export type SafetyZoneLevel = "green" | "amber" | "red";

export interface SafetyZone {
  id: string;
  name: string;
  ward: string;
  center: {
    lat: number;
    lng: number;
  };
  radiusMeters: number;
  level: SafetyZoneLevel;
  riskScore: number;
  signals: string[];
  advice: string[];
}

export const safetyZones: SafetyZone[] = [
  {
    id: "swargate-transit",
    name: "Swargate Transit Watch",
    ward: "Kasba-Vishrambaug",
    center: { lat: 18.5018, lng: 73.8636 },
    radiusMeters: 850,
    level: "red",
    riskScore: 91,
    signals: ["late evening crowd pressure", "reported harassment pattern", "transit theft complaints"],
    advice: ["stay on main roads", "keep valuables secure", "share live route with a trusted contact"],
  },
  {
    id: "shivajinagar-station",
    name: "Shivajinagar Station Watch",
    ward: "Shivajinagar",
    center: { lat: 18.5314, lng: 73.8499 },
    radiusMeters: 750,
    level: "red",
    riskScore: 88,
    signals: ["station crowding", "isolated lanes after dark", "snatching complaint cluster"],
    advice: ["avoid isolated lanes", "use well-lit exits", "keep emergency contact ready"],
  },
  {
    id: "pune-station",
    name: "Pune Station Watch",
    ward: "Dhole Patil",
    center: { lat: 18.5289, lng: 73.8744 },
    radiusMeters: 900,
    level: "red",
    riskScore: 86,
    signals: ["high footfall", "night travel risk", "lost item complaint cluster"],
    advice: ["stay near public movement", "avoid displaying phone or cash", "prefer verified transport"],
  },
  {
    id: "hadapsar-market",
    name: "Hadapsar Market Watch",
    ward: "Hadapsar-Mundhwa",
    center: { lat: 18.5089, lng: 73.9259 },
    radiusMeters: 800,
    level: "amber",
    riskScore: 72,
    signals: ["market crowding", "traffic conflict", "evening complaint spike"],
    advice: ["stay alert at junctions", "keep bags closed", "avoid stopping in low-light pockets"],
  },
  {
    id: "katraj-bus-zone",
    name: "Katraj Bus Zone Watch",
    ward: "Dhankawadi-Sahakarnagar",
    center: { lat: 18.4529, lng: 73.8652 },
    radiusMeters: 850,
    level: "amber",
    riskScore: 70,
    signals: ["bus terminal crowding", "late-night waiting risk", "traffic safety pressure"],
    advice: ["wait near official counters", "use lit routes", "confirm vehicle details before boarding"],
  },
];
