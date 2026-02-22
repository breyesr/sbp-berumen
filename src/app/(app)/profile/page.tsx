"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/button";
import ProfileSectionNav from "@/components/profile/ProfileSectionNav";

type DevicePlatform = "ios" | "android";

const AUTHENTICATOR_LINKS: Record<DevicePlatform, Array<{ name: string; href: string }>> = {
  ios: [
    { name: "Google Authenticator", href: "https://apps.apple.com/us/search?term=Google%20Authenticator" },
    { name: "Microsoft Authenticator", href: "https://apps.apple.com/us/search?term=Microsoft%20Authenticator" },
    { name: "Authy", href: "https://apps.apple.com/us/search?term=Authy" },
    { name: "1Password", href: "https://apps.apple.com/us/search?term=1Password" },
  ],
  android: [
    { name: "Google Authenticator", href: "https://play.google.com/store/search?q=Google%20Authenticator&c=apps" },
    { name: "Microsoft Authenticator", href: "https://play.google.com/store/search?q=Microsoft%20Authenticator&c=apps" },
    { name: "Authy", href: "https://play.google.com/store/search?q=Authy&c=apps" },
    { name: "1Password", href: "https://play.google.com/store/search?q=1Password&c=apps" },
  ],
};

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [setup2FA, setSetup2FA] = useState<{ qrCodeDataUrl: string; secret: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [devicePlatform, setDevicePlatform] = useState<DevicePlatform | null>(null);
  const [didConfirmPlatform, setDidConfirmPlatform] = useState(false);
  const [didInstallApp, setDidInstallApp] = useState(false);
  const [didScanQr, setDidScanQr] = useState(false);
  const [selectedAuthenticatorHref, setSelectedAuthenticatorHref] = useState<string>("");
  const [didJustEnable2FA, setDidJustEnable2FA] = useState(false);
  const step2Ref = useRef<HTMLDivElement | null>(null);
  const step3Ref = useRef<HTMLDivElement | null>(null);
  const completeSetupRef = useRef<HTMLDivElement | null>(null);
  const verifyStepRef = useRef<HTMLFormElement | null>(null);
  const is2FAEnabled = didJustEnable2FA || Boolean(session?.user?.two_factor_enabled);
  const authenticatorOptions = devicePlatform ? AUTHENTICATOR_LINKS[devicePlatform] : [];
  const selectedAuthenticator =
    authenticatorOptions.find((app) => app.href === selectedAuthenticatorHref) ?? authenticatorOptions[0];

  useEffect(() => {
    if (!didConfirmPlatform) return;
    step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [didConfirmPlatform]);

  useEffect(() => {
    if (!didInstallApp) return;
    step3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [didInstallApp]);

  useEffect(() => {
    if (!setup2FA) return;
    completeSetupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [setup2FA]);

  useEffect(() => {
    if (!didScanQr) return;
    verifyStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [didScanQr]);

  const handleGenerate2FA = async () => {
    setError(null);
    setMessage(null);
    setVerificationCode("");
    setDidScanQr(false);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/2fa/generate", { method: "POST" });
      const data = await response.json();

      if (response.ok) {
        setSetup2FA(data);
        setMessage("Step 1 complete. Scan the QR code, then enter your 6-digit code below.");
      } else {
        setError(data.error || "Failed to start 2FA setup.");
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode.trim() }),
      });
      const data = await response.json();

      if (response.ok) {
        setSetup2FA(null);
        setVerificationCode("");
        setDidJustEnable2FA(true);
        setMessage("Success: 2FA is now active on your account.");
        await update({ two_factor_enabled: true } as any); // Force an explicit session update trigger
      } else {
        setError(data.error || "Failed to verify 2FA code.");
      }
    } catch {
      setError("Could not verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyAuthenticatorLink = async () => {
    if (!selectedAuthenticator) return;
    try {
      await navigator.clipboard.writeText(selectedAuthenticator.href);
      setMessage("Store link copied. Send it to your phone and open it there.");
    } catch {
      setError("Could not copy link automatically. Please copy it manually.");
    }
  };

  if (!session?.user) {
    return <p className="text-sm text-[#a1a1aa]">Loading profile...</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <ProfileSectionNav />
        <h1 className="mt-4 text-2xl font-semibold text-white">Profile & Security</h1>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          Two-factor authentication (2FA) adds one extra security step when you log in.
          After your password, you will also type a 6-digit code from your phone.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
            <p className="text-xs uppercase tracking-wide text-[#71717a]">Email</p>
            <p className="mt-1 text-sm text-[#e4e4e7]">{session.user.email}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
            <p className="text-xs uppercase tracking-wide text-[#71717a]">2FA Status</p>
            <p className="mt-1 text-sm font-semibold">
              <span
                className={
                  is2FAEnabled ? "text-emerald-400" : "text-amber-400"
                }
              >
                {is2FAEnabled ? "Enabled" : "Disabled"}
              </span>
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {message}
          </p>
        )}
      </section>

      {!is2FAEnabled && !setup2FA && (
        <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
          <h2 className="text-lg font-semibold text-white">Set Up 2FA (Step by Step)</h2>
          <p className="mt-2 text-sm text-[#a1a1aa]">
            Follow each step and click done to continue.
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
              <p className="text-sm font-semibold text-white">Step 1: Which phone do you use?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDevicePlatform("ios");
                    setSelectedAuthenticatorHref(AUTHENTICATOR_LINKS.ios[0].href);
                  }}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    devicePlatform === "ios"
                      ? "border-blue-500 bg-blue-500/20 text-blue-200"
                      : "border-white/20 bg-transparent text-[#d4d4d8]"
                  }`}
                >
                  iPhone (iOS)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDevicePlatform("android");
                    setSelectedAuthenticatorHref(AUTHENTICATOR_LINKS.android[0].href);
                  }}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    devicePlatform === "android"
                      ? "border-blue-500 bg-blue-500/20 text-blue-200"
                      : "border-white/20 bg-transparent text-[#d4d4d8]"
                  }`}
                >
                  Android
                </button>
              </div>
              <Button
                className="mt-4"
                type="button"
                disabled={!devicePlatform}
                onClick={() => {
                  setDidConfirmPlatform(true);
                  setDidInstallApp(false);
                }}
              >
                Done - Continue
              </Button>
            </div>

            {didConfirmPlatform && (
              <div ref={step2Ref} className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
                <p className="text-sm font-semibold text-white">Step 2: Install an authenticator app</p>
                <p className="mt-2 text-sm text-[#a1a1aa]">
                  Pick one app below.
                  If you are on desktop, scan the QR code with your phone camera to open the store link.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {authenticatorOptions.map((app) => (
                    <button
                      key={app.name}
                      type="button"
                      onClick={() => setSelectedAuthenticatorHref(app.href)}
                      className={`rounded-md border px-3 py-2 text-left text-sm ${
                        selectedAuthenticator?.href === app.href
                          ? "border-blue-500 bg-blue-500/20 text-blue-100"
                          : "border-white/15 bg-[#121318] text-[#d4d4d8] hover:border-blue-500/60 hover:text-white"
                      }`}
                    >
                      {app.name}
                    </button>
                  ))}
                </div>

                {selectedAuthenticator && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-[#111214] p-4">
                    <p className="text-sm text-[#d4d4d8]">
                      Selected app: <span className="font-semibold text-white">{selectedAuthenticator.name}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={selectedAuthenticator.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-[#d4d4d8] hover:border-blue-500/60 hover:text-white"
                      >
                        Open Store Link
                      </a>
                      <Button type="button" onClick={handleCopyAuthenticatorLink}>
                        Copy Link
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-[#a1a1aa]">
                      On desktop? Scan this QR code with your phone camera:
                    </p>
                    <div className="mt-2 inline-block rounded-md bg-white p-2">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedAuthenticator.href)}`}
                        alt={`${selectedAuthenticator.name} store link QR`}
                        className="h-40 w-40"
                      />
                    </div>
                  </div>
                )}

                <Button
                  className="mt-4"
                  type="button"
                  onClick={() => setDidInstallApp(true)}
                >
                  Done - Continue
                </Button>
              </div>
            )}

            {didInstallApp && (
              <div ref={step3Ref} className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
                <p className="text-sm font-semibold text-white">Step 3: Generate your QR code</p>
                <p className="mt-2 text-sm text-[#a1a1aa]">
                  We will now generate a QR code for your app to scan.
                </p>
                <Button
                  className="mt-4"
                  onClick={handleGenerate2FA}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate QR Code"}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {!is2FAEnabled && setup2FA && (
        <section ref={completeSetupRef} className="rounded-xl border border-white/10 bg-[#111214] p-6">
          <h2 className="text-lg font-semibold text-white">Complete 2FA Setup</h2>

          <p className="mt-3 text-sm text-[#d4d4d8]">
            Step 1: Open your authenticator app on your phone and scan this QR code.
          </p>
          <div className="mt-3 inline-block rounded-lg bg-white p-3">
            <img src={setup2FA.qrCodeDataUrl} alt="2FA QR Code" className="h-48 w-48" />
          </div>

          <p className="mt-4 text-sm text-[#d4d4d8]">
            Step 2 (only if scan does not work): use this manual setup key:
          </p>
          <p className="mt-2 break-all rounded-md bg-[#0d0e10] px-3 py-2 font-mono text-xs text-[#e4e4e7]">
            {setup2FA.secret}
          </p>

          <Button
            type="button"
            className="mt-4"
            onClick={() => setDidScanQr(true)}
          >
            Done - I Scanned the QR Code
          </Button>

          {didScanQr && (
            <form ref={verifyStepRef} onSubmit={handleVerify2FA} className="mt-5 space-y-3">
              <label htmlFor="verificationCode" className="block text-sm text-[#d4d4d8]">
                Step 3: Enter the current 6-digit code from your app
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                minLength={6}
                maxLength={6}
                inputMode="numeric"
                className="w-full max-w-xs rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm text-white outline-none ring-blue-500/40 placeholder:text-[#6b7280] focus:ring"
                placeholder="123456"
              />
              <div className="flex gap-3">
                <Button type="submit" disabled={isVerifying || verificationCode.length !== 6}>
                  {isVerifying ? "Verifying..." : "Verify & Activate 2FA"}
                </Button>
                <Button
                  type="button"
                  className="bg-[#1f2937] hover:bg-[#374151]"
                  onClick={handleGenerate2FA}
                  disabled={isGenerating}
                >
                  Regenerate QR
                </Button>
              </div>
            </form>
          )}

          <div className="mt-5 rounded-md border border-white/10 bg-[#0d0e10] px-3 py-3 text-xs text-[#c4c4cc]">
            <p className="font-semibold text-[#e4e4e7]">If verification fails:</p>
            <p className="mt-1">1. Wait for a new code in your app, then try again.</p>
            <p className="mt-1">2. Make sure your phone time is set to automatic.</p>
            <p className="mt-1">3. Click Regenerate QR and repeat the setup from Step 1.</p>
          </div>
        </section>
      )}

      {is2FAEnabled && (
        <section className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-6">
          <h2 className="text-lg font-semibold text-emerald-300">2FA is active</h2>
          <p className="mt-2 text-sm text-emerald-100/90">
            Your account now requires a one-time code during sign-in.
          </p>
          <p className="mt-2 text-xs text-emerald-100/80">
            Recommended: sign out and sign in again to confirm the 2FA code prompt appears.
          </p>
        </section>
      )}

      <div>
        <SignOutButton />
      </div>
    </div>
  );
}
