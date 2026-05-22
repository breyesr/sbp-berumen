"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignOutButton } from "@/components/auth/SignOutButton";
import LanguageSwitch from "@/components/i18n/LanguageSwitch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
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
    <header className="border-b border-border bg-background/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 3L35 11.66V28.34L20 37L5 28.34V11.66L20 3Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"></path>
            <path d="M20 10L28 14.5V25.5L20 30L12 25.5V14.5L20 10Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"></path>
            <circle cx="20" cy="20" r="3.5" fill="currentColor" className="text-primary"></circle>
            <path d="M20 3V10M35 11.66L28 14.5M35 28.34L28 25.5M20 37V30M5 28.34L12 25.5M5 11.66L12 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"></path>
          </svg>
          <div className="text-2xl font-bold tracking-tight text-foreground font-brand">IntelAgent</div>
          
          {sectionTitle && (
            <>
              <span className="h-8 w-[1px] bg-border mx-2" />
              <span className="text-primary font-semibold font-brand self-center pt-1">{sectionTitle}</span>
            </>
          )}
        </Link>

        {status === "loading" && <p className="text-xs text-foreground-muted">{t("header.checking_session")}</p>}

        <div className="flex items-center gap-3">
          <LanguageSwitch compact />
          <ThemeToggle />
          
          {status !== "loading" && session?.user ? (
            <>
              <Link href="/profile" className="hidden sm:block text-xs text-foreground-muted hover:text-foreground">
                {session.user.email}
              </Link>
              <SignOutButton />
            </>
          ) : null}

          {status !== "loading" && !session?.user ? (
            <SignInButton />
          ) : null}
        </div>
      </div>
    </header>
  );
}
