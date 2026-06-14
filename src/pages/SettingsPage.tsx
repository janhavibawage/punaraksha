import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Camera,
  CheckCircle2,
  Globe2,
  HelpCircle,
  KeyRound,
  Languages,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  Phone,
  Save,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { deleteAccount, type AppearanceMode, type LanguageCode } from "../services/settingsApi";
import { useAuthStore } from "../store/useAuthStore";
import { useSettingsStore } from "../store/useSettingsStore";

const languageOptions: Array<{
  code: LanguageCode;
  name: string;
  nativeName: string;
  complaint: string;
  track: string;
  safety: string;
}> = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    complaint: "File complaint",
    track: "Track status",
    safety: "Safety and privacy",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    complaint: "तक्रार नोंदवा",
    track: "स्थिती तपासा",
    safety: "सुरक्षा आणि गोपनीयता",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    complaint: "शिकायत दर्ज करें",
    track: "स्थिति देखें",
    safety: "सुरक्षा और गोपनीयता",
  },
];

const appearanceOptions: Array<{ value: AppearanceMode; label: string; icon: LucideIcon }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Smartphone },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const settings = useSettingsStore((state) => state.settings);
  const isSaving = useSettingsStore((state) => state.isSaving);
  const error = useSettingsStore((state) => state.error);
  const applyAppearance = useSettingsStore((state) => state.applyAppearance);
  const updateLocal = useSettingsStore((state) => state.updateLocal);
  const updateNotifications = useSettingsStore((state) => state.updateNotifications);
  const updatePermissions = useSettingsStore((state) => state.updatePermissions);
  const updatePrivacy = useSettingsStore((state) => state.updatePrivacy);
  const loadRemote = useSettingsStore((state) => state.loadRemote);
  const saveRemote = useSettingsStore((state) => state.saveRemote);
  const [notice, setNotice] = useState("");
  const [deleteArmed, setDeleteArmed] = useState(false);
  const isCitizen = user?.role === "citizen";

  useEffect(() => {
    applyAppearance();
    if (user) {
      void loadRemote();
    }
  }, [applyAppearance, loadRemote, user]);

  const selectedLanguage = languageOptions.find((item) => item.code === settings.language) ?? languageOptions[0];

  async function handleSave() {
    if (!user) {
      setNotice("Saved on this browser. Sign in to sync account settings.");
      return;
    }

    await saveRemote();
    setNotice("Settings saved to your account.");
  }

  async function handleDeleteAccount() {
    if (!user) {
      navigate("/signup");
      return;
    }

    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }

    await deleteAccount();
    signOut();
    navigate("/signup");
  }

  return (
    <main className="bg-[#f5f7f4]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-md bg-teal-50 px-3 py-1 text-sm font-semibold text-civic ring-1 ring-teal-100">
                <Globe2 className="h-4 w-4" aria-hidden="true" />
                Multilingual civic service
              </span>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-950">Settings and account controls</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Manage language, appearance, sign-in safety, alerts, permissions, privacy, help, and suggestions from one official account area.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-civic px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {isSaving ? "Saving" : "Save settings"}
            </button>
          </div>

          {(notice || error) && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {error ?? notice}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <SettingsPanel icon={Languages} title="Language" label="Multilingual">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Preferred language</span>
            <select
              value={settings.language}
              onChange={(event) => updateLocal({ language: event.target.value as LanguageCode })}
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800"
            >
              {languageOptions.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name} - {item.nativeName}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[selectedLanguage.complaint, selectedLanguage.track, selectedLanguage.safety].map((item) => (
              <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800">
                {item}
              </div>
            ))}
          </div>
        </SettingsPanel>

        <SettingsPanel icon={Sun} title="Appearance" label="Display">
          <div className="grid gap-3 sm:grid-cols-3">
            {appearanceOptions.map(({ value, label, icon: Icon }) => {
              const active = settings.appearance === value;
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => updateLocal({ appearance: value })}
                  className={[
                    "flex min-h-20 items-center gap-3 rounded-lg border px-4 text-left transition",
                    active ? "border-civic bg-teal-50 text-civic" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </SettingsPanel>

        <SettingsPanel icon={Phone} title="Mobile Number and 2FA" label="Sign-in safety">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Mobile number</span>
            <input
              type="tel"
              value={settings.mobileNumber}
              onChange={(event) => updateLocal({ mobileNumber: event.target.value })}
              placeholder="+91 98765 43210"
              className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800"
            />
          </label>
          <div className="mt-4">
            <Toggle
              icon={KeyRound}
              label="Mobile OTP two-factor authentication"
              description="Require a mobile OTP preference for account sign-in."
              checked={settings.twoFactorEnabled}
              onChange={(checked) => updateLocal({ twoFactorEnabled: checked })}
            />
          </div>
        </SettingsPanel>

        <SettingsPanel icon={Bell} title="Notifications" label="Alerts">
          <div className="grid gap-3">
            <Toggle icon={MessageSquare} label="SMS alerts" description="Complaint status and urgent civic alerts." checked={settings.notifications.sms} onChange={(checked) => updateNotifications("sms", checked)} />
            <Toggle icon={Mail} label="Email updates" description="Receipts, SLA changes, and officer responses." checked={settings.notifications.email} onChange={(checked) => updateNotifications("email", checked)} />
            <Toggle icon={Bell} label="App notifications" description="Live updates inside the PunaRaksha account." checked={settings.notifications.push} onChange={(checked) => updateNotifications("push", checked)} />
            <Toggle icon={ShieldCheck} label="Emergency advisories" description="AQI, safety, and ward-level public warnings." checked={settings.notifications.emergencyAlerts} onChange={(checked) => updateNotifications("emergencyAlerts", checked)} />
            {isCitizen ? (
              <Toggle icon={MapPin} label="Safety zone alerts" description="Warn me when my device enters a high-risk safety zone." checked={settings.notifications.safetyZoneAlerts} onChange={(checked) => updateNotifications("safetyZoneAlerts", checked)} />
            ) : null}
          </div>
        </SettingsPanel>

        <SettingsPanel icon={LockKeyhole} title="Safety and Privacy" label="Control">
          <div className="grid gap-3">
            <Toggle icon={ShieldCheck} label="Share profile with assigned officers" description="Name and complaint history visible to responsible teams." checked={settings.privacy.shareProfileWithOfficers} onChange={(checked) => updatePrivacy("shareProfileWithOfficers", checked)} />
            <Toggle icon={Phone} label="Hide phone from public view" description="Phone number remains private outside official workflows." checked={settings.privacy.hidePhoneFromPublicView} onChange={(checked) => updatePrivacy("hidePhoneFromPublicView", checked)} />
            <Toggle icon={Camera} label="Allow evidence review" description="Uploaded images can be checked for metadata and authenticity." checked={settings.privacy.allowEvidenceReview} onChange={(checked) => updatePrivacy("allowEvidenceReview", checked)} />
          </div>
        </SettingsPanel>

        <SettingsPanel icon={MapPin} title="Permissions" label="Access">
          <div className="grid gap-3">
            {isCitizen ? (
              <Toggle icon={MapPin} label="Location access" description="Attach ward and location context to complaints." checked={settings.permissions.location} onChange={(checked) => updatePermissions("location", checked)} />
            ) : null}
            <Toggle icon={Camera} label="Camera access" description="Capture complaint evidence from the device." checked={settings.permissions.camera} onChange={(checked) => updatePermissions("camera", checked)} />
            <Toggle icon={ShieldCheck} label="Evidence file storage" description="Store uploaded images with access control." checked={settings.permissions.evidenceStorage} onChange={(checked) => updatePermissions("evidenceStorage", checked)} />
            <Toggle icon={CheckCircle2} label="Service analytics" description="Improve response quality using anonymous usage signals." checked={settings.permissions.analytics} onChange={(checked) => updatePermissions("analytics", checked)} />
          </div>
        </SettingsPanel>

        <SettingsPanel icon={MessageSquare} title="Suggestions" label="Feedback">
          <textarea
            value={settings.suggestion}
            onChange={(event) => updateLocal({ suggestion: event.target.value })}
            rows={6}
            placeholder="Suggest a service, ward workflow, or citizen safety improvement..."
            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-800"
          />
        </SettingsPanel>

        <SettingsPanel icon={HelpCircle} title="Help Center" label="Support">
          <div className="grid gap-3 sm:grid-cols-2">
            <HelpItem title="Complaint support" text="Track complaint routing, SLA status, and officer response." />
            <HelpItem title="Evidence support" text="Understand image metadata, EXIF checks, and file access." />
            <HelpItem title="Account support" text="Manage sign-in, language, privacy, and notification controls." />
            <HelpItem title="Ward response" text="Review AQI alerts, ward risk, and public safety actions." />
          </div>
        </SettingsPanel>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-rose-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-rose-700">
                <Trash2 className="h-5 w-5" aria-hidden="true" />
                Delete account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Removes the signed-in account, saved settings, and complaints linked to this user.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {user ? (deleteArmed ? "Confirm delete" : "Delete account") : "Create account"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function SettingsPanel({
  icon: Icon,
  title,
  label,
  children,
}: {
  icon: LucideIcon;
  title: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function Toggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <span className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-civic" aria-hidden="true" />
        <span>
          <span className="block text-sm font-semibold text-slate-900">{label}</span>
          <span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span>
        </span>
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={["relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-civic" : "bg-slate-300"].join(" ")}>
        <span className={["absolute top-1 h-4 w-4 rounded-full bg-white transition", checked ? "left-6" : "left-1"].join(" ")} />
      </span>
    </label>
  );
}

function HelpItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
