'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { GUIDES } from '@/data/guides';

export default function GuideListPage() {
  const router = useRouter();

  return (
    <div className="max-w-screen-md mx-auto px-4 py-4 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-400">서비스 사용 가이드</span>
      </div>

      {/* Guide List (당근마켓 스타일의 Flat한 리스트) */}
      <div className="divide-y divide-gray-100/80">
        {GUIDES.map((guide) => (
          <Link 
            key={guide.id}
            href={`/my/guide/${guide.id}`}
            className="group block py-5 bg-white hover:bg-gray-50/30 transition-colors"
          >
            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                <BookOpen size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="font-bold text-gray-800 text-[15px] sm:text-[16px] group-hover:text-orange-500 transition-colors truncate">
                    {guide.title}
                  </h2>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {guide.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center text-xs text-gray-400">
        우리끼리플리마켓은 임직원 간의 건전하고 따뜻한 거래 환경을 지원합니다.
      </div>
    </div>
  );
}
