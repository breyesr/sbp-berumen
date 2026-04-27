"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import {
  Loader2,
  Megaphone,
  PenSquare,
  CheckSquare,
  Target,
  Send,
  Hash,
  AlignLeft,
  Sparkles,
  Download,
} from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import PersonaSelect from "@/components/PersonaSelect";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";

const OutputSchema = z.object({
  outputs: z.array(
    z.object({
      platformId: z.string(),
      platformName: z.string(),
      formatId: z.string(),
      formatName: z.string(),
      primaryCopy: z.string(),
      alternateCopy: z.string().optional(),
      hashtags: z.array(z.string()).optional(),
      cta: z.string().optional(),
      notes: z.array(z.string()).optional(),
    })
  ),
});

const FIELD_LIMITS = {
  context: { min: 10, max: 600 },
  message: { min: 5, max: 800 },
  goal: { min: 5, max: 400 },
};

type PersonaOption = { id: string; name: string; role?: string; cluster?: string };

type Platform = {
  id: string;
  name: string;
  platform_purpose?: string;
  core_voice?: string;
  tone_adaptation?: string;
  copy_guidelines_summary?: string;
  global_guidelines?: Record<string, any>;
  formats: Format[];
};

type Format = {
  id: string;
  platform_id: string;
  name: string;
  primary_goal_vibe?: string;
  tone_preference?: string;
  copy_guidelines?: Record<string, any>;
};

type CopyOutput = {
  platformId: string;
  platformName: string;
  formatId: string;
  formatName: string;
  primaryCopy: string;
  alternateCopy?: string;
  hashtags?: string[];
  cta?: string;
  notes?: string[];
};

type CopywriterResponse = {
  persona: string;
  context?: string;
  goal: string;
  message: string;
  outputs: CopyOutput[];
};

