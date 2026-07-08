'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ChevronLeft, Info, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, getMannerRank } from '@/lib/utils';
import ProductSkeleton from '@/components/market/ProductSkeleton';
import { MannerRankModal } from '@/components/market/MannerRankModal';
import { ReviewPreviewSection } from '@/components/market/ReviewPreviewSection';
import { MannerThermometer } from '@/components/market/MannerThermometer';
import { useState } from 'react';

interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  profileImage: string | null;
  createdAt: string;
  mannerScore: number;
  listingCount: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  status: string;
  imageUrls: string[];
  wishCount: number;
  viewCount: number;
  category: string;
  isAuction: boolean;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useQuery<UserProfile>({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const res = await api.get(`/api/users/${userId}`);
      return res.data;
    },
  });

  const { data: listings, isLoading: isListingsLoading } = useQuery<Product[]>({
    queryKey: ['userListings', userId],
    queryFn: async () => {
      const res = await api.get(`/api/users/${userId}/listings`);
      return res.data;
    },
  });

  const { data: userReviews } = useQuery({
    queryKey: ['userReviews', userId],
    queryFn: async () => {
      const res = await api.get(`/api/users/${userId}/reviews`);
      return res.data?.items || res.data?.content || res.data?.data || res.data || [];
    },
    enabled: !!userId,
  });

  if (isProfileLoading || isListingsLoading) {
    return (
      <div>
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-6 bg-gray-200 rounded-md" />
              <div className="w-24 h-4 bg-gray-200 rounded-md" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <ProductSkeleton />
          <ProductSkeleton />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 mb-4">사용자를 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">뒤로 가기</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">프로필</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500 flex-shrink-0 overflow-hidden border border-gray-100">
            <Image
              src={profile.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.nickname}`}
              alt={profile.nickname}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 text-lg mb-1">{profile.nickname}</h2>
            {profile.email && <p className="text-sm text-gray-500 truncate mb-1.5">{profile.email}</p>}
            <div className="flex items-center text-xs text-gray-500 gap-1">
              <p className="text-sm text-gray-500">
                가입일 {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 mb-2 px-1">
          <MannerThermometer score={profile.mannerScore} />
        </div>

        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-gray-900">{profile.listingCount}</p>
            <p className="text-xs text-gray-400">판매 내역</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-orange-500">{getMannerRank(profile.mannerScore)}</p>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
              <span>매너 계급</span>
              <button onClick={() => setIsRankModalOpen(true)} className="hover:text-gray-600 transition-colors">
                <Info size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 미리보기 섹션 (당근마켓 스타일) */}
      {userReviews && userReviews.length > 0 && (
        <ReviewPreviewSection userId={userId} reviews={userReviews} isMyPage={false} />
      )}

      {/* Listings Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 min-h-[400px] mb-4">
        <h3 className="font-bold text-gray-900 mb-4 text-lg">판매 상품 <span className="text-orange-500">{listings?.length || 0}</span></h3>

        <div className="space-y-0">
          {listings && listings.length > 0 ? (
            listings.map(product => (
              <div key={product.id} className="flex gap-3 py-4 border-b border-gray-100 last:border-0 relative">
                <Link href={`/products/${product.id}`} className="shrink-0">
          <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100">
            {product.imageUrls?.[0] ? (
              <Image src={product.imageUrls[0]} alt={product.title} fill className="object-cover" sizes="112px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={24} className="opacity-50" />
              </div>
            )}
            <div className="absolute top-1.5 left-1.5 z-10 flex gap-1 items-center">
              {product.status === 'SALE' && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 border-0 rounded-sm block w-fit bg-orange-500 text-white">판매중</Badge>
              )}
              {product.status === 'RESERVED' && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 border-0 rounded-sm block w-fit bg-green-500 text-white">예약중</Badge>
              )}
              {product.status === 'SOLD' && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 border-0 rounded-sm block w-fit bg-gray-500 text-white">판매완료</Badge>
              )}
              {product.status === 'AUCTION' && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 border-0 rounded-sm block w-fit bg-purple-500 text-white">경매중</Badge>
              )}
              {product.isAuction && product.status !== 'AUCTION' && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 border-0 rounded-sm block w-fit bg-purple-500 text-white">경매</Badge>
              )}
            </div>
                  </div>
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5 relative">
                  <div className="flex items-start justify-between gap-1">
                    <Link href={`/products/${product.id}`} className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-gray-900 line-clamp-2 mb-1">
                        {product.title}
                      </p>
                    </Link>
                  </div>

                  <div className="flex-1 flex items-end justify-between mt-1">
                    <div>
                      <p className={cn('font-bold text-[16px] tracking-tight', product.status === 'SOLD' ? 'text-gray-400' : 'text-gray-900')}>
                        {product.price.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm">등록된 판매 상품이 없습니다.</p>
            </div>
          )}
        </div>
      </div>

      {isRankModalOpen && (
        <MannerRankModal onClose={() => setIsRankModalOpen(false)} />
      )}
    </div>
  );
}
