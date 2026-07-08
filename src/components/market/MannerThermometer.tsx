'use client';
import { cn } from '@/lib/utils';
import { getMannerRank } from '@/lib/utils';

interface MannerThermometerProps {
  score: number;
  className?: string;
}

export function MannerThermometer({ score, className }: MannerThermometerProps) {
  // 온도에 따른 색상 결정
  let colorClass = 'bg-gray-400 text-gray-500'; // 기본
  let barColorClass = 'bg-gray-400';
  
  if (score >= 90) {
    colorClass = 'text-yellow-500';
    barColorClass = 'bg-yellow-500';
  } else if (score >= 70) {
    colorClass = 'text-orange-600';
    barColorClass = 'bg-orange-600';
  } else if (score >= 50) {
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
  
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[14px] font-bold text-gray-800">{rankStr}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] font-medium text-gray-500 mb-0.5">
            매너 점수
          </span>
          <span className={cn('text-sm font-bold', colorClass)}>
            {score.toFixed(1)}점 <span className="text-[12px] font-medium text-gray-500">({rankStr})</span>
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
