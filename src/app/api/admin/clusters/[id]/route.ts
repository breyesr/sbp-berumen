import { auth } from "@/lib/auth";
import { db } from "@/lib/clients";
import { isAdminRole } from "@/lib/rbac";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id || !isAdminRole(session.user.roles)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description } = await req.json();
    
    // Get original name to update personas if name changes
    const oldClusterRes = await db.query('SELECT name FROM clusters WHERE id = $1', [id]);
    if (oldClusterRes.rowCount === 0) {
      return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
    }
    const oldName = oldClusterRes.rows[0].name;

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Update the cluster
      await client.query(
        `UPDATE clusters SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
        [name || oldName, description, id]
      );

      // If name changed, update all personas that used the old name
      if (name && name !== oldName) {
        await client.query(
          `UPDATE personas SET cluster = $1 WHERE cluster = $2`,
          [name, oldName]
        );
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Cluster PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id || !isAdminRole(session.user.roles)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the name before deleting
    const clusterRes = await db.query('SELECT name FROM clusters WHERE id = $1', [id]);
    if (clusterRes.rowCount === 0) {
      return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
    }
    const clusterName = clusterRes.rows[0].name;

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Delete the cluster
      await client.query('DELETE FROM clusters WHERE id = $1', [id]);

      // Move associated personas to 'General'
      await client.query(
        `UPDATE personas SET cluster = 'General' WHERE cluster = $1`,
        [clusterName]
      );

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Cluster DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
