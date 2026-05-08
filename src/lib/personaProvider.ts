// src/lib/personaProvider.ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { db } from "@/lib/clients";
import { hybridSearch } from "@/lib/rag";

export type Bench = {
  cplTargetMXN: [number, number];
  retentionP50: number;
  noShowRangePct: [number, number];
  channelCPL?: Record<string, [number, number]>;
  roasTarget?: number;
};

export type Persona = {
  id: number | string;
  id_text: string;
  name: string;
  role?: string;
  cluster?: string;
  is_active?: boolean;
  profile?: {
    goals?: string[];
    pains?: string[];
    channels?: string[];
    ethics?: string[];
  };
  locale?: string;
  context: string;
  bench?: Bench;
  voice?: PersonaVoice;
  voiceProfile?: string;
  anchors?: string[];
  triggers?: PersonaTrigger[];
  ragHighlights?: string | null;
};

const DATA_DIR = path.join(process.cwd(), "data", "personas");

export type PersonaVoice = {
  tone?: string;
  style?: string[];
  dos?: string[];
  donts?: string[];
  phrases?: string[];
};

export type PersonaTrigger = {
  label: string;
  description: string;
};

function normalizeVoice(input: any): PersonaVoice | null {
  if (!input || typeof input !== "object") return null;
  const toArray = (v: any) =>
    Array.isArray(v) ? v.map(String).filter(Boolean) : v ? [String(v)] : [];
  return {
    tone: typeof input.tone === "string" ? input.tone : undefined,
    style: toArray(input.style),
    dos: toArray(input.dos),
    donts: toArray(input.donts),
    phrases: toArray(input.phrases),
  };
}

function deriveVoiceFromJson(j: any): PersonaVoice {
  const quotes = Array.isArray(j.quotes) ? j.quotes.map(String).filter(Boolean) : [];
  const hasQuotes = quotes.length > 0;
  const inferredTone = hasQuotes
    ? `Match the style of these quotes: "${quotes.slice(0, 3).join('"; "')}"`
    : "Professional, analytical, and direct.";

  const style = [
    j.role ? `Perspective: ${j.role}` : "Perspective: Decision Maker",
    j.city ? `Regional Context: ${j.city}` : "",
    "Prioritize brevity",
    "No fluff",
  ].filter(Boolean);

  const pains = Array.isArray(j.pains) ? j.pains.map(String).filter(Boolean) : [];
  const donts = [
    "Do not be polite just to be nice",
    "Do not use generic AI marketing jargon",
    ...pains.slice(0, 2).map((p: string) => `Avoid triggering pain: ${p}`),
  ];

  return {
    tone: inferredTone,
    style,
    dos: ["Be skeptical", "Focus on ROI/Value"],
    donts,
    phrases: hasQuotes ? quotes.slice(0, 3) : [],
  };
}

function collectAnchors(j: any): string[] {
  const sources = [
    j.quotes,
    j.objections,
    j.pains,
    j.goals,
    j.motivations,
    j.channels,
    j.regionalNotes,
    j.business,
    j.demographics,
  ];
  const anchors: string[] = [];
  for (const src of sources) {
    if (!Array.isArray(src)) continue;
    for (const item of src) {
      if (!item || typeof item !== "string") continue;
      const trimmed = item.trim();
      if (!trimmed) continue;
      if (!anchors.includes(trimmed)) anchors.push(trimmed);
      if (anchors.length >= 5) return anchors;
    }
  }
  return anchors;
}

function formatAnchors(anchors?: string[] | null): string | null {
  if (!anchors || anchors.length === 0) return null;
  return `Persona anchors (must reference at least two):\n- ${anchors.join("\n- ")}`;
}

function buildTriggers(j: any, anchors: string[]): PersonaTrigger[] {
  const triggers: PersonaTrigger[] = [];
  const add = (label: string, description: string | undefined) => {
    if (!description) return;
    const trimmed = String(description).trim();
    if (!trimmed) return;
    triggers.push({ label, description: trimmed });
  };

  add("Primary objection", Array.isArray(j.objections) ? j.objections[0] : undefined);
  add("Core pain", Array.isArray(j.pains) ? j.pains[0] : undefined);
  add("Motivation", Array.isArray(j.motivations) ? j.motivations[0] : undefined);
  add("Decision goal", Array.isArray(j.goals) ? j.goals[0] : undefined);

  if (anchors && anchors.length > 0) {
    add("Anchor", anchors[0]);
    if (anchors[1]) add("Anchor", anchors[1]);
  }

  return triggers.slice(0, 5);
}

function formatTriggers(triggers?: PersonaTrigger[] | null): string | null {
  if (!triggers || triggers.length === 0) return null;
  const lines = triggers.map((t, i) => `${i + 1}. **${t.label}:** ${t.description}`);
  return `Persona decision triggers:\n${lines.join("\n")}`;
}

