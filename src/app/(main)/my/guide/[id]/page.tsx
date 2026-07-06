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
      <div className="max-w-screen-md mx-auto px-0 sm:px-4 py-0 sm:py-6 min-h-screen bg-white sm:bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-gray-50 px-4 sm:px-1 pt-4 sm:pt-0">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-32 bg-gray-100 rounded-md animate-pulse" />
        </div>
        <div className="bg-white rounded-none sm:rounded-[28px] border-0 sm:border border-gray-100 shadow-none sm:shadow-sm px-4 py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-400">가이드를 로딩하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="max-w-screen-md mx-auto px-0 sm:px-4 py-0 sm:py-6 min-h-screen bg-white sm:bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-gray-50 px-4 sm:px-1 pt-4 sm:pt-0">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">오류</h1>
        </div>
        <div className="bg-white rounded-none sm:rounded-[28px] border-0 sm:border border-gray-100 shadow-none sm:shadow-sm px-4 py-20 flex flex-col items-center justify-center text-center">
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
    <div className="max-w-screen-md mx-auto px-0 sm:px-4 py-0 sm:py-6 min-h-screen bg-white sm:bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-gray-50 px-4 sm:px-1 pt-4 sm:pt-0">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-400">가이드 상세보기</span>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-none sm:rounded-[28px] border-0 sm:border border-gray-100 shadow-none sm:shadow-sm px-4 py-4 sm:px-10 sm:py-10 pb-16">
        <MarkdownViewer content={content} />
      </div>
    </div>
  );
}
