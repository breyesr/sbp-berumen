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

    let clusters = [];
    try {
      const result = await db.query(
        `SELECT id, name, description FROM clusters ORDER BY name ASC`
      );
      clusters = result.rows;
    } catch (dbError) {
      console.warn("Clusters table might be missing, returning empty list:", dbError);
      clusters = [];
    }

    return NextResponse.json({ clusters }, { status: 200 });
  } catch (error) {
    console.error("Admin list clusters error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
