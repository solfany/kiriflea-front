'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { logout } from '@/lib/auth';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronRight, Heart, ShoppingBag, MessageCircle, LogOut, Gavel, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileEditModal } from '@/components/market/ProfileEditModal';
import { MannerRankModal } from '@/components/market/MannerRankModal';
import { ContactDeveloperModal } from '@/components/market/ContactDeveloperModal';
import Image from 'next/image';
import { getMannerRank } from '@/lib/utils';
import pkg from '../../../../package.json';

const MENU_ITEMS = [
  { href: '/my/listings',  icon: ShoppingBag,   label: '내 판매 목록' },
  { href: '/my/purchases', icon: ShoppingBag,   label: '내 구매 내역' },
  { href: '/my/bids',      icon: Gavel,         label: '내 입찰 내역' },
  { href: '/wishlist',     icon: Heart,         label: '찜 목록' },
  { href: '/chat',         icon: MessageCircle, label: '채팅' },
];

export default function MyPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const { data: userInfo } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => api.get(`/api/users/${user?.id}`).then(res => res.data),
    enabled: !!user?.id,
  });

  const displayUser = userInfo || user;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 백엔드 실패해도 로컬 클리어
    } finally {
      clearAuth();
      toast.success('로그아웃 됐습니다.');
      router.replace('/login');
    }
  };

  useEffect(() => {
    if (mounted && !user) router.replace('/login');
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

  return (
    <div>
      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500 flex-shrink-0 overflow-hidden border border-gray-100">
            {displayUser.profileImage ? (
              <Image src={displayUser.profileImage} alt="프로필 이미지" fill className="object-cover" sizes="64px" />
            ) : (
              displayUser.nickname.slice(0, 2)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900 text-lg">{displayUser.nickname}</p>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-colors"
              >
                프로필 수정
              </button>
            </div>
            <p className="text-sm text-gray-500 truncate">{displayUser.email}</p>
            <div className="mt-1.5">
              <span className="text-xs text-gray-500 font-medium">
                매너 {displayUser.mannerScore.toFixed(1)}점 <span className="text-orange-500">({getMannerRank(displayUser.mannerScore)})</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-gray-900">{displayUser.listingCount}</p>
            <p className="text-xs text-gray-400">판매 내역</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-orange-500">{getMannerRank(displayUser.mannerScore)}</p>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
              <span>매너 계급</span>
              <button onClick={() => setIsRankModalOpen(true)} className="hover:text-gray-600 transition-colors">
                <Info size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        {MENU_ITEMS.map(({ href, icon: Icon, label }, i) => (
          <div key={href}>
            {i > 0 && <Separator />}
            <Link
              href={href}
              className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <Icon size={18} className="text-gray-500" />
              <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          </div>
        ))}
      </div>

      {/* 고객지원 메뉴 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle size={18} className="text-gray-500" />
          <span className="flex-1 text-left text-sm font-medium text-gray-800">개발자 문의하기</span>
          <ChevronRight size={16} className="text-gray-300" />
        </button>
      </div>

      {/* 로그아웃 */}
      <Button
        variant="outline"
        className="w-full h-12 text-base font-medium text-gray-500 border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors mb-6"
        onClick={handleLogout}
      >
        <LogOut size={16} className="mr-2" />
        로그아웃
      </Button>

      {/* 버전 정보 */}
      <div className="text-center text-xs text-gray-400 mb-8">
        버전 {pkg.version}
      </div>

      {isEditModalOpen && (
        <ProfileEditModal onClose={() => setIsEditModalOpen(false)} />
      )}
      {isRankModalOpen && (
        <MannerRankModal onClose={() => setIsRankModalOpen(false)} />
      )}
      {isContactModalOpen && (
        <ContactDeveloperModal onClose={() => setIsContactModalOpen(false)} />
      )}
    </div>
  );
}
