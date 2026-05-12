// src/app/api/public/personas/[id]/photo/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/clients";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

/**
 * GET /api/public/personas/[id]/photo
 * Serves the profile photo for a specific persona.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Resolve id_text
    let id_text = "";
    const isNumeric = !isNaN(Number(id)) && id.toString().indexOf("-") === -1;
    
    const personaRes = isNumeric 
        ? await db.query(`SELECT id_text FROM personas WHERE id = $1`, [parseInt(id, 10)])
        : await db.query(`SELECT id_text FROM personas WHERE id_text = $1`, [id]);

    if (!personaRes.rows[0]) {
        return new NextResponse("Persona not found", { status: 404 });
    }

    id_text = personaRes.rows[0].id_text;

    // Find the photo file
    const personaDir = path.join(process.cwd(), "data", "personas", id_text);
    const files = await fs.readdir(personaDir).catch(() => []);
    const photoFile = files.find(f => f.startsWith("photo."));

    if (!photoFile) {
        return new NextResponse("Photo not found", { status: 404 });
    }

    const filePath = path.join(personaDir, photoFile);
    const buffer = await fs.readFile(filePath);
    
    // Determine content type
    const ext = path.extname(photoFile).toLowerCase();
    const contentType = ext === ".png" ? "image/png" : 
                        ext === ".gif" ? "image/gif" : 
                        ext === ".webp" ? "image/webp" : "image/jpeg";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (err: any) {
    console.error("Error serving persona photo:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
