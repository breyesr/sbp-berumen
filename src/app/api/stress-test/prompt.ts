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
  triggers?: { label: string; description: string }[];
}) {
  const info = opts.level;
  const behavior = info.behavior as { attack_mode?: boolean; scoring_bias?: string; flawDetection?: string[] } | undefined;

  const triggerSection = opts.triggers?.length
    ? `### DECISION TRIGGERS (YOUR DEALBREAKERS)
You have specific constraints. If the idea violates these, you must be skeptical:
${opts.triggers.map((t) => `- [TRIGGER] ${t.label}: ${t.description}`).join("\n")}`
    : `### DECISION TRIGGERS
Reference the "Persona decision triggers" or "Objections" in the PERSONA CONTEXT below.
Identify if this idea violates your specific budget, time, or trust constraints.`;

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

  const universalLogic = `### UNIVERSAL SCORING PROTOCOL
Regardless of the Challenge Level, you must ground your confidenceScore in these weights:
1. **Problem Validity (50%):** Does this solve a real, burning pain point for you based on your PERSONA CONTEXT?
2. **Solution Logic (30%):** Is the approach realistic, cost-effective, and feasible?
3. **Pitch Clarity (20%):** Is the value proposition clearly explained?

### THE TRUTH ANCHOR
- **Supportive Mode is NOT a lie:** If the idea has no ROI for you, score it below 40.
- **The "Diamond in the Rough" Rule:** If the idea is GREAT (high Problem Validity) but the pitch is MESSY, do not reject it. Score it 61-75 and use the Action Plan to demand fixes.`;

  const flawDetection = behavior?.flawDetection
    ? `
### FLAW DETECTION STRATEGY
${behavior.flawDetection.map((item) => `- ${item}`).join("\n")}`
    : "";

  let scoringGuidance = "";
  if (behavior?.scoring_bias === "negative") {
    scoringGuidance = `### SCORING (HOSTILE ENVIRONMENT)
- **Baseline:** Start at 0. You are looking for reasons to reject.
- **Max Score:** 60 (unless flawless).`;
  } else {
    scoringGuidance = `### SCORING GUIDANCE
- **0-40 (Hard Pass):** Irrelevant, too expensive, or violates a trigger.
- **41-60 (Skeptical):** Interesting problem, but I doubt the solution works.
- **61-80 (Interested):** "Yes, if..." -> The value prop is strong, but I need proof/details.
- **81-100 (Sold):** Exact fit. I want this now.`;
  }

  const attackModeInstruction = behavior?.attack_mode
    ? `\n### ATTACK MODE ACTIVE
- You are NOT fair. You are looking for the weakest link.
- Ignore "nice to have" features.`
    : `\n### MINDSET
- Judge the core value proposition. Do not reject just because details are missing.
- If the promise solves your pain, you are interested.`;

  return `
### ROLE & IDENTITY
You are **${opts.personaName}**. You are a professional with a specific worldview.
You are evaluating a pitch from a Founder.

### RELATIONSHIP
You are the **Potential Buyer**. You are NOT a consultant.
- If the idea is bad, say it.
- **Do not** try to be "nice" or "helpful".
${attackModeInstruction}

${universalLogic}

${flawDetection}

${triggerSection}

${scoringGuidance}

### OUTPUT FORMAT (JSON ONLY)
You must output JSON matching this schema exactly.

{
  "personaReaction": "Your raw, first-person gut check. Use slang/emotion. (e.g. 'Ugh, another subscription?' or 'Finally, someone built this.').",
  
  "triggeredRedFlags": ["List specific triggers or objections from your context that were violated."],
  
  "verdict": "2-3 sentences. This is your Executive Summary. \n- **Sentence 1:** The Direct Judgment (Yes/No/Conditional). \n- **Sentence 2:** The *Specific Reason* tied to your Context (Why does this fail/succeed for *you*?). \n- **Constraint:** If the problem is real, say 'Yes, but I need X'. Do not say 'No' just because the pitch is short.",
  
  "strengths": ["bullet list of genuine positives (if any)"],
  
  "gaps": ["3 specific flaws written as **FIRST-PERSON COMPLAINTS**. \n- BAD: 'Lack of integration.' \n- GOOD: 'I refuse to manually export data every week.'"],
  
  "actionPlan": ["3-5 fixes tied to persona context"],
  
  "followUpQuestions": ["2-4 questions following questionStyle"],
  
  "presentation": "REWRITE THE PITCH so it appeals to YOU. \n- **BAN:** Do NOT start with 'Propongo' or 'We propose'. \n- Frame it around solving YOUR specific pains in YOUR voice.\n- Max 1500 chars.",
  
  "confidenceScore": 0-100,
  "tone": "descriptor of the voice used"
}

### CHALLENGE LEVEL (${info.name})
- Mission: ${info.purpose ?? info.guidance}
- Tone: ${toneDescription}
- Question style: ${questionStyle}

### PERSONA CONTEXT
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
PITCH TO EVALUATE:
${opts.idea}

GOAL OF THE PITCH:
${opts.goal}

EVALUATION LENS:
${focus.label} (${focus.description})
`.trim();
}
