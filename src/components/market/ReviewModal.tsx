'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReviewModalProps {
  tradeId: number;
  partnerNickname: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ tradeId, partnerNickname, onClose, onSuccess }: ReviewModalProps) {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const qc = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: () => api.post(`/api/trades/${tradeId}/reviews`, { score, comment }),
    onSuccess: () => {
      toast.success('리뷰를 남겼습니다! 매너온도에 반영되었습니다.');
      qc.invalidateQueries({ queryKey: ['product'] });
      qc.invalidateQueries({ queryKey: ['trade'] });
      onSuccess();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err.response?.data?.message || '리뷰 작성에 실패했습니다.');
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">거래 후기 남기기</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-4 text-center">
            <span className="font-semibold text-orange-600">{partnerNickname}</span>님과의 거래는 어떠셨나요?
          </p>
          <div className="flex gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 transition-transform hover:scale-110 focus:outline-none"
                onMouseEnter={() => setHoverScore(star)}
                onMouseLeave={() => setHoverScore(0)}
                onClick={() => setScore(star)}
              >
                <Star
                  size={36}
                  className={cn(
                    "transition-colors",
                    (hoverScore || score) >= star ? "fill-orange-400 text-orange-400" : "fill-gray-100 text-gray-200"
                  )}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="따뜻한 후기를 남겨주세요 (선택)"
            className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            rows={3}
          />
        </div>
        <div className="p-4 border-t border-gray-50 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>나중에</Button>
          <Button 
            className="flex-1 bg-orange-500 hover:bg-orange-600" 
            disabled={score === 0 || reviewMutation.isPending}
            onClick={() => reviewMutation.mutate()}
          >
            보내기
          </Button>
        </div>
      </div>
    </div>
  );
}
