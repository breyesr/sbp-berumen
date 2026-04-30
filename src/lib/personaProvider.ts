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
  id: string;
  name: string;
  role?: string;
  cluster?: string;
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
function mapToPersona(id: string, j: any, contextStr?: string): Persona {
  const name: string = j.name ?? id;
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

async function readPersonaFile(id: string): Promise<Persona | null> {
  const personaDir = path.join(DATA_DIR, id);
  const personaFile = path.join(personaDir, 'persona.json');

  try {
    const raw = await fs.readFile(personaFile, "utf8");
    const j = JSON.parse(raw);
    return mapToPersona(id, j);
  } catch {
    return null;
  }
}

export async function getPersona(id: string, userQuery: string): Promise<Persona | null> {
  let persona: Persona | null = null;

  // 1. Try fetching from Database first
  try {
    const res = await db.query(
      `SELECT id, name, role, cluster, metadata, voice, context FROM personas WHERE id = $1`,
      [id]
    );
    if (res.rows[0]) {
      const row = res.rows[0];
      persona = {
        ...mapToPersona(row.id, row.metadata, row.context),
        cluster: row.cluster
      };
    }
  } catch (err) {
    console.error("Database error fetching persona, falling back to filesystem", err);
  }

  // 2. Fallback to filesystem if not in DB
  if (!persona) {
    persona = await readPersonaFile(id);
  }

  if (!persona) return null;

  // 3. Dynamic RAG Context Augmentation
  const searchResults = await hybridSearch(userQuery, id);
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

export async function listPersonas(options?: { allowedClusters?: string[]; isAdmin?: boolean }): Promise<{ id: string; name: string; role?: string; cluster?: string }[]> {
    const { allowedClusters = [], isAdmin = false } = options || {};

    // 1. Try listing from Database
    try {
        let query = `SELECT id, name, role, cluster FROM personas`;
        let params: any[] = [];

        if (!isAdmin && allowedClusters.length > 0) {
            query += ` WHERE cluster = ANY($1)`;
            params.push(allowedClusters);
        } else if (!isAdmin) {
            // If not admin and no clusters, they see nothing (or maybe only "general"?)
            // For now, strict: no clusters = no access, unless we decide 'general' is public.
            query += ` WHERE cluster = ANY($1)`;
            params.push([]); 
        }

        query += ` ORDER BY cluster, name ASC`;
        
        const res = await db.query(query, params);
        return res.rows.map(r => ({
            id: r.id,
            name: r.name,
            role: r.role,
            cluster: r.cluster
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
            personaIds.map(async (id) => {
                const p = await readPersonaFile(id);
                if (!p) return null;
                
                // Filesystem filtering logic
                if (!isAdmin && allowedClusters.length > 0) {
                   if (!p.cluster || !allowedClusters.includes(p.cluster)) return null;
                } else if (!isAdmin) {
                   return null;
                }

                return { id: p.id, name: p.name, role: p.role, cluster: p.cluster };
            })
        );

        return metas.filter(Boolean) as { id: string; name: string; role?: string; cluster?: string }[];
    } catch (err) {
        console.error("Failed to list personas from filesystem", err);
        return [];
    }
}

export async function getPersonaKnowledgeFiles(personaId: string): Promise<string[]> {
  const knowledgeDir = path.join(DATA_DIR, personaId, 'knowledge');
  try {
    const files = await fs.readdir(knowledgeDir);
    return files.map(file => path.basename(file));
  } catch (error) {
    return [];
  }
}
