'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string | null, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      // 액세스/리프레시 토큰은 백엔드가 httpOnly 쿠키로 직접 내려주므로 여기서 JS로
      // localStorage/document.cookie에 저장하지 않는다 (XSS 한 방에 토큰이 털리는 걸 방지).
      setTokens: (accessToken, refreshToken, user) => {
        set({ user, accessToken, isAuthenticated: true });
      },

      clearAuth: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    { name: 'nplohs-auth', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) },
  ),
);
