import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck, Users } from "lucide-react";
import type { AuthUser, UserRole } from "../services/authApi";
import { getAdminSummary, updateUserRole } from "../services/authApi";
import { useAuthStore } from "../store/useAuthStore";

export function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [summary, setSummary] = useState({ grievanceCount: 0, unresolvedCount: 0, interventionCount: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      return;
    }

    getAdminSummary()
      .then((data) => {
        setUsers(data.users);
        setSummary({
          grievanceCount: data.grievanceCount,
          unresolvedCount: data.unresolvedCount,
          interventionCount: data.interventionCount,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load admin data"));
  }, [user?.role]);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/agents" replace />;
  }

  async function changeRole(id: string, role: UserRole) {
    const result = await updateUserRole(id, role);
    setUsers(result.users);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-civic">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Admin console
        </div>
        <h1 className="mt-2 text-4xl font-semibold text-slate-950">Users and Roles</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Manage citizen, officer, and admin access for PunaRaksha.
        </p>
      </div>

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Stat label="Total grievances" value={summary.grievanceCount} />
        <Stat label="Open grievances" value={summary.unresolvedCount} />
        <Stat label="Interventions" value={summary.interventionCount} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-950">
          <Users className="h-5 w-5 text-civic" aria-hidden="true" />
          Accounts
        </div>

        {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-2 pr-4 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Email</th>
                <th className="px-4 py-2 font-semibold">Role</th>
                <th className="px-4 py-2 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((account) => (
                <tr key={account.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 font-semibold text-slate-900">{account.name}</td>
                  <td className="px-4 py-3 text-slate-600">{account.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={account.role}
                      onChange={(event) => void changeRole(account.id, event.target.value as UserRole)}
                      className="min-h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm font-semibold text-slate-800"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="officer">Officer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(account.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
