import crypto from "node:crypto";

export const wardForecasts = [
  { wardId: "W01", wardName: "Shivajinagar", currentAQI: 154, forecast7day: [158, 164, 171, 166, 160, 153, 148], trend: "stable" },
  { wardId: "W02", wardName: "Kothrud", currentAQI: 132, forecast7day: [128, 125, 121, 118, 116, 113, 111], trend: "improving" },
  { wardId: "W03", wardName: "Hadapsar", currentAQI: 189, forecast7day: [198, 211, 224, 232, 226, 215, 207], trend: "critical" },
  { wardId: "W04", wardName: "Viman Nagar", currentAQI: 176, forecast7day: [182, 193, 205, 212, 208, 199, 190], trend: "worsening" },
  { wardId: "W05", wardName: "Yerawada", currentAQI: 168, forecast7day: [175, 181, 187, 191, 188, 180, 173], trend: "worsening" },
  { wardId: "W06", wardName: "Bibwewadi", currentAQI: 117, forecast7day: [115, 114, 112, 109, 106, 105, 103], trend: "improving" },
  { wardId: "W07", wardName: "Aundh", currentAQI: 104, forecast7day: [106, 108, 107, 105, 102, 101, 99], trend: "stable" },
  { wardId: "W08", wardName: "Kasba Peth", currentAQI: 161, forecast7day: [166, 174, 181, 184, 180, 172, 165], trend: "stable" },
];

const categoryKeywords = {
  air_quality: ["aqi", "air", "pollution", "smoke", "dust", "fumes", "factory", "burning", "breath", "cough", "construction"],
  garbage: ["garbage", "trash", "waste", "bin", "dump", "overflow", "stench", "dry leaves"],
  water_supply: ["water", "tanker", "pipeline", "pipe", "leak", "sewage", "drain", "contamination", "pressure"],
  noise: ["noise", "loudspeaker", "midnight", "honking", "horn", "sleep", "patients"],
  road_damage: ["pothole", "road", "crater", "surface", "flyover", "skid", "manhole", "signal", "ramp"],
  encroachment: ["encroachment", "footpath", "vendors", "hawker", "illegal parking", "blocked", "occupied", "shed"],
  tree_safety: ["tree", "branch", "trunk", "pruning", "fallen", "storm", "wire", "playground"],
  other: [],
};

const departmentByCategory = {
  air_quality: "PMC Environment Cell",
  garbage: "Solid Waste Management Department",
  water_supply: "Water Supply and Drainage Department",
  noise: "Ward Nuisance Control Cell",
  road_damage: "Road Maintenance Department",
  encroachment: "Anti-Encroachment Ward Squad",
  tree_safety: "Garden and Tree Authority",
  other: "Ward Office Civic Desk",
};

const slaHoursBySeverity = {
  critical: 4,
  high: 24,
  medium: 72,
  low: 168,
};

export function classifyText(text) {
  const normalized = text.toLowerCase();
  const scores = Object.entries(categoryKeywords)
    .map(([category, keywords]) => ({
      category,
      score: keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? 1 : 0), 0),
    }))
    .sort((a, b) => b.score - a.score);

  const category = scores[0].score > 0 ? scores[0].category : "other";
  const severity = pickSeverity(normalized, category);
  const confidence = Math.min(0.96, Math.max(0.68, 0.7 + scores[0].score * 0.05));
  return { category, severity, confidence: Number(confidence.toFixed(2)) };
}

export function routeGrievance(category, wardId) {
  return `${departmentByCategory[category] ?? departmentByCategory.other}, Ward ${wardId}`;
}

export function getSlaHours(severity) {
  return slaHoursBySeverity[severity] ?? 72;
}

export function getSlaDeadline(timestamp, severity) {
  const deadline = new Date(timestamp);
  deadline.setHours(deadline.getHours() + getSlaHours(severity));
  return deadline.toISOString();
}

export function draftNotice(grievance, assignedTo) {
  const sla = getSlaHours(grievance.severity);
  return `Please treat this ${grievance.severity} priority complaint as time-sensitive for your ward response team. A citizen has reported: "${grievance.text}". Kindly inspect the location, record the action taken, and resolve or update the case within ${sla} hours. If field constraints prevent closure, escalate with reasons and a revised action plan.`;
}

export function makeAction(input, timestamp = new Date().toISOString()) {
  return {
    id: crypto.randomUUID(),
    timestamp,
    ...input,
  };
}

export function buildIntervention(forecast) {
  const earlyWindow = forecast.forecast7day.slice(0, 3);
  const triggerAQI = Math.max(...earlyWindow);
  const triggerDay = earlyWindow.findIndex((value) => value === triggerAQI) + 1;

  if (triggerAQI <= 200 && forecast.trend !== "critical") {
    return undefined;
  }

  return {
    id: crypto.randomUUID(),
    wardId: forecast.wardId,
    wardName: forecast.wardName,
    triggerAQI,
    triggerDay,
    proposedActions: [
      `Deploy mobile dust-control and water-sprinkling units in ${forecast.wardName}.`,
      "Issue a ward advisory for schools, clinics, and outdoor workers.",
      triggerAQI >= 220
        ? "Temporarily restrict high-dust construction and inspect uncovered material storage."
        : "Increase traffic smoothing near congestion points and check open burning reports.",
    ],
    status: "proposed",
    createdAt: new Date().toISOString(),
  };
}

function pickSeverity(text, category) {
  if (/(ambulance|live wires|danger|emergency|collapse|fire|contamination|open manhole|cannot breathe)/.test(text)) {
    return "critical";
  }

  if (/(children|school|elderly|hospital|two weeks|week|urgent|overflowing|midnight|skids|patients)/.test(text)) {
    return "high";
  }

  if (/(three days|repeated|continued|leaking|blocked|clogged|rising|irritation)/.test(text)) {
    return "medium";
  }

  if (category === "air_quality" && /(smoke|dust)/.test(text)) {
    return "high";
  }

  return "low";
}
