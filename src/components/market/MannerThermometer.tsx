'use client';
import { cn } from '@/lib/utils';
import { getMannerRank } from '@/lib/utils';

interface MannerThermometerProps {
  score: number;
  className?: string;
}

export function MannerThermometer({ score, className }: MannerThermometerProps) {
  // 온도에 따른 색상 결정 (당근마켓과 유사한 로직)
  // 36.5 기준
  let colorClass = 'bg-gray-400 text-gray-500'; // 기본
  let barColorClass = 'bg-gray-400';
  
  if (score >= 50) {
    colorClass = 'text-orange-500';
    barColorClass = 'bg-orange-500';
  } else if (score >= 40) {
    colorClass = 'text-amber-500';
    barColorClass = 'bg-amber-500';
  } else if (score >= 36.5) {
    colorClass = 'text-green-500';
    barColorClass = 'bg-green-500';
  } else if (score >= 30) {
    colorClass = 'text-blue-500';
    barColorClass = 'bg-blue-500';
  } else {
    colorClass = 'text-slate-600';
    barColorClass = 'bg-slate-600';
  }

  // 막대 게이지 퍼센트 (0~100)
  const percentage = Math.min(Math.max((score / 100) * 100, 0), 100);
  
  const rankStr = getMannerRank(score);
  
  // 온도계 아이콘 (이모지 대체)
  const faceEmoji = score >= 50 ? '🥰' : score >= 40 ? '😀' : score >= 36.5 ? '🙂' : score >= 30 ? '🤔' : '😥';

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4 decoration-dashed cursor-pointer">
          매너온도
        </span>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-lg font-bold tracking-tight", colorClass)}>
            {score.toFixed(1)}°C
          </span>
          <span className="text-xl leading-none">{faceEmoji}</span>
        </div>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-[11px] text-gray-400 text-right mt-0.5">
        현재 등급: <span className="font-medium text-gray-500">{rankStr}</span>
      </div>
    </div>
  );
}
