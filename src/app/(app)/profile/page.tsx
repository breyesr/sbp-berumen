"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Button } from "@/components/ui/button";
import ProfileSectionNav from "@/components/profile/ProfileSectionNav";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Camera, ShieldCheck, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";

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
    return <p className="text-sm text-foreground-muted font-brand">{t("profile.loading")}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 animate-fade-in font-body">
      <section className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
        <ProfileSectionNav />
        <h1 className="mt-8 text-3xl font-bold text-foreground font-brand uppercase tracking-tighter">{t("profile.title")}</h1>
        <p className="mt-2 text-base text-foreground-muted font-medium">
          {t("profile.description")}
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-5 shadow-inner">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle font-brand mb-1">{t("common.fields.email")}</p>
            <p className="text-sm font-semibold text-foreground">{session.user.email}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5 shadow-inner">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle font-brand mb-1">{t("profile.twofa_status")}</p>
            <p className="text-sm font-bold">
              <span
                className={
                  is2FAEnabled ? "text-success" : "text-warning"
                }
              >
                {is2FAEnabled ? t("common.status.enabled") : t("common.status.disabled")}
              </span>
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error font-bold font-brand uppercase tracking-widest">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-6 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success font-bold font-brand uppercase tracking-widest">
            {message}
          </p>
        )}
      </section>

      {!is2FAEnabled && !setup2FA && (
        <section className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground font-brand uppercase tracking-tight">{t("profile.setup.title")}</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            {t("profile.setup.subtitle")}
          </p>

          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <p className="text-xs font-bold text-foreground uppercase tracking-widest font-brand mb-4">{t("profile.setup.step1.title")}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectPlatform("ios")}
                  className={clsx(
                    "rounded-xl border px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all font-brand",
                    devicePlatform === "ios"
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-surface text-foreground-muted hover:text-foreground hover:border-primary/50"
                  )}
                >
                  {t("profile.setup.step1.ios")}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPlatform("android")}
                  className={clsx(
                    "rounded-xl border px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all font-brand",
                    devicePlatform === "android"
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-surface text-foreground-muted hover:text-foreground hover:border-primary/50"
                  )}
                >
                  {t("profile.setup.step1.android")}
                </button>
              </div>

              {!setup2FA && (
                <div className="mt-6 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!devicePlatform) setDevicePlatform("ios");
                      await handleContinueStep2();
                    }}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-primary-hover transition-colors font-brand"
                  >
                    {t("profile.setup.step1.fast_track")}
                  </button>
                </div>
              )}
            </div>

            {didConfirmPlatform && (
              <div ref={step2Ref} className="rounded-2xl border border-border bg-background p-6 animate-fade-in">
                <p className="text-xs font-bold text-foreground uppercase tracking-widest font-brand mb-2">{t("profile.setup.step2.title")}</p>
                <p className="text-sm text-foreground-muted mb-6">
                  {t("profile.setup.step2.pick_app")}
                </p>

                {selectedAuthenticator && (
                  <div className="mb-8 rounded-2xl border border-border bg-surface p-6 shadow-inner">
                    <p className="text-sm font-bold text-foreground font-brand uppercase tracking-wider mb-4">
                      {selectedAuthenticator.name}
                    </p>
                    {accessDevice === "mobile" ? (
                      <div className="mt-3">
                        <a
                          href={selectedAuthenticator.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary-hover transition-all shadow-md font-brand"
                        >
                          {t("profile.setup.step2.open_store_link")}
                        </a>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-6">
                        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="rounded-full bg-primary/10 p-3 text-primary">
                              <Camera className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-brand">
                                {t("profile.setup.step2.camera_mode")}
                              </p>
                              <p className="text-xs text-foreground-muted font-medium mt-0.5">
                                {t("profile.setup.step2.camera_hint")}
                              </p>
                            </div>
                          </div>
                          <p className="mt-4 border-t border-primary/10 pt-3 text-[10px] font-bold text-warning uppercase tracking-widest font-brand">
                            <AlertTriangle className="mr-1.5 inline-block h-3.5 w-3.5 align-text-bottom" />
                            {t("profile.setup.step2.download_qr_warning")}
                          </p>
                        </div>
                        <div className="inline-block rounded-2xl bg-white p-4 shadow-xl border border-border">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(selectedAuthenticator.href)}`}
                            alt={t("profile.setup.step2.download_qr_alt", { app: selectedAuthenticator.name })}
                            className="h-48 w-48"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  className="w-full h-14"
                  type="button"
                  disabled={isGenerating}
                  onClick={() => void handleContinueStep2()}
                >
                  {isGenerating ? t("profile.setup.step2.preparing") : t("profile.setup.step2.continue")}
                </Button>
                {step2Hint && <p className="mt-4 text-xs font-bold text-success uppercase tracking-widest font-brand">{step2Hint}</p>}
              </div>
            )}
          </div>
        </section>
      )}

      {!is2FAEnabled && showStep3 && (
        <section ref={completeSetupRef} className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
          <h2 className="text-xl font-bold text-foreground font-brand uppercase tracking-tight mb-6">{t("profile.setup.step3.title")}</h2>

          <div className="rounded-xl border border-warning/20 bg-warning/5 px-5 py-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-warning/10 p-3 text-warning">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-warning font-brand">
                  {t("profile.setup.step3.authenticator_mode")}
                </p>
                <p className="text-xs text-foreground-muted font-medium mt-0.5">
                  {t("profile.setup.step3.authenticator_hint")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-background p-10 text-center transition-all duration-500 min-h-[450px] shadow-inner">
            {!isReadyToScan ? (
              <div className="flex flex-col items-center animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <ShieldCheck className="h-10 w-10 text-primary/40" />
                </div>
                <p className="max-w-xs text-sm text-foreground-muted font-medium leading-relaxed">
                  {t("profile.setup.step3.ready_check")}
                </p>
                <Button
                  type="button"
                  className="mt-8 h-12 px-10"
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
                    <div className="w-full max-w-sm space-y-6">
                      <p className="text-sm text-foreground-muted font-medium italic">
                        {t("profile.setup.step3.mobile_1")}
                      </p>
                      <p className="text-sm text-foreground-muted font-medium italic">
                        {t("profile.setup.step3.mobile_2")}
                      </p>
                      <div className="rounded-xl bg-surface border border-border p-5 shadow-inner">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-subtle mb-2 font-brand">Setup Key</p>
                          <p className="break-all font-mono text-sm text-primary font-bold tracking-wider">
                            {setup2FA.secret}
                          </p>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        <Button
                          type="button"
                          className="h-11 px-8"
                          onClick={handleCopySetupKey}
                        >
                          {setupKeyCopyState === "copied" ? t("profile.setup.step3.copy_key_done") : t("profile.setup.step3.copy_key")}
                        </Button>
                        {setupKeyCopyState === "copied" && (
                          <p className="text-xs font-bold text-success uppercase tracking-widest font-brand">{t("profile.setup.step3.copy_key_success")}</p>
                        )}
                        {setupKeyCopyState === "failed" && (
                          <p className="text-xs font-bold text-error uppercase tracking-widest font-brand">
                            {t("profile.setup.step3.copy_key_error")}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        className="w-full h-12 bg-foreground text-background hover:opacity-90 mt-4"
                        onClick={handleContinueSetupComplete}
                      >
                        {t("profile.setup.step3.done")}
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center space-y-8">
                      <p className="text-sm text-foreground-muted font-medium italic">
                        {t("profile.setup.step3.desktop_1")}
                      </p>
                      <div className="inline-block rounded-2xl bg-white p-5 shadow-2xl border border-border">
                        <img src={setup2FA.qrCodeDataUrl} alt={t("profile.setup.step3.qr_alt")} className="h-52 w-52" />
                      </div>

                      <div className="w-full max-w-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle mb-2 font-brand">
                          {t("profile.setup.step3.desktop_2")}
                        </p>
                        <div className="rounded-xl bg-surface border border-border p-4 shadow-inner">
                            <p className="break-all font-mono text-sm text-primary font-bold tracking-wider">
                              {setup2FA.secret}
                            </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        className="w-full max-w-xs h-12"
                        onClick={handleContinueSetupComplete}
                      >
                        {t("profile.setup.step3.done")}
                      </Button>
                    </div>
                  )}

                  {didScanQr && (
                    <form ref={verifyStepRef} onSubmit={handleVerify2FA} className="mt-12 w-full max-w-xs space-y-6 border-t border-border pt-10">
                      <div className="text-left">
                        <label htmlFor="verificationCode" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle font-brand">
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
                          className="mt-3 w-full rounded-2xl border border-border bg-surface px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-foreground outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-foreground-subtle shadow-sm transition-all"
                          placeholder="000000"
                        />
                      </div>
                      <div className="flex flex-col gap-4">
                        <Button
                          type="submit"
                          className="w-full h-12 bg-success text-white hover:opacity-90"
                          disabled={isVerifying || verificationCode.length !== 6}
                        >
                          {isVerifying ? t("profile.setup.step3.verifying") : t("profile.setup.step3.verify_button")}
                        </Button>
                        <button
                          type="button"
                          className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-foreground-subtle hover:text-foreground transition-colors font-brand"
                          onClick={handleGenerate2FA}
                          disabled={isGenerating}
                        >
                          {accessDevice === "mobile" ? t("profile.setup.step3.regenerate_key") : t("profile.setup.step3.regenerate_qr")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-background p-5 text-xs text-foreground-muted shadow-inner font-body">
            <p className="font-bold text-foreground font-brand uppercase tracking-wider mb-2">{t("profile.setup.troubleshoot.title")}</p>
            <p className="mt-1 flex gap-2"><span className="text-primary font-bold">1.</span> {t("profile.setup.troubleshoot.item1")}</p>
            <p className="mt-1 flex gap-2"><span className="text-primary font-bold">2.</span> {t("profile.setup.troubleshoot.item2")}</p>
            <p className="mt-1 flex gap-2">
              <span className="text-primary font-bold">3.</span>
              {t("profile.setup.troubleshoot.item3", {
                action: accessDevice === "mobile" ? t("profile.setup.step3.regenerate_key") : t("profile.setup.step3.regenerate_qr"),
              })}
            </p>
          </div>
        </section>
      )}

      {is2FAEnabled && (
        <section className="rounded-[2rem] border border-success/30 bg-success/5 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-success font-brand uppercase tracking-tight">{t("profile.setup.success.title")}</h2>
          <p className="mt-3 text-base text-foreground font-medium font-body leading-relaxed">
            {t("profile.setup.success.body")}
          </p>
          <p className="mt-4 text-sm text-foreground-muted font-medium italic border-t border-success/20 pt-4">
            {t("profile.setup.success.note")}
          </p>
        </section>
      )}

      <div className="pt-4">
        <SignOutButton />
      </div>
    </div>
  );
}
