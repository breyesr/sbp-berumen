"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/button";
import ProfileSectionNav from "@/components/profile/ProfileSectionNav";

type DevicePlatform = "ios" | "android";
type AccessDevice = "mobile" | "desktop";

const AUTHENTICATOR_LINKS: Record<DevicePlatform, Array<{ name: string; href: string }>> = {
  ios: [
    { name: "Google Authenticator", href: "https://apps.apple.com/us/app/google-authenticator/id388497605" },
    { name: "Microsoft Authenticator", href: "https://apps.apple.com/us/app/microsoft-authenticator/id983156458" },
    { name: "Authy", href: "https://apps.apple.com/us/app/twilio-authy/id494168017" },
    { name: "1Password", href: "https://apps.apple.com/us/app/1password-password-manager/id1511601750" },
  ],
  android: [
    { name: "Google Authenticator", href: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" },
    { name: "Microsoft Authenticator", href: "https://play.google.com/store/apps/details?id=com.azure.authenticator" },
    { name: "Authy", href: "https://play.google.com/store/apps/details?id=com.authy.authy" },
    { name: "1Password", href: "https://play.google.com/store/apps/details?id=com.onepassword.android" },
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
  const [hasAuthenticatorApp, setHasAuthenticatorApp] = useState<boolean | null>(null);
  const [didScanQr, setDidScanQr] = useState(false);
  const [selectedAuthenticatorHref, setSelectedAuthenticatorHref] = useState<string>("");
  const [didJustEnable2FA, setDidJustEnable2FA] = useState(false);
  const [accessDevice, setAccessDevice] = useState<AccessDevice>("desktop");
  const [step2Hint, setStep2Hint] = useState<string>("");
  const [setupKeyCopyState, setSetupKeyCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const step2Ref = useRef<HTMLDivElement | null>(null);
  const completeSetupRef = useRef<HTMLDivElement | null>(null);
  const verifyStepRef = useRef<HTMLFormElement | null>(null);
  const is2FAEnabled = didJustEnable2FA || Boolean(session?.user?.two_factor_enabled);
  const authenticatorOptions = devicePlatform ? AUTHENTICATOR_LINKS[devicePlatform] : [];
  const selectedAuthenticator =
    authenticatorOptions.find((app) => app.href === selectedAuthenticatorHref) ?? authenticatorOptions[0];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || "";
    const isMobileByUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isCoarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const isSmallScreen = window.innerWidth <= 900;

    if (isMobileByUa || (isCoarsePointer && isSmallScreen)) {
      setAccessDevice("mobile");
    } else {
      setAccessDevice("desktop");
    }
  }, []);

  useEffect(() => {
    if (!didConfirmPlatform) return;
    step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [didConfirmPlatform]);

  useEffect(() => {
    if (!setup2FA) return;
    completeSetupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [setup2FA]);

  useEffect(() => {
    if (!didScanQr) return;
    verifyStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [didScanQr]);

  useEffect(() => {
    if (setupKeyCopyState === "idle") return;

    const timer = window.setTimeout(() => {
      setSetupKeyCopyState("idle");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [setupKeyCopyState]);

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
        setMessage("Setup details generated. Continue with Step 3 below.");
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

  const handleCopySetupKey = async () => {
    if (!setup2FA?.secret) return;
    try {
      await navigator.clipboard.writeText(setup2FA.secret);
      setSetupKeyCopyState("copied");
    } catch {
      setSetupKeyCopyState("failed");
    }
  };

  const handleSelectPlatform = (platform: DevicePlatform) => {
    setDevicePlatform(platform);
    setSelectedAuthenticatorHref(AUTHENTICATOR_LINKS[platform][0].href);
    setHasAuthenticatorApp(null);
    setStep2Hint("");
    if (!didConfirmPlatform) setDidConfirmPlatform(true);
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleContinueStep2 = async (selectedPath: boolean | null = hasAuthenticatorApp) => {
    if (selectedPath === null || isGenerating) return;
    setStep2Hint(
      selectedPath
        ? "Great. You already have an app. Preparing your 2FA setup..."
        : "Preparing your 2FA setup..."
    );
    await handleGenerate2FA();
    setStep2Hint("");
  };

  const handleContinueSetupComplete = () => {
    setDidScanQr(true);
    setTimeout(() => {
      verifyStepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
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
            Follow each step in order. Selecting your phone in Step 1 moves you to Step 2 automatically.
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
              <p className="text-sm font-semibold text-white">Step 1: Which phone do you use?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPlatform("ios")}
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
                  onClick={() => handleSelectPlatform("android")}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    devicePlatform === "android"
                      ? "border-blue-500 bg-blue-500/20 text-blue-200"
                      : "border-white/20 bg-transparent text-[#d4d4d8]"
                  }`}
                >
                  Android
                </button>
              </div>
            </div>

            {didConfirmPlatform && (
              <div ref={step2Ref} className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
                <p className="text-sm font-semibold text-white">Step 2: Install an authenticator app</p>
                <p className="mt-2 text-sm text-[#a1a1aa]">
                  Do you already have an authenticator app installed on your phone?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHasAuthenticatorApp(true);
                      setStep2Hint("");
                      void handleContinueStep2(true);
                    }}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      hasAuthenticatorApp === true
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-100"
                        : "border-white/20 bg-transparent text-[#d4d4d8]"
                    }`}
                  >
                    Yes, I already have one
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHasAuthenticatorApp(false);
                      setStep2Hint("");
                    }}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      hasAuthenticatorApp === false
                        ? "border-blue-500 bg-blue-500/20 text-blue-100"
                        : "border-white/20 bg-transparent text-[#d4d4d8]"
                    }`}
                  >
                    No, help me install one
                  </button>
                </div>

                {hasAuthenticatorApp === true && (
                  <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <p className="text-sm text-emerald-100">
                      Great. You already have an app. Moving you to setup...
                    </p>
                  </div>
                )}

                {hasAuthenticatorApp === false && (
                  <>
                    <p className="mt-4 text-sm text-[#a1a1aa]">
                      Pick one app below.
                      {accessDevice === "mobile"
                        ? " You are on mobile, so use the store link directly from this device."
                        : " You are on desktop, so use the QR below with your phone camera to open the store page."}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {authenticatorOptions.map((app) => (
                        <button
                          key={app.name}
                          type="button"
                          onClick={() => {
                            setSelectedAuthenticatorHref(app.href);
                            setStep2Hint("");
                          }}
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
                        {accessDevice === "mobile" ? (
                          <div className="mt-3">
                            <a
                              href={selectedAuthenticator.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center rounded-md border border-blue-500/40 bg-blue-500/15 px-3 py-2 text-sm text-blue-100 hover:bg-blue-500/25"
                            >
                              Open Store Link
                            </a>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-3">
                              <p className="text-sm font-semibold uppercase tracking-wide text-amber-200">
                                Scan with your camera to download your chosen 2FA app
                              </p>
                              <p className="mt-1 text-xs text-amber-100/90">
                                Do not scan this with your authenticator app. This QR is only to open the app store.
                              </p>
                            </div>
                            <div className="mt-3 inline-block rounded-md bg-white p-2">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selectedAuthenticator.href)}`}
                                alt={`${selectedAuthenticator.name} app download QR`}
                                className="h-52 w-52"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {hasAuthenticatorApp !== true && (
                  <>
                    <Button
                      className="mt-4 transition-transform active:scale-[0.98]"
                      type="button"
                      disabled={hasAuthenticatorApp === null || isGenerating}
                      onClick={() => void handleContinueStep2(false)}
                    >
                      {isGenerating ? "Preparing 2FA Setup..." : "Done - Continue to Step 3"}
                    </Button>
                    {hasAuthenticatorApp === null && (
                      <p className="mt-2 text-xs text-amber-300">Choose Yes or No above to continue.</p>
                    )}
                  </>
                )}
                {step2Hint && <p className="mt-2 text-xs text-emerald-300">{step2Hint}</p>}
              </div>
            )}
          </div>
        </section>
      )}

      {!is2FAEnabled && setup2FA && (
        <section ref={completeSetupRef} className="rounded-xl border border-white/10 bg-[#111214] p-6">
          <h2 className="text-lg font-semibold text-white">Step 3: Complete setup in your authenticator app</h2>

          {accessDevice === "mobile" ? (
            <>
              <p className="mt-3 text-sm text-[#d4d4d8]">
                In your authenticator app, choose to add an account manually.
              </p>
              <p className="mt-2 text-sm text-[#d4d4d8]">
                Paste this setup key and choose a time-based code (TOTP):
              </p>
              <p className="mt-2 break-all rounded-md bg-[#0d0e10] px-3 py-2 font-mono text-xs text-[#e4e4e7]">
                {setup2FA.secret}
              </p>
              <div className="mt-3">
                <Button
                  type="button"
                  className="transition-transform active:scale-[0.98]"
                  onClick={handleCopySetupKey}
                >
                  {setupKeyCopyState === "copied" ? "Setup Key Copied" : "Copy Setup Key"}
                </Button>
                {setupKeyCopyState === "copied" && (
                  <p className="mt-2 text-xs text-emerald-300">Copied. Open your authenticator app and paste the key.</p>
                )}
                {setupKeyCopyState === "failed" && (
                  <p className="mt-2 text-xs text-red-300">
                    Could not copy automatically. Press and hold the key above to copy manually.
                  </p>
                )}
              </div>
              <Button
                type="button"
                className="mt-4 transition-transform active:scale-[0.98]"
                onClick={handleContinueSetupComplete}
              >
                Done - Continue
              </Button>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-[#d4d4d8]">
                Open your authenticator app on your phone and scan this QR code.
              </p>
              <div className="mt-3 inline-block rounded-lg bg-white p-3">
                <img src={setup2FA.qrCodeDataUrl} alt="2FA QR Code" className="h-48 w-48" />
              </div>

              <p className="mt-4 text-sm text-[#d4d4d8]">
                If scan does not work, use this manual setup key:
              </p>
              <p className="mt-2 break-all rounded-md bg-[#0d0e10] px-3 py-2 font-mono text-xs text-[#e4e4e7]">
                {setup2FA.secret}
              </p>

              <Button
                type="button"
                className="mt-4 transition-transform active:scale-[0.98]"
                onClick={handleContinueSetupComplete}
              >
                Done - Continue
              </Button>
            </>
          )}

          {didScanQr && (
            <form ref={verifyStepRef} onSubmit={handleVerify2FA} className="mt-5 space-y-3">
              <label htmlFor="verificationCode" className="block text-sm text-[#d4d4d8]">
                Enter the current 6-digit code from your app
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
                <Button
                  type="submit"
                  className="transition-transform active:scale-[0.98]"
                  disabled={isVerifying || verificationCode.length !== 6}
                >
                  {isVerifying ? "Verifying..." : "Verify & Activate 2FA"}
                </Button>
                <Button
                  type="button"
                  className="bg-[#1f2937] transition-transform hover:bg-[#374151] active:scale-[0.98]"
                  onClick={handleGenerate2FA}
                  disabled={isGenerating}
                >
                  {accessDevice === "mobile" ? "Regenerate Setup Key" : "Regenerate QR"}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-5 rounded-md border border-white/10 bg-[#0d0e10] px-3 py-3 text-xs text-[#c4c4cc]">
            <p className="font-semibold text-[#e4e4e7]">If verification fails:</p>
            <p className="mt-1">1. Wait for a new code in your app, then try again.</p>
            <p className="mt-1">2. Make sure your phone time is set to automatic.</p>
            <p className="mt-1">
              3. Click {accessDevice === "mobile" ? "Regenerate Setup Key" : "Regenerate QR"} and repeat the setup
              from Step 1.
            </p>
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
