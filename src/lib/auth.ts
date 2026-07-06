import { api } from './api';
import type { AuthTokens, LoginRequest, RegisterRequest } from '@/types';

export async function sendVerificationCode(email: string) {
  await api.post('/api/auth/email/send-code', { email });
}

export async function confirmVerificationCode(email: string, code: string) {
  await api.post('/api/auth/email/verify', { email, code });
  return { valid: true };
}

export async function register(data: RegisterRequest): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>('/api/auth/register', data);
  return res.data;
}


export async function login(data: LoginRequest): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>('/api/auth/login', data);
  return res.data;
}

export async function logout() {
  await api.post('/api/auth/logout');
}

export async function generateNickname(): Promise<string> {
  const res = await api.get<{ nickname: string }>('/api/auth/nickname/random');
  return res.data.nickname;
}

export async function checkNickname(nickname: string): Promise<boolean> {
  const res = await api.get<{ available: boolean }>('/api/auth/nickname/check', {
    params: { nickname },
  });
  return res.data.available;
}
