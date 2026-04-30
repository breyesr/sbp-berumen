import type { Session } from "next-auth";

export type UserRole = "admin" | "user";

export function isAdminRole(roles: string[] | undefined): boolean {
  return Array.isArray(roles) && roles.includes("admin");
}

export function isAdminSession(session: Session | null): boolean {
  return Boolean(session?.user?.id) && isAdminRole(session?.user?.roles);
}

export function hasClusterAccess(session: Session | null, clusterId: string): boolean {
  if (!session?.user) return false;
  // Admin bypass
  if (isAdminRole(session.user.roles)) return true;
  // Check clusters array
  return Array.isArray(session.user.clusters) && session.user.clusters.includes(clusterId);
}
