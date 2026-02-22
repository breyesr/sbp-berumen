"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function AppHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-white/10 bg-[#0f0f10]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="text-sm font-semibold tracking-wide text-[#ededed]">
          Synthetic Persona Web
        </Link>

        {status === "loading" && <p className="text-xs text-[#a1a1aa]">Checking session...</p>}

        {status !== "loading" && session?.user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-xs text-[#a1a1aa] hover:text-[#ededed]">
              {session.user.email}
            </Link>
            <SignOutButton />
          </div>
        ) : null}

        {status !== "loading" && !session?.user ? (
          <div className="flex items-center gap-3">
            <SignInButton />
          </div>
        ) : null}
      </div>
    </header>
  );
}
