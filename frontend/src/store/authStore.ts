import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from 'firebase/auth';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (v: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: (user, token) => set({ user, token, isAuthenticated: true, loading: false }),
      logout: async () => {
        if (isFirebaseConfigured()) {
          await signOut(auth);
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setLoading: (loading) => set({ loading }),

      signInWithGoogle: async () => {
        if (!isFirebaseConfigured()) {
          console.warn('[PrepMate] Firebase not configured. Cannot sign in with Google.');
          return;
        }
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const token = await result.user.getIdToken();
          const user = result.user;
          get().login({
            id: user.uid,
            email: user.email || '',
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            avatarUrl: user.photoURL || undefined,
            createdAt: user.metadata.creationTime || new Date().toISOString(),
          }, token);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          console.error('Google sign-in error:', message);
        }
      },

      signInWithEmail: async (email, password) => {
        if (!isFirebaseConfigured()) {
          get().login(
            { id: crypto.randomUUID(), email, firstName: email.split('@')[0], lastName: '', createdAt: new Date().toISOString() },
            `local-${Date.now()}`
          );
          return {};
        }
        set({ loading: true });
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          const token = await result.user.getIdToken();
          const user = result.user;
          get().login({
            id: user.uid,
            email: user.email || '',
            firstName: user.displayName?.split(' ')[0] || email.split('@')[0],
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            createdAt: user.metadata.creationTime || new Date().toISOString(),
          }, token);
          return {};
        } catch (error: unknown) {
          set({ loading: false });
          return { error: error instanceof Error ? error.message : 'Failed to sign in' };
        }
      },

      signUpWithEmail: async (email, password, firstName, lastName) => {
        if (!isFirebaseConfigured()) {
          get().login(
            { id: crypto.randomUUID(), email, firstName, lastName, createdAt: new Date().toISOString() },
            `local-${Date.now()}`
          );
          return {};
        }
        set({ loading: true });
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(result.user, {
            displayName: `${firstName} ${lastName}`,
          });
          const token = await result.user.getIdToken();
          const user = result.user;
          get().login({
            id: user.uid,
            email: user.email || '',
            firstName,
            lastName,
            createdAt: user.metadata.creationTime || new Date().toISOString(),
          }, token);
          return {};
        } catch (error: unknown) {
          set({ loading: false });
          return { error: error instanceof Error ? error.message : 'Failed to sign up' };
        }
      },

      initAuth: () => {
        if (!isFirebaseConfigured()) return;
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const token = await user.getIdToken();
            set({
              user: {
                id: user.uid,
                email: user.email || '',
                firstName: user.displayName?.split(' ')[0] || user.email?.split('@')[0] || '',
                lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                avatarUrl: user.photoURL || undefined,
                createdAt: user.metadata.creationTime || new Date().toISOString(),
              },
              token,
              isAuthenticated: true,
              loading: false,
            });
          }
        });
      },
    }),
    {
      name: 'prepmate-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
