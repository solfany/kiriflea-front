'use client';

import { useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Gavel, Trophy, Clock } from 'lucide-react';
import { fetchMyBids } from '@/lib/products';
import { useAuthStore } from '@/store/auth';
import type { MyBid } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import ProductCard from '@/components/market/ProductCard';

function BidCard({ bid }: { bid: MyBid }) {
  const router = useRouter();
  const endAt = bid.product.auctionEndAt ? new Date(bid.product.auctionEndAt) : null;
  const isEnded = endAt ? endAt < new Date() : false;

  const productForCard: any = {
    ...bid.product,
    imageUrls: bid.product.thumbnailUrl ? [bid.product.thumbnailUrl] : [],
    price: 0,
    isAuction: true, // Always true for bids
    createdAt: bid.createdAt || new Date().toISOString(), // Fallback if createdAt is not on product
  };

  const customPriceArea = (
    <div className="flex-1 flex flex-col justify-center gap-1.5 mt-1">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-gray-500">내 입찰가</span>
        <span className="font-semibold text-gray-900">{bid.amount.toLocaleString()}원</span>
      </div>
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-gray-500">현재 최고가</span>
        <span className={cn('font-bold', bid.isWinning ? 'text-emerald-700' : 'text-gray-700')}>
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
            <span className="flex items-center gap-0.5 text-emerald-700 font-medium text-[12px]">
              <Trophy className="w-3 h-3" /> 최고 입찰자
            </span>
          ) : (
            <span className="text-red-400 font-medium text-[12px]">경쟁 중</span>
          )}
        </div>
      </div>
    </div>
  );

  const bottomAction = endAt ? (
    <div className="flex items-center gap-1 text-[12px] text-gray-400">
      <Clock className="w-3 h-3" />
      <span suppressHydrationWarning>
        {isEnded ? '경매 종료' : `${formatDistanceToNow(endAt, { addSuffix: true, locale: ko })} 마감`}
      </span>
    </div>
  ) : undefined;

  return (
    <ProductCard
      product={productForCard}
      customPriceArea={customPriceArea}
      bottomAction={bottomAction}
    />
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
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 active:scale-95 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">입찰 내역</h1>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="space-y-px animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-gray-100">
              <div className="w-[110px] h-[110px] rounded-lg bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-5 bg-gray-100 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && bids.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center font-nook tracking-[1px]">
          <div className="w-20 h-20 bg-emerald-50/50 rounded-full flex items-center justify-center mb-4">
            <Image src="/images/logo/raccoon-mascot-hi.png" alt="no bids" width={40} height={40} className="object-contain" />
          </div>
          <p className="text-[17px] font-semibold text-gray-700">입찰 내역이 없다구리!</p>
          <p className="text-[15px] text-gray-500 mt-1.5">경매 상품에 참여해 보라구리!</p>
          <Link
            href="/"
            className="mt-6 px-6 py-3 bg-emerald-600 text-white text-[15px] font-bold rounded-full shadow-sm hover:bg-emerald-700 active:scale-95 transition-all font-sans tracking-normal"
          >
            경매 상품 보기
          </Link>
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
