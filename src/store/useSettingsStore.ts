import { create } from "zustand";
import {
  getSettings,
  updateSettings as saveSettings,
  type AppearanceMode,
  type UserSettings,
} from "../services/settingsApi";

const storageKey = "punaraksha_settings";

export const defaultSettings: UserSettings = {
  appearance: "light",
  language: "en",
  mobileNumber: "",
  twoFactorEnabled: false,
  notifications: {
    sms: false,
    email: true,
    push: false,
    emergencyAlerts: true,
    safetyZoneAlerts: false,
    serviceUpdates: true,
  },
  permissions: {
    location: true,
    camera: true,
    evidenceStorage: true,
    analytics: false,
  },
  privacy: {
    shareProfileWithOfficers: true,
    hidePhoneFromPublicView: true,
    allowEvidenceReview: true,
  },
  suggestion: "",
};

interface SettingsState {
  settings: UserSettings;
  isSaving: boolean;
  error?: string;
  applyAppearance: () => void;
  updateLocal: (patch: Partial<UserSettings>) => void;
  updateNotifications: (key: keyof UserSettings["notifications"], value: boolean) => void;
  updatePermissions: (key: keyof UserSettings["permissions"], value: boolean) => void;
  updatePrivacy: (key: keyof UserSettings["privacy"], value: boolean) => void;
  loadRemote: () => Promise<void>;
  saveRemote: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: readLocalSettings(),
  isSaving: false,
  error: undefined,

  applyAppearance: () => {
    applyAppearance(get().settings.appearance);
  },

  updateLocal: (patch) => {
    const next = mergeSettings(get().settings, patch);
    writeLocalSettings(next);
    applyAppearance(next.appearance);
    set({ settings: next, error: undefined });
  },

  updateNotifications: (key, value) => {
    get().updateLocal({ notifications: { ...get().settings.notifications, [key]: value } });
  },

  updatePermissions: (key, value) => {
    get().updateLocal({ permissions: { ...get().settings.permissions, [key]: value } });
  },

  updatePrivacy: (key, value) => {
    get().updateLocal({ privacy: { ...get().settings.privacy, [key]: value } });
  },

  loadRemote: async () => {
    try {
      const { settings } = await getSettings();
      const next = mergeSettings(get().settings, settings);
      writeLocalSettings(next);
      applyAppearance(next.appearance);
      set({ settings: next, error: undefined });
    } catch {
      get().applyAppearance();
    }
  },

  saveRemote: async () => {
    set({ isSaving: true, error: undefined });
    try {
      const { settings } = await saveSettings(get().settings);
      const next = mergeSettings(defaultSettings, settings);
      writeLocalSettings(next);
      applyAppearance(next.appearance);
      set({ settings: next, isSaving: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Settings could not be saved",
        isSaving: false,
      });
      throw error;
    }
  },
}));

function readLocalSettings() {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return mergeSettings(defaultSettings, stored ? JSON.parse(stored) : {});
  } catch {
    return defaultSettings;
  }
}

function writeLocalSettings(settings: UserSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(settings));
}

function mergeSettings(base: UserSettings, patch: Partial<UserSettings>): UserSettings {
  return {
    ...base,
    ...patch,
    notifications: {
      ...base.notifications,
      ...patch.notifications,
    },
    permissions: {
      ...base.permissions,
      ...patch.permissions,
    },
    privacy: {
      ...base.privacy,
      ...patch.privacy,
    },
  };
}

function applyAppearance(appearance: AppearanceMode) {
  if (typeof window === "undefined") {
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = appearance === "dark" || (appearance === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}
