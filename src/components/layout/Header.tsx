'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeaderChatIcon } from './HeaderChatIcon';
import { HeaderNotifications } from './HeaderNotifications';

export default function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/images/woori_market_app_icon1.png"
              alt="우리끼리플리마켓 로고 아이콘"
              width={32}
              height={32}
              className="rounded-xl object-cover"
            />
          </div>
          <div className="flex items-baseline tracking-tight">
            <span className="font-extrabold text-[19px] text-gray-800">우리</span>
            <span className="font-black text-[20px] text-orange-500 ml-[1px]">끼리플리</span>
            <span className="font-extrabold text-[19px] text-gray-800 ml-[2px]">마켓</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/search" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Search size={20} className="text-gray-600" />
          </Link>
          <HeaderChatIcon />
          {user && (
            <>
              <HeaderNotifications />
              <Link href="/my">
                <Avatar className="h-8 w-8">
                  {user.profileImage && <AvatarImage src={user.profileImage} alt={user.nickname} className="object-cover" />}
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-semibold">
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
