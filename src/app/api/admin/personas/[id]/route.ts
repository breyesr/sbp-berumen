// src/app/api/admin/personas/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/clients";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data", "personas");

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

  const client = await db.connect();
  try {
    const body = await req.json();
    const { name, role, cluster, metadata, voice, context, is_active, photo_url } = body;

    await client.query('BEGIN');

    const isNumeric = !isNaN(Number(id)) && id.indexOf("-") === -1;
    const whereClause = isNumeric ? 'id = $6' : 'id_text = $6';

    // 1. Update Thin Table
    const resThin = await client.query(
      `UPDATE personas 
       SET name = COALESCE($1, name), 
           role = COALESCE($2, role), 
           cluster = COALESCE($3, cluster),
           is_active = COALESCE($4, is_active),
           photo_url = COALESCE($5, photo_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE ${whereClause}
       RETURNING id`,
      [name, role, cluster, is_active, photo_url, id]
    );

    if (resThin.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    const personaId = resThin.rows[0].id;

    // 2. Update Fat Table (only if heavy data is provided)
    if (metadata !== undefined || voice !== undefined || context !== undefined) {
      await client.query(
        `INSERT INTO persona_intelligence (persona_id, metadata, voice, context)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (persona_id) DO UPDATE SET
           metadata = COALESCE(EXCLUDED.metadata, persona_intelligence.metadata),
           voice = COALESCE(EXCLUDED.voice, persona_intelligence.voice),
           context = COALESCE(EXCLUDED.context, persona_intelligence.context)`,
        [personaId, metadata, voice, context]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
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
    const isNumeric = !isNaN(Number(id)) && id.indexOf("-") === -1;
    const whereClause = isNumeric ? 'id = $1' : 'id_text = $1';
    
    // Get id_text for FS cleanup before deleting from DB
    const pRes = await db.query(`SELECT id_text FROM personas WHERE ${whereClause}`, [id]);
    const id_text = pRes.rows[0]?.id_text;

    await db.query(`DELETE FROM personas WHERE ${whereClause}`, [id]);

    if (id_text && !process.env.VERCEL) {
        const personaDir = path.join(DATA_DIR, id_text);
        try {
            await fs.rm(personaDir, { recursive: true, force: true });
            console.log(`[API] Cleaned up folder: ${id_text}`);
        } catch (fsErr) {
            console.error(`[API] Failed to clean up folder ${id_text}:`, fsErr);
        }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
