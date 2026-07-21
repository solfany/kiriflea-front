'use client';
import { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import Image from 'next/image';
import { DeveloperEmail } from './DeveloperEmail';

interface ContactDeveloperModalProps {
  onClose: () => void;
}

export function ContactDeveloperModal({ onClose }: ContactDeveloperModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const user = useAuthStore(s => s.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('문의 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/support/contact', {
        email: user?.email,
        content: content.trim()
      });
      setIsSuccess(true);
    } catch (error) {
      toast.error('문의 전송에 실패했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-xl relative animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 font-nook tracking-[1px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 font-sans tracking-normal">개발자 문의하기</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-4 pt-6 flex flex-col items-center text-center animate-in fade-in duration-300">
            <div className="relative w-20 h-20 mb-4">
              <Image
                src="/images/logo/judy-face.png"
                alt="문의 완료"
                fill
                sizes="100px"
                className="object-contain"
              />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-sans tracking-normal">문의 발송 완료 ✨💖</h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              어머~ 소중한 의견 너무 고마워요!<br />
              확인 후에 개발자가 답변을 드릴 예정이랍니다.
            </p>
            <DeveloperEmail />
            <Button
              onClick={onClose}
              className="w-full h-12 bg-gradient-to-r from-sky-300 via-fuchsia-300 to-pink-300 opacity-90 text-white rounded-xl text-base font-bold font-sans tracking-normal shadow-sm transition-opacity hover:opacity-100"
            >
              닫기
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
              <div className="flex justify-center mb-4 mt-2">
                <div className="relative w-24 h-24">
                  <Image
                    src="/images/logo/judy-stand2.png"
                    alt="문의 작성"
                    fill
                    sizes="100px"
                    className="object-contain"
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center font-sans tracking-normal">어머~ 저를 찾아오셨나요?</h3>
              <div className="text-sm text-gray-600 mb-5 text-center">
                사용하다가 불편했던 점이나 버그를 발견했다면 알려주세요!<br />
                반짝이는 아이디어도 언제든 환영이랍니다. ✨💖
              </div>
              <DeveloperEmail />
              <textarea
                className="w-full h-32 p-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                placeholder="여기에 문의 내용을 작성해주세요..."
                value={content}
                onChange={e => setContent(e.target.value)}
                maxLength={2000}
                disabled={isSubmitting}
              />
              <div className="text-right text-xs text-gray-400 mt-1.5 font-medium pr-1">
                {content.length} / 2000
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-sky-300 via-fuchsia-300 to-pink-300 opacity-90 text-white rounded-xl text-base font-bold font-sans tracking-normal shadow-sm transition-opacity hover:opacity-100"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  보내기
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div >
  );
}
