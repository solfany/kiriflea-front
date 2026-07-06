'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/',         icon: Home,       label: '홈' },
  { href: '/search',   icon: Search,     label: '검색' },
  { href: '/sell',     icon: PlusSquare, label: '판매' },
  { href: '/wishlist', icon: Heart,      label: '관심' },
  { href: '/my',       icon: User,       label: '내 정보' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
      <div className="max-w-screen-md mx-auto flex">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs transition-colors',
                active ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600',
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
