'use client';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function HeaderNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  // 현재 페이지가 알림 페이지면 알림 배지를 숨기기 위함
  const isNotificationsPage = pathname === '/notifications';

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get<{ unreadCount: number }>('/api/notifications');
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // silent
    }
  };

  // 실시간 STOMP 연결은 GlobalNotification이 앱 전역에서 이미 하나 유지하고 있고,
  // 새 알림이 오면 'notificationReceived' 이벤트를 쏴준다. 여기서 별도 소켓을 또
  // 열면 사용자당 동일 토픽에 중복 연결이 쌓이므로, 이벤트 구독 + 폴백 폴링만 한다.
  useEffect(() => {
    fetchUnreadCount();

    // Fallback polling (1분 간격으로 완화)
    const t = setInterval(fetchUnreadCount, 60000);
    const handleNotification = () => fetchUnreadCount();
    window.addEventListener('notificationReceived', handleNotification);

    return () => {
      clearInterval(t);
      window.removeEventListener('notificationReceived', handleNotification);
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative p-1.5 rounded-full hover:bg-gray-100 transition-colors inline-block"
      aria-label="알림"
    >
      <Bell size={21} strokeWidth={1.8} className="text-gray-800" />
      {!isNotificationsPage && unreadCount > 0 && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
