import type { WardForecast, WardProfile } from "../agents/types";

export const wards: WardProfile[] = [
  {
    wardId: "W01",
    wardName: "Shivajinagar",
    population: 162000,
    openComplaints: 34,
    responseScore: 88,
    safetyRisk: 62,
  },
  {
    wardId: "W02",
    wardName: "Kothrud",
    population: 214000,
    openComplaints: 41,
    responseScore: 83,
    safetyRisk: 55,
  },
  {
    wardId: "W03",
    wardName: "Hadapsar",
    population: 284000,
    openComplaints: 68,
    responseScore: 72,
    safetyRisk: 81,
  },
  {
    wardId: "W04",
    wardName: "Viman Nagar",
    population: 138000,
    openComplaints: 39,
    responseScore: 79,
    safetyRisk: 74,
  },
  {
    wardId: "W05",
    wardName: "Yerawada",
    population: 238000,
    openComplaints: 57,
    responseScore: 76,
    safetyRisk: 69,
  },
  {
    wardId: "W06",
    wardName: "Bibwewadi",
    population: 181000,
    openComplaints: 29,
    responseScore: 86,
    safetyRisk: 48,
  },
  {
    wardId: "W07",
    wardName: "Aundh",
    population: 151000,
    openComplaints: 24,
    responseScore: 91,
    safetyRisk: 42,
  },
  {
    wardId: "W08",
    wardName: "Kasba Peth",
    population: 116000,
    openComplaints: 45,
    responseScore: 77,
    safetyRisk: 66,
  },
];

export const wardForecasts: WardForecast[] = [
  {
    wardId: "W01",
    wardName: "Shivajinagar",
    currentAQI: 154,
    forecast7day: [158, 164, 171, 166, 160, 153, 148],
    trend: "stable",
  },
  {
    wardId: "W02",
    wardName: "Kothrud",
    currentAQI: 132,
    forecast7day: [128, 125, 121, 118, 116, 113, 111],
    trend: "improving",
  },
  {
    wardId: "W03",
    wardName: "Hadapsar",
    currentAQI: 189,
    forecast7day: [198, 211, 224, 232, 226, 215, 207],
    trend: "critical",
  },
  {
    wardId: "W04",
    wardName: "Viman Nagar",
    currentAQI: 176,
    forecast7day: [182, 193, 205, 212, 208, 199, 190],
    trend: "worsening",
  },
  {
    wardId: "W05",
    wardName: "Yerawada",
    currentAQI: 168,
    forecast7day: [175, 181, 187, 191, 188, 180, 173],
    trend: "worsening",
  },
  {
    wardId: "W06",
    wardName: "Bibwewadi",
    currentAQI: 117,
    forecast7day: [115, 114, 112, 109, 106, 105, 103],
    trend: "improving",
  },
  {
    wardId: "W07",
    wardName: "Aundh",
    currentAQI: 104,
    forecast7day: [106, 108, 107, 105, 102, 101, 99],
    trend: "stable",
  },
  {
    wardId: "W08",
    wardName: "Kasba Peth",
    currentAQI: 161,
    forecast7day: [166, 174, 181, 184, 180, 172, 165],
    trend: "stable",
  },
];

export const historicalAQI = [
  {
    wardId: "W01",
    days: [142, 146, 149, 151, 153, 155, 157, 160, 158, 161, 164, 166, 168, 165, 162, 160, 158, 156, 154, 151, 149],
  },
  {
    wardId: "W02",
    days: [151, 148, 146, 144, 141, 139, 137, 134, 132, 130, 128, 126, 124, 122, 121, 119, 118, 116, 115, 113, 112],
  },
  {
    wardId: "W03",
    days: [166, 171, 175, 179, 183, 187, 190, 194, 199, 204, 209, 215, 221, 228, 233, 230, 226, 221, 216, 211, 207],
  },
  {
    wardId: "W04",
    days: [149, 153, 158, 162, 166, 170, 174, 178, 184, 191, 199, 205, 211, 214, 210, 206, 202, 198, 194, 190, 187],
  },
  {
    wardId: "W05",
    days: [151, 154, 158, 160, 164, 168, 171, 174, 178, 183, 188, 190, 192, 191, 188, 185, 181, 178, 175, 171, 168],
  },
  {
    wardId: "W06",
    days: [132, 131, 129, 128, 126, 124, 123, 121, 119, 118, 116, 115, 113, 111, 110, 108, 107, 106, 105, 104, 102],
  },
  {
    wardId: "W07",
    days: [112, 114, 113, 112, 111, 109, 108, 106, 105, 104, 103, 105, 106, 107, 106, 105, 104, 103, 102, 101, 100],
  },
  {
    wardId: "W08",
    days: [145, 148, 151, 154, 157, 160, 163, 165, 168, 172, 176, 181, 184, 186, 183, 180, 176, 172, 168, 165, 162],
  },
];

export const sampleComplaints = [
  {
    text: "Garbage has not been collected near the school for two weeks and children are playing next to overflowing bins.",
    wardId: "W03",
  },
  {
    text: "Black smoke from a small factory is making it difficult for elderly residents to breathe in the evening.",
    wardId: "W05",
  },
  {
    text: "A large pothole near the BRT stop is causing two-wheeler skids every morning.",
    wardId: "W01",
  },
  {
    text: "Water supply has stopped for three days in our lane and the tanker did not arrive.",
    wardId: "W02",
  },
  {
    text: "A tree branch is hanging over live wires after last night's rain and may fall on the footpath.",
    wardId: "W07",
  },
  {
    text: "Construction dust is covering the road and there is no water sprinkling near the metro work.",
    wardId: "W04",
  },
  {
    text: "Loudspeakers continue past midnight near the chowk and patients in the clinic cannot sleep.",
    wardId: "W08",
  },
  {
    text: "Street vendors have blocked the entire footpath and school children have to walk on the road.",
    wardId: "W06",
  },
  {
    text: "Sewage water is leaking into the drinking water line and residents smell contamination.",
    wardId: "W03",
  },
  {
    text: "Illegal parking and shop displays are blocking an ambulance route near the market.",
    wardId: "W08",
  },
  {
    text: "Burning waste behind the apartment is creating smoke every night.",
    wardId: "W04",
  },
  {
    text: "The storm drain is clogged and water is rising near the bus depot after rain.",
    wardId: "W05",
  },
  {
    text: "A cracked tree trunk near the playground looks dangerous after strong wind.",
    wardId: "W02",
  },
  {
    text: "Repeated honking from private buses is disturbing the hospital zone.",
    wardId: "W01",
  },
  {
    text: "The road surface has broken near the flyover ramp and traffic is swerving suddenly.",
    wardId: "W04",
  },
  {
    text: "Dry leaves and mixed waste are piling up near the public garden gate.",
    wardId: "W07",
  },
  {
    text: "Dust from uncovered construction material is triggering cough and eye irritation.",
    wardId: "W03",
  },
  {
    text: "A footpath has been occupied by a temporary shed outside the bus stand.",
    wardId: "W05",
  },
  {
    text: "Low water pressure has continued for a week in the apartment block.",
    wardId: "W06",
  },
  {
    text: "Open manhole cover is a danger for pedestrians near the traffic signal.",
    wardId: "W08",
  },
];
