'use client';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyLikes, toggleLike } from '@/lib/products';
import ProductCard from '@/components/market/ProductCard';
import ProductSkeleton from '@/components/market/ProductSkeleton';
import { Heart, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { ProductCursor, ProductListItem } from '@/types';

export default function WishlistPage() {
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<ProductCursor>({
      queryKey: ['myLikes'],
      queryFn: ({ pageParam }) => fetchMyLikes(pageParam as string | undefined),
      initialPageParam: undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
    });

  useIntersectionObserver(bottomRef, () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  });

  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ['myLikes'] });
      qc.setQueryData(['myLikes'], (old: { pages: ProductCursor[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((p: ProductListItem) => p.id !== productId),
          })),
        };
      });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['myLikes'] }),
  });

  const products = data?.pages.flatMap((p) => p.items) ?? [];

  if (isLoading) {
    return (
      <div>
        <h1 className="text-lg font-bold text-gray-900 mb-4">관심 목록</h1>
        <div>
          {[1, 2, 3, 4, 5].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-900 mb-4">관심 목록</h1>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
          <Heart size={48} className="mb-3" />
          <p className="text-sm font-medium text-gray-400">찜한 상품이 없어요</p>
          <p className="text-xs text-gray-300 mt-1">마음에 드는 상품에 하트를 눌러보세요</p>
        </div>
      ) : (
        <>
          <div>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onLikeToggle={(id) => likeMutation.mutate(id)}
              />
            ))}
          </div>

          <div ref={bottomRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <Loader2 size={18} className="animate-spin text-gray-300" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
