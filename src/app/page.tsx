"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { User, BarChart, AlertTriangle, CheckCircle, Sparkles, Loader2, MessageSquare, TrendingUp, Shield, Award, Target, HelpCircle, XCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { SignInButton } from "@/components/auth/SignInButton";

type StressResult = {
    persona?: string;
    challengeLevel: number;
    challengeLevelId?: string;
    challengeDetail?: string;
    challengeLabel: string;
    focus: string;
    summary: string;
    strengths: string[];
    gaps: string[];
    improvements: string[];
    questions: string[];
    triggeredRedFlags?: string[];
    presentation: string;
    confidence: number;
    tone?: string;
    personaReaction?: string;
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

type ChallengeLevelOption = {
    id: string;
    name: string;
    detail: string;
    intensity: number;
};

type PersonaOption = {
    id: string;
    name:string;
};

const FIELD_LIMITS = {
    idea: { min: 10, max: 1500 },
    goal: { min: 5, max: 300 },
    evaluationFocus: { min: 5, max: 300 },
};

export default function HomePage() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-8">Please sign in to use the application.</p>
        <SignInButton />
      </div>
    );
  }
  
  return <StressTestTool />;
}

function StressTestTool() {
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [personaNames, setPersonaNames] = useState<Record<string, string>>({});
  const [personaType, setPersonaType] = useState<string>("");
  const [levels, setLevels] = useState<ChallengeLevelOption[]>([]);
  const [challengeLevelId, setChallengeLevelId] = useState<string>("");
  const [idea, setIdea] = useState("");
  const [goal, setGoal] = useState("");
  const [evaluationFocus, setEvaluationFocus] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StressResult | null>(null);
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [refineQuestions, setRefineQuestions] = useState<string[]>([]);
  const [refineAnswers, setRefineAnswers] = useState<string[]>([]);
  const [refinedPitch, setRefinedPitch] = useState<string | null>(null);
  const [refineChanges, setRefineChanges] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const resultTopRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
        try {
            const [personasRes, levelsRes] = await Promise.all([
                fetch("/api/personas", { cache: "no-store" }),
                fetch("/api/challenge-levels", { cache: "no-store" })
            ]);

            if (!personasRes.ok) throw new Error(`HTTP ${personasRes.status} for personas`);
            if (!levelsRes.ok) throw new Error(`HTTP ${levelsRes.status} for levels`);

            const personasData = await personasRes.json();
            const levelsData = await levelsRes.json();

            if (!cancelled) {
                const personaList: Array<{ id: string; name: string; role?: string }> = Array.isArray(personasData)
                    ? personasData
                    : Array.isArray(personasData?.options)
                        ? personasData.options
                        : [];

                const lookup: Record<string, string> = {};
                const selectOptions: PersonaOption[] = personaList.map((item) => {
                    lookup[item.id] = item.name;
                    return {
                        id: item.id,
                        name: item.role?.trim() ? `${item.name} — ${item.role}` : item.name,
                    };
                });
                setPersonas(selectOptions);
                setPersonaNames(lookup);
                if (selectOptions.length > 0) {
                    setPersonaType(selectOptions[0].id);
                }


                const levelList: ChallengeLevelOption[] = Array.isArray(levelsData)
                    ? levelsData
                    : Array.isArray(levelsData?.options)
                        ? levelsData.options
                        : [];
                setLevels(levelList);
                if (levelList.length > 0) {
                    setChallengeLevelId(levelList[0].id);
                }
            }
        } catch (err) {
            if (!cancelled) {
                const message =
                    err instanceof Error ? err.message : "Unable to load initial data.";
                setError(message);
            }
        }
    };

    loadInitialData();

    return () => {
        cancelled = true;
    };
}, []);

useEffect(() => {
    const envEnabled = process.env.NEXT_PUBLIC_STRESS_DEBUG === "1";
    const queryEnabled = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("debug") === "1"
        : false;
    setShowDebug(envEnabled && queryEnabled);
}, []);

