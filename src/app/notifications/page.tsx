'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, Bell, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { format, isToday, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { useConfirmStore } from '@/store/confirm';

interface Notification {
  id: number;
  type: string;
  message: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

// 당근마켓 스타일 날짜 포맷 (방금 전, 1시간 전 등)
function getRelativeTime(dateStr: string) {
  const d = new Date(dateStr);
  const diffInSeconds = Math.floor((Date.now() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 86400 * 30) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  return format(d, 'M월 d일', { locale: ko });
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

  const { openConfirm } = useConfirmStore();

  const handleDeleteAll = () => {
    if (notifications.length === 0) return;
    openConfirm({
      title: '모든 알림을 삭제하시겠습니까?',
      confirmText: '삭제하기',
      onConfirm: async () => {
        setNotifications([]);
        try { 
          await api.delete('/api/notifications/all'); 
          toast.success('모든 알림이 삭제되었습니다.');
        } catch { /* noop */ }
      }
    });
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
          <div className="flex items-center gap-3 pr-2">
            <button
              onClick={handleReadAll}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              모두 읽기
            </button>
            <button
              onClick={handleDeleteAll}
              className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              모두 삭제
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
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex flex-col gap-1.5 px-5 py-4 transition-all hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                      n.isRead ? 'opacity-60 bg-white' : 'bg-white'
                    }`}
                  >
                    {/* 타이틀 및 날짜 */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
                        <span className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          끼리플리 알림
                        </span>
                        <span suppressHydrationWarning className="text-[13px] text-gray-400">
                          {n.createdAt && getRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <div
                        onClick={(e) => handleDelete(e, n.id)}
                        className="p-1 -mr-1 text-gray-300 hover:text-gray-500 transition-colors"
                        aria-label="삭제"
                        role="button"
                      >
                        <X size={16} strokeWidth={2.5} />
                      </div>
                    </div>
                    {/* 본문 내용 */}
                    <p
                      className={`text-[15px] leading-relaxed break-keep pr-4 pl-3.5 ${
                        !n.isRead ? 'font-medium text-gray-800' : 'text-gray-600'
                      }`}
                    >
                      {n.message}
                    </p>
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
