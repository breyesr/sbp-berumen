// src/app/api/stress-test/route.ts
import { z } from "zod";
import { randomUUID } from "crypto";
import { getPersona } from "@/lib/personaProvider";
import { getChallengeLevel } from "@/lib/challengeLevels";
import { describeFocus } from "./prompt";
import { db } from "@/lib/clients";
import { logger } from "@/lib/logger";
import { runScoringEngine, streamSynthesis } from "@/lib/scoring-engine";

export const runtime = "nodejs";

const Body = z.object({
  personaType: z.string(),
  challengeLevelId: z.string(),
  idea: z.string().min(10).max(1500),
  goal: z.string().min(5).max(300),
  evaluationFocus: z.string().min(5).max(300),
});

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const persona = await getPersona(body.personaType, body.idea);
    if (!persona) {
      return new Response(JSON.stringify({ error: "Persona not found" }), { status: 404 });
    }

    const challengeLevel = await getChallengeLevel(body.challengeLevelId);
    if (!challengeLevel) {
      return new Response(JSON.stringify({ error: "Challenge level not found" }), { status: 400 });
    }

    const focusMeta = describeFocus(body.evaluationFocus);

    // 1. Run Deterministic Scoring Engine (Micro-Agents in parallel)
    const { scores, weightedScore } = await runScoringEngine({
      personaId: persona.id,
      personaName: persona.name,
      personaContext: persona.context,
      idea: body.idea,
      goal: body.goal,
      evaluationLens: focusMeta.label,
    });

    // 2. Stream Final Synthesis (Persona Voice)
    const result = await streamSynthesis({
      personaName: persona.name,
      personaContext: persona.context,
      idea: body.idea,
      goal: body.goal,
      scores,
      weightedScore,
      challengeLevel: {
        name: challengeLevel.name,
        guidance: challengeLevel.purpose ?? challengeLevel.guidance ?? "",
      },
    });

    return result.toTextStreamResponse();

  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to evaluate";
    logger.error({ err }, "[stress-test] evaluation failed");
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
}
