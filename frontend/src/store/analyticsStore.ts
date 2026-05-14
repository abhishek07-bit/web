import { create } from 'zustand';
import type { AnalyticsData } from '../types';

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  setData: (data: AnalyticsData) => void;
  setLoading: (val: boolean) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  isLoading: false,
  setData: (data) => set({ data }),
  setLoading: (val) => set({ isLoading: val }),
}));
