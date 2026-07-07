'use client';
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export function HeaderChatIcon() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get<{ unreadCount: number }>('/api/chat/unread-count');
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch chat unread count', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    const handleMessage = () => fetchUnreadCount();
    window.addEventListener('chatMessageReceived', handleMessage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('chatMessageReceived', handleMessage);
    };
  }, []);

  return (
    <Link href="/chat" className="relative p-1.5 rounded-full hover:bg-gray-100 transition-colors">
      <MessageCircle size={19} strokeWidth={1.8} className="text-gray-800" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
