'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Image from 'next/image';
import { MessageCircle, ChevronLeft, User } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
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

export default function UserReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SELLER' | 'BUYER'>('ALL');
  
  const { data: reviews = [] as ReviewItem[], isLoading } = useQuery<ReviewItem[]>({
    queryKey: ['userReviews', id],
    queryFn: () => api.get(`/api/users/${id}/reviews`).then(res => res.data?.items || res.data?.content || []),
    enabled: !!id,
  });

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'SELLER') return r.reviewer.role === '구매자';
    if (activeTab === 'BUYER') return r.reviewer.role === '판매자';
    return true;
  });

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 active:scale-95 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">거래 후기 상세</h1>
      </div>

      <div className="max-w-screen-md mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-4 px-1">
          <button 
            onClick={() => setActiveTab('ALL')} 
            className={cn("flex-1 pb-3 text-sm font-semibold transition-colors border-b-2", activeTab === 'ALL' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600")}
          >
            전체후기
          </button>
          <button 
            onClick={() => setActiveTab('SELLER')} 
            className={cn("flex-1 pb-3 text-sm font-semibold transition-colors border-b-2", activeTab === 'SELLER' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600")}
          >
            판매자 후기
          </button>
          <button 
            onClick={() => setActiveTab('BUYER')} 
            className={cn("flex-1 pb-3 text-sm font-semibold transition-colors border-b-2", activeTab === 'BUYER' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600")}
          >
            구매자 후기
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="pt-2 pb-2">
              <p className="text-[15px] font-bold text-gray-900">후기 {filteredReviews.length}개</p>
            </div>
            
            {filteredReviews.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-gray-400">
                <MessageCircle size={48} className="mb-4 text-gray-200" strokeWidth={1.5} />
                <p className="text-[15px] font-medium text-gray-500">아직 후기가 없어요.</p>
              </div>
            ) : (
              <div>
                {filteredReviews.map((review) => (
                  <div key={review.id} className="relative border-b border-gray-100 py-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0 overflow-hidden relative">
                        {review.reviewer.profileImage ? (
                          <Image src={review.reviewer.profileImage} alt={review.reviewer.nickname} fill className="object-cover" />
                        ) : (
                          <User size={20} className="text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-[15px] text-gray-900">{review.reviewer.nickname}</p>
                            <p className="text-[13px] text-gray-500 mt-0.5">
                              {review.reviewer.role || '판매자'} · {review.createdAt ? formatDistanceToNow(new Date(review.createdAt.replace(' ', 'T')), { addSuffix: true, locale: ko }) : ''}
                            </p>
                          </div>
                        </div>

                        {/* Comment */}
                        <div className="text-[15px] text-gray-900 mt-2.5 leading-relaxed whitespace-pre-wrap">
                          {review.comment ? (
                            <p>{review.comment}</p>
                          ) : (
                            <p className="text-gray-400 italic text-sm">남겨진 후기 내용이 없습니다.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