export function formatVoiceProfile(voice?: PersonaVoice | null): string | null {
  if (!voice) return null;
  const lines = [];
  if (voice.tone) lines.push(`Tone: ${voice.tone}`);
  if (voice.style && voice.style.length > 0) lines.push(`Style: ${voice.style.join(" | ")}`);
  if (voice.dos && voice.dos.length > 0) lines.push(`Dos: ${voice.dos.join(" | ")}`);
  if (voice.donts && voice.donts.length > 0) lines.push(`Donts: ${voice.donts.join(" | ")}`);
  if (voice.phrases && voice.phrases.length > 0) lines.push(`Phrases: ${voice.phrases.join(" | ")}`);
  return lines.length > 0 ? lines.join("\n") : null;
}

/**
 * Maps a database row or JSON object to a Persona object.
 */
function mapToPersona(id: number | string, id_text: string, j: any, contextStr?: string): Persona {
  const name: string = j.name ?? id_text;
  const role: string | undefined = j.role;
  const bench: Bench | undefined = j.bench
    ? {
        cplTargetMXN: [Number(j.bench.cplTargetMXN?.[0] ?? 0), Number(j.bench.cplTargetMXN?.[1] ?? 0)] as [number, number],
        retentionP50: Number(j.bench.retentionP50 ?? 0),
        noShowRangePct: [Number(j.bench.noShowRangePct?.[0] ?? 0), Number(j.bench.noShowRangePct?.[1] ?? 0)] as [number, number],
      }
    : undefined;

  const contextParts: string[] = [];
  const addContext = (label: string, v: any) => {
    if (!v) return;
    if (Array.isArray(v)) contextParts.push(`${label}: ${v.join("; ")}`);
    else if (typeof v === "string") contextParts.push(`${label}: ${v}`);
  };
  addContext("role", j.role);
  addContext("city", j.city);
  addContext("demographics", j.demographics);
  addContext("business", j.business);
  addContext("goals", j.goals);
  addContext("pains", j.pains);
  addContext("objections", j.objections);
  addContext("motivations", j.motivations);
  addContext("channels", j.channels);
  addContext("quotes", j.quotes);
  addContext("regionalNotes", j.regionalNotes);

  const voice = normalizeVoice(j.voice) ?? deriveVoiceFromJson(j);
  const voiceProfile = formatVoiceProfile(voice) ?? undefined;
  const anchors = collectAnchors(j);
  const triggers = buildTriggers(j, anchors);

  return {
    id,
    id_text,
    name,
    role,
    profile: {
      goals: j.goals ?? [],
      pains: j.pains ?? [],
      channels: j.channels ?? [],
      ethics: [],
    },
    locale: j.locale ?? "es-MX",
    context: contextStr || contextParts.join("\n"),
    bench,
    voice,
    voiceProfile,
    anchors,
    triggers,
  };
}

async function readPersonaFile(id_text: string): Promise<Persona | null> {
  const personaDir = path.join(DATA_DIR, id_text);
  const personaFile = path.join(personaDir, 'persona.json');

  try {
    const raw = await fs.readFile(personaFile, "utf8");
    const j = JSON.parse(raw);
    // Use id_text as the ID for filesystem personas to ensure uniqueness in fallback mode
    return mapToPersona(id_text, id_text, j);
  } catch {
    return null;
  }
}

/**
 * Core persona retrieval logic (DB + Filesystem fallback)
 * Does NOT include dynamic RAG context augmentation.
 */
export async function getPersonaData(id: string | number): Promise<Persona | null> {
  let persona: Persona | null = null;

  // 1. Try fetching from Database first (normalized structure)
  try {
    const isNumeric = typeof id === "number" || (!isNaN(Number(id)) && id.toString().indexOf("-") === -1);
    const query = isNumeric 
        ? `SELECT p.id, p.id_text, p.name, p.role, p.cluster, p.is_active, pi.metadata, pi.voice, pi.context 
           FROM personas p 
           LEFT JOIN persona_intelligence pi ON p.id = pi.persona_id 
           WHERE p.id = $1`
        : `SELECT p.id, p.id_text, p.name, p.role, p.cluster, p.is_active, pi.metadata, pi.voice, pi.context 
           FROM personas p 
           LEFT JOIN persona_intelligence pi ON p.id = pi.persona_id 
           WHERE p.id_text = $1`;

    const res = await db.query(query, [id]);
    
    if (res.rows[0]) {
      const row = res.rows[0];
      persona = {
        ...mapToPersona(row.id, row.id_text, row.metadata, row.context),
        cluster: row.cluster,
        is_active: row.is_active
      };
    }
  } catch (err) {
    console.error("Database error fetching persona, falling back to filesystem", err);
  }

  // 2. Fallback to filesystem if not in DB
  if (!persona) {
    const isNumeric = typeof id === "number" || (!isNaN(Number(id)) && id.toString().indexOf("-") === -1);
    
    // Only attempt filesystem fallback if the ID is a text slug. 
    // Purely numerical IDs cannot be resolved to filesystem paths without the DB.
    if (!isNumeric) {
      persona = await readPersonaFile(id.toString());
      if (persona) persona.is_active = true; // Filesystem personas are active by default
    }
  }

  return persona;
}

