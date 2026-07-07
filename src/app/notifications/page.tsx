'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Heart, Star, TrendingUp, Gavel, MessageCircle, CheckCheck, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

interface Notification {
  id: number;
  type: string;
  message: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_META: Record<string, { icon: React.ReactNode; bg: string; color: string; label: string }> = {
  LIKE: {
    icon: <Heart size={16} strokeWidth={2.5} />,
    bg: 'bg-rose-50',
    color: 'text-rose-500',
    label: '관심',
  },
  REVIEW_REQUEST: {
    icon: <Star size={16} strokeWidth={2.5} />,
    bg: 'bg-amber-50',
    color: 'text-amber-500',
    label: '후기',
  },
  OUTBID: {
    icon: <TrendingUp size={16} strokeWidth={2.5} />,
    bg: 'bg-blue-50',
    color: 'text-blue-500',
    label: '경매',
  },
  AUCTION_CLOSED: {
    icon: <Gavel size={16} strokeWidth={2.5} />,
    bg: 'bg-purple-50',
    color: 'text-purple-500',
    label: '낙찰',
  },
  CHAT_REQUEST: {
    icon: <MessageCircle size={16} strokeWidth={2.5} />,
    bg: 'bg-green-50',
    color: 'text-green-500',
    label: '채팅',
  },
};

function getTypeMeta(type: string) {
  return (
    TYPE_META[type] ?? {
      icon: <Bell size={16} strokeWidth={2.5} />,
      bg: 'bg-gray-50',
      color: 'text-gray-400',
      label: '알림',
    }
  );
}

function dateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return '오늘';
  if (isYesterday(d)) return '어제';
  return format(d, 'M월 d일', { locale: ko });
}

function groupByDate(list: Notification[]) {
  const map = new Map<string, Notification[]>();
  list.forEach((n) => {
    const key = dateLabel(n.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  });
  return Array.from(map.entries());
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await api.get<{ items: Notification[]; unreadCount: number }>('/api/notifications');
      setNotifications(res.data.items || []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const handleNotification = () => fetchNotifications();
    window.addEventListener('notificationReceived', handleNotification);
    return () => {
      window.removeEventListener('notificationReceived', handleNotification);
    };
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
      try { await api.post(`/api/notifications/${n.id}/read`); } catch { /* noop */ }
    }
    if (n.linkUrl) router.push(n.linkUrl);
  };

  const handleReadAll = async () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try { 
      await api.post('/api/notifications/read-all'); 
      toast.success('모두 읽음 처리되었습니다.');
    } catch { /* noop */ }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;
    if (!confirm('모든 알림을 삭제하시겠습니까?')) return;
    setNotifications([]);
    try { 
      await api.delete('/api/notifications/all'); 
      toast.success('모든 알림이 삭제되었습니다.');
    } catch { /* noop */ }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    try { await api.delete(`/api/notifications/${id}`); } catch { /* noop */ }
  };

  const groups = groupByDate(notifications);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-screen-md mx-auto px-2 h-[52px] flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">알림</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDeleteAll}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="모두 삭제"
            >
              <Trash2 size={20} className="text-gray-800" />
            </button>
            <button
              onClick={handleReadAll}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="모두 읽음"
            >
              <CheckCheck size={20} className="text-gray-800" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-md mx-auto w-full bg-white pb-10">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              <Bell size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400">새로운 알림이 없습니다</p>
          </div>
        ) : (
          groups.map(([label, items]) => (
            <div key={label}>
              {/* 날짜 레이블 (옵션: 당근 스타일처럼 생략할수도 있으나 구분용으로 유지) */}
              <div className="px-5 py-2.5 bg-gray-50/50">
                <span suppressHydrationWarning className="text-xs font-bold text-gray-400">
                  {label}
                </span>
              </div>

              {items.map((n) => {
                const meta = getTypeMeta(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex items-start gap-4 px-5 py-5 transition-all hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                      n.isRead ? 'opacity-50' : 'bg-white'
                    }`}
                  >
                    {/* 타입 아이콘 */}
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-1 ${meta.bg} ${meta.color}`}
                    >
                      {meta.icon}
                    </div>

                    {/* 내용 영역 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                          <span className="text-[13px] font-semibold text-gray-500">{meta.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span suppressHydrationWarning className="text-[12px] text-gray-400">
                            {n.createdAt &&
                              formatDistanceToNow(new Date(n.createdAt), {
                                addSuffix: true,
                                locale: ko,
                              })}
                          </span>
                          <div
                            onClick={(e) => handleDelete(e, n.id)}
                            className="p-1.5 -m-1.5 text-gray-300 hover:text-gray-500 transition-colors"
                            aria-label="삭제"
                            role="button"
                          >
                            <X size={16} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                      <p
                        className={`text-[15px] leading-relaxed break-keep pr-4 ${
                          !n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {n.message}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
