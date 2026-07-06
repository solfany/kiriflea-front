'use client';

import { useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ShoppingBag, MoreHorizontal, Clock } from 'lucide-react';
import { fetchMyListings } from '@/lib/products';
import { useAuthStore } from '@/store/auth';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProductListItem, ProductCursor } from '@/types';
import { toast } from 'sonner';

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


function ListingCard({ product, onReviewClick }: { product: ProductListItem; onReviewClick: (p: ProductListItem) => void }) {
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const s = STATUS_MAP[product.status] ?? { label: product.status, className: 'bg-gray-100 text-gray-500' };

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

  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0 relative">
      <Link href={`/products/${product.id}`} className="shrink-0">
        <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100">
          {(product.isDeleted || (product as any).deleted) ? (
            <>
              {product.imageUrls?.[0] ? (
                <Image src={product.imageUrls[0]} alt="삭제됨" fill className="object-cover" sizes="112px" />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                <span className="text-white text-[9px] font-bold px-1 text-center leading-tight">삭제된<br />상품</span>
              </div>
            </>
          ) : product.imageUrls?.[0] ? (
            <Image src={product.imageUrls[0]} alt={product.title} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📦</div>
          )}
          {!(product.isDeleted || (product as any).deleted) && (
            <div className="absolute top-1.5 left-1.5 z-10 flex gap-1 items-center">
              <span className={cn('inline-block text-[10px] px-1.5 py-0.5 font-bold rounded shadow-sm', s.className)}>
                {s.label}
              </span>
              {product.isAuction && (
                <span className="inline-block text-[10px] px-1.5 py-0.5 font-bold rounded shadow-sm bg-purple-500 text-white w-fit">
                  경매
                </span>
              )}
              {(product.isHidden || (product as any).hidden) && (
                <span className="inline-block text-[10px] px-1.5 py-0.5 font-bold rounded shadow-sm bg-gray-600 text-white w-fit">
                  숨김
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5 relative">
        <div className="flex items-start justify-between gap-1">
          <Link href={`/products/${product.id}`} className="flex-1 min-w-0">
            <p className="text-[15px] leading-snug text-gray-900 line-clamp-2 mb-1">
              {product.title}
            </p>
          </Link>
          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-0.5">
              <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="text-[12px] text-gray-400 mb-1.5 flex items-center gap-1">
          <span className="flex items-center gap-0.5">
            <Clock size={12} className="opacity-70" />
            {relativeTime(product.createdAt)}
          </span>
        </div>

        <div className="flex-1 flex items-end justify-between mt-1">
          <div>
            {product.isAuction ? (
              <div className="flex flex-col">
                <p className="text-[11px] text-gray-500">
                  시작가 {product.price.toLocaleString()}원
                </p>
                <p className="font-bold text-[16px] text-orange-600 tracking-tight leading-tight mt-0.5">
                  입찰가 {product.currentBid?.toLocaleString() ?? 0}원
                </p>
              </div>
            ) : (
              <p className={cn('font-bold text-[16px] tracking-tight', product.status === 'SOLD' ? 'text-gray-400' : 'text-gray-900')}>
                {product.price.toLocaleString()}원
              </p>
            )}
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

      {/* Status change menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-12 mt-1 w-36 bg-white border border-gray-100 shadow-lg rounded-xl z-50 overflow-hidden py-1">
            {!(product.isDeleted || (product as any).deleted) && (
              <Link
                href={`/sell?edit=${product.id}`}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                수정하기
              </Link>
            )}
            {!(product.isDeleted || (product as any).deleted) && !product.isAuction && product.status !== 'SALE' && !product.tradeId && (
              <button
                onClick={() => statusMutation.mutate('SALE')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {product.status === 'SOLD' ? '다시 판매하기' : '판매중으로 변경'}
              </button>
            )}
            {!(product.isDeleted || (product as any).deleted) && !product.isAuction && product.status !== 'RESERVED' && !product.tradeId && (
              <button
                onClick={() => statusMutation.mutate('RESERVED')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                예약중으로 변경
              </button>
            )}
            {!(product.isDeleted || (product as any).deleted) && !product.isAuction && product.status !== 'SOLD' && (
              <button
                onClick={() => statusMutation.mutate('SOLD')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                판매완료로 변경
              </button>
            )}

            <button
              onClick={() => {
                api.post(`/api/products/${product.id}/hide`)
                  .then(() => {
                    qc.invalidateQueries({ queryKey: ['myListings'] });
                    toast.success(product.isHidden ? '숨김 해제되었습니다.' : '숨김 처리되었습니다.');
                    setMenuOpen(false);
                  })
                  .catch(() => toast.error('실패했습니다.'));
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {product.isHidden ? '숨김 해제' : '숨기기'}
            </button>
            <button
              onClick={() => {
                if (confirm('정말로 삭제하시겠습니까?')) {
                  deleteMutation.mutate();
                }
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              삭제하기
            </button>
          </div>
        </>
      )}
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
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
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
          <p className="text-sm font-medium text-gray-500">판매 중인 상품이 없어요</p>
          <p className="text-xs text-gray-400 mt-1">판매하고 싶은 물건을 등록해보세요</p>
          <Link
            href="/sell"
            className="mt-4 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors"
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
            qc.invalidateQueries({ queryKey: ['myListings'] });
          }}
        />
      )}
    </div>
  );
}
