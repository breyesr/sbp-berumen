// src/app/api/copywriter/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import fs from "fs/promises";
import path from "path";
import { getPersona } from "@/lib/personaProvider";
import { randomUUID } from "crypto";
import { db } from "@/lib/clients";

export const runtime = "nodejs";

type PlatformFile = {
  id: string;
  name: string;
  icon?: string;
  platform_purpose?: string;
  core_voice?: string;
  tone_adaptation?: string;
  copy_guidelines_summary?: string;
  global_guidelines?: Record<string, any>;
};

type FormatFile = {
  id: string;
  platform_id: string;
  name: string;
  includes_formats?: string[];
  content_type_group?: string;
  primary_goal_vibe?: string;
  tone_preference?: string;
  copy_guidelines?: Record<string, any>;
  on_screen_text_guidelines?: Record<string, any>;
  hashtags_mentions?: Record<string, any>;
  technical_constraints?: Record<string, any>;
  required_elements?: string[];
  output_fields?: string[];
  disallowed_practices?: string[];
  sub_format_emphasis_rules?: Record<string, any>;
  // New fields for Copywriter 2.0
  system_directives?: {
    tone: string[];
    copywriting_rules: string[];
  };
  required_generation_elements?: string[];
  hard_constraints?: string[];
};

type PlatformWithFormats = PlatformFile & { formats: FormatFile[] };

const PATHS = {
  platformsRoot: path.join(
    process.cwd(),
    "data",
    "copywriter",
    "digital-platforms"
  ),
  companyGuidelinesDir: path.join(
    process.cwd(),
    "data",
    "global-knowledge",
    "company-guidelines"
  ),
};

const RequestSchema = z.object({
  personaType: z.union([z.string(), z.number()]),
  context: z.string().optional().default(""),
  message: z.string().min(5),
  goal: z.string().min(5),
  platforms: z.array(z.string()).min(1),
  formats: z.array(z.string()).min(1),
});

const OutputSchema = z.object({
  outputs: z.array(
    z.object({
      platformId: z.string(),
      platformName: z.string(),
      formatId: z.string(),
      formatName: z.string(),
      fields: z.record(z.string(), z.string()),
      strategicAlignment: z.object({
        anchorsUsed: z.array(z.string()).optional(),
        triggersAddressed: z.array(z.string()).optional(),
        reasoning: z.string().optional(),
      }).optional(),
    })
  ),
});

async function logUsageToDb(payload: {
  event: string;
  persona: string;
  platforms: string[];
  formats: string[];
  goal: string;
  message: string;
  context?: string;
}) {
  try {
    const id = randomUUID();
    await db.query(
      `INSERT INTO usage_logs (id, event, persona_name, confidence_score, input_idea, goal, verdict, payload)
       VALUES ($1, $2, $3, NULL, $4, $5, NULL, $6::jsonb)`,
      [
        id,
        payload.event,
        payload.persona,
        payload.message,
        payload.goal,
        JSON.stringify(payload),
      ]
    );
  } catch (err) {
    console.error("[copywriter] log insert error", err);
  }
}

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function loadCompanyGuidelines(): Promise<Record<string, any>> {
  try {
    const entries = await fs.readdir(PATHS.companyGuidelinesDir, {
      withFileTypes: true,
    });
    const candidate = entries.find(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".json") &&
        !entry.name.startsWith(".")
    );
    if (!candidate) {
      return {};
    }
    const filePath = path.join(PATHS.companyGuidelinesDir, candidate.name);
    const parsed = await readJson<Record<string, any>>(filePath);
    return parsed ?? {};
  } catch {
    return {};
  }
}

export async function loadPlatforms(): Promise<PlatformWithFormats[]> {
  try {
    const entries = await fs.readdir(PATHS.platformsRoot, {
      withFileTypes: true,
    });

    // Sort platforms by directory name to respect numerical prefixes
    const sortedEntries = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith("."))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const platforms: PlatformWithFormats[] = [];

    for (const entry of sortedEntries) {
      const platformDir = path.join(PATHS.platformsRoot, entry.name);
      const platform = await readJson<PlatformFile>(
        path.join(platformDir, "platform.json")
      );
      if (!platform) continue;

      const formatsDir = path.join(platformDir, "formats");
      let formats: FormatFile[] = [];
      try {
        const formatFiles = await fs.readdir(formatsDir, {
          withFileTypes: true,
        });
        
        // Sort format files to respect numerical prefixes (e.g. 01-feed-post.json)
        const sortedFormatFiles = formatFiles
          .filter(
            (f) =>
              f.isFile() &&
              f.name.toLowerCase().endsWith(".json") &&
              !f.name.startsWith(".")
          )
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        const parsedFormats = await Promise.all(
          sortedFormatFiles.map((file) =>
            readJson<FormatFile>(path.join(formatsDir, file.name))
          )
        );
        formats = parsedFormats.filter(Boolean) as FormatFile[];
      } catch {
        formats = [];
      }

      platforms.push({ ...platform, formats });
    }

    return platforms;
  } catch {
    return [];
  }
}

