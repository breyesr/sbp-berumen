import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import type { AppLocale } from "@/lib/i18n/config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles?: string[];
      apps?: string[];
      personas?: string[];
      clusters?: string[];
      two_factor_enabled?: boolean;
      locale?: AppLocale;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roles?: string[];
    apps?: string[];
    personas?: string[];
    clusters?: string[];
    two_factor_enabled?: boolean;
    locale?: AppLocale;
  }
}
