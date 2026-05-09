// src/lib/ingestion.ts
import { db, openai } from "./clients";
import { v5 as uuidv5 } from 'uuid';
import * as pdf from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';
import { logger } from "./logger";

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

function generateUUID(value: string): string {
  return uuidv5(value, UUID_NAMESPACE);
}

function chunkText(text: string): string[] {
    if (!text) return [];
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
        chunks.push(text.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
}

function getTextFromPersonaJson(data: any): string {
    return Object.entries(data)
        .map(([key, value]) => {
            if (typeof value === 'string') return value;
            if (typeof value === 'object' && value !== null) return getTextFromPersonaJson(value);
            return '';
        })
        .join(' ');
}

async function getTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
    const extension = path.extname(filename).toLowerCase();

    if (extension === '.json') {
        const data = JSON.parse(buffer.toString('utf-8'));
        return getTextFromPersonaJson(data);
    } else if (extension === '.pdf') {
        const data = await (pdf as any)(buffer);
        return data.text;
    } else if (extension === '.docx') {
        const data = await mammoth.extractRawText({ buffer });
        return data.value;
    } else {
        return buffer.toString('utf-8');
    }
}

/**
 * Main ingestion function to process a file buffer and store embeddings.
 */
export async function ingestFileContent(args: {
    buffer: Buffer;
    filename: string;
    personaId: string;
}) {
    const { buffer, filename, personaId } = args;
    
    try {
        const text = await getTextFromBuffer(buffer, filename);
        const chunks = chunkText(text);

        const metadata = {
            source_file: filename,
            persona_ids: [personaId],
            uploaded_at: new Date().toISOString(),
        };

        logger.info({ personaId, filename, chunks: chunks.length }, "Starting embedding process for uploaded file");

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const uniqueChunkIdentifier = `upload::${personaId}::${filename}::chunk${i}`;
            const docId = generateUUID(uniqueChunkIdentifier);

            const embeddingResponse = await openai.embeddings.create({
                model: EMBEDDING_MODEL,
                input: chunk,
            });
            const embedding = embeddingResponse.data[0].embedding;

            const upsertQuery = `
                INSERT INTO documents (id, content, embedding, metadata)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO UPDATE SET
                    content = EXCLUDED.content,
                    embedding = EXCLUDED.embedding,
                    metadata = EXCLUDED.metadata;
            `;
            await db.query(upsertQuery, [docId, chunk, `[${embedding.join(',')}]`, metadata]);
        }

        // 3. AUTO-SYNTHESIS LITE: Update persona record with context/metadata if it's currently empty
        // This ensures the dossier works immediately after upload.
        try {
            const currentPersona = await db.query(
                `SELECT p.id, pi.context, pi.metadata 
                 FROM personas p 
                 JOIN persona_intelligence pi ON p.id = pi.persona_id 
                 WHERE p.id_text = $1`, 
                [personaId]
            );

            if (currentPersona.rows[0]) {
                const { id, context, metadata: currentMeta } = currentPersona.rows[0];
                const needsContext = !context || context.trim() === "";
                const isFicha = filename.toUpperCase().includes("FICHA_TECNICA") || filename.toUpperCase().includes("PERSONA_STRATEGIC_DEPTH");
                
                if (needsContext && isFicha) {
                    await db.query(
                        `UPDATE persona_intelligence SET context = $1 WHERE persona_id = $2`,
                        [text, id]
                    );
                    console.log(`[Ingestion] Auto-populated context for ${personaId} from ${filename}`);
                }

                // Simple check for metadata fields
                const needsMeta = !currentMeta.strategic_synthesis || (currentMeta.goals?.length === 0 && currentMeta.pains?.length === 0);
                if (needsMeta && filename.endsWith(".json")) {
                    try {
                        const jsonMeta = JSON.parse(buffer.toString('utf-8'));
                        await db.query(
                            `UPDATE persona_intelligence SET metadata = $1 WHERE persona_id = $2`,
                            [JSON.stringify(jsonMeta), id]
                        );
                        console.log(`[Ingestion] Auto-populated metadata for ${personaId} from JSON upload`);
                    } catch (e) { /* ignore invalid JSON */ }
                }
            }
        } catch (syncErr) {
            console.error(`[Ingestion] Failed to auto-populate persona ${personaId}:`, syncErr);
        }

        logger.info({ personaId, filename }, "File successfully ingested and embedded");
        return { success: true, chunks: chunks.length };

    } catch (err: any) {
        logger.error({ err, personaId, filename }, "Failed to ingest file content");
        throw err;
    }
}
