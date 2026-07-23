'use client';

import { useEffect, useRef } from 'react';
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
  // 페이지 이동마다 소켓을 재연결하지 않도록, 최신 pathname은 ref로만 읽는다.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!user?.id) return;

    const client = new Client({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webSocketFactory: () => new (SockJS as any)(WS_HTTP_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe(`/topic/user/${user.id}/chats`, (frame) => {
          const msg: ChatMessage = JSON.parse(frame.body);

          // 현재 사용자가 해당 채팅방을 보고 있지 않은 경우에만 알림 띄우기
          if (pathnameRef.current !== `/chat/${msg.roomId}`) {
            const contentPreview = msg.type === 'IMAGE' ? '사진을 보냈습니다.' : msg.content;
            
            toast.custom((t) => (
              <div
                className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100 p-3.5 w-[356px] flex items-center gap-3 cursor-pointer"
                onClick={() => { toast.dismiss(t); router.push(`/chat/${msg.roomId}`); }}
              >
                {/* 프로필 이미지 */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {msg.sender.profileImage ? (
                      <img src={msg.sender.profileImage} alt={msg.sender.nickname} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-500">{msg.sender.nickname.slice(0, 2)}</span>
                    )}
                  </div>
                  {/* 채팅 뱃지 */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                </div>
                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-[14px] truncate">{msg.sender.nickname}</p>
                  <p className="text-gray-500 text-[13px] truncate mt-0.5">{contentPreview}</p>
                </div>
                {/* 보기 버튼 */}
                <button
                  onClick={(e) => { e.stopPropagation(); toast.dismiss(t); router.push(`/chat/${msg.roomId}`); }}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-[13px] font-bold rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
                >
                  보기
                </button>
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
                <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return null;
}