export async function getPersona(id: string | number, userQuery: string): Promise<Persona | null> {
  // 1. Get core persona data
  const persona = await getPersonaData(id);

  if (!persona) return null;

  // 2. Dynamic RAG Context Augmentation (Always use id_text for RAG)
  const searchResults = await hybridSearch(userQuery, persona.id_text);
  const ragContext = searchResults.map(r => r.content).join("\n\n");
  const ragHighlights = buildRagHighlights(searchResults);
  
  const voiceContext = persona.voiceProfile ? `Persona voice profile:\n${persona.voiceProfile}` : "";
  const anchorsContext = formatAnchors(persona.anchors);
  const triggersContext = formatTriggers(persona.triggers);
  
  // Combine all context layers
  const context = [
    voiceContext, 
    triggersContext, 
    anchorsContext, 
    highlightsContext(ragHighlights), 
    ragContext, 
    persona.context
  ]
    .filter(Boolean)
    .join("\n\n");

  return { ...persona, context, ragHighlights };
}

function highlightsContext(highlights: string | null): string {
  return highlights ? `Persona knowledge highlights (cite at least one if present):\n${highlights}` : "";
}

function buildRagHighlights(results: { content: string; metadata?: { source_file?: string } }[]): string | null {
  if (!results || results.length === 0) return null;
  const highlights: string[] = [];
  for (const r of results) {
    const source = r.metadata?.source_file ? path.basename(r.metadata.source_file) : "knowledge";
    const sentence = extractFirstSentence(r.content);
    if (!sentence) continue;
    const entry = `- (${source}) ${sentence}`;
    if (!highlights.includes(entry)) highlights.push(entry);
    if (highlights.length >= 3) break;
  }
  return highlights.length > 0 ? highlights.join("\n") : null;
}

function extractFirstSentence(input: string): string | null {
  if (!input) return null;
  const clean = input.replace(/\s+/g, " ").trim();
  if (!clean) return null;
  const parts = clean.split(/(?<=[.!?])\s+/);
  const sentence = parts[0] ?? clean;
  const clipped = sentence.length > 220 ? `${sentence.slice(0, 217)}...` : sentence;
  return clipped.trim() || null;
}

export async function listPersonas(options?: { allowedClusters?: string[]; isAdmin?: boolean }): Promise<{ id: number | string; id_text: string; name: string; role?: string; cluster?: string; is_active?: boolean }[]> {
    const { allowedClusters = [], isAdmin = false } = options || {};

    // 1. Try listing from Database
    try {
        let query = `SELECT id, id_text, name, role, cluster, is_active FROM personas`;
        let conditions: string[] = [];
        let params: any[] = [];

        if (!isAdmin) {
            // Non-admins only see active personas
            conditions.push(`is_active = true`);
            
            // If they have assigned clusters, restrict to those
            if (allowedClusters && allowedClusters.length > 0) {
                conditions.push(`(cluster = ANY($${params.length + 1}) OR cluster IS NULL OR LOWER(cluster) = 'general')`);
                params.push(allowedClusters);
            }
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(` AND `);
        }

        query += ` ORDER BY cluster, name ASC`;
        
        const res = await db.query(query, params);
        return res.rows.map(r => ({
            id: r.id,
            id_text: r.id_text,
            name: r.name,
            role: r.role,
            cluster: r.cluster,
            is_active: r.is_active
        }));
    } catch (err) {
        console.error("Database error listing personas, falling back to filesystem", err);
    }

    // 2. Fallback to filesystem
    try {
        const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
        const personaIds = entries
            .filter(e => e.isDirectory())
            .map(e => e.name);

        const metas = await Promise.all(
            personaIds.map(async (id_text) => {
                const p = await readPersonaFile(id_text);
                if (!p) return null;
                
                // Filesystem filtering logic
                if (!isAdmin && allowedClusters.length > 0) {
                   if (!p.cluster || !allowedClusters.includes(p.cluster)) return null;
                } else if (!isAdmin) {
                   return null;
                }

                return { id: p.id, id_text: p.id_text, name: p.name, role: p.role, cluster: p.cluster, is_active: true };
            })
        );

        return metas.filter(Boolean) as { id: number | string; id_text: string; name: string; role?: string; cluster?: string; is_active?: boolean }[];
    } catch (err) {
        console.error("Failed to list personas from filesystem", err);
        return [];
    }
}

export async function getPersonaKnowledgeFiles(personaId: string | number): Promise<string[]> {
  let id_text = personaId.toString();
  
  // Resolve id_text if numerical
  const isNumeric = typeof personaId === "number" || (!isNaN(Number(personaId)) && personaId.toString().indexOf("-") === -1);
  if (isNumeric) {
    const res = await db.query(`SELECT id_text FROM personas WHERE id = $1`, [personaId]);
    if (res.rows[0]) {
      id_text = res.rows[0].id_text;
    }
  }

  const knowledgeDir = path.join(DATA_DIR, id_text, 'knowledge');
  try {
    const files = await fs.readdir(knowledgeDir);
    return files.map(file => path.basename(file));
  } catch (error) {
    return [];
  }
}
