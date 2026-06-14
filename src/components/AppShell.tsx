import { Bot, FlaskConical, LayoutDashboard, LogIn, Settings, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LanguageRuntime } from "./LanguageRuntime";
import { RakshakChatbot } from "./RakshakChatbot";
import { useAuthStore } from "../store/useAuthStore";
import { useGrievanceStore } from "../store/useGrievanceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { formatTime } from "../utils/format";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/evals", label: "Evals", icon: FlaskConical },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const simulatedNow = useGrievanceStore((state) => state.simulatedNow);
  const user = useAuthStore((state) => state.user);
  const hydrate = useAuthStore((state) => state.hydrate);
  const signOut = useAuthStore((state) => state.signOut);
  const applyAppearance = useSettingsStore((state) => state.applyAppearance);

  useEffect(() => {
    void hydrate();
    applyAppearance();
  }, [applyAppearance, hydrate]);

  return (
    <div className="min-h-screen bg-[#f5f7f4] text-slate-950">
      <LanguageRuntime />
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <NavLink to="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-tight">PunaRaksha</span>
              <span className="block text-xs font-medium text-slate-500">Civic safety and AQI command center</span>
            </span>
          </NavLink>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    [
                      "flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
                      isActive ? "bg-white text-civic shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-950",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
              {user?.role === "admin" ? (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    [
                      "flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
                      isActive ? "bg-white text-civic shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-950",
                    ].join(" ")
                  }
                >
                  <Users className="h-4 w-4" aria-hidden="true" />
                  Admin
                </NavLink>
              ) : null}
            </nav>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              Real time <span className="text-slate-950">{formatTime(simulatedNow)}</span>
            </div>
            {user ? (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className="text-xs font-semibold text-slate-600">
                  {user.name} <span className="text-civic">({user.role})</span>
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex rounded-lg border border-slate-200 bg-white p-1">
                <NavLink
                  to="/signin"
                  className={({ isActive }) =>
                    [
                      "flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition",
                      isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                    ].join(" ")
                  }
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign in
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    [
                      "flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition",
                      isActive ? "bg-civic text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                    ].join(" ")
                  }
                >
                  <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      <Outlet />
      <RakshakChatbot />
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-slate-950">PunaRaksha</p>
                <p className="text-xs font-medium text-slate-500">Pune civic safety and AQI response platform</p>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
              Citizen grievance intake, ward response coordination, evidence review, and city risk monitoring in one civic service.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-950">Public Services</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <NavLink className="hover:text-civic" to="/agents">File complaint</NavLink>
              <NavLink className="hover:text-civic" to="/dashboard">Ward dashboard</NavLink>
              <NavLink className="hover:text-civic" to="/settings">Settings</NavLink>
              <NavLink className="hover:text-civic" to="/evals">System evals</NavLink>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-950">Service Status</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p>Complaint services: protected</p>
              <p>Evidence uploads: access controlled</p>
              <p>Case records: saved securely</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-500">
          PunaRaksha civic technology platform for Pune. For emergency assistance, contact official emergency services.
        </div>
      </footer>
    </div>
  );
}
