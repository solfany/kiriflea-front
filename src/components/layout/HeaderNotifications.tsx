'use client';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Notification {
  id: number;
  type: string;
  message: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

export function HeaderNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await api.get<{ items: Notification[]; unreadCount: number }>('/api/notifications');
      setNotifications(res.data.items || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (n: Notification) => {
    // Optimistic update for UI instant feedback
    if (!n.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
      try {
        await api.post(`/api/notifications/${n.id}/read`);
      } catch (err) {
        console.error('Failed to read notification', err);
        // Revert on failure (optional, skipping for better UX)
      }
    }
    
    setIsOpen(false);
    if (n.linkUrl) {
      router.push(n.linkUrl);
    }
  };

  const handleReadAll = async () => {
    if (unreadCount === 0) return;
    
    setUnreadCount(0);
    setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    
    try {
      await api.post('/api/notifications/read-all');
    } catch (err) {
      console.error('Failed to read all notifications', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">알림</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-orange-500 font-medium">{unreadCount}개 안읽음</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={handleReadAll}
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  모두 읽음
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">알림이 없습니다.</div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${
                      !n.isRead ? 'bg-orange-50/50' : ''
                    }`}
                  >
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className={`text-sm ${!n.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {n.message}
                      </p>
                      {n.createdAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ko })}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
