'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Package, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchTrending } from '@/lib/products';
import { cn } from '@/lib/utils';
import type { TrendingProduct } from '@/types';

// 너굴상점 시그니처 선명한 뱃지 (솔리드 에메랄드 그린 & 리치 너굴 갈색)
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  RESERVED: { label: '예약중', className: 'bg-emerald-600 text-white font-bold shadow-xs' },
  SOLD: { label: '판매완료', className: 'bg-gray-600 text-white font-bold shadow-xs' },
};

export default function TrendingScroll() {
  const { data: items = [] } = useQuery<TrendingProduct[]>({
    queryKey: ['trending'],
    queryFn: fetchTrending,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="mb-4">
      <div className="flex items-center gap-1.5 mb-3">
        <TrendingUp size={16} className="text-emerald-600" />
        <h2 className="text-sm font-semibold text-gray-700">급상승 TOP 10</h2>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">
          아직 급상승 중인 상품이 없습니다.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {items.map((item) => {
            const s = STATUS_MAP[item.status];
            return (
              <Link key={item.id} href={`/products/${item.id}`} className="flex-shrink-0 w-28 group">
                <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100 mb-1.5 border border-gray-100">
                  {item.isDeleted ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-2xl">🚫</div>
                  ) : item.imageUrls?.[0] ? (
                    <Image
                      src={item.imageUrls[0]}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={24} className="opacity-50" />
                    </div>
                  )}
                  {!item.isDeleted && (
                    <div className="absolute top-1 left-1 z-10 flex gap-1 items-center flex-wrap">
                      {s && (
                        <span className={cn('inline-block text-[9px] px-1.5 py-0.5 font-bold rounded shadow-xs', s.className)}>
                          {s.label}
                        </span>
                      )}
                      {item.isAuction && (
                        <span className="inline-block text-[9px] px-1.5 py-0.5 font-bold rounded shadow-xs bg-nook-brown text-white">
                          경매
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className={cn("text-[13px] font-medium text-gray-800 line-clamp-2 leading-tight", item.status === 'SOLD' && "text-gray-400")}>
                  {item.isDeleted ? '삭제된 상품입니다.' : item.title}
                </p>
                {item.isAuction ? (
                  <div className="mt-0.5">
                    <p className="text-[13px] font-bold text-nook-brown">{item.currentBid?.toLocaleString() ?? 0}원</p>
                  </div>
                ) : (
                  <p className={cn("text-[13px] font-bold mt-0.5", item.status === 'SOLD' ? "text-gray-400" : "text-gray-900")}>
                    {item.price.toLocaleString()}원
                  </p>
                )}

                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-400">
                  {item.viewCount > 0 && <span>조회 {item.viewCount}</span>}
                  {item.viewCount > 0 && item.wishCount > 0 && <span>·</span>}
                  {item.wishCount > 0 && <span>관심 {item.wishCount}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
