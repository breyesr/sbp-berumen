// src/app/api/admin/personas/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/clients";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/personas/[id]
 * Updates persona metadata (cluster, role, name, etc.)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.roles)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, role, cluster, metadata, context, is_active } = body;

    const res = await db.query(
      `UPDATE personas 
       SET name = COALESCE($1, name), 
           role = COALESCE($2, role), 
           cluster = COALESCE($3, cluster),
           metadata = COALESCE($4, metadata),
           context = COALESCE($5, context),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, role, cluster, metadata, context, is_active, id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/personas/[id]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.roles)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await db.query(`DELETE FROM personas WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
