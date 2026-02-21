"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import ProfileSectionNav from "@/components/profile/ProfileSectionNav";
import { Button } from "@/components/ui/button";

export default function ProfileSecurityPage() {
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
      setPasswordError("Enable 2FA first, then come back to change your password.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 10) {
      setPasswordError("New password must be at least 10 characters.");
      return;
    }

    if (!/^\d{6}$/.test(password2faCode.trim())) {
      setPasswordError("Enter a valid 6-digit 2FA code.");
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
      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || "Could not change password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPassword2faCode("");
      setPasswordMessage(data.message || "Password changed successfully.");

      window.setTimeout(() => {
        void signOut({ callbackUrl: "/login" });
      }, 1000);
    } catch {
      setPasswordError("Could not reach server. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!session?.user) {
    return <p className="text-sm text-[#a1a1aa]">Loading security settings...</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <ProfileSectionNav />
        <h1 className="mt-4 text-2xl font-semibold text-white">Security Settings</h1>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          Manage account access settings like password updates.
        </p>

        <div className="mt-5 rounded-lg border border-white/10 bg-[#0d0e10] p-4">
          <p className="text-xs uppercase tracking-wide text-[#71717a]">2FA Status</p>
          <p className="mt-1 text-sm font-semibold">
            <span className={is2FAEnabled ? "text-emerald-400" : "text-amber-400"}>
              {is2FAEnabled ? "Enabled" : "Disabled"}
            </span>
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <h2 className="text-lg font-semibold text-white">Change Password</h2>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          For security, changing your password requires your current password and a 6-digit 2FA code.
        </p>

        {!is2FAEnabled && (
          <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-200">
            <p>Password change is locked until 2FA is active.</p>
            <Link href="/profile" className="mt-2 inline-block underline">
              Go to 2FA setup
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
              Current password
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
              New password
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
              Confirm new password
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
              2FA code
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
              placeholder="123456"
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
              {isChangingPassword ? "Updating..." : "Update Password"}
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
