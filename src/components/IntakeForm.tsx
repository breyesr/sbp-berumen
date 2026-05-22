"use client";

import { useEffect, useMemo, useState } from "react";
import PersonaSelect, { PersonaOption } from "./PersonaSelect";
import IndustrySelect from "./IndustrySelect";
import CitySelect from "./CitySelect";

type Scorecard = {
  efficiencyScore: number;
  narratives: string[];
  suggestedFocus?: "optimize_spend" | "improve_sales" | "change_channel" | "choose";
};

type PersonaReply = {
  reaction: string;
  answerToQuestion: string;
  dudasCliente: string[];
  sugerencias: string[];
  conversionLikelihood: number;
  personaName?: string;
  industryName?: string;
  askedQuestion?: string;
  insights?: {
    whatClientWantsSummary: string;
    whatToDoThisWeek: string[];
    expectedImpact: string[];
    howToKnow: string[];
    howToTalk: string[];
  } | null;
};

type Props = { personas?: PersonaOption[] };

const CHANNEL_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "google", label: "Google (Búsqueda/Maps)" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "referidos", label: "Recomendaciones" },
  { value: "otros", label: "Otros" },
];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const toInt = (v: string, fallback = 0) => {
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
};
const digitsOnly = (s: string) => s.replace(/[^\d]/g, "");
function isAllowedKey(e: React.KeyboardEvent<HTMLInputElement>) {
  const code = e.key;
  const allowed = ["Backspace","Delete","Tab","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"];
  if (allowed.includes(code)) return true;
  if ((e.ctrlKey || e.metaKey) && /^[acvxyz]$/i.test(code)) return true;
  return /^[0-9]$/.test(code);
}
const preventWheel = (e: React.WheelEvent<HTMLInputElement>) => (e.currentTarget as any).blur();

