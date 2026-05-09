// src/lib/db-sync.ts
import { db } from "./clients";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "personas");

async function findPersonaFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Ignore knowledge subfolders as they might contain backups/metadata that aren't the primary persona.json
            if (entry.name === 'knowledge') continue;
            files = files.concat(await findPersonaFiles(fullPath));
        } else if (entry.name === 'persona.json') {
            files.push(fullPath);
        }
    }
    return files;
}

/**
 * Core synchronization logic to pull personas from the filesystem into the database.
 */
export async function syncPersonasFromFilesystem() {
    const results: { migrated: string[], failed: string[] } = { migrated: [], failed: [] };

    try {
        // 1. Run Schema Setup (Ensure tables exist)
        const schemaPath = path.join(process.cwd(), "scripts", "db", "personas-schema.sql");
        const schemaSql = await fs.readFile(schemaPath, "utf8");
        await db.query(schemaSql);

        // 2. Find all persona files
        const personaFiles = await findPersonaFiles(DATA_DIR);

        for (const filePath of personaFiles) {
            try {
                const personaId = path.dirname(filePath).substring(DATA_DIR.length + 1);
                const raw = await fs.readFile(filePath, "utf8");
                const data = JSON.parse(raw);

                const pathParts = personaId.split(path.sep);
                const pathCluster = pathParts.length > 1 ? pathParts[0] : "General";
                const cluster = data.cluster || pathCluster;
                const finalId = pathParts[pathParts.length - 1];

                // Fetch strategic depth if available (Name Agnostic)
                let strategicDepth = "";
                try {
                    const dirFiles = await fs.readdir(path.dirname(filePath));
                    const mdFiles = dirFiles.filter(f => f.toLowerCase().endsWith(".md"));
                    
                    if (mdFiles.length > 0) {
                        // Prioritization: 
                        // 1. FICHA_TECNICA or PERSONA_STRATEGIC_DEPTH
                        // 2. Any other markdown file (pick the first/only one)
                        const primaryFile = mdFiles.find(f => 
                            f.toUpperCase().includes("FICHA_TECNICA") || 
                            f.toUpperCase().includes("STRATEGIC_DEPTH")
                        ) || mdFiles[0];

                        strategicDepth = await fs.readFile(path.join(path.dirname(filePath), primaryFile), "utf8");
                    }
                } catch (sdErr) {
                    console.error(`Failed to read strategic depth for ${personaId}`, sdErr);
                }

                // 1. Insert/Update personas (Thin Table)
                const resThin = await db.query(
                    `INSERT INTO personas (id_text, name, role, cluster)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (id_text) DO UPDATE SET
                        name = EXCLUDED.name,
                        role = EXCLUDED.role,
                        cluster = EXCLUDED.cluster,
                        updated_at = CURRENT_TIMESTAMP
                     RETURNING id`,
                    [
                        finalId, // this is the slug from the filesystem
                        data.name || finalId,
                        data.role || "",
                        cluster
                    ]
                );
                
                const personaIdInt = resThin.rows[0].id;

                // 2. Insert/Update persona_intelligence (Fat Table)
                // Note: We include voice if it exists in the data
                await db.query(
                    `INSERT INTO persona_intelligence (persona_id, metadata, voice, context)
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (persona_id) DO UPDATE SET
                        metadata = EXCLUDED.metadata,
                        voice = EXCLUDED.voice,
                        context = EXCLUDED.context`,
                    [
                        personaIdInt,
                        JSON.stringify(data),
                        data.voice ? JSON.stringify(data.voice) : null,
                        strategicDepth.trim()
                    ]
                );
                results.migrated.push(finalId);
            } catch (err) {
                console.error(`Failed to sync persona at ${filePath}`, err);
                results.failed.push(filePath);
            }
        }
        return results;
    } catch (err: any) {
        console.error("Critical error during syncPersonasFromFilesystem:", err);
        throw err;
    }
}
