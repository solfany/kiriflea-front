'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const NAV = [
  { href: '/',         icon: Home,       label: '홈' },
  { href: '/search',   icon: Search,     label: '검색' },
  { href: '/register', icon: PlusSquare, label: '등록' },
  { href: '/chat',     icon: MessageCircle, label: '채팅' },
  { href: '/my',       icon: User,       label: '내 정보' },
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
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
      <nav className="mx-auto max-w-md w-[calc(100%-2rem)] mb-4 sm:mb-6 bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 rounded-full pointer-events-auto">
        <div className="flex h-16 items-center justify-between px-2">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex-1 flex flex-col items-center justify-center h-full transition-all duration-300',
                  active ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                  active ? "bg-orange-50" : "bg-transparent"
                )}>
                  <Icon size={24} strokeWidth={active ? 2.5 : 1.8} className={cn("transition-transform duration-300", active && "scale-110")} />
                  {href === '/chat' && unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white box-content shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "absolute bottom-1 font-bold text-[10px] transition-all duration-300",
                  active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                )}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
