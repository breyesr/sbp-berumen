"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/button";
import ProfileSectionNav from "@/components/profile/ProfileSectionNav";
import { useI18n } from "@/components/i18n/I18nProvider";

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
  const { t } = useI18n();
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
      const data = await response.json().catch(() => null);

      if (response.ok && data?.qrCodeDataUrl && data?.secret) {
        setSetup2FA({ qrCodeDataUrl: data.qrCodeDataUrl, secret: data.secret });
        setMessage(t("profile.setup.generated"));
      } else {
        setError(t("profile.setup.generate_error"));
      }
    } catch {
      setError(t("common.errors.network"));
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
      await response.json().catch(() => null);

      if (response.ok) {
        setSetup2FA(null);
        setVerificationCode("");
        setDidJustEnable2FA(true);
        setMessage(t("profile.setup.success.banner"));
        await update({ two_factor_enabled: true } as any); // Force an explicit session update trigger
      } else {
        setError(t("profile.setup.verify_error"));
      }
    } catch {
      setError(t("profile.setup.verify_unreachable"));
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
        ? t("profile.setup.step2.yes_hint")
        : t("profile.setup.step2.preparing")
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
    return <p className="text-sm text-[#a1a1aa]">{t("profile.loading")}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <ProfileSectionNav />
        <h1 className="mt-4 text-2xl font-semibold text-white">{t("profile.title")}</h1>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          {t("profile.description")}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
            <p className="text-xs uppercase tracking-wide text-[#71717a]">{t("common.fields.email")}</p>
            <p className="mt-1 text-sm text-[#e4e4e7]">{session.user.email}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
            <p className="text-xs uppercase tracking-wide text-[#71717a]">{t("profile.twofa_status")}</p>
            <p className="mt-1 text-sm font-semibold">
              <span
                className={
                  is2FAEnabled ? "text-emerald-400" : "text-amber-400"
                }
              >
                {is2FAEnabled ? t("common.status.enabled") : t("common.status.disabled")}
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
          <h2 className="text-lg font-semibold text-white">{t("profile.setup.title")}</h2>
          <p className="mt-2 text-sm text-[#a1a1aa]">
            {t("profile.setup.subtitle")}
          </p>

          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
              <p className="text-sm font-semibold text-white">{t("profile.setup.step1.title")}</p>
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
                  {t("profile.setup.step1.ios")}
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
                  {t("profile.setup.step1.android")}
                </button>
              </div>
            </div>

            {didConfirmPlatform && (
              <div ref={step2Ref} className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
                <p className="text-sm font-semibold text-white">{t("profile.setup.step2.title")}</p>
                <p className="mt-2 text-sm text-[#a1a1aa]">
                  {t("profile.setup.step2.question_has_app")}
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
                    {t("profile.setup.step2.option_yes")}
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
                    {t("profile.setup.step2.option_no")}
                  </button>
                </div>

                {hasAuthenticatorApp === true && (
                  <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <p className="text-sm text-emerald-100">
                      {t("profile.setup.step2.yes_hint")}
                    </p>
                  </div>
                )}

                {hasAuthenticatorApp === false && (
                  <>
                    <p className="mt-4 text-sm text-[#a1a1aa]">
                      {t("profile.setup.step2.pick_app")}
                      {accessDevice === "mobile"
                        ? ` ${t("profile.setup.step2.mobile_hint")}`
                        : ` ${t("profile.setup.step2.desktop_hint")}`}
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
                          {t("profile.setup.step2.selected_app", { app: selectedAuthenticator.name })}
                        </p>
                        {accessDevice === "mobile" ? (
                          <div className="mt-3">
                            <a
                              href={selectedAuthenticator.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center rounded-md border border-blue-500/40 bg-blue-500/15 px-3 py-2 text-sm text-blue-100 hover:bg-blue-500/25"
                            >
                              {t("profile.setup.step2.open_store_link")}
                            </a>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-3">
                              <p className="text-sm font-semibold uppercase tracking-wide text-amber-200">
                                {t("profile.setup.step2.download_qr_title")}
                              </p>
                              <p className="mt-1 text-xs text-amber-100/90">
                                {t("profile.setup.step2.download_qr_warning")}
                              </p>
                            </div>
                            <div className="mt-3 inline-block rounded-md bg-white p-2">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selectedAuthenticator.href)}`}
                                alt={t("profile.setup.step2.download_qr_alt", { app: selectedAuthenticator.name })}
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
                      {isGenerating ? t("profile.setup.step2.preparing") : t("profile.setup.step2.continue")}
                    </Button>
                    {hasAuthenticatorApp === null && (
                      <p className="mt-2 text-xs text-amber-300">{t("profile.setup.step2.choose_required")}</p>
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
          <h2 className="text-lg font-semibold text-white">{t("profile.setup.step3.title")}</h2>

          {accessDevice === "mobile" ? (
            <>
              <p className="mt-3 text-sm text-[#d4d4d8]">
                {t("profile.setup.step3.mobile_1")}
              </p>
              <p className="mt-2 text-sm text-[#d4d4d8]">
                {t("profile.setup.step3.mobile_2")}
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
                  {setupKeyCopyState === "copied" ? t("profile.setup.step3.copy_key_done") : t("profile.setup.step3.copy_key")}
                </Button>
                {setupKeyCopyState === "copied" && (
                  <p className="mt-2 text-xs text-emerald-300">{t("profile.setup.step3.copy_key_success")}</p>
                )}
                {setupKeyCopyState === "failed" && (
                  <p className="mt-2 text-xs text-red-300">
                    {t("profile.setup.step3.copy_key_error")}
                  </p>
                )}
              </div>
              <Button
                type="button"
                className="mt-4 transition-transform active:scale-[0.98]"
                onClick={handleContinueSetupComplete}
              >
                {t("profile.setup.step3.done")}
              </Button>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-[#d4d4d8]">
                {t("profile.setup.step3.desktop_1")}
              </p>
              <div className="mt-3 inline-block rounded-lg bg-white p-3">
                <img src={setup2FA.qrCodeDataUrl} alt={t("profile.setup.step3.qr_alt")} className="h-48 w-48" />
              </div>

              <p className="mt-4 text-sm text-[#d4d4d8]">
                {t("profile.setup.step3.desktop_2")}
              </p>
              <p className="mt-2 break-all rounded-md bg-[#0d0e10] px-3 py-2 font-mono text-xs text-[#e4e4e7]">
                {setup2FA.secret}
              </p>

              <Button
                type="button"
                className="mt-4 transition-transform active:scale-[0.98]"
                onClick={handleContinueSetupComplete}
              >
                {t("profile.setup.step3.done")}
              </Button>
            </>
          )}

          {didScanQr && (
            <form ref={verifyStepRef} onSubmit={handleVerify2FA} className="mt-5 space-y-3">
              <label htmlFor="verificationCode" className="block text-sm text-[#d4d4d8]">
                {t("profile.setup.step3.verify_label")}
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
                placeholder={t("profile.setup.step3.verify_placeholder")}
              />
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="transition-transform active:scale-[0.98]"
                  disabled={isVerifying || verificationCode.length !== 6}
                >
                  {isVerifying ? t("profile.setup.step3.verifying") : t("profile.setup.step3.verify_button")}
                </Button>
                <Button
                  type="button"
                  className="bg-[#1f2937] transition-transform hover:bg-[#374151] active:scale-[0.98]"
                  onClick={handleGenerate2FA}
                  disabled={isGenerating}
                >
                  {accessDevice === "mobile" ? t("profile.setup.step3.regenerate_key") : t("profile.setup.step3.regenerate_qr")}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-5 rounded-md border border-white/10 bg-[#0d0e10] px-3 py-3 text-xs text-[#c4c4cc]">
            <p className="font-semibold text-[#e4e4e7]">{t("profile.setup.troubleshoot.title")}</p>
            <p className="mt-1">{t("profile.setup.troubleshoot.item1")}</p>
            <p className="mt-1">{t("profile.setup.troubleshoot.item2")}</p>
            <p className="mt-1">
              {t("profile.setup.troubleshoot.item3", {
                action: accessDevice === "mobile" ? t("profile.setup.step3.regenerate_key") : t("profile.setup.step3.regenerate_qr"),
              })}
            </p>
          </div>
        </section>
      )}

      {is2FAEnabled && (
        <section className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-6">
          <h2 className="text-lg font-semibold text-emerald-300">{t("profile.setup.success.title")}</h2>
          <p className="mt-2 text-sm text-emerald-100/90">
            {t("profile.setup.success.body")}
          </p>
          <p className="mt-2 text-xs text-emerald-100/80">
            {t("profile.setup.success.note")}
          </p>
        </section>
      )}

      <div>
        <SignOutButton />
      </div>
    </div>
  );
}
