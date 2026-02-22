import type { Session } from "next-auth";

export type UserRole = "admin" | "user";

export function isAdminRole(roles: string[] | undefined): boolean {
  return Array.isArray(roles) && roles.includes("admin");
}

export function isAdminSession(session: Session | null): boolean {
  return Boolean(session?.user?.id) && isAdminRole(session?.user?.roles);
}
