import { llmCall } from "./llmClient";
import type { AgentAction, ClassificationResult, Grievance, GrievanceCategory, Severity } from "./types";

const slaHoursBySeverity: Record<Severity, number> = {
  critical: 4,
  high: 24,
  medium: 72,
  low: 168,
};

const departmentByCategory: Record<GrievanceCategory, string> = {
  air_quality: "PMC Environment Cell",
  garbage: "Solid Waste Management Department",
  water_supply: "Water Supply and Drainage Department",
  noise: "Ward Nuisance Control Cell",
  road_damage: "Road Maintenance Department",
  encroachment: "Anti-Encroachment Ward Squad",
  tree_safety: "Garden and Tree Authority",
  other: "Ward Office Civic Desk",
};

export async function classifyGrievance(grievance: Pick<Grievance, "text">): Promise<ClassificationResult> {
  const prompt = `Classify this civic complaint into category {enum} and severity {enum}. Complaint: '${grievance.text}'. Respond as JSON: {category, severity, confidence}.`;
  const response = await llmCall(prompt);
  return JSON.parse(response) as ClassificationResult;
}

export function routeGrievance(category: GrievanceCategory, wardId: string): string {
  return `${departmentByCategory[category]}, Ward ${wardId}`;
}

export async function draftNotice(grievance: Grievance, department: string, slaHours: number): Promise<string> {
  const prompt = `Write a short formal notice (3-4 sentences) to ${department} about this complaint, requesting action within ${slaHours} hours. Complaint: '${grievance.text}'. Severity: ${grievance.severity}.`;
  return llmCall(prompt);
}

export function getSlaHours(severity: Severity): number {
  return slaHoursBySeverity[severity];
}

export function getSlaDeadline(now: Date, severity: Severity): string {
  const deadline = new Date(now);
  deadline.setHours(deadline.getHours() + getSlaHours(severity));
  return deadline.toISOString();
}

export function makeAction(input: Omit<AgentAction, "id" | "timestamp">, timestamp: string): AgentAction {
  return {
    ...input,
    id: crypto.randomUUID(),
    timestamp,
  };
}

export function departmentForCategory(category: GrievanceCategory) {
  return departmentByCategory[category];
}
