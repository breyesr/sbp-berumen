import { auth } from "@/lib/auth";
import { db } from "@/lib/clients";
import { isAdminRole } from "@/lib/rbac";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminRole(session.user.roles)) {
      return NextResponse.json({ error: "Forbidden: admin access required" }, { status: 403 });
    }

    const result = await db.query(
      `SELECT
        u.id,
        u.email,
        u.two_factor_enabled,
        COALESCE(array_remove(array_agg(DISTINCT r.name), NULL), ARRAY[]::TEXT[]) AS roles,
        COALESCE(array_remove(array_agg(DISTINCT uca."clusterId"), NULL), ARRAY[]::TEXT[]) AS clusters
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur."userId"
      LEFT JOIN roles r ON ur."roleId" = r.id
      LEFT JOIN user_cluster_access uca ON u.id = uca."userId"
      GROUP BY u.id, u.email, u.two_factor_enabled
      ORDER BY u.email ASC`
    );

    return NextResponse.json({ users: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Admin list users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
