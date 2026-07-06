'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types';

const WS_HTTP_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/ws';

export function GlobalNotification() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const client = new Client({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webSocketFactory: () => new (SockJS as any)(token ? `${WS_HTTP_URL}?token=${token}` : WS_HTTP_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/user/${user.id}/chats`, (frame) => {
          const msg: ChatMessage = JSON.parse(frame.body);
          
          // 현재 사용자가 해당 채팅방을 보고 있지 않은 경우에만 알림 띄우기
          if (pathname !== `/chat/${msg.roomId}`) {
            const contentPreview = msg.type === 'IMAGE' ? '사진을 보냈습니다.' : msg.content;
            
            toast.custom((t) => (
              <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 p-4 w-[356px] flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col w-[200px]">
                    <span className="font-bold text-gray-900 text-sm truncate">{msg.sender.nickname}</span>
                    <span className="text-gray-600 text-sm mt-0.5 truncate">{contentPreview}</span>
                  </div>
                  <button 
                    onClick={() => {
                      toast.dismiss(t);
                      router.push(`/chat/${msg.roomId}`);
                    }}
                    className="px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors shrink-0"
                  >
                    보기
                  </button>
                </div>
              </div>
            ), { duration: 5000 });
          }
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [user, pathname, router]);

  return null;
}
