"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { isAdminRole, type UserRole } from "@/lib/rbac";
import { useI18n } from "@/components/i18n/I18nProvider";
import { clsx } from "clsx";

type UserRecord = {
  id: string;
  email: string;
  two_factor_enabled: boolean;
  roles: string[];
  clusters: string[];
};

type Cluster = {
  id: string;
  name: string;
};

export default function AdminUsersPage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const isAdmin = useMemo(() => isAdminRole(session?.user?.roles), [session?.user?.roles]);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [availableClusters, setAvailableClusters] = useState<Cluster[]>([]);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<UserRole>("user");
  const [draftRoles, setDraftRoles] = useState<Record<string, UserRole>>({});
  const [draftClusters, setDraftClusters] = useState<Record<string, string[]>>({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingUsers(true);
    setError(null);

    try {
      const [usersRes, clustersRes] = await Promise.all([
        fetch("/api/admin/users", { method: "GET" }),
        fetch("/api/admin/clusters", { method: "GET" })
      ]);

      if (!usersRes.ok || !clustersRes.ok) {
        console.error("Admin data fetch failed:", {
          usersStatus: usersRes.status,
          clustersStatus: clustersRes.status,
        });
        setError(t("admin.error.load_users"));
        return;
      }

      const usersData = await usersRes.json();
      const clustersData = await clustersRes.json();

      const nextUsers = (usersData.users || []) as UserRecord[];
      setUsers(nextUsers);
      setAvailableClusters((clustersData.clusters || []) as Cluster[]);
      
      setDraftRoles(
        Object.fromEntries(
          nextUsers.map((user) => [user.id, user.roles.includes("admin") ? "admin" : "user"])
        )
      );
      setDraftClusters(
        Object.fromEntries(
          nextUsers.map((user) => [user.id, user.clusters || []])
        )
      );
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError(t("admin.error.load_users"));
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      void loadData();
    }
  }, [status, isAdmin]);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmittingCreate(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail.trim().toLowerCase(),
          password: createPassword,
          role: createRole,
        }),
      });

      if (!response.ok) {
        setError(t("admin.error.create_user"));
      } else {
        const roleLabel = createRole === "admin" ? t("role.admin") : t("role.user");
        setMessage(t("admin.message.user_created", { role: roleLabel }));
        setCreateEmail("");
        setCreatePassword("");
        setCreateRole("user");
        await loadData();
      }
    } catch {
      setError(t("admin.error.create_user"));
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    const nextRole = draftRoles[userId];
    const nextClusters = draftClusters[userId];
    if (!nextRole) return;

    setError(null);
    setMessage(null);
    setRowBusy((current) => ({ ...current, [userId]: true }));

    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole, clusters: nextClusters }),
      });

      if (!response.ok) {
        setError(t("admin.error.update_role"));
      } else {
        setMessage(t("admin.message.role_updated"));
        await loadData();
      }
    } catch {
      setError(t("admin.error.update_role"));
    } finally {
      setRowBusy((current) => ({ ...current, [userId]: false }));
    }
  };

  const toggleCluster = (userId: string, clusterId: string) => {
    setDraftClusters(current => {
      const userClusters = current[userId] || [];
      const next = userClusters.includes(clusterId)
        ? userClusters.filter(id => id !== clusterId)
        : [...userClusters, clusterId];
      return { ...current, [userId]: next };
    });
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    const confirmed = window.confirm(t("admin.confirm.delete_user", { email }));
    if (!confirmed) return;

    setError(null);
    setMessage(null);
    setRowBusy((current) => ({ ...current, [userId]: true }));

    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError(t("admin.error.delete_user"));
      } else {
        setMessage(t("admin.message.user_deleted"));
        await loadData();
      }
    } catch {
      setError(t("admin.error.delete_user"));
    } finally {
      setRowBusy((current) => ({ ...current, [userId]: false }));
    }
  };

  if (status === "loading") return null;

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-zinc-500 font-medium tracking-tight">
          {t("admin.access_denied_message")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {t("admin.users.title")}
        </h2>

        <form
          onSubmit={handleCreateUser}
          className="glass border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder={t("admin.create_user.email_placeholder")}
              className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              required
            />
            <input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder={t("admin.create_user.password_placeholder")}
              className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              required
            />
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value as UserRole)}
              className="bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
            >
              <option value="user">{t("role.user")}</option>
              <option value="admin">{t("role.admin")}</option>
            </select>
          </div>
          <Button type="submit" disabled={submittingCreate}>
            {submittingCreate ? t("common.loading") : t("admin.create_user.button")}
          </Button>
        </form>

        {error && <p className="text-sm text-red-400 font-medium px-1">{error}</p>}
        {message && <p className="text-sm text-emerald-400 font-medium px-1">{message}</p>}

        {loadingUsers ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="glass border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-left text-[#a1a1aa]">
                  <th className="px-6 py-4">{t("admin.table.email")}</th>
                  <th className="px-6 py-4">{t("admin.table.twofa")}</th>
                  <th className="px-6 py-4">{t("admin.table.role")}</th>
                  <th className="px-6 py-4">{t("admin.table.clusters")}</th>
                  <th className="px-6 py-4">{t("admin.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => {
                  const selectedRole = draftRoles[user.id] ?? (user.roles.includes("admin") ? "admin" : "user");
                  const selectedClusters = draftClusters[user.id] || [];
                  const isSelf = user.id === session.user.id;
                  const busy = Boolean(rowBusy[user.id]);

                  return (
                    <tr key={user.id} className="text-zinc-300 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "text-[10px] font-bold uppercase tracking-widest",
                          user.two_factor_enabled ? "text-emerald-400" : "text-amber-400"
                        )}>
                          {user.two_factor_enabled ? t("common.status.enabled") : t("common.status.disabled")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={selectedRole}
                          onChange={(e) =>
                            setDraftRoles((current) => ({
                              ...current,
                              [user.id]: e.target.value as UserRole,
                            }))
                          }
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                          disabled={busy}
                        >
                          <option value="user">{t("role.user")}</option>
                          <option value="admin">{t("role.admin")}</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                          {availableClusters.map(cluster => (
                            <label key={cluster.id} className="flex items-center gap-2 cursor-pointer group/item">
                              <input 
                                type="checkbox" 
                                checked={selectedClusters.includes(cluster.id)}
                                onChange={() => toggleCluster(user.id, cluster.id)}
                                disabled={busy}
                                className="rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-0 focus:ring-offset-0 transition-all"
                              />
                              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 group-hover/item:text-zinc-300 transition-colors">
                                {cluster.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => void handleUpdateUser(user.id)}
                            disabled={busy}
                            variant="secondary"
                            size="sm"
                          >
                            {busy ? t("admin.button.saving") : t("admin.button.save_role")}
                          </Button>
                          {!isSelf && (
                            <button
                              onClick={() => void handleDeleteUser(user.id, user.email)}
                              className="text-xs text-zinc-500 hover:text-red-400 transition-colors font-bold uppercase tracking-widest disabled:opacity-50"
                              disabled={busy}
                            >
                              {t("admin.button.delete")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
