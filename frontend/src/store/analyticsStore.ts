import { create } from 'zustand';
import type { AnalyticsData } from '../types';

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  setData: (data: AnalyticsData) => void;
  setLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  setData: (data) => set({ data, error: null }),
  setLoading: (val) => set({ isLoading: val }),
  setError: (err) => set({ error: err }),
}));
