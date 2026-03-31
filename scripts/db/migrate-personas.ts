// scripts/db/migrate-personas.ts
import { db } from "../../src/lib/clients";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const DATA_DIR = path.join(process.cwd(), "data", "personas");

async function findPersonaFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(await findPersonaFiles(fullPath));
        } else if (entry.name === 'persona.json') {
            files.push(fullPath);
        }
    }
    return files;
}

async function main() {
    try {
        console.log("🚀 Starting Persona Migration...");

        // 1. Run Schema Setup
        const schemaPath = path.join(process.cwd(), "scripts", "db", "personas-schema.sql");
        const schemaSql = await fs.readFile(schemaPath, "utf8");
        await db.query(schemaSql);
        console.log("✅ Database schema updated.");

        // 2. Find all persona files
        const personaFiles = await findPersonaFiles(DATA_DIR);
        console.log(`Found ${personaFiles.length} personas to migrate.`);

        for (const filePath of personaFiles) {
            const personaId = path.dirname(filePath).substring(DATA_DIR.length + 1);
            
            // Determine Cluster from path (e.g. "marketing/alejandro" -> cluster: "marketing")
            const pathParts = personaId.split(path.sep);
            const cluster = pathParts.length > 1 ? pathParts[0] : "General";
            const finalId = pathParts[pathParts.length - 1];

            const raw = await fs.readFile(filePath, "utf8");
            const data = JSON.parse(raw);

            // Fetch strategic depth if available
            let strategicDepth = "";
            try {
                const sdPath = path.join(path.dirname(filePath), "persona_strategic_depth.md");
                strategicDepth = await fs.readFile(sdPath, "utf8");
            } catch {
                // No strategic depth file, ignore
            }

            console.log(`Migrating persona: ${finalId} (${cluster})`);

            // Insert into DB
            await db.query(
                `INSERT INTO personas (id, name, role, cluster, metadata, context)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    cluster = EXCLUDED.cluster,
                    metadata = EXCLUDED.metadata,
                    context = EXCLUDED.context,
                    updated_at = CURRENT_TIMESTAMP`,
                [
                    finalId,
                    data.name || finalId,
                    data.role || "",
                    cluster,
                    JSON.stringify(data),
                    strategicDepth.trim()
                ]
            );
        }

        console.log("🎉 Persona migration complete!");
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    } finally {
        await db.end();
    }
}

main();
