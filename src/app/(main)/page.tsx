'use client';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { fetchProducts, toggleLike } from '@/lib/products';
import ProductCard from '@/components/market/ProductCard';
import ProductSkeleton from '@/components/market/ProductSkeleton';
import TrendingScroll from '@/components/market/TrendingScroll';
import CategoryFilter from '@/components/market/CategoryFilter';
import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Category, ProductCursor, ProductListItem } from '@/types';

export default function HomePage() {
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

  return (
    <div>
      <TrendingScroll />
      <CategoryFilter value={category} onChange={setCategory} />

      <div>
        {isLoading ? (
          [1, 2, 3, 4, 5].map((i) => <ProductSkeleton key={i} />)
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onLikeToggle={(id) => likeMutation.mutate(id)}
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
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4">
            🛍️
          </div>
          <p className="text-base font-semibold text-gray-700">등록된 상품이 없어요</p>
          <p className="text-sm text-gray-400 mt-1.5">가장 먼저 상품을 등록해 보세요!</p>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href="/sell"
        className="fixed bottom-20 right-4 z-50 flex items-center justify-center w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 hover:shadow-xl active:scale-95 transition-all"
      >
        <span className="text-3xl leading-none -mt-1">+</span>
      </a>
    </div>
  );
}
