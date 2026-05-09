// src/app/api/admin/personas/[id]/knowledge/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { db } from "@/lib/clients";
import fs from "node:fs/promises";
import path from "node:path";
import { ingestFileContent } from "@/lib/ingestion";

export const runtime = "nodejs";

/**
 * POST /api/admin/personas/[id]/knowledge
 * Uploads and EMBEDS a knowledge file for a specific persona.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.roles)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Resolve id_text if id is numerical
    let id_text = id;
    const isNumeric = !isNaN(Number(id)) && id.toString().indexOf("-") === -1;
    
    if (isNumeric) {
      try {
        const res = await db.query(`SELECT id_text FROM personas WHERE id = $1`, [parseInt(id, 10)]);
        if (res.rows[0]) {
          id_text = res.rows[0].id_text;
        } else {
          console.warn(`Persona with numerical ID ${id} not found in DB during knowledge upload fallback.`);
        }
      } catch (dbErr: any) {
        console.error("Database error resolving id_text for knowledge upload:", dbErr);
      }
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer) {
        throw new Error("Failed to read file buffer");
    }
    const buffer = Buffer.from(arrayBuffer);

    // 1. Save to local filesystem (Fallback/Backup) - Always use id_text
    const personaDir = path.join(process.cwd(), "data", "personas", id_text);
    const knowledgeDir = path.join(personaDir, "knowledge");
    
    try {
      await fs.mkdir(knowledgeDir, { recursive: true });
      await fs.writeFile(path.join(knowledgeDir, file.name), buffer);
    } catch (fsErr: any) {
      console.error(`FileSystem sync failed for ${id_text}, but proceeding with DB embedding`, fsErr);
    }

    // 2. Process and Embed into DB (RAG) - Use id_text for metadata mapping
    const ingestResult = await ingestFileContent({
      buffer,
      filename: file.name,
      personaId: id_text,
    });

    return NextResponse.json({ 
      success: true, 
      filename: file.name,
      chunks: ingestResult.chunks 
    });
  } catch (err: any) {
    console.error("Critical error in knowledge upload API:", err);
    return NextResponse.json({ error: err.message || "An unexpected error occurred during upload" }, { status: 500 });
  }
}
