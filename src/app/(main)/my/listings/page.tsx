'use client';

import { useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ShoppingBag, MoreVertical, Clock } from 'lucide-react';
import { fetchMyListings } from '@/lib/products';
import { useAuthStore } from '@/store/auth';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ProductListItem, ProductCursor } from '@/types';
import { toast } from 'sonner';
import { useConfirmStore } from '@/store/confirm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ProductCard from '@/components/market/ProductCard';

import { ReviewModal } from '@/components/market/ReviewModal';

function ListingCard({ product, onReviewClick }: { product: ProductListItem; onReviewClick: (p: ProductListItem) => void }) {
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const { openConfirm } = useConfirmStore();

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      api.patch(`/api/products/${product.id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myListings'] });
      toast.success('상태가 변경됐습니다.');
      setMenuOpen(false);
    },
    onError: () => toast.error('상태 변경에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/products/${product.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myListings'] });
      toast.success('상품이 삭제됐습니다.');
      setMenuOpen(false);
    },
    onError: () => toast.error('삭제에 실패했습니다.'),
  });

  const actionMenu = (
    <div className="relative">
      <button onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }} className="p-1 -mr-2 -mt-1 rounded-full hover:bg-gray-100 text-gray-400">
        <MoreVertical size={20} />
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 shadow-lg rounded-xl z-50 overflow-hidden py-1">
            {/* 상태 변경 버튼들 */}
            {!(product.isDeleted || (product as any).deleted) && !product.isAuction && !product.tradeId && (
              <>
                {product.status !== 'SALE' && (
                  <button
                    onClick={(e) => { e.preventDefault(); statusMutation.mutate('SALE'); }}
                    disabled={statusMutation.isPending}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 outline-none transition-colors disabled:opacity-50"
                  >
                    {product.status === 'SOLD' ? '다시 판매하기' : '판매중으로 변경'}
                  </button>
                )}
                {product.status !== 'RESERVED' && product.status !== 'SOLD' && (
                  <button
                    onClick={(e) => { e.preventDefault(); statusMutation.mutate('RESERVED'); }}
                    disabled={statusMutation.isPending}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 outline-none transition-colors disabled:opacity-50"
                  >
                    예약중으로 변경
                  </button>
                )}
                {product.status !== 'SOLD' && (
                  <button
                    onClick={(e) => { e.preventDefault(); statusMutation.mutate('SOLD'); }}
                    disabled={statusMutation.isPending}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 outline-none transition-colors disabled:opacity-50"
                  >
                    판매완료로 변경
                  </button>
                )}
                <div className="border-b border-gray-100 my-1"></div>
              </>
            )}
            {/* 수정 / 숨김 / 삭제 */}
            {!(product.isDeleted || (product as any).deleted) && (
              <Link
                href={`/sell?edit=${product.id}`}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 outline-none transition-colors"
              >
                수정하기
              </Link>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                api.post(`/api/products/${product.id}/hide`)
                  .then(() => {
                    qc.invalidateQueries({ queryKey: ['myListings'] });
                    toast.success(product.isHidden ? '숨김 해제되었습니다.' : '숨김 처리되었습니다.');
                    setMenuOpen(false);
                  })
                  .catch(() => toast.error('실패했습니다.'));
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 outline-none transition-colors"
            >
              {product.isHidden ? '숨김 해제' : '숨기기'}
            </button>
            <button
              onClick={() => {
                openConfirm({
                  title: '정말로 삭제하시겠습니까?',
                  confirmText: '삭제하기',
                  onConfirm: () => {
                    deleteMutation.mutate();
                  }
                });
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 outline-none transition-colors"
            >
              삭제하기
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col relative">
      <ProductCard
        product={product}
        actionMenu={actionMenu}
      />
    </div>
  );
}

export default function MyListingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const bottomRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const [reviewTarget, setReviewTarget] = useState<ProductListItem | null>(null);
  const [activeTab, setActiveTab] = useState<'SALE' | 'SOLD' | 'HIDDEN'>('SALE');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<ProductCursor>({
      queryKey: ['myListings', activeTab],
      queryFn: ({ pageParam }) => fetchMyListings(pageParam as string | undefined, activeTab),
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
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 active:scale-95 transition-all">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">내 판매 목록</h1>
        <span className="text-sm text-gray-400 ml-auto">{products.length}건</span>
      </div>

      <div className="flex border-b border-gray-100 mb-4 px-1">
        {(['SALE', 'SOLD', 'HIDDEN'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 pb-3 text-sm font-semibold transition-colors border-b-2",
              activeTab === tab ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            {tab === 'SALE' ? '판매중' : tab === 'SOLD' ? '판매완료' : '숨김'}
          </button>
        ))}
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
        <div className="flex flex-col items-center justify-center py-32 text-center font-nook tracking-[1px]">
          <div className="w-20 h-20 bg-emerald-50/50 rounded-full flex items-center justify-center mb-4">
            <Image src="/images/logo/raccoon-mascot-hi.png" alt="no products" width={40} height={40} className="object-contain" />
          </div>
          <p className="text-[17px] font-semibold text-gray-700">판매 중인 상품이 없다구리!</p>
          <p className="text-[15px] text-gray-500 mt-1.5">안 쓰는 물건을 너굴상점에서 편리하게 팔아보라구리!</p>
          <Link
            href="/sell"
            className="mt-6 px-6 py-3 bg-emerald-600 font-sans tracking-normal text-white text-[15px] font-bold rounded-full shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
          >
            상품 등록하기
          </Link>
        </div>
      )}

      {products.map((product) => (
        <ListingCard key={product.id} product={product} onReviewClick={setReviewTarget} />
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
            qc.invalidateQueries({ queryKey: ['myListings'] });
          }}
        />
      )}
    </div>
  );
}