function buildPrompt(options: {
  personaName: string;
  personaContext?: string;
  anchors?: string[];
  triggers?: { label: string; description: string }[];
  knowledge?: string[];
  messageContext?: string;
  message: string;
  goal: string;
  companyGuidelines: Record<string, any>;
  platforms: PlatformWithFormats[];
  selectedPlatformIds: string[];
  selectedFormats: FormatFile[];
}) {
  const selectedPlatforms = options.platforms.filter((p) =>
    options.selectedPlatformIds.includes(p.id)
  );

  const selectedPairs = options.selectedFormats
    .map(
      (f, idx) =>
        `${idx + 1}. ${f.platform_id} :: ${f.id} (${f.name})`
    )
    .join("\n");

  const platformDetails = selectedPlatforms
    .map(
      (p) => `
Platform: ${p.name} (${p.id})
- Purpose: ${p.platform_purpose ?? "n/a"}
- Core voice: ${p.core_voice ?? "n/a"}
- Tone adaptation: ${p.tone_adaptation ?? "n/a"}
- Copy summary: ${p.copy_guidelines_summary ?? "n/a"}
- Global guidelines: ${JSON.stringify(p.global_guidelines ?? {}, null, 2)}
`.trim()
    )
    .join("\n\n");

  const formatDetails = options.selectedFormats
    .map(
      (f) => `
Format: ${f.name} (${f.id}) on ${f.platform_id}
- Goal/vibe: ${f.primary_goal_vibe ?? "n/a"}
- Tone preference: ${f.tone_preference ?? (f.system_directives?.tone?.join(" | ")) ?? "n/a"}
- Copy guidelines: ${JSON.stringify(f.copy_guidelines ?? f.system_directives?.copywriting_rules ?? {}, null, 2)}
- On-screen text: ${JSON.stringify(
        f.on_screen_text_guidelines ?? {},
        null,
        2
      )}
- Hashtags/mentions: ${JSON.stringify(f.hashtags_mentions ?? {}, null, 2)}
- Technical: ${JSON.stringify(f.technical_constraints ?? {}, null, 2)}
- Required elements: ${(f.required_elements ?? f.required_generation_elements ?? []).join("; ")}
- Output fields: ${(f.output_fields ?? f.required_generation_elements ?? ["primaryCopy", "alternateCopy"]).join("; ")}
- Disallowed: ${(f.disallowed_practices ?? f.hard_constraints ?? []).join("; ")}
`.trim()
    )
    .join("\n\n");

  const anchorsText = options.anchors?.length 
    ? `### TARGET AUDIENCE ANCHORS (USE AT LEAST TWO)\n- ${options.anchors.join("\n- ")}`
    : "";

  const triggersText = options.triggers?.length
    ? `### TARGET AUDIENCE TRIGGERS (ADDRESS AT LEAST ONE)\n${options.triggers.map(t => `- **${t.label}:** ${t.description}`).join("\n")}`
    : "";

  const knowledgeText = options.knowledge?.length
    ? `### AUDIENCE INTELLIGENCE (FACTS & INSIGHTS)\n${options.knowledge.map(k => `- ${k}`).join("\n")}`
    : "";

  return `
You are a senior marketing copywriter crafting platform-native copy that converts. Your task is to write copy for the target audience specified, following all platform guidelines, format requirements, and company rules without exception.

**Your Target Audience:**
${options.personaName}
${options.personaContext ?? "(no extra demographics context)"}

**Strategic Audience Profile — Use this to build resonance:**

Audience Anchors (underlying values and philosophy):
${anchorsText || "n/a"}

Audience Triggers (pain points, objections, friction):
${triggersText || "n/a"}

Audience Intelligence (facts, preferences, technical knowledge):
${knowledgeText || "n/a"}

**Company Rules:**
Brand voice, tone, banned phrases, and CTA standards:
${JSON.stringify(options.companyGuidelines, null, 2)}

**Platform & Format Rules:**
${platformDetails}

${formatDetails}

**Message & Context:**
Core message to communicate:
${options.message}

Conversion or awareness goal:
${options.goal}

Additional background context:
${options.messageContext || "(none provided)"}

**Platforms & Formats to Create (produce one output for each, in this order):**
${selectedPairs}

---

**Your Instructions:**

1. **Lead with the promise.** Start every piece with "what's in it for this audience"—the big benefit or insight they need to hear first. Use **What? So What? Now What?** structure: establish the opportunity (What?), explain why it matters to this specific persona (So What?), then guide toward action (Now What?).

2. **Tailor for resonant logic.** Make the copy feel built by someone who truly understands their world. Translate the Audience Anchors into language and logic that feels personally relevant to this reader—don't quote them verbatim. Use the Audience Triggers (pain points) to address their real friction and objections. Ground arguments in the Audience Intelligence facts to build credibility.

3. **Respect all constraints.** Obey platform tone, length, hashtag policy, and technical specifications exactly. Honor all company banned phrases. Make copy specific and concrete—no generic hype.

4. **Match output fields precisely.** For each format, populate the "fields" object with keys that match the "Output fields" listed for that format above. Use specific keys like "Video_Title", "SEO_Description", "Hook", etc. exactly as requested. **EVERY piece of content—including the main copy, hashtags, CTAs, and notes—MUST be placed inside this "fields" object.** Do not invent root-level properties.

5. **Standardized Keys for Support Elements.** If a format requires hashtags, a CTA, or notes, use the keys "HASHTAGS", "CTA", and "NOTES" respectively within the "fields" object.

6. **Produce all requested outputs.** Generate exactly ${options.selectedFormats.length} outputs, one per selected format id above, in the order specified. Do not skip any. If context feels sparse, still produce best-effort compliant copy rather than omitting an output.

7. **Strategic Mapping.** For each output, populate the "strategicAlignment" object. List which specific "Anchors" and "Triggers" from the profile above you used to write that variant. Add a brief "reasoning" (1 sentence) explaining why this copy resonates with the persona.

8. **Front-load hooks and structure for platform best practices.** Lead with attention, benefit, or insight appropriate to each platform. Place CTAs where platform norms expect them.

9. **Include hashtags only when platform guidance permits.** Skip them if the platform rules indicate they don't fit the format.

10. **Match the language of the user's message.** All generated text—including captions, scripts, titles, "notes", and "strategicAlignment.reasoning"—must be in the same language as the user's core message. Do not mix languages.`;
}

