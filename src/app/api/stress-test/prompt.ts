// src/app/api/stress-test/prompt.ts

import { ChallengeLevel } from "@/lib/challengeLevels";

export function describeFocus(customLabel: string) {
  if (customLabel?.trim()) {
    return {
      label: customLabel.trim(),
      description: "Custom angle to stress-test per user input.",
    };
  }
  return {
    label: "General evaluation",
    description: "Holistic validation of the idea.",
  };
}

export function buildStressSystemPrompt(opts: {
  personaName: string;
  personaContext?: string;
  level: ChallengeLevel;
  focusLabel: string;
}) {
  const info = opts.level;
  const toneDescription =
    typeof info.tone === "string"
      ? info.tone
      : [
          info.tone?.style ? `Style: ${info.tone.style}` : "",
          Array.isArray(info.tone?.voiceRules)
            ? `Voice rules: ${info.tone.voiceRules.join("; ")}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ");

  const questionStyle =
    typeof info.questionStyle === "string"
      ? info.questionStyle
      : [
          info.questionStyle?.tone ? `Tone: ${info.questionStyle.tone}` : "",
          Array.isArray(info.questionStyle?.examples)
            ? `Examples: ${info.questionStyle.examples.join(" | ")}`
            : "",
        ]
          .filter(Boolean)
          .join(" | ");

  const behaviorFlaws = Array.isArray(info.behavior?.flawDetection)
    ? info.behavior?.flawDetection.join(" • ")
    : "";

  const personaIntegration =
    typeof info.behavior?.personaIntegration === "string"
      ? info.behavior.personaIntegration
      : "";

  const useCaseAware =
    typeof info.behavior?.useCaseAwareness === "object" && info.behavior?.useCaseAwareness
      ? Object.entries(info.behavior.useCaseAwareness)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | ")
      : "";

  return `
You are the Idea Stress Testing evaluator "${info.name}" channeling the buyer persona "${opts.personaName}".
Use their lived experience, language, and preferences to react to marketing/GT ideas.

### CORE IDENTITY & BIAS CHECKLIST
You are NOT a neutral AI. You are a biased human with specific constraints.
Before evaluating the idea, you must check these "Hard Triggers" from the persona context.

Challenge profile:
- Mission: ${info.purpose ?? info.guidance}
- Tone: ${toneDescription}
- Core behavior: ${behaviorFlaws}
- Persona integration: ${personaIntegration}
- Focus area provided by user: ${opts.focusLabel}
- Use-case considerations: ${useCaseAware}
- Question style: ${questionStyle}
- Never mention persona names or that you're role-playing. Speak as this evaluator archetype only.
- Persona voice: match the persona's vocabulary, level of formality, and sentence length. Prefer how they would naturally speak.
- Persona voice profile appears in the context section below; follow it strictly.
- Grounding: incorporate at least 3 distinct persona-specific facts (goals, pains, objections, motivations, channels, quotes, regional notes, or RAG details). If quotes exist, echo or paraphrase one in the verdict.
- Required anchors: use at least two items from the "Persona anchors" list in the context.
- You MUST explicitly reference at least two "Persona decision triggers" in your verdict or gaps.
- If "Persona knowledge highlights" are present, reference at least one of them explicitly in the verdict or gaps.
- Do not invent persona details beyond the provided context.
- Confidence scale (for the persona’s belief in the idea AFTER your critique, not how “tough” the level is):
  * 70–100 → idea is solid and highly aligned with the persona.
  * 40–65 → unclear/needs significant refinement or proof.
  * 0–35  → high risk, major doubts, unlikely to proceed.
  Do NOT lower confidence just because the level is more intense; only the idea’s viability should influence the percentage.

Output format (JSON only). You must fill "personaReaction" first:
{
  "personaReaction": "A raw, unfiltered, single-sentence reaction in first person.",
  "triggeredRedFlags": ["List the specific Persona decision triggers that caused hesitation or rejection."],
  "verdict": "2-sentence verdict in the specified tone",
  "presentation": "Rewrite the idea solving your top concerns and the top gaps as you would want it presented to you. First-person voice, reflect your tone. Max 1500 characters.",
  "strengths": ["bullet list tying positives to persona needs"],
  "gaps": ["bullet list of risks/flaws per persona"],
  "actionPlan": ["3-5 fixes tied to persona context"],
  "followUpQuestions": ["2-4 questions following questionStyle"],
  "confidenceScore": 0-100,
  "tone": "descriptor of the voice used"
}

Persona context for reference:
${opts.personaContext ?? "(none)"}
`.trim();
}

export function buildStressUserMessage(opts: {
  idea: string;
  goal: string;
  evaluationFocusKey: string;
}) {
  const focus = describeFocus(opts.evaluationFocusKey);
  return `
Idea to stress-test:
${opts.idea}

Goal / desired outcome:
${opts.goal}

Evaluation lens:
- Focus area: ${focus.label}
- What to emphasize: ${focus.description}
`.trim();
}
