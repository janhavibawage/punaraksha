import type { SafetyZone } from "../data/safetyZones";

export function buildSafetyAlert(zone: SafetyZone, distanceMeters: number) {
  const timeBand = getTimeBand();
  const distanceLabel = distanceMeters < 100 ? "inside this zone" : `${Math.round(distanceMeters)} m from this zone`;
  const topSignal = zone.signals[0] ?? "local safety pressure";
  const advice = zone.advice.slice(0, 2).join(" and ");

  if (zone.level === "red") {
    return `Safety alert: You are ${distanceLabel} near ${zone.name}. Current risk is high due to ${topSignal}, especially ${timeBand}. Please ${advice}.`;
  }

  return `Safety watch: You are ${distanceLabel} near ${zone.name}. Stay aware of ${topSignal} and ${advice}.`;
}

function getTimeBand() {
  const hour = new Date().getHours();

  if (hour >= 21 || hour < 5) {
    return "late night";
  }

  if (hour >= 18) {
    return "this evening";
  }

  if (hour < 10) {
    return "this morning";
  }

  return "right now";
}
