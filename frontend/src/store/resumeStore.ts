import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ParsedResume {
  skills: string[];
  experience: { title: string; company: string; duration: string }[];
}

interface ResumeAnalysis {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendedRoles: string[];
  formattingFeedback: string;
}

interface ResumeState {
  id: string | null;
  file: { name: string; size: number } | null;
  parsedData: ParsedResume | null;
  analysis: ResumeAnalysis | null;
  isUploading: boolean;
  isParsing: boolean;
  isAnalyzing: boolean;
  setResumeId: (id: string | null) => void;
  setFile: (file: { name: string; size: number } | null) => void;
  setParsedData: (data: ParsedResume | null) => void;
  setAnalysis: (analysis: ResumeAnalysis | null) => void;
  setUploading: (val: boolean) => void;
  setParsing: (val: boolean) => void;
  setAnalyzing: (val: boolean) => void;
  clearResume: () => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      id: null,
      file: null,
      parsedData: null,
      analysis: null,
      isUploading: false,
      isParsing: false,
      isAnalyzing: false,
      setResumeId: (id) => set({ id }),
      setFile: (file) => set({ file }),
      setParsedData: (data) => set({ parsedData: data }),
      setAnalysis: (analysis) => set({ analysis }),
      setUploading: (val) => set({ isUploading: val }),
      setParsing: (val) => set({ isParsing: val }),
      setAnalyzing: (val) => set({ isAnalyzing: val }),
      clearResume: () => set({ id: null, file: null, parsedData: null, analysis: null }),
    }),
    {
      name: 'prepmate-resume',
      partialize: (state) => ({ file: state.file, parsedData: state.parsedData }),
    }
  )
);
