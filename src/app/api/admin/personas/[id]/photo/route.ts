// src/app/api/admin/personas/[id]/photo/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { db } from "@/lib/clients";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

/**
 * POST /api/admin/personas/[id]/photo
 * Uploads a profile photo for a specific persona.
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
    // Resolve id_text and verify existence
    let id_text = "";
    let numerical_id = -1;

    const isNumeric = !isNaN(Number(id)) && id.toString().indexOf("-") === -1;
    
    const personaRes = isNumeric 
        ? await db.query(`SELECT id, id_text FROM personas WHERE id = $1`, [parseInt(id, 10)])
        : await db.query(`SELECT id, id_text FROM personas WHERE id_text = $1`, [id]);

    if (!personaRes.rows[0]) {
        return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    numerical_id = personaRes.rows[0].id;
    id_text = personaRes.rows[0].id_text;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Save to public filesystem for static serving (Vercel compatible)
    const avatarsDir = path.join(process.cwd(), "public", "avatars");
    await fs.mkdir(avatarsDir, { recursive: true });
    
    // Use id_text (slug) for the filename to ensure it's predictable and public
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${id_text}${ext}`;
    
    // Remove old photos for this persona if they have different extensions
    const existingFiles = await fs.readdir(avatarsDir);
    for (const f of existingFiles) {
        if (f.startsWith(`${id_text}.`) && f !== filename) {
            await fs.unlink(path.join(avatarsDir, f)).catch(() => {});
        }
    }

    await fs.writeFile(path.join(avatarsDir, filename), buffer);
    console.log(`[API] Saved persona photo to: public/avatars/${filename}`);

    // 2. Update DB with the public static URL
    const photoUrl = `/avatars/${filename}?v=${Date.now()}`;
    await db.query(`UPDATE personas SET photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [photoUrl, numerical_id]);

    return NextResponse.json({ 
      success: true, 
      photo_url: photoUrl
    });
  } catch (err: any) {
    console.error("Critical error in persona photo upload API:", err);
    return NextResponse.json({ error: err.message || "An unexpected error occurred during upload" }, { status: 500 });
  }
}
