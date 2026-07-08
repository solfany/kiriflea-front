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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ProductCard from '@/components/market/ProductCard';

import { ReviewModal } from '@/components/market/ReviewModal';

function PurchaseCard({ product, onReviewClick }: { product: ProductListItem; onReviewClick: (p: ProductListItem) => void }) {
  const bottomAction = product.status === 'SOLD' && product.tradeId && !product.isReviewed ? (
    <button
      onClick={(e) => { e.preventDefault(); onReviewClick(product); }}
      className="text-[11px] bg-orange-500 text-white px-2.5 py-1.5 rounded shadow-sm hover:bg-orange-600 transition-colors shrink-0 font-medium"
    >
      거래 후기 남기기
    </button>
  ) : undefined;

  return (
    <ProductCard 
      product={product} 
      bottomAction={bottomAction} 
    />
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
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 active:scale-95 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">내 구매 목록</h1>
        <span className="text-sm text-gray-400 ml-auto">{products.length}건</span>
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

      {/* Empty */}
      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4">
            🛒
          </div>
          <p className="text-base font-semibold text-gray-700">구매한 상품이 없어요</p>
          <p className="text-sm text-gray-400 mt-1.5">따뜻한 거래를 통해 원하던 물건을 찾아보세요!</p>
          <Link
            href="/"
            className="mt-6 px-6 py-3 bg-orange-500 text-white text-[15px] font-bold rounded-full shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
          >
            홈으로 가기
          </Link>
        </div>
      )}

      {products.map((product) => (
        <PurchaseCard key={product.id} product={product} onReviewClick={setReviewTarget} />
      ))}

      <div ref={bottomRef} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <LoadingSpinner size="sm" />
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
