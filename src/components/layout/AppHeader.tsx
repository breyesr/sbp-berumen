"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignOutButton } from "@/components/auth/SignOutButton";
import LanguageSwitch from "@/components/i18n/LanguageSwitch";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function AppHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { t } = useI18n();

  const getSectionTitle = () => {
    if (pathname === "/") return t("nav.stress_test");
    if (pathname === "/copywriter") return t("nav.copywriter");
    if (pathname?.startsWith("/profile")) return t("nav.profile");
    if (pathname?.startsWith("/admin/users")) return t("nav.users");
    if (pathname?.startsWith("/admin/personas")) return t("nav.personas");
    return "";
  };

  const sectionTitle = getSectionTitle();

  return (
    <header className="border-b border-white/10 bg-[#0f0f10]/90 backdrop-blur">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="text-sm font-semibold tracking-wide text-[#ededed] flex items-center gap-2">
          <span>{t("app.brand")}</span>
          {sectionTitle && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-indigo-400 font-medium">{sectionTitle}</span>
            </>
          )}
        </Link>

        {status === "loading" && <p className="text-xs text-[#a1a1aa]">{t("header.checking_session")}</p>}

        {status !== "loading" && session?.user ? (
          <div className="flex items-center gap-3">
            <LanguageSwitch compact />
            <Link href="/profile" className="text-xs text-[#a1a1aa] hover:text-[#ededed]">
              {session.user.email}
            </Link>
            <SignOutButton />
          </div>
        ) : null}

        {status !== "loading" && !session?.user ? (
          <div className="flex items-center gap-3">
            <LanguageSwitch compact />
            <SignInButton />
          </div>
        ) : null}
      </div>
    </header>
  );
}
