'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types';

import { getWebSocketHttpUrl } from '@/lib/utils';

const WS_HTTP_URL = getWebSocketHttpUrl();

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
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
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
          
          // 헤더 아이콘 즉시 갱신을 위해 전역 이벤트 발생
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('chatMessageReceived'));
          }
        });
        
        // 시스템 일반 알림 (좋아요, 입찰, 상태 변경 등)
        client.subscribe(`/topic/user/${user.id}/notifications`, (frame) => {
          const noti = JSON.parse(frame.body);
          toast.custom((t) => (
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 p-4 w-[356px] flex flex-col gap-2 cursor-pointer" onClick={() => toast.dismiss(t)}>
              <div className="flex justify-between items-start">
                <div className="flex flex-col flex-1 pr-4">
                  <span className="font-bold text-gray-900 text-sm">새로운 알림</span>
                  <span className="text-gray-600 text-sm mt-0.5 line-clamp-2">{noti.message}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1" />
              </div>
            </div>
          ), { duration: 5000 });

          // 헤더 종 아이콘 즉시 갱신을 위해 전역 이벤트 발생
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('notificationReceived'));
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
