'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { GUIDES } from '@/data/guides';

export default function GuideListPage() {
  const router = useRouter();

  return (
    <div className="max-w-screen-md mx-auto px-0 sm:px-4 py-0 sm:py-6 min-h-screen bg-white sm:bg-slate-50/50">
      {/* Header (디자인 통일) */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-gray-50 px-4 sm:px-1 pt-4 sm:pt-0">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-400">서비스 사용 가이드</span>
      </div>

      {/* Guide Board / List Container (디자인 통일) */}
      <div className="bg-white rounded-none sm:rounded-[28px] border-0 sm:border border-gray-100 shadow-none sm:shadow-sm px-0 py-2 sm:px-10 sm:py-10 pb-16">
        <div className="divide-y divide-gray-100 sm:divide-y-0 sm:space-y-4">
          {GUIDES.map((guide) => (
            <Link 
              key={guide.id}
              href={`/my/guide/${guide.id}`}
              className="group block bg-white rounded-none sm:rounded-2xl p-4 sm:p-5 border-x-0 sm:border border-gray-100 shadow-none sm:shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-300 transform sm:hover:-translate-y-[2px]"
            >
              <div className="flex gap-3 sm:gap-4 items-start">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <BookOpen size={18} className="sm:hidden" />
                  <BookOpen size={20} className="hidden sm:block" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1 sm:mb-1.5">
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
      </div>

      <div className="mt-12 text-center text-xs text-gray-400 px-4">
        우리끼리플리마켓은 임직원 간의 건전하고 따뜻한 거래 환경을 지원합니다.
      </div>
    </div>
  );
}
