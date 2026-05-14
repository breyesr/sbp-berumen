import { db } from "../../src/lib/clients";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * PHOTO SYNC SCRIPT
 * Updates the 'photo_url' column in the database based on files present in public/avatars/
 * 
 * Usage: npx tsx scripts/db/sync-photos.ts
 */

const AVATAR_DIR = path.join(process.cwd(), "public", "avatars");

async function main() {
  console.log("🚀 Starting Persona Photo Synchronization...");

  try {
    // 1. Ensure the directory exists
    try {
      await fs.access(AVATAR_DIR);
    } catch {
      console.error(`❌ ERROR: Directory ${AVATAR_DIR} not found.`);
      process.exit(1);
    }

    // 2. Read all files in the directory
    const files = await fs.readdir(AVATAR_DIR);
    const photoFiles = files.filter(file => 
      file.toLowerCase().endsWith(".png") || 
      file.toLowerCase().endsWith(".jpg") || 
      file.toLowerCase().endsWith(".jpeg") || 
      file.toLowerCase().endsWith(".webp")
    );

    console.log(`🔍 Found ${photoFiles.length} photo assets.`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const file of photoFiles) {
      const slug = path.parse(file).name;
      const photoUrl = `/avatars/${file}`;

      // Update the persona with matching id_text (slug)
      const result = await db.query(
        `UPDATE personas SET photo_url = $1 WHERE id_text = $2 RETURNING id, name`,
        [photoUrl, slug]
      );

      if (result.rowCount && result.rowCount > 0) {
        console.log(`✅ Updated ${result.rows[0].name} (${slug}) -> ${photoUrl}`);
        updatedCount++;
      } else {
        console.log(`⚠️  No persona found for slug: ${slug} (file: ${file})`);
        skippedCount++;
      }
    }

    console.log(`\n✨ Sync Complete!`);
    console.log(`📊 Summary: ${updatedCount} updated, ${skippedCount} skipped.`);

  } catch (error) {
    console.error("❌ Photo sync failed:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
