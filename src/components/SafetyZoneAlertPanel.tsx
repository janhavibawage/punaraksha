import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellRing, LocateFixed, MapPin, ShieldAlert, TestTube2, type LucideIcon } from "lucide-react";
import { buildSafetyAlert } from "../agents/safetyAlertAgent";
import { safetyZones, type SafetyZone } from "../data/safetyZones";
import { useAuthStore } from "../store/useAuthStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { distanceMeters, type Coordinates } from "../utils/geo";

interface ZoneMatch {
  zone: SafetyZone;
  distance: number;
  inside: boolean;
}

export function SafetyZoneAlertPanel() {
  const user = useAuthStore((state) => state.user);
  const settings = useSettingsStore((state) => state.settings);
  const updateNotifications = useSettingsStore((state) => state.updateNotifications);
  const updatePermissions = useSettingsStore((state) => state.updatePermissions);
  const [status, setStatus] = useState("Location monitoring is off");
  const [position, setPosition] = useState<Coordinates>();
  const [nearest, setNearest] = useState<ZoneMatch>();
  const [isWatching, setIsWatching] = useState(false);
  const watchId = useRef<number | undefined>(undefined);
  const lastAlertZone = useRef("");

  const redZoneCount = useMemo(() => safetyZones.filter((zone) => zone.level === "red").length, []);
  const currentAlert = nearest ? buildSafetyAlert(nearest.zone, nearest.distance) : "No location checked yet.";
  const alertEnabled = settings.notifications.safetyZoneAlerts && settings.permissions.location;

  useEffect(() => {
    return () => {
      if (watchId.current !== undefined) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  if (user?.role !== "citizen") {
    return null;
  }

  async function startMonitoring() {
    if (!("geolocation" in navigator)) {
      setStatus("Location is not supported on this browser");
      return;
    }

    updatePermissions("location", true);
    updateNotifications("safetyZoneAlerts", true);
    await requestNotificationPermission();

    const id = navigator.geolocation.watchPosition(
      (result) => {
        const nextPosition = {
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        };
        const match = findNearestZone(nextPosition);

        setPosition(nextPosition);
        setNearest(match);
        setIsWatching(true);
        setStatus(match.inside ? `${match.zone.level.toUpperCase()} zone detected` : "Monitoring active");

        if (match.inside && match.zone.level === "red" && lastAlertZone.current !== match.zone.id) {
          lastAlertZone.current = match.zone.id;
          sendSafetyNotification(match.zone, match.distance);
        }
      },
      () => {
        setStatus("Location permission was not allowed");
        setIsWatching(false);
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 12000 },
    );

    watchId.current = id;
    setStatus("Monitoring active");
    setIsWatching(true);
  }

  function stopMonitoring() {
    if (watchId.current !== undefined) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = undefined;
    }

    setIsWatching(false);
    setStatus("Location monitoring is off");
  }

  async function testRedZoneAlert() {
    updateNotifications("safetyZoneAlerts", true);
    await requestNotificationPermission();
    const zone = safetyZones[0];
    const match = { zone, distance: 25, inside: true };
    setPosition(zone.center);
    setNearest(match);
    setStatus("Demo red zone detected");
    sendSafetyNotification(zone, 25);
  }

  return (
    <section className="rounded-lg border border-rose-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            Safety Zone Alerts
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Location-based public safety warning</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Opt-in monitoring uses real browser GPS location, checks nearby Pune safety zones, and sends a warning when a citizen enters a high-risk red zone.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={isWatching ? stopMonitoring : startMonitoring}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-civic px-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            <LocateFixed className="h-4 w-4" aria-hidden="true" />
            {isWatching ? "Stop alerts" : "Start alerts"}
          </button>
          <button
            type="button"
            onClick={testRedZoneAlert}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            <TestTube2 className="h-4 w-4" aria-hidden="true" />
            Test alert
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-900">
        To turn on location: sign in as a citizen, click <span className="font-semibold">Start alerts</span>, then choose{" "}
        <span className="font-semibold">Allow</span> when the browser asks for GPS/location permission.
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <StatusCard icon={BellRing} label="Alert state" value={alertEnabled ? "Enabled" : "Off"} />
        <StatusCard icon={MapPin} label="Pune zones" value={`${safetyZones.length} mapped`} />
        <StatusCard icon={ShieldAlert} label="Red zones" value={String(redZoneCount)} />
        <StatusCard icon={Bell} label="Live status" value={status} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-950">Current Location Risk</h3>
          <div className="mt-4 space-y-3 text-sm">
            <InfoRow label="Nearest zone" value={nearest?.zone.name ?? "Not checked"} />
            <InfoRow label="Distance" value={nearest ? `${Math.round(nearest.distance)} meters` : "Waiting for location"} />
            <InfoRow label="Risk level" value={nearest?.zone.level.toUpperCase() ?? "Unknown"} />
            <InfoRow label="Position" value={position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : "Permission required"} />
          </div>
        </div>

        <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
          <h3 className="text-sm font-semibold text-rose-800">Customized Warning Message</h3>
          <p className="mt-3 text-sm leading-6 text-rose-900">{currentAlert}</p>
          {nearest ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {nearest.zone.advice.map((item) => (
                <span key={item} className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function findNearestZone(position: Coordinates): ZoneMatch {
  return safetyZones
    .map((zone) => {
      const distance = distanceMeters(position, zone.center);
      return {
        zone,
        distance,
        inside: distance <= zone.radiusMeters,
      };
    })
    .sort((a, b) => a.distance - b.distance)[0];
}

async function requestNotificationPermission() {
  if (!("Notification" in window) || Notification.permission === "granted") {
    return;
  }

  if (Notification.permission !== "denied") {
    await Notification.requestPermission();
  }
}

function sendSafetyNotification(zone: SafetyZone, distance: number) {
  const body = buildSafetyAlert(zone, distance);

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("PunaRaksha Safety Alert", {
      body,
      tag: `punaraksha-${zone.id}`,
    });
  }
}

function StatusCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-civic" aria-hidden="true" />
      <p className="mt-3 text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}
