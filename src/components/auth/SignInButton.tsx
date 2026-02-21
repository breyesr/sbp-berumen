"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Link href="/login">
      <Button>
        Sign in
      </Button>
    </Link>
  );
}
