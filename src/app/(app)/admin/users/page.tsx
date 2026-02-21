"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { isAdminRole, type UserRole } from "@/lib/rbac";

type UserRecord = {
  id: string;
  email: string;
  two_factor_enabled: boolean;
  roles: string[];
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const isAdmin = useMemo(() => isAdminRole(session?.user?.roles), [session?.user?.roles]);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<UserRole>("user");
  const [draftRoles, setDraftRoles] = useState<Record<string, UserRole>>({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", { method: "GET" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to load users.");
        return;
      }

      const nextUsers = data.users as UserRecord[];
      setUsers(nextUsers);
      setDraftRoles(
        Object.fromEntries(
          nextUsers.map((user) => [user.id, user.roles.includes("admin") ? "admin" : "user"])
        )
      );
    } catch {
      setError("Could not load users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      void loadUsers();
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
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create user.");
      } else {
        setMessage(`User created with role '${createRole}'.`);
        setCreateEmail("");
        setCreatePassword("");
        setCreateRole("user");
        await loadUsers();
      }
    } catch {
      setError("Could not create user.");
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleRoleUpdate = async (userId: string) => {
    const nextRole = draftRoles[userId];
    if (!nextRole) return;

    setError(null);
    setMessage(null);
    setRowBusy((current) => ({ ...current, [userId]: true }));

    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update user role.");
      } else {
        setMessage("User role updated.");
        await loadUsers();
      }
    } catch {
      setError("Could not update user role.");
    } finally {
      setRowBusy((current) => ({ ...current, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    const confirmed = window.confirm(`Delete user '${email}'? This cannot be undone.`);
    if (!confirmed) return;

    setError(null);
    setMessage(null);
    setRowBusy((current) => ({ ...current, [userId]: true }));

    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete user.");
      } else {
        setMessage("User deleted.");
        await loadUsers();
      }
    } catch {
      setError("Could not delete user.");
    } finally {
      setRowBusy((current) => ({ ...current, [userId]: false }));
    }
  };

  if (status === "loading") {
    return <p className="text-sm text-[#a1a1aa]">Checking access...</p>;
  }

  if (!session?.user || !isAdmin) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <h1 className="text-xl font-semibold text-red-200">Access denied</h1>
        <p className="mt-2 text-sm text-red-100">
          Only admin users can manage accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <h1 className="text-2xl font-semibold text-white">User Management</h1>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          Admin-only area to create users and manage roles.
        </p>

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
        <h2 className="text-lg font-semibold text-white">Create User</h2>
        <form onSubmit={handleCreateUser} className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            type="email"
            value={createEmail}
            onChange={(event) => setCreateEmail(event.target.value)}
            placeholder="user@example.com"
            required
            className="rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm text-white outline-none ring-blue-500/40 placeholder:text-[#6b7280] focus:ring sm:col-span-2"
          />
          <input
            type="password"
            value={createPassword}
            onChange={(event) => setCreatePassword(event.target.value)}
            placeholder="Temporary password"
            required
            className="rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm text-white outline-none ring-blue-500/40 placeholder:text-[#6b7280] focus:ring"
          />
          <select
            value={createRole}
            onChange={(event) => setCreateRole(event.target.value as UserRole)}
            className="rounded-md border border-white/15 bg-[#0d0e10] px-3 py-2 text-sm text-white outline-none ring-blue-500/40 focus:ring"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <div className="sm:col-span-4">
            <Button type="submit" disabled={submittingCreate}>
              {submittingCreate ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#111214] p-6">
        <h2 className="text-lg font-semibold text-white">Existing Users</h2>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          You cannot delete your own account or remove your own admin role.
        </p>

        {loadingUsers ? (
          <p className="mt-4 text-sm text-[#a1a1aa]">Loading users...</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[#a1a1aa]">
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">2FA</th>
                  <th className="px-2 py-2">Role</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const selectedRole = draftRoles[user.id] ?? (user.roles.includes("admin") ? "admin" : "user");
                  const isSelf = user.id === session.user.id;
                  const busy = Boolean(rowBusy[user.id]);

                  return (
                    <tr key={user.id} className="border-b border-white/5 text-[#e4e4e7]">
                      <td className="px-2 py-3">{user.email}</td>
                      <td className="px-2 py-3">
                        <span className={user.two_factor_enabled ? "text-emerald-400" : "text-amber-400"}>
                          {user.two_factor_enabled ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <select
                          value={selectedRole}
                          onChange={(event) =>
                            setDraftRoles((current) => ({
                              ...current,
                              [user.id]: event.target.value as UserRole,
                            }))
                          }
                          className="rounded-md border border-white/15 bg-[#0d0e10] px-2 py-1 text-sm text-white outline-none ring-blue-500/40 focus:ring"
                          disabled={busy}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            onClick={() => void handleRoleUpdate(user.id)}
                            disabled={busy}
                          >
                            {busy ? "Saving..." : "Save Role"}
                          </Button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteUser(user.id, user.email)}
                            disabled={busy || isSelf}
                            className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
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
