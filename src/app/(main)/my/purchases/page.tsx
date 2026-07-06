'use client';

import { useRef, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ShoppingBag, Clock } from 'lucide-react';
import { fetchMyPurchases } from '@/lib/products';
import { useAuthStore } from '@/store/auth';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProductListItem, ProductCursor } from '@/types';

import { ReviewModal } from '@/components/market/ReviewModal';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  SALE: { label: '판매중', className: 'bg-orange-500 text-white' },
  RESERVED: { label: '예약중', className: 'bg-green-500 text-white' },
  SOLD: { label: '판매완료', className: 'bg-gray-500 text-white' },
  AUCTION: { label: '경매중', className: 'bg-purple-500 text-white' },
};

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

function PurchaseCard({ product, onReviewClick }: { product: ProductListItem; onReviewClick: (p: ProductListItem) => void }) {
  const s = STATUS_MAP[product.status] ?? { label: product.status, className: 'bg-gray-100 text-gray-500' };

  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0 relative">
      <Link href={`/products/${product.id}`} className="shrink-0">
        <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100">
          {product.imageUrls?.[0] ? (
            <Image src={product.imageUrls[0]} alt={product.title} fill className="object-cover" sizes="112px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📦</div>
          )}
          {!product.isDeleted && (
            <div className="absolute top-1.5 left-1.5 z-10 flex gap-1 items-center">
              <span className={cn('inline-block text-[10px] px-1.5 py-0.5 font-bold rounded shadow-sm', s.className)}>
                {s.label}
              </span>
              {product.isAuction && (
                <span className="inline-block text-[10px] px-1.5 py-0.5 font-bold rounded shadow-sm bg-purple-500 text-white w-fit">
                  경매
                </span>
              )}
            </div>
          )}
          {product.isDeleted && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="text-white text-[10px] font-semibold text-center leading-tight">삭제된<br/>상품</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5 relative">
        <div className="flex items-start justify-between gap-1">
          <Link href={`/products/${product.id}`} className="flex-1 min-w-0">
            <p className={cn("text-[15px] leading-snug line-clamp-2 mb-1", product.isDeleted ? "text-gray-400" : "text-gray-900")}>
              {product.isDeleted && <Badge className="text-[10px] px-1.5 py-0 h-4 border-0 rounded-sm block w-fit bg-red-500 text-white mr-1.5 align-text-bottom translate-y-[-1px] inline-flex items-center">삭제</Badge>}
              {product.title}
            </p>
          </Link>
        </div>
        
        <div className="text-[12px] text-gray-400 mb-1.5 flex items-center gap-1">
          <span className="flex items-center gap-0.5">
            <Clock size={12} className="opacity-70" />
            {relativeTime(product.createdAt)}
          </span>
        </div>

        <div className="flex-1 flex items-end justify-between mt-1">
          <div>
            <p className={cn('font-bold text-[16px] tracking-tight', product.status === 'SOLD' ? 'text-gray-400' : 'text-gray-900')}>
              {product.price.toLocaleString()}원
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-gray-400">
              {product.viewCount > 0 && (
                <span className="flex items-center gap-1 text-[13px]">
                  조회 {product.viewCount}
                </span>
              )}
              {product.wishCount > 0 && (
                <span className="flex items-center gap-1 text-[13px]">
                  · 관심 {product.wishCount}
                </span>
              )}
            </div>
            {product.status === 'SOLD' && product.tradeId && !product.isReviewed && (
              <button
                onClick={() => onReviewClick(product)}
                className="text-[11px] bg-orange-500 text-white px-2.5 py-1.5 rounded shadow-sm hover:bg-orange-600 transition-colors shrink-0 font-medium"
              >
                거래 후기 남기기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyPurchasesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const bottomRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const [reviewTarget, setReviewTarget] = useState<ProductListItem | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<ProductCursor>({
      queryKey: ['myPurchases'],
      queryFn: ({ pageParam }) => fetchMyPurchases(pageParam as string | undefined),
      initialPageParam: undefined,
      getNextPageParam: (last) => last.hasMore ? last.nextCursor ?? undefined : undefined,
      enabled: !!user,
    });

  useIntersectionObserver(bottomRef, () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  });

  const products = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="pb-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">내 구매 목록</h1>
        <span className="text-sm text-gray-400 ml-auto">{products.length}건</span>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="space-y-px animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-4 border-b border-gray-100">
              <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-500">구매한 상품이 없어요</p>
          <p className="text-xs text-gray-400 mt-1">마음에 드는 물건을 찾아보세요</p>
        </div>
      )}

      {products.map((product) => (
        <PurchaseCard key={product.id} product={product} onReviewClick={setReviewTarget} />
      ))}

      <div ref={bottomRef} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {reviewTarget && reviewTarget.tradeId && reviewTarget.partnerNickname && (
        <ReviewModal
          tradeId={reviewTarget.tradeId}
          partnerNickname={reviewTarget.partnerNickname}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => {
            setReviewTarget(null);
            qc.invalidateQueries({ queryKey: ['myPurchases'] });
          }}
        />
      )}
    </div>
  );
}
