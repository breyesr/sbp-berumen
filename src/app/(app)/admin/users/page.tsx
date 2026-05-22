"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
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
    <div className="space-y-12 animate-fade-in font-body">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tighter text-foreground font-brand uppercase">
          {t("admin.users.title")}
        </h2>

        <form
          onSubmit={handleCreateUser}
          className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder={t("admin.create_user.email_placeholder")}
              className="bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              required
            />
            <input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder={t("admin.create_user.password_placeholder")}
              className="bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              required
            />
            <div className="relative">
                <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value as UserRole)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                >
                <option value="user">{t("role.user")}</option>
                <option value="admin">{t("role.admin")}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-subtle">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
          </div>
          <Button type="submit" disabled={submittingCreate} className="h-12 px-10">
            {submittingCreate ? t("common.loading") : t("admin.create_user.button")}
          </Button>
        </form>

        {error && <p className="text-sm text-error font-bold font-brand uppercase tracking-widest px-1">{error}</p>}
        {message && <p className="text-sm text-success font-bold font-brand uppercase tracking-widest px-1">{message}</p>}

        {loadingUsers ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-left text-foreground-subtle bg-surface-elevated/30">
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] font-brand">{t("admin.table.email")}</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] font-brand">{t("admin.table.twofa")}</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] font-brand">{t("admin.table.role")}</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] font-brand">{t("admin.table.clusters")}</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] font-brand text-right">{t("admin.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const selectedRole = draftRoles[user.id] ?? (user.roles.includes("admin") ? "admin" : "user");
                  const selectedClusters = draftClusters[user.id] || [];
                  const isSelf = user.id === session?.user?.id;
                  const busy = Boolean(rowBusy[user.id]);

                  return (
                    <tr key={user.id} className="text-foreground-muted hover:bg-surface-hover transition-colors group">
                      <td className="px-6 py-4 font-medium">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                          user.two_factor_enabled 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-warning/10 text-warning border-warning/20"
                        )}>
                          {user.two_factor_enabled ? t("common.status.enabled") : t("common.status.disabled")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group/select w-32">
                            <select
                            value={selectedRole}
                            onChange={(e) =>
                                setDraftRoles((current) => ({
                                ...current,
                                [user.id]: e.target.value as UserRole,
                                }))
                            }
                            className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                            disabled={busy}
                            >
                            <option value="user">{t("role.user")}</option>
                            <option value="admin">{t("role.admin")}</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-subtle">
                                <ChevronDown className="w-3 h-3" />
                            </div>
                        </div>
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
                                className="rounded border-border bg-background text-primary focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
                              />
                              <span className="text-[10px] uppercase font-bold tracking-widest text-foreground-subtle group-hover/item:text-foreground transition-colors font-brand">
                                {cluster.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Button
                            onClick={() => void handleUpdateUser(user.id)}
                            disabled={busy}
                            className="h-8 px-4 text-[9px]"
                          >
                            {busy ? t("admin.button.saving") : t("admin.button.save_role")}
                          </Button>
                          {!isSelf && (
                            <button
                              onClick={() => void handleDeleteUser(user.id, user.email)}
                              className="text-[9px] text-foreground-subtle hover:text-error transition-colors font-bold uppercase tracking-widest disabled:opacity-50 font-brand"
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
