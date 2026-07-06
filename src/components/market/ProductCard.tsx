'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProductListItem } from '@/types';

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

interface Props {
  product: ProductListItem;
  onLikeToggle?: (id: number) => void;
}

export default function ProductCard({ product, onLikeToggle }: Props) {
  const s = STATUS_MAP[product.status];

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="flex gap-4 py-3.5 px-2 border-b border-gray-100 hover:bg-gray-50 transition-colors">
        {/* Product Image */}
        <div className="relative w-[108px] h-[108px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
          {product.isDeleted ? (
            <>
              {product.imageUrls?.[0] ? (
                <Image
                  src={product.imageUrls[0]}
                  alt="삭제됨"
                  fill
                  className="object-cover"
                  sizes="108px"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <span className="text-white text-[12px] font-bold px-2 py-1 text-center leading-tight">삭제된<br />상품</span>
              </div>
            </>
          ) : product.imageUrls?.[0] ? (
            <Image
              src={product.imageUrls[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="108px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
          )}
          {!product.isDeleted && (
            <div className="absolute top-1.5 left-1.5 z-10 flex gap-1 items-center">
              <span className={cn('inline-block text-[10px] px-1.5 py-0.5 font-bold rounded shadow-sm', s.className)}>
                {s.label}
              </span>
              {product.isAuction && (
                <span className="inline-block text-[10px] px-1.5 py-0.5 font-bold rounded shadow-sm bg-purple-500 text-white">
                  경매
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 py-0.5 flex flex-col relative">
          <p className={cn('text-[15px] leading-snug text-gray-900 line-clamp-2 mb-1', (product.status === 'SOLD' || product.isDeleted) && 'text-gray-400')}>
            {product.title}
          </p>

          <div className="text-[12px] text-gray-400 mb-1.5 flex items-center gap-1">
            <span className="flex items-center gap-0.5">
              <Clock size={12} className="opacity-70" />
              {relativeTime(product.createdAt)}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            {product.isDeleted ? (
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-[16px] tracking-tight text-gray-400">
                  삭제된 상품입니다
                </p>
              </div>
            ) : product.isAuction ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-[16px] text-gray-900 tracking-tight">
                    {product.currentBid?.toLocaleString() ?? 0}원
                  </p>
                </div>
                {product.bidCount != null && product.bidCount > 0 && (
                  <p className="text-[12px] font-medium text-orange-600 mt-0.5">
                    🔥 현재 {product.bidCount}명 참여 중
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <p className={cn('font-bold text-[16px] tracking-tight', product.status === 'SOLD' ? 'text-gray-400' : 'text-gray-900')}>
                  {product.price.toLocaleString()}원
                </p>
              </div>
            )}
          </div>

          {/* Likes and Views indicator (bottom right) */}
          <div className="absolute bottom-0 right-0 flex items-center gap-2 text-gray-400">
            {product.viewCount > 0 && (
              <span className="flex items-center gap-1 text-[13px]">
                조회 {product.viewCount}
              </span>
            )}
            <button
              onClick={(e) => { e.preventDefault(); onLikeToggle?.(product.id); }}
              className={cn(
                'flex items-center gap-1 transition-colors',
                product.isLiked ? 'text-red-500' : 'hover:text-red-400',
              )}
            >
              <Heart size={15} fill={product.isLiked ? 'currentColor' : 'none'} className={cn(product.isLiked && "text-red-500")} />
              {product.wishCount > 0 && <span className="text-[13px]">{product.wishCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
