// src/components/stress-test/types.ts

export type StressResult = {
    persona?: string;
    challengeLevel: number;
    challengeLevelId?: string;
    challengeDetail?: string;
    challengeLabel: string;
    focus: string;
    personaReaction?: string;
    summary: string;
    strengths: string[];
    gaps: string[];
    improvements: string[];
    questions: string[];
    triggeredRedFlags?: string[];
    presentation: string;
    confidence: number;
    tone?: string;
    debug?: {
        rawModelOutput?: string;
        retried?: boolean;
        model?: string;
        temperature?: number;
        retryTemperature?: number;
        systemPrompt?: string;
        userPrompt?: string;
        personaContext?: string;
        ragHighlights?: string | null;
        confidenceBreakdown?: {
            problemValidity: number;
            solutionLogic: number;
            pitchClarity: number;
        } | null;
        debugRationale?: string | null;
    };
};

export type ChallengeLevelOption = {
    id: string;
    name: string;
    detail: string;
    intensity: number;
};

export type PersonaOption = {
    id: string;
    name: string;
};

export const FIELD_LIMITS = {
    idea: { min: 10, max: 1500 },
    goal: { min: 5, max: 300 },
    evaluationFocus: { min: 5, max: 300 },
};
