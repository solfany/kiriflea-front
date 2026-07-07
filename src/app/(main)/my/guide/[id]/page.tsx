'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { GUIDES } from '@/data/guides';
import MarkdownViewer from '@/components/ui/MarkdownViewer';

export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const guideId = params.id as string;

  const guide = GUIDES.find((g) => g.id === guideId);

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!guide) {
      setError('존재하지 않는 가이드 페이지입니다.');
      setLoading(false);
      return;
    }

    const fetchMarkdown = async () => {
      try {
        setLoading(true);
        const res = await fetch(guide.file);
        if (!res.ok) {
          throw new Error('마크다운 파일을 로드하는 데 실패했습니다.');
        }
        const text = await res.text();
        setContent(text);
      } catch (err: any) {
        console.error(err);
        setError('가이드 본문을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, [guide]);

  if (loading) {
    return (
      <div className="pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-32 bg-gray-100/70 rounded-md animate-pulse" />
        </div>
        <div className="bg-white py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-400">가이드를 로딩하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">오류</h1>
        </div>
        <div className="bg-white py-20 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <p className="text-gray-600 font-semibold mb-6">{error || '페이지를 불러올 수 없습니다.'}</p>
          <button 
            onClick={() => router.back()} 
            className="px-6 py-3 bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-2xl text-sm transition-colors shadow-md"
          >
            이전 화면으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[calc(100vh-3.5rem)] -mx-4 px-4 pt-4 pb-12 -mt-4 sm:mt-0 sm:bg-transparent sm:min-h-0 sm:mx-0 sm:px-0 sm:pt-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 py-1">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">가이드 상세보기</h1>
      </div>

      {/* Main Content Area (모바일에서는 테두리 없는 풀블리드, PC에서는 둥근 카드 형태) */}
      <div className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-gray-100 shadow-none sm:shadow-sm px-4 py-6 sm:p-8 pb-16 animate-fadeIn -mx-4 sm:mx-0">
        <MarkdownViewer content={content} />
      </div>
    </div>
  );
}
