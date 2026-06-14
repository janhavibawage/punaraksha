export type UserRole = "citizen" | "officer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  firstUser?: boolean;
}

const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "" : "http://127.0.0.1:8787");

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  adminCode?: string;
}) {
  return requestJson<AuthResponse>("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function signIn(input: { email: string; password: string }) {
  return requestJson<AuthResponse>("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function getMe() {
  return requestJson<{ user: AuthUser }>("/api/auth/me", {
    credentials: "include",
  });
}

export async function signOut() {
  return requestJson<{ ok: true }>("/api/auth/signout", {
    method: "POST",
  });
}

export async function getAdminSummary() {
  return requestJson<{
    users: AuthUser[];
    grievanceCount: number;
    unresolvedCount: number;
    interventionCount: number;
  }>("/api/admin/summary", {
    credentials: "include",
  });
}

export async function updateUserRole(id: string, role: UserRole) {
  return requestJson<{ users: AuthUser[] }>(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...init,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed: ${response.status}`);
  }

  return payload as T;
}
