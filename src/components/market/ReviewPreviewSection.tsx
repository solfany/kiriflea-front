'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, MoreVertical, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface ReviewItem {
  id: number;
  score: number;
  comment: string;
  createdAt: string;
  reviewer: {
    id: number;
    nickname: string;
    profileImage: string | null;
    role?: string;
  };
}

interface ReviewPreviewSectionProps {
  userId?: number;
  reviews: ReviewItem[];
  isMyPage?: boolean;
}

export function ReviewPreviewSection({ userId, reviews, isMyPage }: ReviewPreviewSectionProps) {
  const qc = useQueryClient();

  const hideMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/api/me/reviews/${id}/hide`),
    onSuccess: () => {
      toast.success('후기가 숨김 처리되었습니다.');
      qc.invalidateQueries({ queryKey: ['myReviews'] });
      qc.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: () => toast.error('후기 숨김에 실패했습니다.')
  });

  if (!reviews || reviews.length === 0) return null;

  const previewReviews = reviews.slice(0, 3);
  const href = isMyPage ? '/my/reviews' : `/users/${userId}/reviews`;

  return (
    <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      <Link href={href} className="flex items-center justify-between mb-4 hover:opacity-80 transition-opacity">
        <h3 className="font-bold text-[17px] text-gray-900">받은 후기 {reviews.length}</h3>
        <ChevronRight size={20} className="text-gray-400" />
      </Link>

      <div className="flex flex-col">
        {previewReviews.map((review, idx) => (
          <div key={review.id} className={`py-4 ${idx > 0 ? 'border-t border-gray-100' : 'pt-0'}`}>
            <div className="flex gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {review.reviewer.profileImage ? (
                  <Image src={review.reviewer.profileImage} fill className="object-cover" alt="프로필" />
                ) : (
                  <User size={20} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900 text-[15px]">{review.reviewer.nickname}</p>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                      {review.reviewer.role || '판매자'} · {review.createdAt ? formatDistanceToNow(new Date(review.createdAt.replace(' ', 'T')), { addSuffix: true, locale: ko }) : ''}
                    </p>
                  </div>
                  {isMyPage && (
                    <div className="relative">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="text-gray-400 p-1 hover:text-gray-600 transition-colors outline-none">
                          <MoreVertical size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-28 bg-white border border-gray-100 rounded-lg shadow-lg !ring-0 !outline-none p-1">
                          <DropdownMenuItem
                            onClick={() => hideMutation.mutate(review.id)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            후기 숨기기
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                <div className="text-[15px] text-gray-800 mt-2 leading-relaxed">
                  {review.comment ? (
                    <p>{review.comment}</p>
                  ) : (
                    <p className="text-gray-400 italic">남겨진 후기 내용이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
