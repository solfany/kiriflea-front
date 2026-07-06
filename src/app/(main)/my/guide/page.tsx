'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { GUIDES } from '@/data/guides';

export default function GuideListPage() {
  const router = useRouter();

  return (
    <div className="max-w-screen-md mx-auto px-4 py-4 min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">서비스 사용 가이드</h1>
      </div>

      {/* Guide Board / List */}
      <div className="space-y-4">
        {GUIDES.map((guide) => (
          <Link 
            key={guide.id}
            href={`/my/guide/${guide.id}`}
            className="group block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-300 transform hover:-translate-y-[2px]"
          >
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                <BookOpen size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h2 className="font-bold text-gray-800 text-[16px] group-hover:text-orange-500 transition-colors truncate">
                    {guide.title}
                  </h2>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
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