useEffect(() => {
    if (result && resultTopRef.current) {
        resultTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}, [result]);

const isFormValid = idea.trim().length >= FIELD_LIMITS.idea.min &&
                    idea.trim().length <= FIELD_LIMITS.idea.max &&
                    goal.trim().length >= FIELD_LIMITS.goal.min &&
                    goal.trim().length <= FIELD_LIMITS.goal.max &&
                    evaluationFocus.trim().length >= FIELD_LIMITS.evaluationFocus.min &&
                    evaluationFocus.trim().length <= FIELD_LIMITS.evaluationFocus.max &&
                    personaType &&
                    challengeLevelId;

const handleSubmit = async () => {
    if (!isFormValid || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setRefineError(null);
    setRefineQuestions([]);
    setRefineAnswers([]);
    setRefinedPitch(null);
    setRefineChanges([]);

    try {
        const res = await fetch("/api/stress-test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                personaType,
                challengeLevelId,
                idea: idea.trim(),
                goal: goal.trim(),
                evaluationFocus: evaluationFocus.trim(),
            }),
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setResult(json as StressResult);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Could not get a response.";
        setError(message);
    } finally {
        setLoading(false);
    }
};

const handleRefine = async (answers?: string[]) => {
    if (!result || refineLoading) return;

    setRefineLoading(true);
    setRefineError(null);
    if (!answers?.length) {
        setRefinedPitch(null);
        setRefineChanges([]);
    }

    try {
        const res = await fetch("/api/idea-refinement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                personaType,
                challengeLevelId,
                idea: idea.trim(),
                goal: goal.trim(),
                stressResult: {
                    summary: result.summary,
                    gaps: result.gaps,
                    improvements: result.improvements,
                    questions: result.questions,
                    triggeredRedFlags: result.triggeredRedFlags ?? [],
                    confidence: result.confidence,
                },
                missingInfoQuestions: refineQuestions.length ? refineQuestions : undefined,
                userAnswers: answers,
            }),
        });
        let json: any = null;
        try {
            json = await res.json();
        } catch {
            json = null;
        }
        if (!res.ok) {
            const message = json?.error || `HTTP error! status: ${res.status}`;
            throw new Error(message);
        }
        if (json.status === "needs_input") {
            const questions = Array.isArray(json.questions) ? json.questions : [];
            setRefineQuestions(questions);
            setRefineAnswers(new Array(questions.length).fill(""));
            setRefinedPitch(null);
            setRefineChanges([]);
        } else {
            setRefineQuestions([]);
            setRefineAnswers([]);
            setRefinedPitch(json.refinedPitch ?? "");
            setRefineChanges(Array.isArray(json.changesSummary) ? json.changesSummary : []);
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Could not refine the pitch.";
        setRefineError(message);
    } finally {
        setRefineLoading(false);
    }
};

const getConfidenceBadgeColor = (score: number) => {
    if (score >= 70) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
};

const selectedPersonaName = personas.find(p => p.id === personaType)?.name.split('—')[0].trim() || 'Persona';
const analysis = result
    ? {
        confidenceScore: result.confidence,
        verdict: result.summary,
        strengths: result.strengths,
        gaps: result.gaps,
        actionPlan: result.improvements,
        followUpQuestions: result.questions,
        presentation: result.presentation,
    }
    : null;

