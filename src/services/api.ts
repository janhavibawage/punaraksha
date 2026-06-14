import type { EvidenceAnalysis, Grievance, AgentAction, Intervention } from "../agents/types";

export interface BackendState {
  grievances: Grievance[];
  actions: AgentAction[];
  interventions: Intervention[];
}

const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? "" : "http://127.0.0.1:8787");

export async function fetchBackendState(): Promise<BackendState> {
  return requestJson("/api/state");
}

export async function createBackendGrievance(input: {
  text: string;
  wardId: string;
  evidence?: EvidenceAnalysis;
  evidenceFile?: File;
}): Promise<BackendState> {
  const form = new FormData();
  form.append("text", input.text);
  form.append("wardId", input.wardId);

  if (input.evidence) {
    form.append("evidence", JSON.stringify(input.evidence));
  }

  if (input.evidenceFile) {
    form.append("evidenceFile", input.evidenceFile);
  }

  return requestJson("/api/grievances", {
    method: "POST",
    body: form,
  });
}

export async function updateBackendGrievanceStatus(id: string, status: string): Promise<BackendState> {
  return requestJson(`/api/grievances/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function scanBackendInterventions(): Promise<BackendState> {
  return requestJson("/api/interventions/scan", { method: "POST" });
}

export async function notifyBackendIntervention(id: string): Promise<BackendState> {
  return requestJson(`/api/interventions/${id}/notify`, { method: "POST" });
}

export async function resetBackendDemo(): Promise<BackendState> {
  return requestJson("/api/demo/reset", { method: "DELETE" });
}

function absolutizeUploads(value: BackendState): BackendState {
  if (!value || typeof value !== "object") {
    return value;
  }

  return {
    ...value,
    grievances: value.grievances.map((grievance) => {
      const storedUrl = grievance.evidence?.storedUrl;
      return {
        ...grievance,
        evidence: grievance.evidence
          ? {
              ...grievance.evidence,
              previewUrl: storedUrl?.startsWith("/api/files") ? `${API_URL}${storedUrl}` : grievance.evidence.previewUrl,
            }
          : undefined,
      };
    }),
  };
}

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return absolutizeUploads(await response.json());
}
