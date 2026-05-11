import { db } from "../src/lib/clients";
import fs from "node:fs/promises";
import path from "node:path";

async function migrate() {
    console.log("🚀 Starting Epic 21 migration...");
    try {
        const migrationPath = path.join(process.cwd(), "scripts", "db", "utc-timezone-migration.sql");
        const sql = await fs.readFile(migrationPath, "utf8");
        
        console.log("Applying SQL...");
        await db.query(sql);
        
        console.log("✅ Migration successful!");
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();
