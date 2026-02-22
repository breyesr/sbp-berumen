"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { usePathname } from "next/navigation";

const links = [
  { href: "/profile", label: "2FA Setup" },
  { href: "/profile/security", label: "Security" },
];

export default function ProfileSectionNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Profile sections" className="rounded-lg border border-white/10 bg-[#0d0e10] p-2">
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={clsx(
                  "inline-flex rounded-md px-3 py-2 text-sm transition-colors",
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
