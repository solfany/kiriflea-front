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
      <div className="max-w-screen-md mx-auto px-4 py-6 min-h-screen bg-slate-50/50">
        <div className="flex items-center gap-3 mb-5">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200/80 hover:bg-gray-50 rounded-2xl shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            뒤로가기
          </button>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm/80 px-6 py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-400">가이드를 로딩하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-6 min-h-screen bg-slate-50/50">
        <div className="flex items-center gap-3 mb-5">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200/80 hover:bg-gray-50 rounded-2xl shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            뒤로가기
          </button>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm/80 px-6 py-20 flex flex-col items-center justify-center text-center">
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
    <div className="max-w-screen-md mx-auto px-4 py-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200/80 hover:bg-gray-50 rounded-2xl shadow-sm transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          뒤로가기
        </button>
        <span className="text-[11px] font-bold text-orange-500/90 bg-orange-50/80 px-3 py-1 rounded-full border border-orange-100/30">Guide Center</span>
      </div>

      {/* Main Content Area in Premium Rounded Card */}
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm px-6 py-8 sm:px-10 sm:py-10 pb-16">
        <MarkdownViewer content={content} />
      </div>
    </div>
  );
}
