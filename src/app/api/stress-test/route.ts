// src/app/api/stress-test/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { randomUUID } from "crypto";
import { getPersona } from "@/lib/personaProvider";
import { getChallengeLevel, ChallengeLevel } from "@/lib/challengeLevels";
import { buildStressSystemPrompt, buildStressUserMessage, describeFocus } from "./prompt";
import { db } from "@/lib/clients";

export const runtime = "nodejs";

const Body = z.object({
  personaType: z.string(),
  challengeLevelId: z.string(),
  idea: z.string().min(10).max(1500),
  goal: z.string().min(5).max(300),
  evaluationFocus: z.string().min(5).max(300),
});

// 1. The Output Schema (as a Zod schema)
const SimulationResultSchema = z.object({
  personaReaction: z.string(),
  triggeredRedFlags: z.array(z.string()),
  confidenceScore: z.number().int().min(1).max(100),
  verdict: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  actionPlan: z.array(z.string()),
  followUpQuestions: z.array(z.string()),
  presentation: z.string(),
  confidenceBreakdown: z
    .object({
      problemValidity: z.number().min(0).max(100),
      solutionLogic: z.number().min(0).max(100),
      pitchClarity: z.number().min(0).max(100),
    })
    .optional(),
  debugRationale: z.string().optional(),
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

async function logUsageToDb(payload: {
  event: string;
  persona: string;
  confidence: number;
  idea: string;
  goal: string;
  verdict: string;
}) {
  try {
    const id = randomUUID();
    await db.query(
      `INSERT INTO usage_logs (id, event, persona_name, confidence_score, input_idea, goal, verdict, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [
        id,
        payload.event,
        payload.persona,
        payload.confidence,
        payload.idea,
        payload.goal,
        payload.verdict,
        JSON.stringify(payload),
      ]
    );
  } catch (err) {
    console.error("[stress-test] log insert error", err);
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = Body.parse(await req.json());
    const persona = await getPersona(body.personaType, body.idea);
    if (!persona) {
      return NextResponse.json(
        { error: "Persona not found" },
        { status: 404 }
      );
    }

    const challengeLevel = await getChallengeLevel(body.challengeLevelId);
    if (!challengeLevel) {
      return NextResponse.json(
        { error: "Challenge level not found" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const focusMeta = describeFocus(body.evaluationFocus);

    const debugEnabled = process.env.NEXT_PUBLIC_STRESS_DEBUG === "1";
    const system = buildStressSystemPrompt({
      personaName: persona.name,
      personaContext: persona.context,
      level: challengeLevel,
      focusLabel: focusMeta.label,
      includeDebug: debugEnabled,
    });
    
    const user = buildStressUserMessage({
      idea: body.idea,
      goal: body.goal,
      evaluationFocusKey: focusMeta.label,
    });

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.9,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed = SimulationResultSchema.safeParse(JSON.parse(raw));
    let usedRaw = raw;
    let retried = false;
    if (!parsed.success) {
      const retry = await openai.chat.completions.create({
        model: MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${system}\n\nReturn valid JSON only. Fix the prior formatting issues.` },
          { role: "user", content: user },
        ],
      });
      const retryRaw = retry.choices[0]?.message?.content ?? "{}";
      usedRaw = retryRaw;
      retried = true;
      parsed = SimulationResultSchema.safeParse(JSON.parse(retryRaw));
    }

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Malformed model output", details: parsed.error.format() },
        { status: 500 }
      );
    }

    // 3. The Passthrough Normalization (No rigging)
    const confidenceScore = Math.min(100, Math.max(1, parsed.data.confidenceScore || 50));

    // Map new schema to old response structure for frontend compatibility
    const responsePayload = {
      persona: persona.name,
      challengeLevel: challengeLevel.intensity,
      challengeLevelId: challengeLevel.id,
      challengeLabel: challengeLevel.name,
      challengeDetail: challengeLevel.detail,
      focus: focusMeta.label,
      personaReaction: parsed.data.personaReaction,
      triggeredRedFlags: parsed.data.triggeredRedFlags,
      summary: parsed.data.verdict,
      strengths: parsed.data.strengths,
      gaps: parsed.data.gaps,
      improvements: parsed.data.actionPlan,
      questions: parsed.data.followUpQuestions,
      presentation: parsed.data.presentation,
      confidence: confidenceScore,
      debug: debugEnabled
        ? {
            rawModelOutput: usedRaw,
            retried,
            model: MODEL,
            temperature: 0.9,
            retryTemperature: 0.4,
            systemPrompt: system,
            userPrompt: user,
            personaContext: persona.context,
            ragHighlights: persona.ragHighlights ?? null,
            confidenceBreakdown: parsed.data.confidenceBreakdown ?? null,
            debugRationale: parsed.data.debugRationale ?? null,
          }
        : undefined,
      // tone is part of prompt now, not response
    };

    // Non-blocking usage log to Vercel runtime logs
    console.log(
      JSON.stringify(
        {
          event: "stress_test_completed",
          timestamp: new Date().toISOString(),
          persona: persona.name,
          confidence_score: confidenceScore,
          input_idea: body.idea,
          verdict: parsed.data.verdict,
        },
        null,
        2
      )
    );

    // Persist usage log (best-effort, non-blocking)
    logUsageToDb({
      event: "stress_test_completed",
      persona: persona.name,
      confidence: confidenceScore,
      idea: body.idea,
      goal: body.goal,
      verdict: parsed.data.verdict,
    }).catch(() => {});

    return NextResponse.json(responsePayload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to evaluate";
    console.error("[stress-test] error", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
