import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, Answer } from '../types';
import { analyticsAPI } from '../api/client';

interface SessionRecord {
  id: string;
  role: string;
  company: string;
  persona: string;
  score: number | null;
  duration: number;
  answers: { questionId: string; score: number }[];
  createdAt: string;
}

interface InterviewState {
  /* Active session */
  sessionId: string | null;
  role: string;
  company: string;
  persona: string;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  timeRemaining: number;
  isActive: boolean;
  loading: boolean;

  /* Historical */
  sessions: SessionRecord[];

  /* Actions */
  setupSession: (data: { sessionId: string; role: string; company: string; persona: string }) => void;
  setQuestions: (questions: Question[]) => void;
  addAnswer: (answer: Answer) => void;
  nextQuestion: () => void;
  setTimeRemaining: (time: number) => void;
  startSession: () => void;
  endSession: (score: number) => void;
  reset: () => void;
  fetchSessions: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      role: '',
      company: '',
      persona: '',
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
      timeRemaining: 0,
      isActive: false,
      loading: false,
      sessions: [],

      setupSession: ({ sessionId, role, company, persona }) =>
        set({ sessionId, role, company, persona, questions: [], answers: [], currentQuestionIndex: 0, isActive: false }),
      setQuestions: (questions) => set({ questions }),
      addAnswer: (answer) => set((state) => ({ answers: [...state.answers, answer] })),
      nextQuestion: () => set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
      setTimeRemaining: (time) => set({ timeRemaining: time }),
      startSession: () => set({ isActive: true }),
      endSession: (score) => {
        const state = get();
        const record: SessionRecord = {
          id: state.sessionId || Date.now().toString(),
          role: state.role,
          company: state.company,
          persona: state.persona,
          score,
          duration: 45,
          answers: state.answers.map((a) => ({ questionId: a.questionId, score: a.score || 0 })),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          isActive: false,
          sessions: [record, ...s.sessions].slice(0, 50),
        }));
      },
      reset: () =>
        set({
          sessionId: null,
          role: '',
          company: '',
          persona: '',
          questions: [],
          answers: [],
          currentQuestionIndex: 0,
          timeRemaining: 0,
          isActive: false,
        }),
      
      setLoading: (loading) => set({ loading }),

      fetchSessions: async () => {
        set({ loading: true });
        try {
          const { data } = await analyticsAPI.getHistory();
          set({ sessions: data });
        } catch (error) {
          console.error('Failed to fetch sessions:', error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'prepmate-interview',
      partialize: (state) => ({ sessions: state.sessions }),
    }
  )
);
