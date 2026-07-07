import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMannerRank(score: number): string {
  if (score < 30) return '노비';
  if (score < 36.5) return '천민';
  if (score < 40) return '평민';
  if (score < 60) return '양반';
  if (score < 80) return '귀족';
  if (score < 100) return '왕족';
  return '황제';
}

export function getWebSocketHttpUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:8080/ws';
  
  const { hostname } = window.location;
  
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  // 로컬 개발 환경
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080/ws';
  }
  
  // 모바일 로컬 테스트 (예: 192.168.x.x)
  if (hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
    return `http://${hostname}:8080/ws`;
  }
  
  // 리눅스 실서버 배포 환경 (포트 10005)
  return `http://${hostname}:10005/ws`;
}
