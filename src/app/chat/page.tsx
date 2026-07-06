'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { ChatRoom } from '@/types';
import { ChevronLeft, MessageCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';

async function fetchChatRooms(): Promise<ChatRoom[]> {
  const res = await api.get<ChatRoom[]>('/api/chat/rooms');
  return res.data;
}

function relativeTime(iso?: string) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function ChatListPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: rooms = [], isLoading } = useQuery<ChatRoom[]>({
    queryKey: ['chatRooms'],
    queryFn: fetchChatRooms,
    refetchInterval: 10_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-screen-md mx-auto relative border-x border-gray-50 pb-20">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg text-gray-900">채팅</h1>
      </header>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <MessageCircle size={40} className="mb-3 text-gray-200" />
          <p className="text-sm">아직 채팅 내역이 없습니다</p>
        </div>
      ) : (
        <ul>
          {rooms.map((room) => {
            const isUnread = room.unreadCount > 0;
            return (
              <li key={room.id}>
                <Link href={`/chat/${room.id}`} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    {/* Product Image */}
                    <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100 relative border border-gray-100">
                      {room.product.isDeleted ? (
                        <>
                          {room.product.thumbnailUrl ? (
                            <Image src={room.product.thumbnailUrl} alt={room.product.title} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold text-center leading-tight">삭제된<br/>상품</span>
                          </div>
                        </>
                      ) : room.product.thumbnailUrl ? (
                        <Image src={room.product.thumbnailUrl} alt={room.product.title} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">📦</div>
                      )}
                    </div>
                    {/* Overlapping Profile Image */}
                    <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center shadow-sm">
                      {room.partner.profileImage ? (
                        <Image src={room.partner.profileImage} alt={room.partner.nickname} fill className="object-cover" sizes="32px" />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-500">{room.partner.nickname.slice(0, 2)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[15px] font-bold text-gray-900">{room.partner.nickname}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{relativeTime(room.lastMessageAt)}</span>
                    </div>
                    <p className={`text-[14px] truncate leading-snug ${isUnread ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                      {room.lastMessage ?? (room.product.isDeleted ? '삭제된 상품입니다.' : room.product.title)}
                    </p>
                  </div>

                  {isUnread && room.unreadCount > 0 && (
                    <div className="flex-shrink-0 flex items-center ml-2">
                      <span className="min-w-[20px] h-5 px-1.5 bg-orange-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <BottomNav />
    </div>
  );
}
