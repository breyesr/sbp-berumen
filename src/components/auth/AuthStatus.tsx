"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-sm text-gray-400">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-300">
          Signed in as {session.user?.email}
        </p>
        <SignOutButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm text-gray-400">Not signed in</p>
      <SignInButton />
    </div>
  );
}
