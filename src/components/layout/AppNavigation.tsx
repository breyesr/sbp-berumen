"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const links = [
  { href: "/", label: "Stress Test" },
  { href: "/copywriter", label: "Copywriter" },
  { href: "/profile", label: "Profile" },
];

export default function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="rounded-xl border border-white/10 bg-[#0f0f10] p-2 lg:p-3">
      <ul className="flex flex-col gap-1 lg:gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={clsx(
                  "block rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-[#4F46E5]/20 text-[#ededed]"
                    : "text-[#a1a1aa] hover:bg-white/5 hover:text-[#ededed]"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
