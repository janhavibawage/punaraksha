import type { ClassificationResult, GrievanceCategory, Severity } from "./types";

const categoryKeywords: Record<GrievanceCategory, string[]> = {
  air_quality: [
    "aqi",
    "air",
    "pollution",
    "smoke",
    "dust",
    "fumes",
    "factory",
    "burning",
    "breath",
    "cough",
    "metro",
    "construction dust",
  ],
  garbage: [
    "garbage",
    "trash",
    "waste",
    "bin",
    "dump",
    "overflow",
    "stench",
    "segregation",
    "dry leaves",
    "mixed waste",
  ],
  water_supply: [
    "water",
    "tanker",
    "pipeline",
    "pipe",
    "leak",
    "sewage",
    "drain",
    "contamination",
    "pressure",
    "storm drain",
  ],
  noise: ["noise", "loudspeaker", "midnight", "honking", "horn", "sleep", "patients"],
  road_damage: [
    "pothole",
    "road",
    "crater",
    "surface",
    "flyover",
    "skid",
    "manhole",
    "traffic signal",
    "ramp",
  ],
  encroachment: [
    "encroachment",
    "footpath",
    "vendors",
    "hawker",
    "illegal parking",
    "blocked",
    "occupied",
    "shed",
    "shop displays",
  ],
  tree_safety: ["tree", "branch", "trunk", "pruning", "fallen", "storm", "wire", "playground"],
  other: [],
};

const severityKeywords: Record<Severity, string[]> = {
  critical: [
    "ambulance",
    "live wires",
    "danger",
    "emergency",
    "collapse",
    "fire",
    "contamination",
    "open manhole",
    "cannot breathe",
  ],
  high: [
    "children",
    "school",
    "elderly",
    "hospital",
    "two weeks",
    "week",
    "urgent",
    "overflowing",
    "midnight",
    "skids",
    "patients",
  ],
  medium: ["three days", "repeated", "continued", "leaking", "blocked", "clogged", "rising", "irritation"],
  low: ["minor", "small", "request", "please"],
};

const categoryLabels: Record<GrievanceCategory, string> = {
  air_quality: "air quality",
  garbage: "garbage",
  water_supply: "water supply",
  noise: "noise",
  road_damage: "road damage",
  encroachment: "encroachment",
  tree_safety: "tree safety",
  other: "other civic issue",
};

export async function llmCall(prompt: string): Promise<string> {
  if (import.meta.env.VITE_USE_REAL_LLM === "true") {
    // A real model call can be swapped in here through a small server proxy.
    // The demo intentionally stays deterministic and offline-safe.
  }

  await wait(260 + (hashText(prompt) % 240));
  return simulateLLM(prompt);
}

export function simulateLLM(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes("classify this civic complaint")) {
    return JSON.stringify(classifyText(extractComplaint(prompt)));
  }

  if (lowerPrompt.includes("write a short formal notice")) {
    return makeNotice(prompt);
  }

  if (lowerPrompt.includes("propose 2-3 immediate civic actions")) {
    return makeIntervention(prompt);
  }

  return "Unable to simulate this request.";
}

export function classifyText(text: string): ClassificationResult {
  const normalized = text.toLowerCase();
  const scores = Object.entries(categoryKeywords).map(([category, keywords]) => {
    const score = keywords.reduce((total, keyword) => {
      return total + (normalized.includes(keyword) ? keyword.length > 8 ? 2 : 1 : 0);
    }, 0);
    return { category: category as GrievanceCategory, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const top = scores[0];
  const second = scores[1];
  const category = top.score > 0 ? top.category : "other";

  const severity = pickSeverity(normalized, category);
  const margin = Math.max(0, top.score - second.score);
  const confidence = clamp(0.64 + top.score * 0.045 + margin * 0.025 + (hashText(text) % 9) / 100, 0.67, 0.96);

  return {
    category,
    severity,
    confidence: Number(confidence.toFixed(2)),
  };
}

function pickSeverity(text: string, category: GrievanceCategory): Severity {
  for (const severity of ["critical", "high", "medium"] as Severity[]) {
    if (severityKeywords[severity].some((keyword) => text.includes(keyword))) {
      return severity;
    }
  }

  if (category === "tree_safety" && (text.includes("wire") || text.includes("fall"))) {
    return "high";
  }

  if (category === "air_quality" && (text.includes("smoke") || text.includes("dust"))) {
    return "high";
  }

  if (category === "water_supply" && (text.includes("sewage") || text.includes("leak"))) {
    return "medium";
  }

  return "low";
}

function makeNotice(prompt: string): string {
  const department = matchValue(prompt, /to (.*?) about this complaint/i) ?? "the responsible civic department";
  const complaint = extractComplaint(prompt);
  const severity = matchValue(prompt, /Severity:\s*(\w+)/i) ?? "medium";
  const sla = matchValue(prompt, /within (\d+) hours/i) ?? "72";
  const category = categoryLabels[classifyText(complaint).category];

  return `Please treat this ${severity} priority ${category} complaint as time-sensitive for your ward response team. A citizen has reported: "${complaint}". Kindly inspect the location, record the action taken, and resolve or update the case within ${sla} hours. If field constraints prevent closure, escalate with reasons and a revised action plan.`;
}

function makeIntervention(prompt: string): string {
  const ward = matchValue(prompt, /Ward (.*?) AQI forecast/i) ?? "this ward";
  const value = Number(matchValue(prompt, /shows (\d+)/i) ?? 200);
  const strong = value >= 220;

  const actions = [
    `Deploy mobile dust-control and water-sprinkling units in ${ward} before the projected spike.`,
    `Issue a ward advisory for schools, clinics, and outdoor workers with timing tied to peak AQI hours.`,
    strong
      ? "Temporarily restrict high-dust construction and inspect uncovered material storage."
      : "Increase traffic smoothing near congestion points and check open burning reports.",
  ];

  return actions.map((action) => `- ${action}`).join("\n");
}

function extractComplaint(prompt: string): string {
  return (
    matchValue(prompt, /Complaint:\s*'([^']+)'/i) ??
    matchValue(prompt, /Complaint:\s*"([^"]+)"/i) ??
    prompt
  ).trim();
}

function matchValue(text: string, regex: RegExp): string | undefined {
  return regex.exec(text)?.[1]?.trim();
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hashText(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}
