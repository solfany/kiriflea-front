'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Search, PlusSquare, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const NAV = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/search', icon: Search, label: '검색' },
  { href: '/sell', icon: PlusSquare, label: '등록' },
  { href: '/chat', icon: MessageCircle, label: '채팅' },
  { href: '/my', icon: User, label: '내 정보' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await api.get<{ unreadCount: number }>('/api/chat/unread-count');
        setUnreadCount(res.data.unreadCount || 0);
      } catch {
        // silent
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    const handleMessage = () => fetchUnreadCount();
    window.addEventListener('chatMessageReceived', handleMessage);
    window.addEventListener('chatRead', handleMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('chatMessageReceived', handleMessage);
      window.removeEventListener('chatRead', handleMessage);
    };
  }, [user]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
      <div className="max-w-screen-md mx-auto flex h-14">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                active ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600',
              )}
            >
              <div className="relative">
                {active ? (
                  <Image src="/images/logo/raccoon-mascot-logo-sm.png" alt={label} width={24} height={24} className="object-contain shrink-0" />
                ) : (
                  <Icon size={21} strokeWidth={1.8} />
                )}
                {href === '/chat' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white box-content">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="font-medium scale-90">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
