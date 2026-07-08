'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductListItem } from '@/types';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  RESERVED: { label: '예약중', className: 'bg-teal-50 text-teal-600 border border-teal-100' },
  SOLD: { label: '판매완료', className: 'bg-gray-100 text-gray-500' },
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
  actionMenu?: React.ReactNode;
  bottomAction?: React.ReactNode;
  customPriceArea?: React.ReactNode;
}

export default function ProductCard({ product, onLikeToggle, actionMenu, bottomAction, customPriceArea }: Props) {
  const s = STATUS_MAP[product.status];

  return (
    <div className="relative border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <div className="flex gap-4 py-4">
        {/* Thumbnail */}
        <Link href={`/products/${product.id}`} className="shrink-0">
          <div className="relative w-[110px] h-[110px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-black/5">
            {(product.isDeleted || (product as any).deleted) ? (
              <>
                {product.imageUrls?.[0] ? (
                  <Image
                    src={product.imageUrls[0]}
                    alt="삭제됨"
                    fill
                    className="object-cover"
                    sizes="110px"
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
                className="object-cover group-hover:scale-[1.02] transition-transform duration-200"
                sizes="110px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Package size={24} className="opacity-50" />
            </div>
            )}
            {!(product.isDeleted || (product as any).deleted) && (
              <div className="absolute top-1.5 left-1.5 z-10 flex gap-1 items-center flex-wrap">
                {s && (
                  <span className={cn('inline-block text-[10px] px-1.5 py-0.5 font-bold rounded shadow-sm', s.className)}>
                    {s.label}
                  </span>
                )}
                {product.isAuction && (
                  <span className="inline-block text-[10px] px-1.5 py-0.5 font-bold rounded shadow-sm bg-orange-50 text-orange-600 border border-orange-100">
                    경매
                  </span>
                )}
                {(product as any).hidden && (
                  <span className="inline-block text-[10px] px-1.5 py-0.5 font-bold rounded shadow-sm bg-gray-600 text-white">
                    숨김
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>

        {/* Content Area */}
        <div className="flex-1 min-w-0 py-0.5 flex flex-col relative">
          <div className="flex items-start justify-between gap-1">
            <Link href={`/products/${product.id}`} className="flex-1 min-w-0">
              <p className={cn('text-[16px] leading-snug text-gray-900 line-clamp-2', (product.status === 'SOLD' || product.isDeleted || (product as any).deleted) && 'text-gray-400')}>
                {product.title}
              </p>
            </Link>
            {actionMenu && (
              <div className="flex items-center shrink-0">
                {actionMenu}
              </div>
            )}
          </div>

          <div className="text-[13px] text-gray-500 mt-1 mb-1 flex items-center gap-1">
            <span suppressHydrationWarning>
              {relativeTime(product.createdAt)}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-start mt-0.5">
            {(product.isDeleted || (product as any).deleted) ? (
              <p className="font-bold text-[16px] tracking-tight text-gray-400">
                삭제된 상품입니다
              </p>
            ) : customPriceArea ? (
              customPriceArea
            ) : product.isAuction ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <p className={cn('font-bold text-[16px] tracking-tight', product.status === 'SOLD' ? 'text-gray-400' : 'text-gray-900')}>
                    {product.currentBid?.toLocaleString() ?? 0}원
                  </p>
                </div>
                {product.bidCount != null && product.bidCount > 0 && (
                  <p className={cn('text-[12px] font-medium mt-0.5', product.status === 'SOLD' ? 'text-gray-400' : 'text-orange-600')}>
                    🔥 현재 {product.bidCount}명 참여 중
                  </p>
                )}
              </div>
            ) : (
              <p className={cn('font-bold text-[16px] tracking-tight', product.status === 'SOLD' ? 'text-gray-400' : 'text-gray-900')}>
                {product.price.toLocaleString()}원
              </p>
            )}
          </div>

          {/* Likes and Views indicator (bottom right) */}
          <div className="absolute bottom-0 right-0 flex items-center gap-2.5 text-gray-400">
            {bottomAction ? (
              bottomAction
            ) : (
              <>
                {product.viewCount > 0 && (
                  <span className="flex items-center gap-1 text-[13px]">
                    <Eye size={14} /> {product.viewCount}
                  </span>
                )}
                {onLikeToggle && (
                  <button
                    onClick={(e) => { e.preventDefault(); onLikeToggle(product.id); }}
                    className={cn(
                      'flex items-center gap-1 transition-colors',
                      product.isLiked ? 'text-red-500' : 'hover:text-red-400',
                    )}
                  >
                    <Heart size={14} fill={product.isLiked ? 'currentColor' : 'none'} className={cn(product.isLiked && "text-red-500")} />
                    {product.wishCount > 0 && <span className="text-[13px]">{product.wishCount}</span>}
                  </button>
                )}
                {!onLikeToggle && product.wishCount > 0 && (
                  <span className="flex items-center gap-1 text-[13px] text-gray-400">
                    <Heart size={14} /> {product.wishCount}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
