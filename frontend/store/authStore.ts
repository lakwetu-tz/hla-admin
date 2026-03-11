import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null, // Keep in memory, but persisted in localStorage is not recommended for production.
      // However, for Next.js hydration and simplicity in this phase, we persist it.
      // In a strict security environment, we would use a session-only store for the accessToken.
      isAuthenticated: false,
      setAuth: (user: User, accessToken: string) =>
        set({ user, accessToken, isAuthenticated: true }),
      setAccessToken: (accessToken: string) => set({ accessToken }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
        // We exclude accessToken from localStorage persistence for better security
      }),
    }
  )
);
