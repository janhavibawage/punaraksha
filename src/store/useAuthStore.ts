import { create } from "zustand";
import type { AuthUser, UserRole } from "../services/authApi";
import { getMe, signIn, signOut, signUp } from "../services/authApi";

interface AuthState {
  user?: AuthUser;
  isLoading: boolean;
  error?: string;
  hydrate: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string; role: UserRole; adminCode?: string }) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: undefined,
  isLoading: false,
  error: undefined,

  hydrate: async () => {
    try {
      const { user } = await getMe();
      set({ user, error: undefined });
    } catch {
      set({ user: undefined });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: undefined });
    try {
      const { user } = await signIn({ email, password });
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Sign in failed", isLoading: false });
      throw error;
    }
  },

  signUp: async (input) => {
    set({ isLoading: true, error: undefined });
    try {
      const { user } = await signUp(input);
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Sign up failed", isLoading: false });
      throw error;
    }
  },

  signOut: () => {
    void signOut().catch(() => undefined);
    set({ user: undefined, error: undefined });
  },
}));
