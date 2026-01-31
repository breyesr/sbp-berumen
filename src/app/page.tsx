// src/app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { User, BarChart, AlertTriangle, CheckCircle, Sparkles, Loader2, MessageSquare, TrendingUp, Shield, Award, Target, HelpCircle, XCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

// Types
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

export default function ConstructionPersonasPage() {
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
                                        <div className="text-xs text-[#71717a]">
                                            {result.debug.model ? `Modelo: ${result.debug.model}` : ""}
                                            {result.debug.temperature !== undefined ? ` · Temp: ${result.debug.temperature}` : ""}
                                            {result.debug.retried ? ` · Retry: sí (temp ${result.debug.retryTemperature})` : " · Retry: no"}
                                        </div>
                                        {result.debug.confidenceBreakdown && (
                                            <div className="text-xs text-[#a1a1aa]">
                                                Desglose confianza — Problem: {result.debug.confidenceBreakdown.problemValidity}, Solution: {result.debug.confidenceBreakdown.solutionLogic}, Pitch: {result.debug.confidenceBreakdown.pitchClarity}
                                            </div>
                                        )}
                                        {result.debug.debugRationale && (
                                            <div className="text-xs text-[#a1a1aa]">
                                                Rationale: {result.debug.debugRationale}
                                            </div>
                                        )}
                                        {result.debug.ragHighlights && (
                                            <div className="text-xs text-[#a1a1aa] whitespace-pre-line">
                                                Highlights: {result.debug.ragHighlights}
                                            </div>
                                        )}
                                        {result.debug.personaContext && (
                                            <details>
                                                <summary className="cursor-pointer text-xs text-[#a1a1aa]">
                                                    Ver contexto de la persona
                                                </summary>
                                                <pre className="whitespace-pre-wrap text-xs text-[#e5e7eb] bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto mt-2">
{result.debug.personaContext}
                                                </pre>
                                            </details>
                                        )}
                                        {result.debug.systemPrompt && (
                                            <details>
                                                <summary className="cursor-pointer text-xs text-[#a1a1aa]">
                                                    Ver system prompt
                                                </summary>
                                                <pre className="whitespace-pre-wrap text-xs text-[#e5e7eb] bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto mt-2">
{result.debug.systemPrompt}
                                                </pre>
                                            </details>
                                        )}
                                        {result.debug.userPrompt && (
                                            <details>
                                                <summary className="cursor-pointer text-xs text-[#a1a1aa]">
                                                    Ver user prompt
                                                </summary>
                                                <pre className="whitespace-pre-wrap text-xs text-[#e5e7eb] bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto mt-2">
{result.debug.userPrompt}
                                                </pre>
                                            </details>
                                        )}
                                        <pre className="whitespace-pre-wrap text-xs text-[#e5e7eb] bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto">
{result.debug.rawModelOutput}
                                        </pre>
                                    </div>
                                </details>
                            </div>
                        )}

                        <div className="animate-slide-in-up stagger-1 bg-gradient-to-r from-[#4F46E5]/10 via-[#4F46E5]/5 to-transparent border-l-4 border-[#4F46E5] rounded-r-xl overflow-hidden shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-[#4F46E5]/20 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F46E5]/30 to-[#4F46E5]/10 flex items-center justify-center shadow-md">
                                        <MessageSquare className="w-6 h-6 text-[#4F46E5]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#4F46E5]">
                                            Persona Reaction
                                        </h3>
                                        <p className="text-xs text-[#a1a1aa] mt-0.5">First-person gut check</p>
                                    </div>
                                </div>
                                <p className="text-base leading-relaxed text-[#ededed]">{result.personaReaction}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="animate-slide-in-up stagger-2 bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/30 rounded-xl overflow-hidden shadow-lg">
                                <div className="p-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-green-500/20 mb-5">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-green-500/10 flex items-center justify-center shadow-md">
                                            <TrendingUp className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">
                                                Strengths
                                            </h3>
                                            <p className="text-xs text-green-400/60 mt-0.5">{result.strengths.length} identified</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-3">
                                        {result.strengths.map((strength, idx) => {
                                            const icons = [Shield, Award, TrendingUp];
                                            const Icon = icons[idx % icons.length];
                                            return (
                                                <li key={idx} className="flex items-start gap-3 text-sm bg-green-500/5 p-3.5 rounded-lg border border-green-500/10 hover:bg-green-500/10 transition-all hover:border-green-500/20">
                                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                        <Icon className="w-4 h-4 text-green-400" />
                                                    </div>
                                                    <span className="text-[#ededed] pt-1">{strength}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>

                            <div className="animate-slide-in-up stagger-3 bg-gradient-to-br from-red-500/10 to-red-500/5 border-2 border-red-500/30 rounded-xl overflow-hidden shadow-lg">
                                <div className="p-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-red-500/20 mb-5">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/30 to-red-500/10 flex items-center justify-center shadow-md">
                                            <AlertTriangle className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
                                                Gaps & Risks
                                            </h3>
                                            <p className="text-xs text-red-400/60 mt-0.5">{result.gaps.length} critical areas</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-3">
                                        {result.gaps.map((gap, idx) => {
                                            const icons = [AlertCircle, XCircle, AlertTriangle];
                                            const Icon = icons[idx % icons.length];
                                            return (
                                                <li key={idx} className="flex items-start gap-3 text-sm bg-red-500/5 p-3.5 rounded-lg border border-red-500/10 hover:bg-red-500/10 transition-all hover:border-red-500/20">
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                                        <Icon className="w-4 h-4 text-red-400" />
                                                    </div>
                                                    <span className="text-[#ededed] pt-1">{gap}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="animate-slide-in-up stagger-4 bg-gradient-to-br from-[#171717] to-[#0a0a0a] border border-[rgba(255,255,255,0.15)] rounded-xl overflow-hidden shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-[rgba(255,255,255,0.1)] mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F46E5]/30 to-[#4F46E5]/10 flex items-center justify-center shadow-md">
                                        <Target className="w-6 h-6 text-[#4F46E5]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#4F46E5]">
                                            Priority Action Plan
                                        </h3>
                                        <p className="text-xs text-[#a1a1aa] mt-0.5">Recommended next steps</p>
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {result.improvements.map((action, idx) => (
                                        <li key={idx} className="flex items-start gap-4 p-4 bg-[rgba(255,255,255,0.03)] rounded-lg border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.06)] transition-all hover:border-[#4F46E5]/30 hover:shadow-md group">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white flex items-center justify-center text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow">
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm text-[#ededed] pt-1.5 leading-relaxed">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="animate-fade-in bg-gradient-to-br from-[#171717] to-[#0a0a0a] border border-[rgba(255,255,255,0.15)] rounded-xl overflow-hidden shadow-lg">
                            <div className="p-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-[rgba(255,255,255,0.1)] mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/30 to-yellow-500/10 flex items-center justify-center shadow-md">
                                        <HelpCircle className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400">
                                            Follow-up Questions
                                        </h3>
                                        <p className="text-xs text-[#a1a1aa] mt-0.5">Critical clarifications needed</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {result.questions.map((question, idx) => (
                                        <button
                                            key={idx}
                                            className="group px-4 py-3.5 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] hover:border-[#4F46E5]/40 rounded-lg text-sm transition-all text-left shadow-sm hover:shadow-md hover:translate-x-1"
                                        >
                                            <span className="text-[#4F46E5] mr-2 group-hover:mr-3 transition-all">→</span>
                                            <span className="text-[#ededed]">{question}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {showDebug && (
                            <div className="animate-fade-in bg-gradient-to-br from-[#171717] to-[#0a0a0a] border border-[rgba(255,255,255,0.15)] rounded-xl overflow-hidden shadow-lg">
                                <div className="p-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-[rgba(255,255,255,0.1)] mb-5">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F46E5]/30 to-[#4F46E5]/10 flex items-center justify-center shadow-md">
                                            <Sparkles className="w-6 h-6 text-[#4F46E5]" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#4F46E5]">
                                                Persona Pitch (First‑Person)
                                            </h3>
                                            <p className="text-xs text-[#a1a1aa] mt-0.5">A first-pass rewrite in this persona's voice</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#ededed] leading-relaxed whitespace-pre-line">{result.presentation}</p>
                                </div>
                            </div>
                        )}

                        <div className="animate-fade-in bg-gradient-to-br from-[#111827] to-[#0a0a0a] border border-[rgba(255,255,255,0.15)] rounded-xl overflow-hidden shadow-lg">
                            <div className="p-6 space-y-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22d3ee]/30 to-[#0ea5e9]/10 flex items-center justify-center shadow-md">
                                            <Sparkles className="w-6 h-6 text-[#22d3ee]" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#22d3ee]">
                                                Refine the Pitch
                                            </h3>
                                            <p className="text-xs text-[#a1a1aa] mt-0.5">Refine the pitch to match this persona</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRefine()}
                                        disabled={refineLoading}
                                        className={clsx(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/40",
                                            refineLoading
                                                ? "bg-[rgba(255,255,255,0.05)] text-[#94a3b8] cursor-not-allowed"
                                                : "bg-[#0ea5e9]/20 text-[#22d3ee] border border-[#22d3ee]/40 hover:bg-[#22d3ee]/20"
                                        )}
                                    >
                                        {refineLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Working...
                                            </>
                                        ) : (
                                            `Refine for ${selectedPersonaName}`
                                        )}
                                    </button>
                                </div>

                                {refineError && (
                                    <div className="text-sm text-red-400">{refineError}</div>
                                )}

                                {refineQuestions.length > 0 && !refinedPitch && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-[#e2e8f0]">
                                            {selectedPersonaName} needs a few specifics before the pitch can be tightened.
                                        </p>
                                        <div className="space-y-4">
                                            {refineQuestions.map((question, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <p className="text-xs uppercase tracking-wider text-[#94a3b8]">{question}</p>
                                                    <textarea
                                                        value={refineAnswers[idx] ?? ""}
                                                        onChange={(e) => {
                                                            const next = [...refineAnswers];
                                                            next[idx] = e.target.value;
                                                            setRefineAnswers(next);
                                                        }}
                                                        rows={2}
                                                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/40 focus:border-transparent transition-all resize-none"
                                                        placeholder="Add the missing detail..."
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handleRefine(refineAnswers)}
                                            disabled={refineLoading || refineAnswers.some((answer) => !answer.trim())}
                                            className={clsx(
                                                "w-full py-3 rounded-lg text-sm font-semibold transition-all",
                                                "focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/40 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
                                                refineLoading || refineAnswers.some((answer) => !answer.trim())
                                                    ? "bg-[rgba(255,255,255,0.05)] text-[#94a3b8] cursor-not-allowed"
                                                    : "bg-[#22d3ee] text-[#0a0a0a] hover:bg-[#38bdf8] shadow-lg shadow-[#22d3ee]/20"
                                            )}
                                        >
                                            {refineLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Working...
                                                </span>
                                            ) : (
                                                "Generate Refined Pitch"
                                            )}
                                        </button>
                                    </div>
                                )}

                                {refinedPitch && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-4">
                                                <p className="text-xs uppercase tracking-wider text-[#94a3b8] mb-2">Original Pitch</p>
                                                <p className="text-sm text-[#e2e8f0] whitespace-pre-line">{idea}</p>
                                            </div>
                                            <div className="rounded-xl border border-[#22d3ee]/30 bg-[#0f172a] p-4 shadow-lg shadow-[#22d3ee]/10">
                                                <p className="text-xs uppercase tracking-wider text-[#22d3ee] mb-2">Refined Pitch</p>
                                                <p className="text-sm text-[#f8fafc] whitespace-pre-line">{refinedPitch}</p>
                                            </div>
                                        </div>
                                        {refineChanges.length > 0 && (
                                            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-4">
                                                <p className="text-xs uppercase tracking-wider text-[#94a3b8] mb-3">What changed</p>
                                                <ul className="space-y-2 text-sm text-[#e2e8f0]">
                                                    {refineChanges.map((change, idx) => (
                                                        <li key={idx} className="flex items-start gap-2">
                                                            <span className="text-[#22d3ee]">•</span>
                                                            <span>{change}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col gap-3 pb-12 sm:flex-row sm:justify-end">
                            {refinedPitch && (
                                <button
                                    onClick={handleExportRefined}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] bg-[#22d3ee] rounded-lg transition-all shadow-lg shadow-[#22d3ee]/20 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/40 hover:bg-[#38bdf8] hover:-translate-y-0.5 active:translate-y-[1px] active:scale-[0.99]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    Download Refined Pitch
                                </button>
                            )}
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#ededed] bg-gradient-to-br from-[#171717] to-[#0f0f0f] border border-[rgba(255,255,255,0.15)] rounded-lg transition-all shadow-lg shadow-black/30 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 hover:bg-[rgba(255,255,255,0.05)] hover:-translate-y-0.5 hover:border-[#4F46E5]/40 hover:shadow-[#4F46E5]/20 active:translate-y-[1px] active:scale-[0.99] active:border-[#4F46E5]/50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Download Analysis
                            </button>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}
