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
    return <p className="text-sm text-[#a1a1aa]">{t("security.loading")}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <ProfileSectionNav />
        <h1 className="mt-4 text-2xl font-semibold text-white">{t("security.title")}</h1>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          {t("security.subtitle")}
        </p>

        <div className="mt-5 rounded-lg border border-white/10 bg-[#0d0e10] p-4">
          <p className="text-xs uppercase tracking-wide text-[#71717a]">{t("profile.twofa_status")}</p>
          <p className="mt-1 text-sm font-semibold">
            <span className={is2FAEnabled ? "text-emerald-400" : "text-amber-400"}>
              {is2FAEnabled ? t("common.status.enabled") : t("common.status.disabled")}
            </span>
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <h2 className="text-lg font-semibold text-white">{t("i18n.profile_section_title")}</h2>
        <p className="mt-2 text-sm text-[#a1a1aa]">{t("i18n.profile_section_description")}</p>
        <div className="mt-4">
          <LanguageSwitch />
        </div>
        <p className="mt-3 text-xs text-[#8f8f96]">{t("i18n.profile_sync_note")}</p>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <h2 className="text-lg font-semibold text-white">{t("security.change_password.title")}</h2>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          {t("security.change_password.subtitle")}
        </p>

        {!is2FAEnabled && (
          <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-200">
            <p>{t("security.change_password.locked")}</p>
            <Link href="/profile" className="mt-2 inline-block underline">
              {t("security.change_password.goto_2fa")}
            </Link>
          </div>
        )}

        {passwordError && (
          <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {passwordError}
          </p>
        )}

        {passwordMessage && (
          <p className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {passwordMessage}
          </p>
        )}

        <form onSubmit={handlePasswordChange} className="mt-4 grid gap-3 sm:max-w-lg">
          <div>
            <label htmlFor="current-password" className="block text-sm text-[#d4d4d8]">
              {t("common.fields.current_password")}
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm text-white outline-none ring-blue-500/40 focus:ring"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm text-[#d4d4d8]">
              {t("common.fields.new_password")}
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={10}
              className="mt-1 w-full rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm text-white outline-none ring-blue-500/40 focus:ring"
            />
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="block text-sm text-[#d4d4d8]">
              {t("common.fields.confirm_new_password")}
            </label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              minLength={10}
              className="mt-1 w-full rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm text-white outline-none ring-blue-500/40 focus:ring"
            />
          </div>

          <div>
            <label htmlFor="password-2fa-code" className="block text-sm text-[#d4d4d8]">
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
              placeholder={t("profile.setup.step3.verify_placeholder")}
              className="mt-1 w-full rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm tracking-widest text-white outline-none ring-blue-500/40 focus:ring"
            />
          </div>

          <div>
            <Button
              type="submit"
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

      <div>
        <SignOutButton />
      </div>
    </div>
  );
}
