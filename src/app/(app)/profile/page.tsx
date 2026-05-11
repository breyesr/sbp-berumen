"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/button";
import ProfileSectionNav from "@/components/profile/ProfileSectionNav";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Camera, ShieldCheck, AlertTriangle } from "lucide-react";

type DevicePlatform = "ios" | "android";
type AccessDevice = "mobile" | "desktop";

const AUTHENTICATOR_LINKS: Record<DevicePlatform, { name: string; href: string }> = {
  ios: { name: "Google Authenticator", href: "https://apps.apple.com/us/app/google-authenticator/id388497605" },
  android: { name: "Google Authenticator", href: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" },
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
  const [didScanQr, setDidScanQr] = useState(false);
  const [isReadyToScan, setIsReadyToScan] = useState(false);
  const [showStep3, setShowStep3] = useState(false);
  const [didJustEnable2FA, setDidJustEnable2FA] = useState(false);
  const [accessDevice, setAccessDevice] = useState<AccessDevice>("desktop");
  const [step2Hint, setStep2Hint] = useState<string>("");
  const [setupKeyCopyState, setSetupKeyCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const step2Ref = useRef<HTMLDivElement | null>(null);
  const completeSetupRef = useRef<HTMLDivElement | null>(null);
  const verifyStepRef = useRef<HTMLFormElement | null>(null);
  const is2FAEnabled = didJustEnable2FA || Boolean(session?.user?.two_factor_enabled);
  const selectedAuthenticator = devicePlatform ? AUTHENTICATOR_LINKS[devicePlatform] : null;

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
    setStep2Hint("");
    if (!didConfirmPlatform) setDidConfirmPlatform(true);
    setTimeout(() => {
      step2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleContinueStep2 = () => {
    setShowStep3(true);
    setTimeout(() => {
      completeSetupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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

              {!setup2FA && (
                <div className="mt-4 border-t border-white/5 pt-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!devicePlatform) setDevicePlatform("ios");
                      await handleContinueStep2();
                    }}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {t("profile.setup.step1.fast_track")}
                  </button>
                </div>
              )}
            </div>

            {didConfirmPlatform && (
              <div ref={step2Ref} className="rounded-lg border border-white/10 bg-[#0d0e10] p-4">
                <p className="text-sm font-semibold text-white">{t("profile.setup.step2.title")}</p>
                <p className="mt-2 text-sm text-[#a1a1aa]">
                  {t("profile.setup.step2.pick_app")}
                </p>

                {selectedAuthenticator && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-[#111214] p-4">
                    <p className="text-sm font-medium text-[#d4d4d8]">
                      {selectedAuthenticator.name}
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
                        <div className="rounded-md border border-blue-500/30 bg-blue-500/10 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-500/20 p-2 text-blue-400">
                              <Camera className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
                                {t("profile.setup.step2.camera_mode")}
                              </p>
                              <p className="text-xs text-blue-100/80">
                                {t("profile.setup.step2.camera_hint")}
                              </p>
                            </div>
                          </div>
                          <p className="mt-3 border-t border-blue-500/20 pt-2 text-xs font-medium text-amber-300">
                            <AlertTriangle className="mr-1 inline-block h-3 w-3 align-text-bottom" />
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

                <Button
                  className="mt-6 w-full transition-transform active:scale-[0.98]"
                  type="button"
                  disabled={isGenerating}
                  onClick={() => void handleContinueStep2()}
                >
                  {isGenerating ? t("profile.setup.step2.preparing") : t("profile.setup.step2.continue")}
                </Button>
                {step2Hint && <p className="mt-2 text-xs text-emerald-300">{step2Hint}</p>}
              </div>
            )}
          </div>
        </section>
      )}

      {!is2FAEnabled && showStep3 && (
        <section ref={completeSetupRef} className="rounded-xl border border-white/10 bg-[#111214] p-6">
          <h2 className="text-lg font-semibold text-white">{t("profile.setup.step3.title")}</h2>

          <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-500/20 p-2 text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-amber-200">
                  {t("profile.setup.step3.authenticator_mode")}
                </p>
                <p className="text-xs text-amber-100/80">
                  {t("profile.setup.step3.authenticator_hint")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 p-6 text-center transition-all duration-500 min-h-[400px]">
            {!isReadyToScan ? (
              <div className="flex flex-col items-center animate-in fade-in duration-500">
                <ShieldCheck className="mb-4 h-12 w-12 text-amber-500/50" />
                <p className="max-w-xs text-sm text-[#a1a1aa]">
                  {t("profile.setup.step3.ready_check")}
                </p>
                <Button
                  type="button"
                  className="mt-6 bg-amber-600 font-bold text-white hover:bg-amber-700 active:scale-[0.98]"
                  disabled={isGenerating}
                  onClick={async () => {
                    await handleGenerate2FA();
                    setIsReadyToScan(true);
                    setTimeout(() => {
                      completeSetupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 100);
                  }}
                >
                  {isGenerating ? t("profile.setup.step2.preparing") : t("common.actions.done_continue")}
                </Button>
              </div>
            ) : (
              setup2FA && (
                <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {accessDevice === "mobile" ? (
                    <>
                      <p className="text-sm text-[#d4d4d8]">
                        {t("profile.setup.step3.mobile_1")}
                      </p>
                      <p className="mt-2 text-sm text-[#d4d4d8]">
                        {t("profile.setup.step3.mobile_2")}
                      </p>
                      <p className="mt-3 w-full max-w-sm break-all rounded-md bg-[#0d0e10] px-3 py-3 font-mono text-xs text-[#e4e4e7] border border-white/5">
                        {setup2FA.secret}
                      </p>
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <Button
                          type="button"
                          className="transition-transform active:scale-[0.98]"
                          onClick={handleCopySetupKey}
                        >
                          {setupKeyCopyState === "copied" ? t("profile.setup.step3.copy_key_done") : t("profile.setup.step3.copy_key")}
                        </Button>
                        {setupKeyCopyState === "copied" && (
                          <p className="text-xs text-emerald-300">{t("profile.setup.step3.copy_key_success")}</p>
                        )}
                        {setupKeyCopyState === "failed" && (
                          <p className="text-xs text-red-300">
                            {t("profile.setup.step3.copy_key_error")}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        className="mt-6 w-full max-w-xs bg-[#1f2937] transition-transform hover:bg-[#374151] active:scale-[0.98]"
                        onClick={handleContinueSetupComplete}
                      >
                        {t("profile.setup.step3.done")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[#d4d4d8]">
                        {t("profile.setup.step3.desktop_1")}
                      </p>
                      <div className="mt-4 inline-block rounded-lg bg-white p-3 shadow-xl">
                        <img src={setup2FA.qrCodeDataUrl} alt={t("profile.setup.step3.qr_alt")} className="h-48 w-48" />
                      </div>

                      <div className="mt-6 w-full max-w-sm">
                        <p className="text-xs uppercase tracking-widest text-[#71717a] font-bold">
                          {t("profile.setup.step3.desktop_2")}
                        </p>
                        <p className="mt-2 break-all rounded-md bg-[#0d0e10] px-3 py-3 font-mono text-sm text-[#e4e4e7] border border-white/5">
                          {setup2FA.secret}
                        </p>
                      </div>

                      <Button
                        type="button"
                        className="mt-8 w-full max-w-xs bg-blue-600 hover:bg-blue-700 transition-transform active:scale-[0.98]"
                        onClick={handleContinueSetupComplete}
                      >
                        {t("profile.setup.step3.done")}
                      </Button>
                    </>
                  )}

                  {didScanQr && (
                    <form ref={verifyStepRef} onSubmit={handleVerify2FA} className="mt-8 w-full max-w-xs space-y-4 border-t border-white/10 pt-8">
                      <div className="text-left">
                        <label htmlFor="verificationCode" className="block text-xs font-bold uppercase tracking-wider text-[#a1a1aa]">
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
                          className="mt-2 w-full rounded-md border border-white/15 bg-[#0d0e10] px-4 py-3 text-center text-xl font-bold tracking-[0.5em] text-white outline-none ring-blue-500/40 placeholder:text-[#3f3f46] focus:ring"
                          placeholder="000000"
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button
                          type="submit"
                          className="w-full bg-emerald-600 font-bold hover:bg-emerald-700 transition-transform active:scale-[0.98]"
                          disabled={isVerifying || verificationCode.length !== 6}
                        >
                          {isVerifying ? t("profile.setup.step3.verifying") : t("profile.setup.step3.verify_button")}
                        </Button>
                        <Button
                          type="button"
                          className="w-full bg-transparent border border-white/10 text-[#a1a1aa] text-xs hover:bg-white/5 transition-transform active:scale-[0.98]"
                          onClick={handleGenerate2FA}
                          disabled={isGenerating}
                        >
                          {accessDevice === "mobile" ? t("profile.setup.step3.regenerate_key") : t("profile.setup.step3.regenerate_qr")}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )
            )}
          </div>

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
