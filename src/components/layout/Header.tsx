'use client';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeaderNotifications } from './HeaderNotifications';
import { NookLogo } from '@/components/ui/NookLogo';

export default function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-screen-md mx-auto px-4 h-[52px] flex items-center justify-between">

        {/* 로고 (로그인 했을 때도 로고 이미지 + "모여봐요 너굴상점" 텍스트가 표시됨) */}
        <Link href="/" className="flex items-center gap-1.5 group">
          <NookLogo size="md" variant="logo" />
        </Link>

        {/* 우측 액션 */}
        <div className="flex items-center gap-1">
          <Link
            href="/search"
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Search size={21} strokeWidth={1.8} className="text-gray-800" />
          </Link>
          {user && (
            <>
              <HeaderNotifications />
              <Link href="/my" className="ml-0.5">
                <Avatar className="h-7 w-7">
                  {user.profileImage && (
                    <AvatarImage
                      src={user.profileImage}
                      alt={user.nickname}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                    {user.nickname.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
