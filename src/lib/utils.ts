import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMannerRank(score: number): string {
  if (score < 30) return '양아치 끼리';
  if (score < 36.5) return '껄렁한 끼리';
  if (score < 40) return '평범한 끼리';
  if (score < 60) return '성숙한 끼리';
  if (score < 80) return '신사적인 끼리';
  if (score < 100) return '존경받는 끼리';
  return '전설적인 끼리';
}

export function getMannerIcon(score: number): string {
  if (score < 30) return '👿';
  if (score < 36.5) return '😒';
  if (score < 40) return '🌱';
  if (score < 60) return '☕';
  if (score < 80) return '🎩';
  if (score < 100) return '👑';
  return '🌟';
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
