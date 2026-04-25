"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/rbac";
import { useI18n } from "@/components/i18n/I18nProvider";
import { KnowledgeDropzone } from "@/components/admin/KnowledgeDropzone";
import { Trash2, Brain } from "lucide-react";

type PersonaRecord = {
  id: string;
  name: string;
  role: string;
  cluster: string;
  metadata: any;
  updated_at: string;
};

const CLUSTERS = ["Marketing & Business", "Students", "Medical & Health", "Retail", "General"];

export default function AdminPersonasPage() {
  const { t, formatDate } = useI18n();
  const { data: session, status } = useSession();
  const isAdmin = useMemo(() => isAdminRole(session?.user?.roles), [session?.user?.roles]);

  const [personas, setPersonas] = useState<PersonaRecord[]>([]);
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState("");
  const [createCluster, setCreateCluster] = useState("General");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [expandingPersona, setExpandingPersona] = useState<string | null>(null);

  const loadPersonas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/personas");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPersonas(data.personas);
    } catch (err: any) {
      setError(t("admin.personas.error.load"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      void loadPersonas();
    }
  }, [status, isAdmin]);

  const handleCreatePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          role: createRole,
          cluster: createCluster,
          metadata: { pains: [], goals: [], channels: [] }
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessage(t("admin.personas.message.created"));
      setCreateName("");
      setCreateRole("");
      setCreateCluster("General");
      await loadPersonas();
    } catch (err: any) {
      setError(t("admin.personas.error.create"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePersona = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${name}?`)) return;
    
    setError(null);
    try {
      const res = await fetch(`/api/admin/personas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadPersonas();
    } catch (err: any) {
      setError("No se pudo eliminar la persona.");
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-[#a1a1aa]">{t("admin.loading_access")}</p>;
  }

  if (!session?.user || !isAdmin) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-xl font-semibold text-red-200">{t("admin.access_denied_title")}</h1>
        <p className="mt-2 text-sm text-red-100">{t("admin.access_denied_message")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <h1 className="text-2xl font-semibold text-white">{t("admin.personas.title")}</h1>
        <p className="mt-2 text-sm text-[#a1a1aa]">{t("admin.personas.subtitle")}</p>

        {error && (
          <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {message}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <h2 className="text-lg font-semibold text-white">{t("admin.personas.create_title")}</h2>
        <form onSubmit={handleCreatePersona} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder={t("admin.personas.name_placeholder")}
            required
            className="rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm text-white outline-none ring-blue-500/40 placeholder:text-[#6b7280] focus:ring"
          />
          <input
            type="text"
            value={createRole}
            onChange={(e) => setCreateRole(e.target.value)}
            placeholder={t("admin.personas.role_placeholder")}
            className="rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm text-white outline-none ring-blue-500/40 placeholder:text-[#6b7280] focus:ring"
          />
          <select
            value={createCluster}
            onChange={(e) => setCreateCluster(e.target.value)}
            className="rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm text-white outline-none ring-blue-500/40 focus:ring"
          >
            {CLUSTERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="sm:col-span-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? t("admin.personas.button_creating") : t("admin.personas.button_create")}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <h2 className="text-lg font-semibold text-white">{t("admin.personas.list_title")}</h2>
        
        {loading ? (
          <p className="mt-4 text-sm text-[#a1a1aa]">{t("common.loading")}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[#a1a1aa]">
                  <th className="px-2 py-2">{t("admin.personas.table.name")}</th>
                  <th className="px-2 py-2">{t("admin.personas.table.cluster")}</th>
                  <th className="px-2 py-2">{t("admin.personas.table.role")}</th>
                  <th className="px-2 py-2">{t("admin.personas.table.updated")}</th>
                  <th className="px-2 py-2 text-right">{t("admin.personas.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {personas.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr className="border-b border-white/5 text-[#e4e4e7] hover:bg-white/[0.02] transition-colors">
                      <td className="px-2 py-3 font-medium">{p.name}</td>
                      <td className="px-2 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] uppercase font-bold">
                          {p.cluster}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-[#a1a1aa]">{p.role || "—"}</td>
                      <td className="px-2 py-3 text-[#71717a] text-xs">{formatDate(p.updated_at)}</td>
                      <td className="px-2 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant={expandingPersona === p.id ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setExpandingPersona(expandingPersona === p.id ? null : p.id)}
                            className="flex items-center gap-1"
                          >
                            <Brain className="w-3 h-3" />
                            Entrenar
                          </Button>
                          <button
                            onClick={() => handleDeletePersona(p.id, p.name)}
                            className="p-2 text-[#71717a] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandingPersona === p.id && (
                      <tr className="bg-indigo-500/5">
                        <td colSpan={5} className="p-6 border-b border-white/10">
                          <div className="max-w-xl mx-auto">
                            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                              <Brain className="w-4 h-4 text-indigo-400" />
                              Base de Conocimiento para {p.name}
                            </h4>
                            <KnowledgeDropzone personaId={p.id} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
