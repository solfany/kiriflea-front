import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMannerRank(score: number): string {
  if (score < 20) return '새싹 주민';
  if (score < 40) return '이웃 주민';
  if (score < 60) return '단골 주민';
  if (score < 80) return '상점 친구';
  if (score < 100) return '인기 주민';
  return '명예 주민';
}

export function stripMarkdown(md: string): string {
  if (!md) return '';
  return md
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/~~(.*?)~~/g, '$1') // strikethrough
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '(사진)') // images
    .replace(/^#+\s+/gm, '') // headings
    .replace(/^>+\s+/gm, '') // blockquotes
    .replace(/^[*-]\s+/gm, '') // unordered lists
    .replace(/^\d+\.\s+/gm, '') // ordered lists
    .trim();
}

export function getWebSocketHttpUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:8080/ws';
  
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  
  // 로컬 개발 환경 (backend는 10005 포트로 매핑됨)
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:10005/ws';
  }
  
  // 운영 환경: Next.js 프록시가 SockJS/WS를 제대로 처리하지 못하는 경우가 있으므로,
  // 프론트 도메인에서 포트만 10005(백엔드 노출 포트)로 바꿔서 직접 연결
  return `http://${window.location.hostname}:10005/ws`;
}
