// src/lib/scoring-engine.ts
import { generateObject, streamObject } from "ai";
import { z } from "zod";
import { aiProvider } from "./clients";
import { 
  VALUE_ADVOCATE_SYSTEM, 
  FEASIBILITY_SYSTEM, 
  LENS_SCORER_SYSTEM, 
  SYNTHESIS_AGENT_SYSTEM,
  buildMicroAgentUserPrompt,
  buildSynthesisUserPrompt
} from "@/prompts/scoring-engine";
import { logger } from "./logger";
import { generateScoringKey, getCachedScores, setCachedScores } from "./cache";

const MicroAgentResultSchema = z.object({
  score: z.number().min(0).max(100),
  rationale: z.string(),
});

export type MicroAgentResult = z.infer<typeof MicroAgentResultSchema>;

export async function runScoringEngine(args: {
  personaId: string | number;
  personaName: string;
  personaContext: string;
  idea: string;
  goal: string;
  evaluationLens?: string;
  model?: string;
}) {
  const cacheKey = generateScoringKey({
    personaId: args.personaId.toString(),
    idea: args.idea,
    goal: args.goal,
    evaluationLens: args.evaluationLens,
  });

  const cached = await getCachedScores(cacheKey);
  if (cached) return cached;

  const modelName = args.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const model = aiProvider(modelName);

  const userPrompt = buildMicroAgentUserPrompt({
    personaName: args.personaName,
    personaContext: args.personaContext,
    idea: args.idea,
    goal: args.goal,
    evaluationLens: args.evaluationLens,
  });

  logger.info({ persona: args.personaName }, "Starting parallel micro-agent scoring");

  // 1. Run Micro-Agents in parallel
  const [valueResult, feasibilityResult, lensResult] = await Promise.all([
    generateObject({
      model,
      schema: MicroAgentResultSchema,
      system: VALUE_ADVOCATE_SYSTEM,
      prompt: userPrompt,
    }),
    generateObject({
      model,
      schema: MicroAgentResultSchema,
      system: FEASIBILITY_SYSTEM,
      prompt: userPrompt,
    }),
    generateObject({
      model,
      schema: MicroAgentResultSchema,
      system: LENS_SCORER_SYSTEM,
      prompt: userPrompt,
    }),
  ]);

  const scores = {
    value: valueResult.object,
    feasibility: feasibilityResult.object,
    lens: lensResult.object,
  };

  // 2. Calculate Weighted Score (Deterministic Math)
  // Value: 50%, Feasibility: 30%, Lens: 20%
  const weightedScore = Math.round(
    scores.value.score * 0.5 +
    scores.feasibility.score * 0.3 +
    scores.lens.score * 0.2
  );

  logger.info({ weightedScore, scores }, "Micro-agent scoring completed");

  const result = {
    scores,
    weightedScore,
    userPrompt, // Useful for the synthesis agent
  };

  await setCachedScores(cacheKey, result);

  return result;
}

const FinalSynthesisSchema = z.object({
  personaReaction: z.string(),
  verdict: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  actionPlan: z.array(z.string()),
  presentation: z.string(),
  followUpQuestions: z.array(z.string()),
  confidenceScore: z.number().min(0).max(100),
  confidenceBreakdown: z.object({
    problemValidity: z.number().min(0).max(100),
    solutionLogic: z.number().min(0).max(100),
    pitchClarity: z.number().min(0).max(100),
  }),
  scoringRationale: z.object({
    value: z.string(),
    feasibility: z.string(),
    lens: z.string(),
  }),
});

export async function streamSynthesis(args: {
  personaName: string;
  personaContext: string;
  idea: string;
  goal: string;
  scores: any;
  weightedScore: number;
  challengeLevel: { name: string; guidance: string };
  model?: string;
}) {
  const modelName = args.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const model = aiProvider(modelName);

  const synthesisPrompt = buildSynthesisUserPrompt({
    personaContext: args.personaContext,
    idea: args.idea,
    goal: args.goal,
    scores: args.scores,
    weightedScore: args.weightedScore,
    challengeLevel: args.challengeLevel,
  });

  return streamObject({
    model,
    schema: FinalSynthesisSchema,
    system: SYNTHESIS_AGENT_SYSTEM
      .replace("{personaName}", args.personaName)
      .replace("{challengeLevelName}", args.challengeLevel.name)
      .replace("{challengeLevelGuidance}", args.challengeLevel.guidance),
    prompt: synthesisPrompt,
  });
}
