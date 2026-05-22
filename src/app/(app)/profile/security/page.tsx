"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import ProfileSectionNav from "@/components/profile/ProfileSectionNav";
import { Button } from "@/components/ui/button";
import LanguageSwitch from "@/components/i18n/LanguageSwitch";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function ProfileSecurityPage() {
  const { t } = useI18n();
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [password2faCode, setPassword2faCode] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const is2FAEnabled = Boolean(session?.user?.two_factor_enabled);

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (!is2FAEnabled) {
      setPasswordError(t("security.error_enable_2fa"));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError(t("security.error_password_mismatch"));
      return;
    }

    if (newPassword.length < 10) {
      setPasswordError(t("security.error_password_length"));
      return;
    }

    if (!/^\d{6}$/.test(password2faCode.trim())) {
      setPasswordError(t("security.error_invalid_2fa_code"));
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/account/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          code: password2faCode.trim(),
        }),
      });
      await response.json().catch(() => null);

      if (!response.ok) {
        setPasswordError(t("security.error_change_password"));
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPassword2faCode("");
      setPasswordMessage(t("security.message_password_changed"));

      window.setTimeout(() => {
        void signOut({ callbackUrl: "/login" });
      }, 1000);
    } catch {
      setPasswordError(t("common.errors.network"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!session?.user) {
    return <p className="text-sm text-foreground-muted font-brand">{t("security.loading")}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 animate-fade-in font-body">
      <section className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
        <ProfileSectionNav />
        <h1 className="mt-8 text-3xl font-bold text-foreground font-brand uppercase tracking-tighter">{t("security.title")}</h1>
        <p className="mt-2 text-base text-foreground-muted font-medium">
          {t("security.subtitle")}
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-background p-6 shadow-inner">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle font-brand mb-1">{t("profile.twofa_status")}</p>
          <p className="text-sm font-bold">
            <span className={is2FAEnabled ? "text-success" : "text-warning"}>
              {is2FAEnabled ? t("common.status.enabled") : t("common.status.disabled")}
            </span>
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
        <h2 className="text-xl font-bold text-foreground font-brand uppercase tracking-tight mb-2">{t("i18n.profile_section_title")}</h2>
        <p className="text-sm text-foreground-muted mb-6">{t("i18n.profile_section_description")}</p>
        <div className="max-w-xs">
          <LanguageSwitch />
        </div>
        <p className="mt-6 text-[10px] text-foreground-subtle font-bold uppercase tracking-widest font-brand border-t border-border pt-4">{t("i18n.profile_sync_note")}</p>
      </section>

      <section className="rounded-[2rem] border border-border bg-surface p-8 shadow-sm">
        <h2 className="text-xl font-bold text-foreground font-brand uppercase tracking-tight mb-2">{t("security.change_password.title")}</h2>
        <p className="text-sm text-foreground-muted mb-8">
          {t("security.change_password.subtitle")}
        </p>

        {!is2FAEnabled && (
          <div className="mb-8 rounded-xl border border-warning/30 bg-warning/5 px-5 py-4 text-sm text-warning font-medium">
            <p>{t("security.change_password.locked")}</p>
            <Link href="/profile" className="mt-2 inline-block underline font-bold">
              {t("security.change_password.goto_2fa")}
            </Link>
          </div>
        )}

        {passwordError && (
          <p className="mb-8 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error font-bold font-brand uppercase tracking-widest">
            {passwordError}
          </p>
        )}

        {passwordMessage && (
          <p className="mb-8 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success font-bold font-brand uppercase tracking-widest">
            {passwordMessage}
          </p>
        )}

        <form onSubmit={handlePasswordChange} className="grid gap-6 sm:max-w-lg">
          <div className="space-y-2">
            <label htmlFor="current-password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle px-1 font-brand">
              {t("common.fields.current_password")}
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="new-password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle px-1 font-brand">
              {t("common.fields.new_password")}
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={10}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-new-password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle px-1 font-brand">
              {t("common.fields.confirm_new_password")}
            </label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              minLength={10}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password-2fa-code" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-subtle px-1 font-brand">
              {t("common.fields.two_fa_code")}
            </label>
            <input
              id="password-2fa-code"
              type="text"
              inputMode="numeric"
              minLength={6}
              maxLength={6}
              value={password2faCode}
              onChange={(e) => setPassword2faCode(e.target.value)}
              required
              placeholder="000000"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm tracking-[0.3em] font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all text-center"
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-12"
              disabled={
                isChangingPassword ||
                !is2FAEnabled ||
                !currentPassword ||
                !newPassword ||
                !confirmNewPassword ||
                password2faCode.trim().length !== 6
              }
            >
              {isChangingPassword ? t("security.button_updating") : t("security.button_update_password")}
            </Button>
          </div>
        </form>
      </section>

      <div className="pt-4">
        <SignOutButton />
      </div>
    </div>
  );
}
