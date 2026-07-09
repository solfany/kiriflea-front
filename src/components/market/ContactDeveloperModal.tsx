'use client';
import { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

interface ContactDeveloperModalProps {
  onClose: () => void;
}

export function ContactDeveloperModal({ onClose }: ContactDeveloperModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast.success('개발자에게 문의가 전송되었습니다.');
      onClose();
    } catch (error) {
      toast.error('문의 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm sm:p-0">
      <div
        className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">개발자 문의하기</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-3">
              앱 사용 중 발생한 버그, 개선 사항, 기타 문의하실 내용을 자유롭게 적어주세요.
            </p>
            <textarea
              className="w-full h-32 p-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              placeholder="여기에 문의 내용을 작성해주세요..."
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-base font-medium"
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
      </div>
    </div>
  );
}
