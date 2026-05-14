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
  { href: "/stresstest", labelKey: "nav.stress_test_linear" as const, icon: Brain },
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
    <nav aria-label={t("nav.main_aria")} className={clsx("flex flex-col gap-4 rounded-xl border border-white/10 bg-[#0f0f10] p-2 lg:p-3 transition-all duration-300", isCollapsed ? "w-16" : "w-56")}>
      <div className="flex items-center justify-between px-2 hidden lg:flex">
        {!isCollapsed && <span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">Menu</span>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-1 text-[#a1a1aa] hover:text-[#ededed] rounded-md hover:bg-white/5 transition-colors"
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-[#4F46E5]/20 text-[#ededed]"
                    : "text-[#a1a1aa] hover:bg-white/5 hover:text-[#ededed]",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? t(link.labelKey) : undefined}
              >
                <Icon size={18} className={clsx("shrink-0", isActive ? "text-[#6366F1]" : "text-[#71717a]")} />
                {!isCollapsed && <span>{t(link.labelKey)}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