export async function GET() {
  const platforms = await loadPlatforms();
  const companyGuidelines = await loadCompanyGuidelines();

  return NextResponse.json({ platforms, companyGuidelines });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      personaType,
      message,
      context,
      goal,
      platforms: platformIds,
      formats,
    } = parsed.data;

    const [platforms, companyGuidelines, persona] = await Promise.all([
      loadPlatforms(),
      loadCompanyGuidelines(),
      getPersona(personaType, [context, message].filter(Boolean).join(" ")),
    ]);

    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found" },
        { status: 404 }
      );
    }

    const platformMap = new Map(platforms.map((p) => [p.id, p]));
    const selectedPlatforms = platformIds
      .map((id) => platformMap.get(id))
      .filter(Boolean) as PlatformWithFormats[];

    if (selectedPlatforms.length === 0) {
      return NextResponse.json(
        { error: "No valid platforms provided" },
        { status: 400 }
      );
    }

    const formatMap = new Map<string, FormatFile>();
    platforms.forEach((p) => {
      p.formats.forEach((f) => {
        formatMap.set(f.id, f);
      });
    });

    const selectedFormats = formats
      .map((id) => formatMap.get(id))
      .filter(
        (f): f is FormatFile =>
          Boolean(f) && platformIds.includes(f!.platform_id)
      );

    if (selectedFormats.length === 0) {
      return NextResponse.json(
        { error: "No valid formats for selected platforms" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt({
      personaName: persona.name,
      personaContext: persona.context,
      anchors: persona.anchors,
      triggers: persona.triggers,
      knowledge: persona.knowledge,
      message,
      messageContext: context,
      goal,
      companyGuidelines,
      platforms,
      selectedPlatformIds: platformIds,
      selectedFormats: selectedFormats,
    });

    const result = await streamObject({
        model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
        schema: OutputSchema,
        system: prompt,
        prompt: "Generate the copy following the platform and format requirements.",
        temperature: 0.2,
        onFinish: ({ object }) => {
             // Structured log for audit
            console.log(
                JSON.stringify(
                {
                    event: "copywriter_generated_stream_finished",
                    timestamp: new Date().toISOString(),
                    persona: persona.name,
                    platforms: platformIds,
                    formats,
                    goal,
                    message,
                    context,
                },
                null,
                2
                )
            );

            // Persist usage log (best-effort, non-blocking)
            logUsageToDb({
                event: "copywriter_generated",
                persona: persona.name,
                platforms: platformIds,
                formats,
                goal,
                message,
                context,
            }).catch(() => {});
        }
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate copy";
    console.error("[copywriter] error", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
