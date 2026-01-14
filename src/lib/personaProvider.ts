// src/lib/personaProvider.ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { hybridSearch } from "@/lib/rag";

export type Bench = {
  cplTargetMXN: [number, number];
  retentionP50: number;
  noShowRangePct: [number, number];
};

export type Persona = {
  id: string;
  name: string;
  role?: string;
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
  const arrays = [
    j.demographics,
    j.business,
    j.goals,
    j.pains,
    j.objections,
    j.motivations,
    j.channels,
    j.quotes,
    j.regionalNotes,
  ];
  const text = arrays
    .flatMap((v) => (Array.isArray(v) ? v : v ? [v] : []))
    .join(" ")
    .toLowerCase();

  const keywordMap = [
    "analítico",
    "estructurado",
    "directo",
    "claro",
    "riguroso",
    "práctico",
    "empático",
    "humano",
    "estratégico",
    "orientado a resultados",
    "ejecutivo",
    "narrativo",
    "crítico",
  ];
  const toneHits = keywordMap.filter((k) => text.includes(k));
  const tone =
    toneHits.length > 0
      ? toneHits.join(", ")
      : "profesional, claro, orientado a resultados";

  const style = [
    "Usa frases claras y concretas; evita jerga vacía.",
    "Prioriza síntesis, titulares y acciones.",
    "Conecta cada punto con impacto de negocio.",
  ];

  const dos = [];
  if (text.includes("accionable") || text.includes("insight")) {
    dos.push("Traduce hallazgos en decisiones y acciones concretas.");
  }
  if (text.includes("reporte") || text.includes("reportes largos") || text.includes("síntesis") || text.includes("titulares")) {
    dos.push("Sé breve y ejecutiva/o; prioriza titulares claros.");
  }
  if (text.includes("precio") || text.includes("costo") || text.includes("rentabilidad") || text.includes("retorno")) {
    dos.push("Ancla el valor en ROI y costo-beneficio.");
  }
  if (text.includes("comparar") || text.includes("comparables")) {
    dos.push("Presenta comparables claros y criterios de decisión.");
  }
  if (text.includes("qa") || text.includes("calidad") || text.includes("errores") || text.includes("campo")) {
    dos.push("Menciona control de calidad y riesgos operativos.");
  }

  const donts = [
    "No uses generalidades sin respaldo.",
    "No prometas sin métricas o evidencia.",
  ];

  const phrases = Array.isArray(j.quotes) ? j.quotes.map(String) : [];

  return {
    tone,
    style,
    dos,
    donts,
    phrases,
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

async function readPersonaFile(id: string): Promise<Persona | null> {
  const personaDir = path.join(DATA_DIR, id);
  const personaFile = path.join(personaDir, 'persona.json');

  try {
    const raw = await fs.readFile(personaFile, "utf8");
    const trimmed = raw.trim();

    if (trimmed.startsWith("{")) {
      const j = JSON.parse(trimmed);
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
      const add = (label: string, v: any) => {
        if (!v) return;
        if (Array.isArray(v)) contextParts.push(`${label}: ${v.join("; ")}`);
        else if (typeof v === "string") contextParts.push(`${label}: ${v}`);
      };
      add("role", j.role);
      add("city", j.city);
      add("demographics", j.demographics);
      add("business", j.business);
      add("goals", j.goals);
      add("pains", j.pains);
      add("objections", j.objections);
      add("motivations", j.motivations);
      add("channels", j.channels);
      add("quotes", j.quotes);
      add("regionalNotes", j.regionalNotes);

      const voice = normalizeVoice(j.voice) ?? deriveVoiceFromJson(j);
      const voiceProfile = formatVoiceProfile(voice);
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
        context: contextParts.join("\n"),
        bench,
        voice,
        voiceProfile,
        anchors,
        triggers,
      };
    }

    const { data, content } = matter(raw);
    const voice = normalizeVoice(data.voice) ?? null;
    const voiceProfile = formatVoiceProfile(voice);
    const anchors = Array.isArray(data.anchors) ? data.anchors.map(String) : [];
    const triggers = Array.isArray(data.triggers) ? data.triggers.map((t: any) => ({
      label: String(t?.label ?? "Trigger"),
      description: String(t?.description ?? ""),
    })) : [];

    return {
      id: data.id ?? id,
      name: data.name ?? id,
      role: data.role,
      profile: data.profile,
      locale: data.locale,
      context: (content ?? "").trim(),
      bench: data.bench,
      voice,
      voiceProfile,
      anchors,
      triggers,
    };
  } catch {
    return null;
  }
}

export async function getPersona(id: string, userQuery: string): Promise<Persona | null> {
  const file = await readPersonaFile(id);
  if (!file) return null;

  // Use the user's query for hybrid search to get relevant context
  const searchResults = await hybridSearch(userQuery, id);
  const ragContext = searchResults.map(r => r.content).join("\n\n");
  const ragHighlights = buildRagHighlights(searchResults);
  const voiceContext = file.voiceProfile ? `Persona voice profile:\n${file.voiceProfile}` : "";
  const anchorsContext = formatAnchors(file.anchors);
  const triggersContext = formatTriggers(file.triggers);
  const highlightsContext = ragHighlights ? `Persona knowledge highlights (cite at least one if present):\n${ragHighlights}` : "";

  // Combine the dynamic RAG context with the static context from the persona file
  const context = [voiceContext, triggersContext, anchorsContext, highlightsContext, ragContext, file.context]
    .filter(Boolean)
    .join("\n\n");

  return { ...file, context };
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

export async function listPersonas(): Promise<{ id: string; name: string; role?: string }[]> {
    try {
        const personaFiles = await findPersonaFiles(DATA_DIR);
        const metas = await Promise.all(
            personaFiles.map(async (file) => {
                const id = path.dirname(file).substring(DATA_DIR.length + 1);
                const p = await readPersonaFile(id);
                return p ? { id: p.id, name: p.name, role: p.role } : null;
            })
        );

        const existing = metas.filter(Boolean) as { id: string; name: string; role?: string }[];
        
        return existing;
    } catch (err) {
        console.error("Failed to list personas", err);
        return []; // Return empty array if error occurs
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
