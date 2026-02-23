"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "@/components/auth/SignInButton";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const { t } = useI18n();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        {t("auth_gate.loading")}
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <h1 className="mb-4 text-3xl font-bold">{t("auth_gate.access_denied_title")}</h1>
        <p className="mb-8">{t("auth_gate.access_denied_message")}</p>
        <SignInButton />
      </div>
    );
  }

  return <>{children}</>;
}