const handleExport = () => {
    if (!analysis) return;
    const date = new Date().toLocaleDateString();
    const report = `IDEA STRESS TEST REPORT FOR ${result?.persona || selectedPersonaName}
Generated: ${date}
[ THE IDEA ] ${idea}

========================================

[ THE VERDICT ] Confidence Score: ${analysis.confidenceScore}/100 Summary: ${analysis.verdict}

[ STRENGTHS ] ${analysis.strengths.map((s: string) => `+ ${s}`).join('\n')}

[ GAPS ] ${analysis.gaps.map((g: string) => `- ${g}`).join('\n')}

[ ACTION PLAN ] ${analysis.actionPlan.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

[ PRESENTATION FOR THIS PERSONA ] ${analysis.presentation}

[ FOLLOW-UP QUESTIONS ] ${analysis.followUpQuestions.map((q: string) => `? ${q}`).join('\n')} `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safePersona = (result?.persona || selectedPersonaName || "persona")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    link.download = `stress-test-${safePersona}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const handleExportRefined = () => {
    if (!refinedPitch) return;
    const date = new Date().toLocaleDateString();
    const report = `REFINED PITCH FOR ${result?.persona || selectedPersonaName}
Generated: ${date}

[ GOAL ]
${goal}

[ REFINED PITCH ]
${refinedPitch}
`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safePersona = (result?.persona || selectedPersonaName || "persona")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    link.download = `refined-pitch-${safePersona}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] px-4 py-12">
        <div className="max-w-4xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-semibold tracking-tight mb-3">
                    Idea Stress Testing Tool v.1.1
                </h1>
                <p className="text-sm text-[#a1a1aa] max-w-3xl">
                    I'm built to be an informed, well-trained, and value-additive dissenting expert.
                    Use me to avoid falling into the confirmation bias trap.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                        Persona
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                        <select
                            value={personaType}
                            onChange={(e) => setPersonaType(e.target.value)}
                            aria-label="Select persona"
                            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                        >
                            {personas.map((p) => (
                                <option key={p.id} value={p.id} className="bg-[#171717]">
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                        Challenge Level
                    </label>
                    <div className="relative">
                        <BarChart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
                        <select
                            value={challengeLevelId}
                            onChange={(e) => setChallengeLevelId(e.target.value)}
                            aria-label="Select challenge level"
                            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
                        >
                            {levels.map((l) => (
                                <option key={l.id} value={l.id} className="bg-[#171717]">
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                            Idea
                        </label>
                    </div>
                    <textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="Describe the asset, pitch, or concept you want to stress-test..."
                        aria-label="Idea description"
                        rows={6}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none"
                    />
                    <span className={clsx(
                        "block text-xs text-right mt-1",
                        idea.length < FIELD_LIMITS.idea.min || idea.length > FIELD_LIMITS.idea.max ? "text-red-400" : "text-gray-400"
                    )}>
                        {idea.length}/{FIELD_LIMITS.idea.max}
                    </span>
                </div>
                

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                            Goal
                        </label>
                    </div>
                    <textarea
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="What are you trying to achieve with this idea?"
                        aria-label="Goal description"
                        rows={3}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none"
                    />
                    <span className={clsx(
                        "block text-xs text-right mt-1",
                        goal.length < FIELD_LIMITS.goal.min || goal.length > FIELD_LIMITS.goal.max ? "text-red-400" : "text-gray-400"
                    )}>
                        {goal.length}/{FIELD_LIMITS.goal.max}
                    </span>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                            Focus
                        </label>
                    </div>
                    <div className="relative">
                        <textarea
                            value={evaluationFocus}
                            onChange={(e) => setEvaluationFocus(e.target.value)}
                            placeholder="Example: Stress-test how clearly we communicate ROI to the CFO."
                            aria-label="Focus area"
                            rows={2}
                            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none"
                        />
                        <span className={clsx(
                            "block text-xs text-right mt-1",
                            evaluationFocus.length < FIELD_LIMITS.evaluationFocus.min || evaluationFocus.length > FIELD_LIMITS.evaluationFocus.max ? "text-red-400" : "text-gray-400"
                        )}>
                            {evaluationFocus.length}/{FIELD_LIMITS.evaluationFocus.max}
                        </span>
                        <button
                            type="button"
                            aria-label="Auto-detect risks"
                            className="absolute right-3 top-3 p-1.5 rounded-md bg-[#4F46E5]/10 hover:bg-[#4F46E5]/20 transition-colors group"
                            title="Auto-detect Risks"
                        >
                            <Sparkles className="w-4 h-4 text-[#4F46E5] group-hover:text-[#6366F1]" />
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                className={clsx(
                    "w-full py-4 px-6 rounded-lg font-semibold text-sm transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
                    isFormValid && !loading
                        ? "bg-[#4F46E5] hover:bg-[#6366F1] text-white shadow-lg shadow-[#4F46E5]/20"
                        : "bg-[rgba(255,255,255,0.05)] text-[#a1a1aa] cursor-not-allowed"
                )}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running Simulation...
                    </span>
                ) : (
                    `Stress-test with ${selectedPersonaName}`
                )}
            </button>
            
            {error && <div className="mt-4 text-red-400 text-sm text-center">{error}</div>}

            {result && (
                <div className="mt-8 space-y-6">
                    <div ref={resultTopRef} className="animate-scale-in bg-gradient-to-br from-[#171717] to-[#0a0a0a] border border-[rgba(255,255,255,0.15)] rounded-xl p-6 shadow-xl">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-semibold tracking-tight">{personaNames[personaType] || 'Persona'}</h2>
                                <p className="text-sm text-[#a1a1aa]">Stress Test Analysis</p>
                            </div>
                            <div className={clsx(
                                "px-4 py-2 rounded-full text-sm font-bold border-2 shadow-lg",
                                getConfidenceBadgeColor(result.confidence)
                            )}>
                                {result.confidence}% Confidence
                            </div>
                        </div>
                    </div>

                    {showDebug && result.debug?.rawModelOutput && (
                        <div className="animate-fade-in bg-[#0f0f0f] border border-[rgba(255,255,255,0.12)] rounded-xl p-5 shadow-lg">
                            <details>
                                <summary className="cursor-pointer text-sm font-semibold text-[#a1a1aa]">
                                    Ver respuesta cruda del modelo
                                </summary>
                                <div className="mt-4 space-y-3">
                                    {/* ... debug info ... */}
                                </div>
                            </details>
                        </div>
                    )}

                    {/* ... rest of the result sections ... */}
                </div>
            )}
        </div>
    </div>
  );
}
