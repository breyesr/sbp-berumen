"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";

const links = [
  { href: "/profile", labelKey: "profile_nav.twofa_setup" as const },
  { href: "/profile/security", labelKey: "profile_nav.security" as const },
];

export default function ProfileSectionNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav aria-label={t("profile_nav.aria")} className="rounded-xl border border-border bg-surface p-1.5 shadow-sm">
      <ul className="flex flex-wrap gap-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={clsx(
                  "inline-flex rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 font-brand",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground-subtle hover:text-foreground hover:bg-surface-hover"
                )}
              >
                {t(link.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
