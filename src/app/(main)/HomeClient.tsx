'use client';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { fetchProducts, toggleLike } from '@/lib/products';
import ProductCard from '@/components/market/ProductCard';
import ProductSkeleton from '@/components/market/ProductSkeleton';
import TrendingScroll from '@/components/market/TrendingScroll';
import MainVideoBanner from '@/components/market/MainVideoBanner';
import CategoryFilter from '@/components/market/CategoryFilter';
import { useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Category, ProductCursor, ProductListItem } from '@/types';
import FloatingMenu from '@/components/layout/FloatingMenu';

export default function HomeClient() {
  const [category, setCategory] = useState<Category | undefined>();
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery<ProductCursor>({
    queryKey: ['products', category],
    queryFn: ({ pageParam }) =>
      fetchProducts({ cursor: pageParam as string | undefined, limit: 20, category, sort: 'LATEST' }),
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  useIntersectionObserver(bottomRef, () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  });

  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ['products', category] });
      qc.setQueryData(['products', category], (old: { pages: ProductCursor[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((p: ProductListItem) =>
              p.id === productId
                ? { ...p, isLiked: !p.isLiked, wishCount: p.isLiked ? p.wishCount - 1 : p.wishCount + 1 }
                : p,
            ),
          })),
        };
      });
    },
  });

  const products = data?.pages.flatMap((p) => p.items) ?? [];

  // ProductCard가 React.memo인데도 여기서 매 렌더마다 새 함수를 만들어 넘기면 memo가
  // 무력화되어 좋아요 하나 누를 때마다 목록 전체가 다시 렌더링된다. mutate 자체가
  // 안정적인 참조이므로 그대로 넘긴다.
  const { mutate: toggleLikeMutate } = likeMutation;
  const handleLikeToggle = useCallback((id: number) => toggleLikeMutate(id), [toggleLikeMutate]);

  return (
    <div>
      <TrendingScroll />
      <MainVideoBanner />
      <CategoryFilter value={category} onChange={setCategory} />

      <div>
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => <ProductSkeleton key={i} />)
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onLikeToggle={handleLikeToggle}
            />
          ))
        )}
      </div>

      <div ref={bottomRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      )}

      {!hasNextPage && products.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-8">모든 상품을 확인했습니다</p>
      )}

      {products.length === 0 && !isFetchingNextPage && (
        <div className="flex flex-col items-center justify-center py-32 text-center font-nook tracking-[1px]">
          <div className="w-20 h-20 bg-emerald-50/50 rounded-full flex items-center justify-center mb-4">
            <Image src="/images/logo/raccoon-mascot-hi.png" alt="no products" width={40} height={40} className="object-contain" />
          </div>
          <p className="text-[17px] font-semibold text-gray-700">등록된 상품이 없다구리!</p>
          <p className="text-[15px] text-gray-500 mt-1.5">가장 먼저 상품을 등록해 보라구리!</p>
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingMenu />
    </div>
  );
}
