// src/app/api/admin/personas/[id]/knowledge/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

/**
 * POST /api/admin/personas/[id]/knowledge
 * Uploads a knowledge file for a specific persona.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.roles)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Ensure the persona directory exists in the filesystem (fallback/legacy support)
    const personaDir = path.join(process.cwd(), "data", "personas", id);
    const knowledgeDir = path.join(personaDir, "knowledge");
    
    try {
      await fs.mkdir(knowledgeDir, { recursive: true });
    } catch (err) {
      console.error("Failed to create knowledge directory", err);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(knowledgeDir, file.name);
    
    await fs.writeFile(filePath, buffer);

    // TODO: Trigger Task 5.4 (Ingest/Embed Pipeline) here in the next phase.
    console.log(`Knowledge file saved for persona ${id}: ${file.name}`);

    return NextResponse.json({ success: true, filename: file.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
