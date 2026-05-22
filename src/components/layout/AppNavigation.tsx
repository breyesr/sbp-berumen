"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { isAdminRole } from "@/lib/rbac";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Brain, PenTool, User, Users, FileText, PanelLeftClose, PanelLeftOpen } from "lucide-react";

const links = [
  { href: "/", labelKey: "nav.stress_test" as const, icon: Brain },
  { href: "/copywriter", labelKey: "nav.copywriter" as const, icon: PenTool },
  { href: "/profile", labelKey: "nav.profile" as const, icon: User },
];

export default function AppNavigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useI18n();
  const allLinks = isAdminRole(session?.user?.roles)
    ? [
        ...links, 
        { href: "/admin/users", labelKey: "nav.users" as const, icon: Users },
        { href: "/admin/personas", labelKey: "nav.personas" as const, icon: FileText }
      ]
    : links;

  return (
    <nav aria-label={t("nav.main_aria")} className={clsx("flex flex-col gap-4 rounded-xl border border-border bg-surface p-2 lg:p-3 transition-all duration-300 shadow-sm", isCollapsed ? "w-16" : "w-56")}>
      <div className="flex items-center justify-between px-2 hidden lg:flex">
        {!isCollapsed && <span className="text-[10px] font-bold text-foreground-subtle uppercase tracking-[0.2em] font-brand">Menu</span>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-1 text-foreground-muted hover:text-foreground rounded-md hover:bg-surface-hover transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <ul className="flex flex-col gap-1 lg:gap-2">
        {allLinks.map((link) => {
          const isActive =
            link.href === "/profile"
              ? pathname?.startsWith("/profile")
              : pathname === link.href;

          const Icon = link.icon;

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 font-brand font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground-muted hover:bg-surface-hover hover:text-foreground",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? t(link.labelKey) : undefined}
              >
                <Icon size={18} className={clsx("shrink-0", isActive ? "text-primary" : "text-foreground-subtle")} />
                {!isCollapsed && <span>{t(link.labelKey)}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
