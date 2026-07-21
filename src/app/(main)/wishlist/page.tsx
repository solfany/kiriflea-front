'use client';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMyLikes, toggleLike } from '@/lib/products';
import ProductCard from '@/components/market/ProductCard';
import ProductSkeleton from '@/components/market/ProductSkeleton';
import { Heart, Loader2, ChevronLeft, MoreVertical, Search } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { ProductCursor, ProductListItem } from '@/types';

export default function WishlistPage() {
  const router = useRouter();
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
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">관심 목록</h1>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center font-nook tracking-[1px]">
          <div className="w-20 h-20 bg-emerald-50/50 rounded-full flex items-center justify-center mb-4">
            <Image src="/images/logo/raccoon-mascot-hi.png" alt="no wishlist" width={40} height={40} className="object-contain" />
          </div>
          <p className="text-[17px] font-semibold text-gray-700">찜한 상품이 없다구리!</p>
          <p className="text-[15px] text-gray-500 mt-1.5">마음에 드는 상품을 찾아 하트를 눌러보라구리!</p>
          <Link
            href="/"
            className="mt-6 px-6 py-3 bg-emerald-600 text-white text-[15px] font-bold rounded-full shadow-sm hover:bg-emerald-700 active:scale-95 transition-all font-sans tracking-normal"
          >
            상품 둘러보기
          </Link>
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
