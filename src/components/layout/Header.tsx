'use client';
import Link from 'next/link';
import { Search, MessageCircleHeart } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeaderNotifications } from './HeaderNotifications';

export default function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-screen-md mx-auto px-4 h-[52px] flex items-center justify-between">

        {/* 로고 */}
        <Link href="/" className="flex items-center gap-1.5 group">
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-orange-50 transition-transform group-hover:scale-105 shrink-0">
            <MessageCircleHeart
              size={19}
              className="text-orange-500"
              strokeWidth={2.2}
            />
          </div>
          <div className="flex items-baseline tracking-tight">
            <span className="font-extrabold text-[16px] text-gray-800">우리</span>
            <span className="font-black text-[17px] text-orange-500 ml-[1px]">끼리플리</span>
            <span className="font-extrabold text-[16px] text-gray-800 ml-[1px]">마켓</span>
          </div>
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
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px] font-semibold">
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
