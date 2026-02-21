import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles?: string[];
      apps?: string[];
      personas?: string[];
      two_factor_enabled?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roles?: string[];
    apps?: string[];
    personas?: string[];
    two_factor_enabled?: boolean;
  }
}
