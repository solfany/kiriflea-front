'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { GUIDES } from '@/data/guides';
import { Separator } from '@/components/ui/separator';

export default function GuideListPage() {
  const router = useRouter();

  return (
    <div className="max-w-screen-md mx-auto py-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4.5 px-1">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-500">서비스 사용 가이드</span>
      </div>

      {/* Guide List (마이페이지의 메뉴판처럼 하나의 둥근 흰색 카드 형태로 통합) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {GUIDES.map((guide, i) => (
          <div key={guide.id}>
            {i > 0 && <Separator className="bg-gray-100/80" />}
            <Link 
              href={`/my/guide/${guide.id}`}
              className="group flex items-center gap-4 px-5 py-4.5 hover:bg-gray-50/50 transition-colors"
            >
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
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-1">
                  {guide.description}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-xs text-gray-400">
        우리끼리플리마켓은 임직원 간의 건전하고 따뜻한 거래 환경을 지원합니다.
      </div>
    </div>
  );
}
