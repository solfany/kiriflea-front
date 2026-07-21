'use client';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const CATEGORIES: { value: Category | undefined; label: string }[] = [
  { value: undefined,      label: '전체' },
  { value: 'ELECTRONICS',  label: '전자기기' },
  { value: 'CLOTHING',     label: '의류' },
  { value: 'BOOKS',        label: '도서' },
  { value: 'HOUSEHOLD',    label: '생활용품' },
  { value: 'OTHER',        label: '기타' },
];

interface Props {
  value: Category | undefined;
  onChange: (c: Category | undefined) => void;
}

export default function CategoryFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
      {CATEGORIES.map((c) => (
        <button
          key={c.label}
          onClick={() => onChange(c.value)}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
            value === c.value
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300',
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
