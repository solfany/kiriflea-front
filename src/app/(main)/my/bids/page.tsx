'use client';

import { useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Gavel, Trophy, Clock } from 'lucide-react';
import { fetchMyBids } from '@/lib/products';
import { useAuthStore } from '@/store/auth';
import type { MyBid } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const STATUS_LABELS: Record<string, string> = {
  SALE: '판매중', AUCTION: '경매중', RESERVED: '예약중', SOLD: '판매완료',
};
const STATUS_COLORS: Record<string, string> = {
  SALE: 'text-green-600 bg-green-50',
  AUCTION: 'text-orange-600 bg-orange-50',
  RESERVED: 'text-blue-600 bg-blue-50',
  SOLD: 'text-gray-500 bg-gray-100',
};

function BidCard({ bid }: { bid: MyBid }) {
  const router = useRouter();
  const endAt = bid.product.auctionEndAt ? new Date(bid.product.auctionEndAt) : null;
  const isEnded = endAt ? endAt < new Date() : false;

  return (
    <div className="relative border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <button
        onClick={() => router.push(`/products/${bid.product.id}`)}
        className="w-full flex gap-4 py-4 text-left"
      >
        {/* Thumbnail */}
        <div className="relative w-[110px] h-[110px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-black/5">
          {bid.product.isDeleted ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-xl">🚫</span>
            </div>
          ) : bid.product.thumbnailUrl ? (
            <Image src={bid.product.thumbnailUrl} alt={bid.product.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-200" sizes="110px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gavel className="w-6 h-6 text-gray-300" />
            </div>
          )}
          {bid.isWinning && !isEnded && !bid.product.isDeleted && (
            <div className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              최고가
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5 flex flex-col relative">
          <div className="flex items-start justify-between gap-2 mb-1">
            {bid.product.isDeleted ? (
              <p className="text-[16px] leading-snug font-semibold text-gray-500 line-clamp-2">삭제된 상품입니다.</p>
            ) : (
              <p className="text-[16px] leading-snug text-gray-900 line-clamp-2">{bid.product.title}</p>
            )}
            <span className={cn('shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm', bid.product.isDeleted ? 'bg-gray-500 text-white' : STATUS_COLORS[bid.product.status] ?? 'text-gray-500 bg-gray-100')}>
              {bid.product.isDeleted ? '삭제됨' : STATUS_LABELS[bid.product.status] ?? bid.product.status}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-1.5 mt-1">
            {/* My bid vs current */}
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-gray-500">내 입찰가</span>
              <span className="font-semibold text-gray-900">{bid.amount.toLocaleString()}원</span>
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-gray-500">현재 최고가</span>
              <span className={cn('font-bold', bid.isWinning ? 'text-orange-500' : 'text-gray-700')}>
                {bid.currentHighestBid.toLocaleString()}원
              </span>
              
              <div className="ml-1 flex items-center">
                {bid.product.status === 'SOLD' ? (
                  bid.isWinning ? (
                    <span className="flex items-center gap-0.5 text-blue-500 font-medium text-[12px]">
                      <Trophy className="w-3 h-3" /> 낙찰 성공!
                    </span>
                  ) : (
                    <span className="text-gray-400 font-medium text-[12px]">낙찰 실패</span>
                  )
                ) : bid.isWinning ? (
                  <span className="flex items-center gap-0.5 text-orange-500 font-medium text-[12px]">
                    <Trophy className="w-3 h-3" /> 최고 입찰자
                  </span>
                ) : (
                  <span className="text-red-400 font-medium text-[12px]">경쟁 중</span>
                )}
              </div>
            </div>
          </div>

          {/* End time */}
          {endAt && (
            <div className="absolute bottom-0 right-0 flex items-center gap-1 text-[12px] text-gray-400">
              <Clock className="w-3 h-3" />
              <span suppressHydrationWarning>
                {isEnded ? '경매 종료' : `${formatDistanceToNow(endAt, { addSuffix: true, locale: ko })} 마감`}
              </span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

export default function MyBidsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['my-bids'],
      queryFn: ({ pageParam }) => fetchMyBids(pageParam as string | undefined),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.hasMore ? last.nextCursor ?? undefined : undefined,
      enabled: !!user,
    });

  const bids = data?.pages.flatMap((p) => p.items) ?? [];

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">입찰 내역</h1>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="space-y-px animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-4 border-b border-gray-100">
              <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && bids.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Gavel className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-500">입찰 내역이 없어요</p>
          <p className="text-xs text-gray-400 mt-1">경매 상품에 입찰하면 여기에 표시돼요</p>
        </div>
      )}

      {/* Bid list */}
      {bids.map((bid) => (
        <BidCard key={bid.id} bid={bid} />
      ))}

      <div ref={bottomRef} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <LoadingSpinner size="sm" />
        )}
      </div>
    </div>
  );
}
