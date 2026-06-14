export type GrievanceCategory =
  | "air_quality"
  | "garbage"
  | "water_supply"
  | "noise"
  | "road_damage"
  | "encroachment"
  | "tree_safety"
  | "other";

export type Severity = "low" | "medium" | "high" | "critical";

export type GrievanceStatus =
  | "new"
  | "triaged"
  | "notified"
  | "escalated"
  | "resolved";

export interface Grievance {
  id: string;
  userId?: string;
  text: string;
  wardId: string;
  timestamp: string;
  evidence?: EvidenceAnalysis;
  category?: GrievanceCategory;
  severity?: Severity;
  confidence?: number;
  assignedTo?: string;
  status: GrievanceStatus;
  slaDeadline?: string;
  noticeDraft?: string;
}

export interface AgentAction {
  id: string;
  timestamp: string;
  agent: "grievance" | "intervention";
  grievanceId?: string;
  wardId?: string;
  actionType:
    | "classified"
    | "routed"
    | "notice_drafted"
    | "sla_set"
    | "escalated"
    | "intervention_proposed"
    | "officer_notified"
    | "evidence_checked";
  detail: string;
  payload?: Record<string, unknown>;
}

export interface WardForecast {
  wardId: string;
  wardName: string;
  currentAQI: number;
  forecast7day: number[];
  trend: "improving" | "stable" | "worsening" | "critical";
}

export interface WardProfile {
  wardId: string;
  wardName: string;
  population: number;
  openComplaints: number;
  responseScore: number;
  safetyRisk: number;
}

export interface Intervention {
  id: string;
  wardId: string;
  wardName: string;
  triggerAQI: number;
  triggerDay: number;
  proposedActions: string[];
  status: "proposed" | "notified";
  createdAt: string;
}

export interface ClassificationResult {
  category: GrievanceCategory;
  severity: Severity;
  confidence: number;
}

export type EvidenceVerdict = "likely_original" | "needs_review" | "suspicious";

export interface EvidenceSignal {
  label: string;
  detail: string;
  severity: "good" | "info" | "warn" | "bad";
}

export interface EvidenceAnalysis {
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl: string;
  storedUrl?: string;
  storedFileName?: string;
  checkedAt: string;
  fileLastModified?: string;
  imageWidth?: number;
  imageHeight?: number;
  exifFound: boolean;
  mimeMatchesExtension: boolean;
  capturedAt?: string;
  modifiedAt?: string;
  cameraMake?: string;
  cameraModel?: string;
  software?: string;
  orientation?: number;
  gpsPresent: boolean;
  authenticityScore: number;
  verdict: EvidenceVerdict;
  signals: EvidenceSignal[];
}
