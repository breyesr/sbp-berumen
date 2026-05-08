import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPersonaData } from "@/lib/personaProvider";

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
    const persona = await getPersonaData(id);

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }
    
    // In the future, we will check if the user has access to this cluster here (Epic 10)
    
    return NextResponse.json({ persona });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch persona" },
      { status: 500 }
    );
  }
}