export default function IntakeForm({ personas = [] }: Props) {
  // Persona
  const [personaType, setPersonaType] = useState<string | number>("");
  useEffect(() => {
    if (!personaType && personas[0]?.id) setPersonaType(personas[0].id);
    else if (personaType && !personas.find((p) => p.id === personaType)) {
      setPersonaType(personas[0]?.id ?? "");
    }
  }, [personas, personaType]);

  // Industry & City
  const [businessType, setBusinessType] = useState<string>("");
  const [city, setCity] = useState("Monterrey");

  // UI state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Scorecard | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Numeric inputs (start empty)
  const [customersPerMonth, setCustomersPerMonth] = useState("");
  const [avgTicket, setAvgTicket] = useState("");
  const [adSpend, setAdSpend] = useState("");

  const [mainDiscovery, setMainDiscovery] = useState("instagram");
  const [supportChannels, setSupportChannels] = useState<string[]>([]);
  const toggleSupportChannel = (v: string) =>
    setSupportChannels(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const [repeatUnknown, setRepeatUnknown] = useState(false);
  const [repeatCount, setRepeatCount] = useState("0");

  function numberToBucket(n: number): "0-2"|"3-4"|"5-6"|"7-8"|"9-10" {
    const x = clamp(Math.round(n), 0, 10);
    if (x <= 2) return "0-2";
    if (x <= 4) return "3-4";
    if (x <= 6) return "5-6";
    if (x <= 8) return "7-8";
    return "9-10";
  }

  // Q&A
  const [focus, setFocus] = useState<"efficiency" | "conversion" | "insight" | null>(null);
  const [question, setQuestion] = useState("");
  const [qnaLoading, setQnaLoading] = useState(false);
  const [qnaError, setQnaError] = useState<string | null>(null);
  const [personaAns, setPersonaAns] = useState<PersonaReply | null>(null);

  const starterQs = useMemo(() => {
    const medios = [
      "¿Dónde sueles buscar primero cuando necesitas algo como lo mío?",
      "¿Qué te haría dar clic en un anuncio mío sin dudar?",
      "¿Qué te hace ignorar por completo una publicación o anuncio?",
    ];
    const regreso = [
      "Después de comprar/visitar, ¿qué te haría volver pronto conmigo?",
      "Si no vuelves, ¿qué cosas suelen fallar o te desaniman?",
      "¿Qué señales te harían confiar más en mí para regresar?",
    ];
    const conocer = [
      "¿Qué problema intentas resolver exactamente conmigo?",
      "¿Qué te preocupa o te frena antes de decidirte?",
      "¿Qué información te gustaría tener clara desde el principio?",
    ];
    return { medios, regreso, conocer };
  }, []);

  // Validation / blocking
  const customersNum = toInt(customersPerMonth || "0", 0);
  const ticketNum = toInt(avgTicket || "0", 0);
  const spendNum = toInt(adSpend || "0", 0);
  const blockSubmit =
    !personaType || !businessType ||
    customersPerMonth === "" || avgTicket === "" || adSpend === "" ||
    customersNum <= 0 || ticketNum <= 0 || spendNum <= 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blockSubmit) {
      setError("Completa los campos con valores mayores a 0.");
      return;
    }

    const payload = {
      personaType,
      businessType,
      city,
      patientsPerMonth: clamp(customersNum, 0, 100000),
      avgTicket: clamp(ticketNum, 0, 10_000_000),
      mainChannel: mainDiscovery,
      adSpend: clamp(spendNum, 0, 10_000_000),
      returnRate: repeatUnknown ? "No sé" : numberToBucket(clamp(toInt(repeatCount, 0), 0, 10)),
      supportChannels,
    };

    setLoading(true);
    setError(null);
    setResult(null);
    setPersonaAns(null);
    setQnaError(null);
    setFocus(null);

    try {
      const res = await fetch("/api/scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: Scorecard = await res.json();
      setResult(json);

      switch (json.suggestedFocus) {
        case "optimize_spend": setFocus("efficiency"); break;
        case "improve_sales": setFocus("conversion"); break;
        case "change_channel": setFocus("insight"); break;
        default: setFocus(null);
      }
    } catch (err: any) {
      setError(err?.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function askPersona(q: string) {
    if (!q?.trim()) return;
    if (!personaType) { setQnaError("Selecciona una persona antes de preguntar."); return; }
    if (!businessType) { setQnaError("Selecciona tu tipo de negocio."); return; }

    setQnaLoading(true);
    setQnaError(null);
    setPersonaAns(null);

    try {
      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaType,
          businessType,
          city,
          question: q,
          focus: focus ?? "insight",
          patientsPerMonth: toInt(customersPerMonth || "0", 0),
          avgTicket: toInt(avgTicket || "0", 0),
          adSpend: toInt(adSpend || "0", 0),
          mainChannel: mainDiscovery,
          supportChannels,
          returnRate: repeatUnknown ? "No sé" : numberToBucket(clamp(toInt(repeatCount, 0), 0, 10)),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const ans: PersonaReply = {
        reaction: json.reaction,
        answerToQuestion: json.answerToQuestion,
        dudasCliente: json.dudasCliente,
        sugerencias: json.sugerencias,
        conversionLikelihood: json.conversionLikelihood,
        personaName: json.persona,
        industryName: json.industry,
        askedQuestion: json.askedQuestion,
        insights: json.insights ?? null,
      };
      setPersonaAns(ans);
    } catch (err: any) {
      setQnaError(err?.message ?? "No pude obtener respuesta. Intenta de nuevo.");
    } finally {
      setQnaLoading(false);
    }
  }

  function handleStarterClick(s: string) {
    setQuestion(s); // select only; send on "Preguntar"
  }

  const noPersonas = personas.length === 0;

  return (
    <div className="w-full max-w-2xl p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
      <h2 className="text-lg font-bold font-brand text-foreground">Aquí empieza tu crecimiento: cuéntanos sobre tu negocio</h2>

      {/* Persona + Industria + Ciudad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PersonaSelect
          options={personas}
          value={personaType}
          onChange={setPersonaType}
          labelText="¿Con quién quieres conectar y vender más?"
        />
        <IndustrySelect
          value={businessType}
          onChange={setBusinessType}
          labelText="¿Qué tipo de negocio tienes?"
        />
        <CitySelect
          value={city}
          onChange={setCity}
          labelText="Ciudad"
        />
      </div>

      {/* Métricas y canales */}
      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Clientes/mes */}
        <label className="space-y-1">
          <span className="text-sm font-medium text-foreground-muted font-brand uppercase tracking-wider">Clientes/mes</span>
          <input
            type="text"
            inputMode="numeric"
            className="w-full rounded-xl border border-border bg-background p-2 text-foreground font-body focus:ring-2 focus:ring-primary/30 outline-none"
            value={customersPerMonth}
            onChange={(e) => setCustomersPerMonth(digitsOnly(e.target.value))}
            onKeyDown={(e) => { if (!isAllowedKey(e)) e.preventDefault(); }}
            onPaste={(e) => {
              const text = (e.clipboardData || (window as any).clipboardData).getData("text");
              if (!/^\d+$/.test(text)) e.preventDefault();
            }}
            onWheel={preventWheel}
            placeholder="Ej. 15"
          />
          {(customersPerMonth === "" || customersNum <= 0) && (
            <p className="text-[10px] text-error font-bold uppercase tracking-widest px-1">Ingresa un número &gt; 0</p>
          )}
        </label>

        {/* Ticket promedio */}
        <label className="space-y-1">
          <span className="text-sm font-medium text-foreground-muted font-brand uppercase tracking-wider">Ticket promedio (MX$)</span>
          <input
            type="text"
            inputMode="numeric"
            className="w-full rounded-xl border border-border bg-background p-2 text-foreground font-body focus:ring-2 focus:ring-primary/30 outline-none"
            value={avgTicket}
            onChange={(e) => setAvgTicket(digitsOnly(e.target.value))}
            onKeyDown={(e) => { if (!isAllowedKey(e)) e.preventDefault(); }}
            onPaste={(e) => {
              const text = (e.clipboardData || (window as any).clipboardData).getData("text");
              if (!/^\d+$/.test(text)) e.preventDefault();
            }}
            onWheel={preventWheel}
            placeholder="Ej. 300"
          />
          {(avgTicket === "" || ticketNum <= 0) && (
            <p className="text-[10px] text-error font-bold uppercase tracking-widest px-1">Ingresa un número &gt; 0</p>
          )}
        </label>

        {/* ¿Dónde te encuentran más? */}
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm font-medium text-foreground-muted font-brand uppercase tracking-wider">¿Dónde te encuentran más?</span>
          <select
            className="w-full rounded-xl border border-border bg-background p-2 text-foreground font-body focus:ring-2 focus:ring-primary/30 outline-none appearance-none"
            value={mainDiscovery}
            onChange={(e) => setMainDiscovery(e.target.value)}
          >
            {CHANNEL_OPTIONS.map((c) => (
              <option key={c.value} value={c.value} className="bg-background">{c.label}</option>
            ))}
          </select>
        </label>

        {/* Canales de apoyo */}
        <div className="sm:col-span-2 space-y-2">
          <p className="text-sm font-medium text-foreground-muted font-brand uppercase tracking-wider">¿Dónde más tienes presencia?</p>
          <div className="flex flex-wrap gap-3">
            {CHANNEL_OPTIONS.map((c) => (
              <label key={`chk-${c.value}`} className="inline-flex items-center gap-2 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  className="rounded border-border bg-background text-primary focus:ring-primary/30 transition-all cursor-pointer"
                  checked={supportChannels.includes(c.value)}
                  onChange={() => toggleSupportChannel(c.value)}
                />
                <span className="text-foreground-muted group-hover:text-foreground transition-colors font-body">{c.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Inversión mensual */}
        <label className="space-y-1">
          <span className="text-sm font-medium text-foreground-muted font-brand uppercase tracking-wider">Inversión mensual (MX$)</span>
          <input
            type="text"
            inputMode="numeric"
            className="w-full rounded-xl border border-border bg-background p-2 text-foreground font-body focus:ring-2 focus:ring-primary/30 outline-none"
            value={adSpend}
            onChange={(e) => setAdSpend(digitsOnly(e.target.value))}
            onKeyDown={(e) => { if (!isAllowedKey(e)) e.preventDefault(); }}
            onPaste={(e) => {
              const text = (e.clipboardData || (window as any).clipboardData).getData("text");
              if (!/^\d+$/.test(text)) e.preventDefault();
            }}
            onWheel={preventWheel}
            placeholder="Ej. 2000"
          />
          {(adSpend === "" || spendNum <= 0) && (
            <p className="text-[10px] text-error font-bold uppercase tracking-widest px-1">Ingresa un número &gt; 0</p>
          )}
        </label>

        {/* Repetición */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-foreground-muted font-brand uppercase tracking-wider block">Retención (de 10 clientes)</span>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="numeric"
              className="w-28 rounded-xl border border-border bg-background p-2 text-foreground font-body focus:ring-2 focus:ring-primary/30 outline-none"
              value={repeatCount}
              onChange={(e) => {
                const v = digitsOnly(e.target.value);
                if (v === "") setRepeatCount("0");
                else setRepeatCount(String(clamp(Number(v), 0, 10)));
              }}
              onKeyDown={(e) => { if (!isAllowedKey(e)) e.preventDefault(); }}
              onPaste={(e) => {
                const text = (e.clipboardData || (window as any).clipboardData).getData("text");
                if (!/^\d+$/.test(text)) e.preventDefault();
              }}
              onWheel={preventWheel}
              disabled={false}
              placeholder="0–10"
            />
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer group">
              <input
                type="checkbox"
                className="rounded border-border bg-background text-primary focus:ring-primary/30 transition-all cursor-pointer"
                checked={repeatUnknown}
                onChange={(e) => setRepeatUnknown(e.target.checked)}
              />
              <span className="text-foreground-muted group-hover:text-foreground transition-colors font-body">No sé</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="sm:col-span-2 pt-2">
          <button
            type="submit"
            disabled={loading || noPersonas || blockSubmit}
            className="w-full rounded-xl bg-primary hover:bg-primary-hover text-white px-6 py-3 text-sm font-bold font-brand uppercase tracking-widest transition-all disabled:opacity-50 shadow-md active:scale-95"
          >
            {loading ? "Calculando..." : "Generar scorecard"}
          </button>
          {(noPersonas || blockSubmit) && (
            <p className="mt-2 text-[10px] text-amber-600 font-bold uppercase tracking-widest px-1">
              {noPersonas ? "Carga al menos una persona para continuar." : "Completa los campos requeridos con valores mayores a 0."}
            </p>
          )}
        </div>
      </form>

      {/* Errors */}
      {error && <p className="text-sm text-red-600">Error: {error}</p>}

      {/* SCORECARD */}
      {result && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-foreground space-y-5 shadow-inner">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold font-brand uppercase tracking-tight">Tu resultado</h2>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-foreground-subtle uppercase tracking-widest">Eficiencia</span>
              <span className="text-3xl font-black text-primary leading-none">{result.efficiencyScore}<span className="text-sm text-foreground-muted font-normal">/10</span></span>
            </div>
          </div>

          {Array.isArray(result.narratives) && result.narratives.length > 0 && (
            <ul className="space-y-3">
              {result.narratives.map((line, i) => (
                <li key={`narr-${i}`} className="flex gap-3 text-sm text-foreground-muted font-body">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  {line}
                </li>
              ))}
            </ul>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-[10px] font-bold text-foreground-subtle uppercase tracking-[0.2em] mb-3 font-brand">¿Qué quieres mejorar primero?</p>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-xl text-xs font-bold font-brand uppercase tracking-widest transition-all border ${focus === "efficiency" ? "bg-primary text-white border-primary shadow-md" : "bg-background text-foreground-muted border-border hover:border-primary/50 hover:text-foreground"}`}
                onClick={() => setFocus("efficiency")}
              >
                Estrategia de medios
              </button>
              <button
                className={`px-4 py-2 rounded-xl text-xs font-bold font-brand uppercase tracking-widest transition-all border ${focus === "conversion" ? "bg-primary text-white border-primary shadow-md" : "bg-background text-foreground-muted border-border hover:border-primary/50 hover:text-foreground"}`}
                onClick={() => setFocus("conversion")}
              >
                Fidelización
              </button>
              <button
                className={`px-4 py-2 rounded-xl text-xs font-bold font-brand uppercase tracking-widest transition-all border ${focus === "insight" ? "bg-primary text-white border-primary shadow-md" : "bg-background text-foreground-muted border-border hover:border-primary/50 hover:text-foreground"}`}
                onClick={() => setFocus("insight")}
              >
                User Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Q&A */}
      <div className="space-y-4">
        {focus && (
          <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
            <p className="text-sm font-bold font-brand text-foreground uppercase tracking-widest">
              Pregunta a {personaAns?.personaName ?? "tu cliente"}
            </p>

            <div className="flex flex-col gap-2">
              {(focus === "efficiency" ? starterQs.medios
                : focus === "conversion" ? starterQs.regreso
                : starterQs.conocer
              ).map((s, idx) => (
                <button
                  key={`sq-${idx}`}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-border bg-background hover:bg-surface-hover hover:border-primary/30 text-foreground-muted hover:text-foreground transition-all font-body italic"
                  onClick={() => handleStarterClick(s)}
                >
                  "{s}"
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Escribe tu pregunta…"
                className="flex-1 rounded-xl border border-border bg-background p-3 text-sm text-foreground font-body focus:ring-2 focus:ring-primary/30 outline-none"
              />
              <button
                onClick={() => askPersona(question)}
                disabled={!question || qnaLoading}
                className="rounded-xl bg-primary hover:bg-primary-hover text-white px-6 py-2 text-sm font-bold font-brand uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {qnaLoading ? "..." : "Preguntar"}
              </button>
            </div>

            {qnaError && <p className="text-xs text-error font-bold font-brand uppercase">{qnaError}</p>}
          </div>
        )}

        {personaAns && (
          <div className="mt-2 rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-lg animate-fade-in">
            <div className="border-b border-border pb-4">
              <h3 className="text-lg font-bold font-brand text-foreground leading-tight">
                Respuestas de {personaAns.personaName ?? "tu cliente"}
              </h3>
              <p className="text-[10px] text-foreground-subtle font-bold uppercase tracking-widest mt-1">
                {personaAns.industryName ?? businessType} • {city}
              </p>
            </div>

            {personaAns.answerToQuestion && (
              <div className="p-4 bg-background border border-border rounded-xl">
                <p className="text-base text-foreground font-body leading-relaxed">
                  "{personaAns.answerToQuestion}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] font-brand">
                  Dudas críticas
                </p>
                <ul className="space-y-2">
                  {personaAns.dudasCliente.map((d, i) => (
                    <li key={`duda-${i}`} className="flex gap-3 text-sm text-foreground-muted font-body leading-tight">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-error/40 mt-1.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-success uppercase tracking-[0.2em] font-brand">
                  Señales de confianza
                </p>
                <ul className="space-y-2">
                  {personaAns.sugerencias.map((s, i) => (
                    <li key={`sug-${i}`} className="flex gap-3 text-sm text-foreground-muted font-body leading-tight">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-success/40 mt-1.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm font-bold font-brand text-foreground-muted uppercase tracking-widest">Probabilidad de conversión</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 bg-background border border-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${personaAns.conversionLikelihood * 10}%` }} />
                </div>
                <span className="text-lg font-black text-primary font-brand">{personaAns.conversionLikelihood}<span className="text-xs text-foreground-muted font-normal">/10</span></span>
              </div>
            </div>

            {/* INSIGHTS */}
            {personaAns.insights && (
              <div className="mt-6 pt-6 border-t border-border space-y-6">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 rounded bg-primary text-white text-[10px] font-black uppercase tracking-widest font-brand shadow-sm">
                    Intelligence Insight
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground-subtle uppercase tracking-widest font-brand">Lo que está pidiendo</p>
                  <p className="text-sm text-foreground font-body leading-relaxed bg-primary/5 p-4 rounded-xl border border-primary/10">{personaAns.insights.whatClientWantsSummary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-widest font-brand mb-2">Pasos accionables</p>
                      <ul className="space-y-2">
                        {personaAns.insights.whatToDoThisWeek.map((l, i) => (
                          <li key={`do-${i}`} className="flex gap-3 text-sm text-foreground-muted font-body italic">
                            <span className="shrink-0 text-primary font-bold">{i+1}.</span>
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-widest font-brand mb-2">Impacto esperado</p>
                      <ul className="space-y-2">
                        {personaAns.insights.expectedImpact.map((l, i) => (
                          <li key={`impact-${i}`} className="text-sm text-foreground-muted font-body flex gap-2">
                            <span className="text-primary">→</span>
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-widest font-brand mb-2">KPI de validación (2-3 semanas)</p>
                      <ul className="space-y-2">
                        {personaAns.insights.howToKnow.map((l, i) => (
                          <li key={`know-${i}`} className="text-sm text-foreground-muted font-body flex gap-2">
                            <span className="text-success text-xs mt-0.5">●</span>
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-surface-elevated rounded-2xl border border-border shadow-inner">
                      <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] font-brand mb-3">Tone of Voice Strategy</p>
                      <ul className="space-y-2">
                        {personaAns.insights.howToTalk.map((l, i) => (
                          <li key={`talk-${i}`} className="text-sm text-foreground font-body leading-snug">
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    );
    }