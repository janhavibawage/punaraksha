export type AppearanceMode = "light" | "dark" | "system";
export type LanguageCode = "en" | "mr" | "hi";

export interface UserSettings {
  appearance: AppearanceMode;
  language: LanguageCode;
  mobileNumber: string;
  twoFactorEnabled: boolean;
  notifications: {
    sms: boolean;
    email: boolean;
    push: boolean;
    emergencyAlerts: boolean;
    safetyZoneAlerts: boolean;
    serviceUpdates: boolean;
  };
  permissions: {
    location: boolean;
    camera: boolean;
    evidenceStorage: boolean;
    analytics: boolean;
  };
  privacy: {
    shareProfileWithOfficers: boolean;
    hidePhoneFromPublicView: boolean;
    allowEvidenceReview: boolean;
  };
  suggestion: string;
}

const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "" : "http://127.0.0.1:8787");

export async function getSettings() {
  return requestJson<{ settings: UserSettings }>("/api/me/settings");
}

export async function updateSettings(settings: UserSettings) {
  return requestJson<{ settings: UserSettings }>("/api/me/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings }),
  });
}

export async function deleteAccount() {
  return requestJson<{ ok: true }>("/api/me", {
    method: "DELETE",
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
