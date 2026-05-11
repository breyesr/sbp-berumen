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
                // Intelligent Sync: Check if human edits exist
                let existingPersona = await db.query(
                    `SELECT id, id_text, name, role, cluster, updated_at, last_synced_at 
                     FROM personas WHERE id_text = $1`,
                    [finalId]
                );

                // DUPLICATION FIX: If slug doesn't match, check for Name + Cluster match
                if (existingPersona.rows.length === 0) {
                    console.log(`[Sync] No slug match for ${finalId}. Checking for Name/Cluster match...`);
                    const nameMatch = await db.query(
                        `SELECT id, id_text, name, role, cluster, updated_at, last_synced_at 
                         FROM personas WHERE name = $1 AND cluster = $2`,
                        [data.name || finalId, cluster]
                    );
                    if (nameMatch.rows.length > 0) {
                        console.log(`[Sync] Match found by Name/Cluster. Merging ${finalId} into existing persona ${nameMatch.rows[0].id_text}`);
                        existingPersona = nameMatch;
                        
                        // Optional: Update the slug in the DB to match the Git folder for future consistency
                        await db.query(`UPDATE personas SET id_text = $1 WHERE id = $2`, [finalId, nameMatch.rows[0].id]);
                    }
                }

                let personaIdInt: number;
                let wasEditedByHuman = false;
                
                if (existingPersona.rows.length > 0) {
                    const p = existingPersona.rows[0];
                    personaIdInt = p.id;
                    
                    // Standardize comparison to UTC to kill the "Timezone Ghost"
                    const updatedAt = new Date(p.updated_at).getTime();
                    const lastSyncedAt = p.last_synced_at ? new Date(p.last_synced_at).getTime() : 0;
                    
                    wasEditedByHuman = lastSyncedAt === 0 || updatedAt > lastSyncedAt;

                    if (wasEditedByHuman) {
                        console.log(`[Sync] Human edits detected for ${finalId}. Protecting identity metadata.`);
                        // Only update last_synced_at to "accept" current state as synced
                        await db.query(
                            `UPDATE personas SET last_synced_at = CURRENT_TIMESTAMP WHERE id = $1`,
                            [personaIdInt]
                        );
                    } else {
                        // Safe to update identity metadata
                        await db.query(
                            `UPDATE personas SET 
                                name = $1, role = $2, cluster = $3, 
                                updated_at = CURRENT_TIMESTAMP, 
                                last_synced_at = CURRENT_TIMESTAMP 
                             WHERE id = $4`,
                            [data.name || finalId, data.role || "", cluster, personaIdInt]
                        );
                    }
                } else {
                    // New Persona: Full Insert - Default to is_active = false for RAG Readiness
                    const resThin = await db.query(
                        `INSERT INTO personas (id_text, name, role, cluster, is_active, last_synced_at)
                         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                         RETURNING id`,
                        [finalId, data.name || finalId, data.role || "", cluster, false]
                    );
                    personaIdInt = resThin.rows[0].id;
                }

                // 2. Insert/Update persona_intelligence (Fat Table)
                if (wasEditedByHuman) {
                    console.log(`[Sync] Protecting strategic metadata for ${finalId}. Only updating grounding context.`);
                    // ONLY update context (markdown), preserve metadata/voice JSON
                    await db.query(
                        `UPDATE persona_intelligence SET 
                            context = $1 
                         WHERE persona_id = $2`,
                        [strategicDepth.trim(), personaIdInt]
                    );
                } else {
                    // Safe to update strategic metadata + grounding context
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
                }
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
