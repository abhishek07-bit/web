import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetRoles: string[];
  strictTiming: boolean;
  audioFeedback: boolean;
  theme: ThemeMode;
  setDifficulty: (d: 'beginner' | 'intermediate' | 'advanced') => void;
  addRole: (role: string) => void;
  removeRole: (role: string) => void;
  toggleStrictTiming: () => void;
  toggleAudioFeedback: () => void;
  setTheme: (theme: ThemeMode) => void;
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      difficulty: 'intermediate',
      targetRoles: [],
      strictTiming: true,
      audioFeedback: false,
      theme: 'system',
      setDifficulty: (difficulty) => set({ difficulty }),
      addRole: (role) =>
        set((state) => ({ targetRoles: [...state.targetRoles, role] })),
      removeRole: (role) =>
        set((state) => ({ targetRoles: state.targetRoles.filter((r) => r !== role) })),
      toggleStrictTiming: () =>
        set((state) => ({ strictTiming: !state.strictTiming })),
      toggleAudioFeedback: () =>
        set((state) => ({ audioFeedback: !state.audioFeedback })),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'prepmate-settings',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useSettingsStore.getState();
    if (state.theme === 'system') applyTheme('system');
  });
}
