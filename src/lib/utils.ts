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
