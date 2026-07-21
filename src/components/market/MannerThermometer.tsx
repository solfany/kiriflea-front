'use client';
import { cn } from '@/lib/utils';
import { getMannerRank } from '@/lib/utils';

interface MannerThermometerProps {
  score: number;
  className?: string;
}

export function MannerThermometer({ score = 0, className }: MannerThermometerProps) {
  // 온도에 따른 색상 결정
  let colorClass = 'bg-gray-400 text-gray-500'; // 기본
  let barColorClass = 'bg-gray-400';

  if (score >= 100) {
    colorClass = 'text-emerald-900';
    barColorClass = 'bg-emerald-900';
  } else if (score >= 80) {
    colorClass = 'text-emerald-800';
    barColorClass = 'bg-emerald-800';
  } else if (score >= 60) {
    colorClass = 'text-emerald-700';
    barColorClass = 'bg-emerald-700';
  } else if (score >= 40) {
    colorClass = 'text-emerald-600';
    barColorClass = 'bg-emerald-600';
  } else if (score >= 20) {
    colorClass = 'text-emerald-500';
    barColorClass = 'bg-emerald-500';
  } else {
    colorClass = 'text-emerald-400';
    barColorClass = 'bg-emerald-400';
  }

  // 막대 게이지 퍼센트 (0~100)
  const percentage = Math.min(Math.max((score / 100) * 100, 0), 100);

  const rankStr = getMannerRank(score);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[14px] font-bold text-gray-800">{rankStr}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] font-medium text-gray-500 mb-0.5">
            주민 매너 점수
          </span>
          <span className={cn('text-sm font-bold', colorClass)}>
            {score.toFixed(1)}점
          </span>
        </div>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