export default function CopywriterPage() {
  const { t, formatDate } = useI18n();
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [personaType, setPersonaType] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [context, setContext] = useState("");
  const [message, setMessage] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { object, submit, isLoading: submitting, error: aiError } = useObject({
    api: "/api/copywriter",
    schema: OutputSchema,
  });

  useEffect(() => {
    if (aiError) {
      setError(aiError.message);
    }
  }, [aiError]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [personasRes, copywriterRes] = await Promise.all([
          fetch("/api/personas", { cache: "no-store" }),
          fetch("/api/copywriter", { cache: "no-store" }),
        ]);

        if (!personasRes.ok) throw new Error(`HTTP ${personasRes.status}`);
        if (!copywriterRes.ok) throw new Error(`HTTP ${copywriterRes.status}`);

        const personasData = await personasRes.json();
        const copywriterData = await copywriterRes.json();

        if (cancelled) return;

        const rawPersonas: PersonaOption[] = Array.isArray(personasData)
          ? personasData
          : Array.isArray(personasData?.options)
          ? personasData.options
          : [];
        const personaList = rawPersonas.map((p) => ({
          ...p,
          name:
            p.role?.trim() && p.role !== p.name
              ? `${p.name} — ${p.role}`
              : p.name,
          cluster: p.cluster,
        }));
        setPersonas(personaList);
        if (personaList.length > 0) setPersonaType(personaList[0].id);

        const platformsData: Platform[] = Array.isArray(copywriterData?.platforms)
          ? copywriterData.platforms
          : [];
        setPlatforms(platformsData);
        if (platformsData.length > 0) {
          setSelectedPlatforms([platformsData[0].id]);
          const firstFormats = platformsData[0].formats ?? [];
          if (firstFormats.length > 0) setSelectedFormats([firstFormats[0].id]);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t("copywriter.error.load");
        setError(message);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const availableFormats = useMemo(() => {
    return platforms
      .filter((p) => selectedPlatforms.includes(p.id))
      .flatMap((p) => p.formats);
  }, [platforms, selectedPlatforms]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        const next = prev.filter((p) => p !== id);
        setSelectedFormats((formats) =>
          formats.filter((f) => {
            const fmt = availableFormats.find((af) => af.id === f);
            return fmt ? next.includes(fmt.platform_id) : false;
          })
        );
        return next;
      }
      return [...prev, id];
    });
  };

  const toggleFormat = (id: string) => {
    setSelectedFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const isFormValid =
    personaType &&
    context.trim().length >= FIELD_LIMITS.context.min &&
    context.trim().length <= FIELD_LIMITS.context.max &&
    message.trim().length >= FIELD_LIMITS.message.min &&
    message.trim().length <= FIELD_LIMITS.message.max &&
    goal.trim().length >= FIELD_LIMITS.goal.min &&
    goal.trim().length <= FIELD_LIMITS.goal.max &&
    selectedPlatforms.length > 0 &&
    selectedFormats.length > 0;

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;
    setError(null);
    submit({
      personaType,
      context: context.trim(),
      message: message.trim(),
      goal: goal.trim(),
      platforms: selectedPlatforms,
      formats: selectedFormats,
    });
  };

  const handleExport = () => {
    if (!object?.outputs) return;
    const selectedPersonaName = personas.find(p => p.id === personaType)?.name || personaType;
    const date = formatDate(new Date(), { dateStyle: "medium" });
    const lines: string[] = [];
    lines.push(t("copywriter.report.header"));
    lines.push(`${t("copywriter.report.generated")}: ${date}`);
    lines.push(`${t("copywriter.report.persona")}: ${selectedPersonaName}`);
    if (context) lines.push(`${t("copywriter.field.context")}: ${context}`);
    lines.push(`${t("copywriter.field.goal")}: ${goal}`);
    lines.push(`${t("copywriter.field.message")}: ${message}`);
    lines.push(``);
    object.outputs.forEach((o) => {
        if (!o) return;
      lines.push(`--- ${o.platformName || "Platform"} / ${o.formatName || "Format"} ---`);
      lines.push(`${t("copywriter.output.primary")}: ${o.primaryCopy || ""}`);
      if (o.alternateCopy) lines.push(`${t("copywriter.output.alternate")}: ${o.alternateCopy}`);
      if (o.cta) lines.push(`${t("copywriter.output.cta")}: ${o.cta}`);
      if (o.hashtags?.length) lines.push(`${t("copywriter.output.hashtags")}: ${o.hashtags.join(" ")}`);
      if (o.notes?.length) {
        lines.push(`${t("copywriter.output.notes")}:`);
        o.notes.forEach((n) => lines.push(`- ${n}`));
      }
      lines.push(``);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `copywriter-${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const platformColors: Record<string, string> = {
    instagram: "#E1306C",
    facebook: "#1877F2",
    linkedin: "#0A66C2",
    tiktok: "#0f0f0f",
    default: "#4F46E5",
  };

    return (
    <div className="bg-[#0a0a0a] text-[#ededed] px-4 py-6 md:py-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Megaphone className="w-6 h-6 text-[#4F46E5]" />
            <h1 className="text-3xl font-semibold tracking-tight">
              {t("copywriter.title")}
            </h1>
          </div>
          <p className="text-sm text-[#a1a1aa] max-w-3xl">
            {t("copywriter.subtitle")}
          </p>
        </header>

        <div className="space-y-5">
          <div className="bg-[#0f0f10] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-lg shadow-black/30">
            <div className="flex items-center gap-2 mb-4">
              <PenSquare className="w-4 h-4 text-[#4F46E5]" />
              <p className="text-sm font-semibold text-[#ededed]">{t("copywriter.section.brief")}</p>
            </div>
            <div className="space-y-4">
              <PersonaSelect
                options={personas}
                value={personaType}
                onChange={setPersonaType}
                labelText={t("copywriter.field.persona")}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                  {t("copywriter.field.context")}
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  placeholder={t("copywriter.placeholder.context")}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none"
                />
                <span
                  className={clsx(
                    "block text-xs text-right mt-1",
                  context.length < FIELD_LIMITS.context.min ||
                    context.length > FIELD_LIMITS.context.max
                      ? "text-red-400"
                      : "text-gray-400"
                  )}
                >
                  {context.length}/{FIELD_LIMITS.context.max}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                  {t("copywriter.field.message")}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={t("copywriter.placeholder.message")}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none"
                />
                <span
                  className={clsx(
                    "block text-xs text-right mt-1",
                    message.length < FIELD_LIMITS.message.min ||
                      message.length > FIELD_LIMITS.message.max
                      ? "text-red-400"
                      : "text-gray-400"
                  )}
                >
                  {message.length}/{FIELD_LIMITS.message.max}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-2">
                  {t("copywriter.field.goal")}
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                  placeholder={t("copywriter.placeholder.goal")}
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all resize-none"
                />
                <span
                  className={clsx(
                    "block text-xs text-right mt-1",
                    goal.length < FIELD_LIMITS.goal.min ||
                      goal.length > FIELD_LIMITS.goal.max
                      ? "text-red-400"
                      : "text-gray-400"
                  )}
                >
                  {goal.length}/{FIELD_LIMITS.goal.max}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f10] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-lg shadow-black/30">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="w-4 h-4 text-[#4F46E5]" />
              <p className="text-sm font-semibold text-[#ededed]">{t("copywriter.section.platforms")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <label
                  key={platform.id}
                  className={clsx(
                    "flex flex-col gap-1 p-3 rounded-lg border transition-all cursor-pointer bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]",
                    selectedPlatforms.includes(platform.id)
                      ? "border-[#4F46E5]/50 shadow-[0_0_0_1px_rgba(79,70,229,0.3)]"
                      : "border-[rgba(255,255,255,0.08)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => togglePlatform(platform.id)}
                        className="h-4 w-4 accent-[#4F46E5]"
                      />
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-[#a1a1aa]">
                      {t("copywriter.platform.formats_count", { count: platform.formats.length })}
                    </span>
                  </div>
                  <p className="text-xs text-[#a1a1aa] line-clamp-2">
                    {platform.copy_guidelines_summary ||
                      platform.platform_purpose ||
                      t("copywriter.platform.guidance_fallback")}
                  </p>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-[#0f0f10] border border-[rgba(255,255,255,0.08)] rounded-xl p-5 shadow-lg shadow-black/30">
            <div className="flex items-center gap-2 mb-4">
              <AlignLeft className="w-4 h-4 text-[#4F46E5]" />
              <p className="text-sm font-semibold text-[#ededed]">{t("copywriter.section.formats")}</p>
              <span className="text-[11px] text-[#a1a1aa]">
                {t("copywriter.section.formats_note")}
              </span>
            </div>
            {selectedPlatforms.length === 0 ? (
              <p className="text-xs text-[#a1a1aa]">{t("copywriter.formats.select_platform_first")}</p>
            ) : (
              <div className="space-y-4">
                {selectedPlatforms.map((pid) => {
                  const plat = platforms.find((p) => p.id === pid);
                  if (!plat) return null;
                  const color = platformColors[plat.id] || platformColors.default;
                  return (
                    <div
                      key={plat.id}
                      className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3"
                      style={{ boxShadow: `0 0 0 1px ${color}26` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold" style={{ color }}>
                          {plat.name}
                        </span>
                        <span className="text-[11px] text-[#a1a1aa] uppercase">
                          {t("copywriter.formats.options_count", { count: plat.formats.length })}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {plat.formats.map((format) => (
                          <label
                            key={format.id}
                            className={clsx(
                              "flex flex-col gap-1 p-3 rounded-lg border transition-all cursor-pointer",
                              selectedFormats.includes(format.id)
                                ? "bg-[rgba(255,255,255,0.06)]"
                                : "bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)]"
                            )}
                            style={{
                              borderColor: selectedFormats.includes(format.id)
                                ? `${color}66`
                                : "rgba(255,255,255,0.1)",
                              boxShadow: selectedFormats.includes(format.id)
                                ? `0 0 0 1px ${color}33`
                                : "none",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedFormats.includes(format.id)}
                                  onChange={() => toggleFormat(format.id)}
                                  className="h-4 w-4 accent-[#4F46E5]"
                                />
                                <span className="text-sm font-medium">
                                  {format.name}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-[#a1a1aa] line-clamp-2">
                              {format.tone_preference ||
                                format.primary_goal_vibe ||
                                t("copywriter.format.guidance_fallback")}
                            </p>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#0f0f10] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 shadow-lg shadow-black/30">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-[#4F46E5]" />
              <p className="text-sm font-semibold text-[#ededed]">{t("copywriter.section.action")}</p>
            </div>
            <p className="text-xs text-[#a1a1aa] mb-3">
              {t("copywriter.action.subtitle")}
            </p>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              className={clsx(
                "w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all",
                "focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
                isFormValid && !submitting
                  ? "bg-[#4F46E5] hover:bg-[#6366F1] text-white shadow-lg shadow-[#4F46E5]/20"
                  : "bg-[rgba(255,255,255,0.05)] text-[#a1a1aa] cursor-not-allowed"
              )}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("copywriter.action.button_loading")}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  {t("copywriter.action.button")}
                </span>
              )}
            </button>
            <div className="text-[11px] text-[#a1a1aa] mt-3">
              {t("copywriter.action.validation")}
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-200 text-sm rounded-lg p-3 mt-4">
                {error}
              </div>
            )}
          </div>
        </div>

        {object?.outputs && (
          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#4F46E5]" />
                <h2 className="text-lg font-semibold">{t("copywriter.results.title")}</h2>
                <span className="text-sm text-[#a1a1aa]">
                   {personas.find(p => p.id === personaType)?.name}
                </span>
              </div>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#ededed] bg-gradient-to-br from-[#171717] to-[#0f0f0f] border border-[rgba(255,255,255,0.15)] rounded-lg transition-all shadow-lg shadow-black/30 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 hover:bg-[rgba(255,255,255,0.05)] hover:-translate-y-0.5 hover:border-[#4F46E5]/40 hover:shadow-[#4F46E5]/20 active:translate-y-[1px] active:scale-[0.99] active:border-[#4F46E5]/50"
              >
                <Download className="w-4 h-4" />
                {t("copywriter.button.export")}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {object.outputs.map((o, idx) => {
                if (!o) return null;
                const color = platformColors[o.platformId || ""] || platformColors.default;
                return (
                  <div
                    key={idx}
                    className="bg-[#0f0f10] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden shadow-xl"
                  >
                    <div 
                        className="px-5 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between"
                        style={{ borderLeft: `4px solid ${color}` }}
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color }}>
                          {o.platformName || "..."}
                        </span>
                        <h3 className="text-sm font-semibold text-[#ededed]">
                          {o.formatName || "..."}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#a1a1aa] mb-2">
                          {t("copywriter.output.primary")}
                        </p>
                        <div className="bg-black/20 rounded-lg p-4 text-sm text-[#ededed] whitespace-pre-line border border-[rgba(255,255,255,0.05)]">
                          {o.primaryCopy || <div className="h-20 animate-pulse bg-white/5 rounded" />}
                        </div>
                      </div>

                      {o.alternateCopy && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[#a1a1aa] mb-2">
                            {t("copywriter.output.alternate")}
                          </p>
                          <div className="bg-black/10 rounded-lg p-4 text-xs text-[#a1a1aa] whitespace-pre-line italic border border-[rgba(255,255,255,0.03)]">
                            {o.alternateCopy}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {o.cta && (
                          <div>
                            <p className="text-[10px] uppercase font-bold text-[#a1a1aa] mb-1">CTA</p>
                            <p className="text-sm text-[#4F46E5] font-semibold">{o.cta}</p>
                          </div>
                        )}
                        {o.hashtags && o.hashtags.length > 0 && (
                          <div>
                            <p className="text-[10px] uppercase font-bold text-[#a1a1aa] mb-1">
                              {t("copywriter.output.hashtags")}
                            </p>
                            <p className="text-xs text-[#a1a1aa]">{o.hashtags.join(" ")}</p>
                          </div>
                        )}
                      </div>

                      {o.notes && o.notes.length > 0 && (
                        <div className="pt-3 border-t border-[rgba(255,255,255,0.05)]">
                           <p className="text-[10px] uppercase font-bold text-[#a1a1aa] mb-2">
                            {t("copywriter.output.notes")}
                          </p>
                          <ul className="space-y-1">
                            {o.notes.map((n, i) => (
                              <li key={i} className="text-[11px] text-[#a1a1aa] flex gap-2">
                                <span className="text-[#4F46E5]">•</span> {n}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
