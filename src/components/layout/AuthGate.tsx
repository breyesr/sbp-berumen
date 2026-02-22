"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "@/components/auth/SignInButton";

export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
        <h1 className="mb-4 text-3xl font-bold">Access Denied</h1>
        <p className="mb-8">Please sign in to use the application.</p>
        <SignInButton />
      </div>
    );
  }

  return <>{children}</>;
}
