import axios from 'axios';

// 상대경로 사용 → Next.js rewrites가 /api/* → localhost:8080 으로 프록시 (클라이언트)
// 서버 사이드 렌더링(SSR) 시에는 BACKEND_URL이나 localhost:8080을 직접 호출
const BASE_URL = typeof window === 'undefined' ? (process.env.BACKEND_URL || 'http://localhost:8080') : '';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (
      res.data !== null &&
      typeof res.data === 'object' &&
      'success' in res.data &&
      'data' in res.data
    ) {
      res.data = res.data.data;
    }
    return res;
  },
  async (err) => {
    // existing error handler stays as-is
    return Promise.reject(err);
  },
);

import { useAuthStore } from '@/store/auth';

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if ((err.response?.status === 401 || err.response?.status === 403) && !original._retry) {
      original._retry = true;
      try {
        // Send request to refresh endpoint. Browser automatically attaches HttpOnly 'refresh_token' cookie because of withCredentials: true.
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const responseData = res.data?.data;
        if (!responseData || !responseData.accessToken) {
          throw new Error('Failed to refresh tokens');
        }

        const { accessToken, refreshToken: newRefreshToken, user } = responseData;
        
        // Sync new access token with Zustand store and cookies
        useAuthStore.getState().setTokens(accessToken, newRefreshToken, user);

        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshErr) {
        console.error('[API] Token refresh failed, logging out:', refreshErr);
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  },
);
