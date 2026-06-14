import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import type { UserRole } from "../services/authApi";
import { useAuthStore } from "../store/useAuthStore";

interface AuthPageProps {
  mode: "signin" | "signup";
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const doSignIn = useAuthStore((state) => state.signIn);
  const doSignUp = useAuthStore((state) => state.signUp);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [adminCode, setAdminCode] = useState("");

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/agents"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "signin") {
      await doSignIn(email, password);
    } else {
      await doSignUp({ name, email, password, role, adminCode });
    }

    const currentUser = useAuthStore.getState().user;
    navigate(currentUser?.role === "admin" ? "/admin" : "/agents");
  }

  const isSignup = mode === "signup";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-74px)] max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg bg-slate-950 p-8 text-white shadow-glow">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-civic">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-8 text-4xl font-semibold">{isSignup ? "Create your PunaRaksha account" : "Welcome back"}</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-200">
            Secure access for citizens, ward officers, and administrators managing civic risk response.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-200">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">Citizens can submit and track evidence-backed complaints.</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">Admins can manage roles and review platform activity.</div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-civic">
            {isSignup ? <UserPlus className="h-4 w-4" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
            {isSignup ? "Sign up" : "Sign in"}
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{isSignup ? "Start with verified access" : "Continue your work"}</h2>

          <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            {isSignup ? (
              <Field label="Full name" value={name} onChange={setName} autoComplete="name" />
            ) : null}
            <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete={isSignup ? "new-password" : "current-password"} />

            {isSignup ? (
              <>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Role</span>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as UserRole)}
                    className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-civic focus:bg-white focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="officer">Ward officer request</option>
                    <option value="admin">Admin request</option>
                  </select>
                </label>

                {role === "admin" ? (
                  <Field label="Admin invite code" value={adminCode} onChange={setAdminCode} autoComplete="off" />
                ) : null}
              </>
            ) : null}

            {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-civic px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-wait disabled:bg-slate-300"
            >
              {isSignup ? <UserPlus className="h-4 w-4" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
              {isLoading ? "Please wait" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <Link className="font-semibold text-civic hover:text-teal-800" to={isSignup ? "/signin" : "/signup"}>
              {isSignup ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-civic focus:bg-white focus:ring-4 focus:ring-teal-100"
      />
    </label>
  );
}
