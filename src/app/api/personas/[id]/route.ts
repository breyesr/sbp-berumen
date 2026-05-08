import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/clients";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const isNumeric = !isNaN(Number(id)) && id.indexOf("-") === -1;
    const whereClause = isNumeric ? 'p.id = $1' : 'p.id_text = $1';

    const res = await db.query(
      `SELECT p.id, p.id_text, p.name, p.role, p.cluster, pi.metadata, pi.voice, pi.context 
       FROM personas p
       LEFT JOIN persona_intelligence pi ON p.id = pi.persona_id
       WHERE ${whereClause}`,
      [id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    const persona = res.rows[0];
    
    // In the future, we will check if the user has access to this cluster here (Epic 10)
    
    return NextResponse.json({ persona });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch persona" },
      { status: 500 }
    );
  }
}
