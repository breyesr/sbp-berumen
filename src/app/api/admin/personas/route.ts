import { NextResponse } from "next/server";
import { db } from "@/lib/clients";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.roles)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const res = await db.query(
      `SELECT p.id, p.id_text, p.name, p.role, p.cluster, p.is_active, pi.metadata, pi.context, p.updated_at,
              EXISTS (SELECT 1 FROM documents d WHERE d.metadata->'persona_numerical_ids' @> to_jsonb(p.id::int)) as has_rag
       FROM personas p
       LEFT JOIN persona_intelligence pi ON p.id = pi.persona_id
       ORDER BY p.cluster ASC, p.name ASC`
    );
    return NextResponse.json({ personas: res.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.roles)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const client = await db.connect();
  try {
    const body = await req.json();
    const { name, role, cluster, metadata, voice, context, is_active } = body;

    if (!name || !cluster) {
      return NextResponse.json({ error: "Name and Cluster are required" }, { status: 400 });
    }

    await client.query('BEGIN');

    // ULTRA-ROBUST slug normalization for id_text
    // 1. Normalize to NFD to separate accents
    // 2. Remove accents
    // 3. Lowercase
    // 4. Replace anything that isn't a-z or 0-9 with a single dash
    // 5. Trim dashes from ends
    const normalizedName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const id_text = normalizedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        + "-" + randomUUID().slice(0, 4);

    console.log(`[API] Creating persona: name="${name}", normalized="${normalizedName}", slug="${id_text}"`);

    // 1. Insert into Thin Table
    const resThin = await client.query(
      `INSERT INTO personas (id_text, name, role, cluster, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [id_text, name, role || "", cluster, is_active === true]
    );

    const personaId = resThin.rows[0].id;

    // 2. Insert into Fat Table
    await client.query(
      `INSERT INTO persona_intelligence (persona_id, metadata, voice, context)
       VALUES ($1, $2, $3, $4)`,
      [personaId, metadata || {}, voice || {}, context || ""]
    );

    await client.query('COMMIT');
    return NextResponse.json({ success: true, id: personaId, id_text });
  } catch (err: any) {
    await client.query('ROLLBACK');
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
