import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonaData } from "@/lib/personaProvider";
import { isAdminRole } from "@/lib/rbac";

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
  const isAdmin = isAdminRole(session.user.roles);

  try {
    const persona = await getPersonaData(id);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Security Gate: Non-admins can only see active personas with RAG
    if (!isAdmin && (!persona.is_active || !persona.has_rag)) {
      return NextResponse.json({ error: "Persona not ready or deactivated" }, { status: 403 });
    }
    
    return NextResponse.json({ persona });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch persona" },
      { status: 500 }
    );
  }
}
