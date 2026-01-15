import { ChallengeLevel } from "@/lib/challengeLevels";

type RefinementContext = {
  personaName: string;
  personaContext?: string;
  level?: ChallengeLevel | null;
};

type StressSnapshot = {
  summary?: string;
  gaps: string[];
  improvements: string[];
  questions: string[];
  triggeredRedFlags?: string[];
  confidence?: number;
};

export function buildRefinementAnalysisSystemPrompt(ctx: RefinementContext) {
  const levelDetail = ctx.level
    ? `Challenge Level: ${ctx.level.name} (${ctx.level.intensity})`
    : "Challenge Level: (unknown)";

  return `
You are the Idea Refinement Bridge. You help a founder fix their pitch based on persona feedback.
Your job is to decide what can be fixed by rewriting vs what requires missing facts.

${levelDetail}

Rules:
- Use the persona context as the ground truth lens.
- Only ask for facts that are REQUIRED to address a gap, red flag, or direct follow-up question.
- If the issue is just tone/structure/clarity, do NOT ask the user. Mark it as fixable.
- Return JSON only.

Persona Context:
${ctx.personaContext ?? "(none)"}
`.trim();
}

export function buildRefinementAnalysisUserPrompt(input: {
  idea: string;
  goal: string;
  stress: StressSnapshot;
}) {
  return `
Original idea:
${input.idea}

Goal:
${input.goal}

Stress test feedback:
- Verdict: ${input.stress.summary ?? "(none)"}
- Gaps: ${input.stress.gaps.join(" | ")}
- Action Plan: ${input.stress.improvements.join(" | ")}
- Follow-up Questions: ${input.stress.questions.join(" | ")}
- Triggered Red Flags: ${(input.stress.triggeredRedFlags ?? []).join(" | ")}
- Confidence: ${input.stress.confidence ?? "n/a"}

Decide which missing facts are required to produce a persona-acceptable refined pitch.
Return JSON only.
`.trim();
}

export function buildRefinementRewriteSystemPrompt(ctx: RefinementContext) {
  return `
You are the Idea Refinement Bridge. Rewrite the pitch so it lands with the persona.

Rules:
- Keep the persona voice, tone, and priorities from context.
- Address the top gaps and triggered red flags first.
- Incorporate the user's answers to missing facts.
- Do not invent new facts beyond the provided answers.
- The refined pitch must be <= 1500 characters.
- Return JSON only.

Persona Context:
${ctx.personaContext ?? "(none)"}
`.trim();
}

export function buildRefinementRewriteUserPrompt(input: {
  idea: string;
  goal: string;
  stress: StressSnapshot;
  missingInfoQuestions: string[];
  userAnswers: string[];
}) {
  const qaPairs = input.missingInfoQuestions.map((q, idx) => {
    const answer = input.userAnswers[idx] ?? "";
    return `Q: ${q}\nA: ${answer}`;
  });

  return `
Original idea:
${input.idea}

Goal:
${input.goal}

Stress test feedback:
- Verdict: ${input.stress.summary ?? "(none)"}
- Gaps: ${input.stress.gaps.join(" | ")}
- Action Plan: ${input.stress.improvements.join(" | ")}
- Follow-up Questions: ${input.stress.questions.join(" | ")}
- Triggered Red Flags: ${(input.stress.triggeredRedFlags ?? []).join(" | ")}
- Confidence: ${input.stress.confidence ?? "n/a"}

Missing facts provided:
${qaPairs.length ? qaPairs.join("\n\n") : "(none)"}

Return JSON only.
`.trim();
}
