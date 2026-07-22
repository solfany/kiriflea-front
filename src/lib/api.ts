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

// 액세스 토큰은 백엔드가 내려주는 httpOnly 쿠키로 자동 전송된다(withCredentials).
// JS가 토큰 값을 들고 있지 않으므로 여기서 Authorization 헤더를 수동으로 붙이지 않는다.

function sanitizeUrls(data: any): any {
  if (typeof data === 'string') {
    // 백엔드가 하드코딩된 localhost URL을 내려보내면, 프론트 프록시(/uploads)를 타도록 상대 경로로 바꾼다
    return data.replace('http://localhost:8080/uploads', '/uploads');
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeUrls);
  }
  if (data !== null && typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      result[key] = sanitizeUrls(data[key]);
    }
    return result;
  }
  return data;
}

api.interceptors.response.use(
  (res) => {
    let responseData = res.data;
    if (
      responseData !== null &&
      typeof responseData === 'object' &&
      'success' in responseData &&
      'data' in responseData
    ) {
      responseData = responseData.data;
    }
    // 데이터 내부에 숨어있는 localhost:8080 이미지 URL들을 일괄 변환
    res.data = sanitizeUrls(responseData);
    
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
    
    // 리프레시 요청 자체가 실패한 경우, 무한 루프 방지를 위해 바로 에러를 던짐
    if (original.url === '/api/auth/refresh') {
      return Promise.reject(err);
    }

    if ((err.response?.status === 401 || err.response?.status === 403) && !original._retry) {
      original._retry = true;
      try {
        // Send request to refresh endpoint using api instance (which has baseURL for SSR)
        const res = await api.post('/api/auth/refresh', {}, { withCredentials: true });
        const responseData = res.data?.data;
        if (!responseData || !responseData.accessToken) {
          throw new Error('Failed to refresh tokens');
        }

        const { accessToken, refreshToken: newRefreshToken, user } = responseData;

        // 새 access_token은 이미 응답의 Set-Cookie로 내려왔으므로, 여기서는 화면에 쓰일 user 상태만 동기화한다.
        useAuthStore.getState().setTokens(accessToken, newRefreshToken, user);

        return api(original);
      } catch (refreshErr) {
        console.error('[API] Token refresh failed, logging out:', refreshErr);
        
        // 401 발생 시, 프론트 상태만 지우면 쿠키가 남아 무한 리다이렉트가 발생할 수 있음
        // 백엔드에 명시적으로 로그아웃을 요청해 쿠키를 완전히 지운다
        try {
          await api.post('/api/auth/logout', {}, { withCredentials: true });
        } catch (logoutErr) {
          console.error('[API] Clear cookie failed:', logoutErr);
        }

        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  },
);
