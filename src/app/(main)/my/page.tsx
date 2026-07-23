'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { logout } from '@/lib/auth';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronRight, Heart, ShoppingBag, MessageCircle, LogOut, Gavel, Info, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileEditModal } from '@/components/market/ProfileEditModal';
import { MannerRankModal } from '@/components/market/MannerRankModal';
import { ContactDeveloperModal } from '@/components/market/ContactDeveloperModal';
import WithdrawModal from '@/components/market/WithdrawModal';
import { ReviewPreviewSection } from '@/components/market/ReviewPreviewSection';
import { MannerThermometer } from '@/components/market/MannerThermometer';
import Image from 'next/image';
import { getMannerRank } from '@/lib/utils';
import pkg from '../../../../package.json';

const MENU_ITEMS = [
  { href: '/my/listings', icon: ShoppingBag, label: '내 판매 목록' },
  { href: '/my/purchases', icon: ShoppingBag, label: '내 구매 내역' },
  { href: '/my/bids', icon: Gavel, label: '내 입찰 내역' },
  { href: '/wishlist', icon: Heart, label: '찜 목록' },
  { href: '/chat', icon: MessageCircle, label: '채팅' },
];

export default function MyPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, clearAuth } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const { data: userInfo } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => api.get(`/api/users/${user?.id}`).then(res => res.data),
    enabled: !!user?.id,
  });

  const { data: myReviews } = useQuery({
    queryKey: ['myReviews'],
    queryFn: () => api.get('/api/me/reviews').then(res => res.data?.items || res.data?.content || []),
    enabled: !!user?.id,
  });

  const displayUser = { ...user, ...userInfo };

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
      // 같은 기기에서 바로 다음 사람이 로그인할 수 있으므로, 이전 사용자의 데이터가
      // 캐시에 남아 잠깐이라도 노출되지 않도록 React Query 캐시를 전부 비운다.
      qc.clear();
      toast.success('로그아웃 됐습니다.');
      router.replace('/login');
    }
  };

  useEffect(() => {
    if (mounted && !user) {
      // 로컬 스토리지(user)는 지워졌는데 쿠키(token)가 남아있어서 미들웨어에서 튕기는 현상 방지
      // 백엔드에 명시적으로 로그아웃을 요청해 쿠키를 완전히 삭제하고 이동
      logout().catch(() => {}).finally(() => {
        window.location.href = '/login';
      });
    }
  }, [mounted, user]);

  if (!mounted || !user) return null;

  return (
    <div>
      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600 flex-shrink-0 overflow-hidden border border-gray-100">
            {displayUser.profileImage ? (
              <Image src={displayUser.profileImage} alt="프로필 이미지" fill className="object-cover" sizes="64px" />
            ) : (
              displayUser.nickname?.slice(0, 2) || '??'
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
          </div>
        </div>

        {/* 매너 온도계 UI 추가 */}
        <div className="mt-5 mb-2 px-1">
          <MannerThermometer score={displayUser.mannerScore} />
        </div>

        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-50">
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-gray-900">{displayUser.listingCount}</p>
            <p className="text-xs text-gray-400">판매 내역</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-emerald-600">
              {getMannerRank(displayUser.mannerScore)}
            </p>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
              <span>주민 매너 점수</span>
              <button onClick={() => setIsRankModalOpen(true)} className="hover:text-gray-600 transition-colors">
                <Info size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 내 리뷰 미리보기 섹션 (당근마켓 스타일) */}
      {myReviews && myReviews.length > 0 && (
        <ReviewPreviewSection reviews={myReviews} isMyPage={true} />
      )}

      {/* 메뉴 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        {MENU_ITEMS.map(({ href, icon: Icon, label }, i) => (
          <div key={href}>
            {i > 0 && <Separator />}
            <Link
              href={href}
              className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <Image src="/images/logo/raccoon-mascot-logo-sm.png" alt="logo" width={18} height={18} className="object-contain shrink-0" />
              <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          </div>
        ))}
      </div>

      {/* 사용 가이드 및 고객지원 메뉴 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <Link
          href="/my/guide"
          className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
        >
          <Image src="/images/logo/raccoon-mascot-face.png" alt="logo" width={25} height={25} className="object-contain shrink-0" />
          <span className="flex-1 text-sm font-medium text-gray-800">서비스 사용 가이드</span>
          <ChevronRight size={16} className="text-gray-300" />
        </Link>
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <Image src="/images/logo/judy-face2.png" alt="logo" width={30} height={30} className="object-contain" />
          <span className="flex-1 text-left text-sm font-medium text-gray-800">개발자 문의하기</span>
          <ChevronRight size={16} className="text-gray-300" />
        </button>
      </div>

      {/* 정식 푸터 영역 */}
      <footer className="mt-6 mb-8 px-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 grayscale opacity-60">
            <Image src="/images/logo/raccoon-mascot-logo-sm.png" alt="logo" width={20} height={20} className="object-contain shrink-0" />
            <span className="font-bold text-base text-gray-400 font-nook tracking-[1px]">모여봐요 너굴상점</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-gray-400 font-medium">
            <Link href="/terms" className="hover:text-gray-600 transition-colors">이용약관</Link>
            <span className="w-[1px] h-2.5 bg-gray-200" />
            <Link href="/privacy" className="hover:text-gray-600 transition-colors font-bold">개인정보처리방침</Link>
            <span className="w-[1px] h-2.5 bg-gray-200" />
            <Link href="/policy" className="hover:text-gray-600 transition-colors">운영정책</Link>
            <span className="w-[1px] h-2.5 bg-gray-200" />
            <button onClick={handleLogout} className="hover:text-gray-600 transition-colors">로그아웃</button>
            <span className="w-[1px] h-2.5 bg-gray-200" />
            <button onClick={() => setIsWithdrawModalOpen(true)} className="hover:text-gray-600 transition-colors">회원탈퇴</button>
          </div>

          <div className="flex flex-col gap-1 text-[10px] text-gray-400">
            <p>서비스명: 모여봐요 너굴상점 | 운영자: 김솔비</p>
            <p>이메일: solfany@krtranslink.com</p>
            <div className="flex justify-between items-center mt-2">
              <p>© 2026 Nook&apos;s Cranny. All rights reserved.</p>
              <p>앱 버전 {pkg.version}</p>
            </div>
          </div>
        </div>
      </footer>

      {isEditModalOpen && (
        <ProfileEditModal onClose={() => setIsEditModalOpen(false)} />
      )}
      {isRankModalOpen && (
        <MannerRankModal onClose={() => setIsRankModalOpen(false)} />
      )}
      {isContactModalOpen && (
        <ContactDeveloperModal onClose={() => setIsContactModalOpen(false)} />
      )}
      {isWithdrawModalOpen && (
        <WithdrawModal onClose={() => setIsWithdrawModalOpen(false)} />
      )}
    </div>
  );
}
