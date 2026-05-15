import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ParsedResume {
  skills: string[];
  experience: { title: string; company: string; duration: string }[];
}

interface ResumeAnalysis {
  atsScore: number;
  impactScore: number;
  brevityScore: number;
  latexStructureScore: number;
  overallSummary: string;
  voiceSummary: string;
  strengths: string[];
  weaknesses: string[];
  metricsDetected: string[];
  allLinksFound: string[];
  projects: { name: string; github: string; live: string; stack: string; impact: string }[];
  recommendedRoles: string[];
  criticalFixes: string[];
}

interface MatchAnalysis {
  rejectionProbability: number;
  matchScore: number;
  topRejectionReasons: string[];
  gapReport: { missingSkill: string; importance: string; fixAction: string }[];
  killRatioVerdict: string;
}

interface ResumeState {
  id: string | null;
  file: { name: string; size: number } | null;
  parsedData: ParsedResume | null;
  analysis: ResumeAnalysis | null;
  matchAnalysis: MatchAnalysis | null;
  isUploading: boolean;
  isParsing: boolean;
  isAnalyzing: boolean;
  isMatching: boolean;
  setResumeId: (id: string | null) => void;
  setFile: (file: { name: string; size: number } | null) => void;
  setParsedData: (data: ParsedResume | null) => void;
  setAnalysis: (analysis: ResumeAnalysis | null) => void;
  setMatchAnalysis: (analysis: MatchAnalysis | null) => void;
  setUploading: (val: boolean) => void;
  setParsing: (val: boolean) => void;
  setAnalyzing: (val: boolean) => void;
  setMatching: (val: boolean) => void;
  clearResume: () => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      id: null,
      file: null,
      parsedData: null,
      analysis: null,
      matchAnalysis: null,
      isUploading: false,
      isParsing: false,
      isAnalyzing: false,
      isMatching: false,
      setResumeId: (id) => set({ id }),
      setFile: (file) => set({ file }),
      setParsedData: (data) => set({ parsedData: data }),
      setAnalysis: (analysis) => set({ analysis }),
      setMatchAnalysis: (matchAnalysis) => set({ matchAnalysis }),
      setUploading: (val) => set({ isUploading: val }),
      setParsing: (val) => set({ isParsing: val }),
      setAnalyzing: (val) => set({ isAnalyzing: val }),
      setMatching: (val) => set({ isMatching: val }),
      clearResume: () => set({ id: null, file: null, parsedData: null, analysis: null, matchAnalysis: null }),
    }),
    {
      name: 'prepmate-resume',
      partialize: (state) => ({ file: state.file, parsedData: state.parsedData }),
    }
  )
);
