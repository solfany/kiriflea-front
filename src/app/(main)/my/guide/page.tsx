'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { GUIDES } from '@/data/guides';

export default function GuideListPage() {
  const router = useRouter();

  return (
    <div className="bg-white min-h-[calc(100vh-3.5rem)] -mx-4 px-4 pt-4 pb-36 -mb-24 -mt-4 sm:mt-0 sm:bg-transparent sm:min-h-0 sm:mx-0 sm:px-0 sm:pt-0 sm:mb-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 py-1">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">서비스 사용 가이드</h1>
      </div>

      {/* Guide List (모바일에서는 테두리 없는 풀블리드 리스트, PC에서는 둥근 카드 형태) */}
      <div className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-gray-100 shadow-none sm:shadow-sm overflow-hidden -mx-4 sm:mx-0">
        {GUIDES.map((guide, i) => (
          <div key={guide.id}>
            {i > 0 && <div className="h-px bg-gray-100/70 w-full" />}
            <Link 
              href={`/my/guide/${guide.id}`}
              className="group flex gap-3 px-5 py-5 sm:px-6 hover:bg-gray-50/80 active:bg-gray-100 transition-colors items-start"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 group-hover:scale-105 transition-all duration-300 shadow-sm border border-emerald-100/50">
                <Image src="/images/logo/raccoon-mascot-logo.png" alt="logo" width={28} height={28} className="object-contain drop-shadow-sm" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="font-bold text-gray-900 text-[16px] sm:text-[17px] group-hover:text-emerald-700 transition-colors truncate tracking-tight">
                    {guide.title}
                  </h2>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all self-center shrink-0" />
                </div>
                <p className="text-[13px] sm:text-[14px] text-gray-500 leading-snug line-clamp-1 break-keep pr-2 sm:pr-4">
                  {guide.description}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-xs text-gray-400">
        모여봐요 너굴상점은 임직원 간의 건전하고 따뜻한 거래 환경을 지원합니다.
      </div>
    </div>
  );
}
