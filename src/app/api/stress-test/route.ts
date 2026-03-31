// src/app/api/stress-test/route.ts
import { streamObject } from "ai";
import { z } from "zod";
import { randomUUID } from "crypto";
import { getPersona } from "@/lib/personaProvider";
import { getChallengeLevel } from "@/lib/challengeLevels";
import { buildStressSystemPrompt, buildStressUserMessage, describeFocus } from "./prompt";
import { db, aiProvider } from "@/lib/clients";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const Body = z.object({
  personaType: z.string(),
  challengeLevelId: z.string(),
  idea: z.string().min(10).max(1500),
  goal: z.string().min(5).max(300),
  evaluationFocus: z.string().min(5).max(300),
});

const SimulationResultSchema = z.object({
  personaReaction: z.string().describe("The persona's raw first-person gut check."),
  triggeredRedFlags: z.array(z.string()).describe("List of violated triggers or objections."),
  verdict: z.string().describe("2-3 sentences explaining the honest reaction and decision path."),
  strengths: z.array(z.string()).describe("Bullet list of genuine positives."),
  gaps: z.array(z.string()).describe("Specific flaws written as first-person complaints."),
  actionPlan: z.array(z.string()).describe("2-4 fixes tied to persona context."),
  followUpQuestions: z.array(z.string()).describe("2-4 follow-up questions."),
  presentation: z.string().describe("First-person pitch of the idea by the persona."),
  confidenceScore: z.number().min(0).max(100).describe("Overall confidence score from 0 to 100."),
  confidenceBreakdown: z.object({
    problemValidity: z.number().min(0).max(100),
    solutionLogic: z.number().min(0).max(100),
    pitchClarity: z.number().min(0).max(100),
  }).optional(),
  debugRationale: z.string().optional(),
});

async function logUsageToDb(payload: any) {
  try {
    const id = randomUUID();
    await db.query(
      `INSERT INTO usage_logs (id, event, persona_name, confidence_score, input_idea, goal, verdict, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [
        id,
        "stress_test_completed",
        payload.persona,
        payload.confidence,
        payload.idea,
        payload.goal,
        payload.verdict,
        JSON.stringify(payload),
      ]
    );
  } catch (err) {
    logger.error({ err, payload }, "[stress-test] database log insert error");
  }
}

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

    const result = await streamObject({
      model: aiProvider(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      schema: SimulationResultSchema,
      system,
      prompt: user,
      onFinish: ({ object }) => {
        if (object) {
          // Log completion
          logger.info(
            {
              persona: persona.name,
              confidence: object.confidenceScore,
              verdict: object.verdict,
            },
            "Stress test simulation completed"
          );

          // Persist usage log
          logUsageToDb({
            persona: persona.name,
            confidence: object.confidenceScore,
            idea: body.idea,
            goal: body.goal,
            // Include other metadata for the payload
            challengeLevel: challengeLevel.intensity,
            challengeLabel: challengeLevel.name,
            focus: focusMeta.label,
            ...object
          }).catch(() => {});
        }
      },
    });

    return result.toTextStreamResponse();

  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to evaluate";
    logger.error({ err }, "[stress-test] evaluation failed");
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
}
