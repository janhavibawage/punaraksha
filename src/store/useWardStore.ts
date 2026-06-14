import { create } from "zustand";
import { wardForecasts, wards } from "../data/mock";
import type { WardForecast, WardProfile } from "../agents/types";

interface WardState {
  wards: WardProfile[];
  forecasts: WardForecast[];
  selectedWardId: string;
  setSelectedWard: (wardId: string) => void;
  getWardName: (wardId: string) => string;
}

export const useWardStore = create<WardState>((set, get) => ({
  wards,
  forecasts: wardForecasts,
  selectedWardId: wards[0].wardId,
  setSelectedWard: (wardId) => set({ selectedWardId: wardId }),
  getWardName: (wardId) => get().wards.find((ward) => ward.wardId === wardId)?.wardName ?? wardId,
}));
