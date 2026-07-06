'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { uploadImage } from '@/lib/products';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronLeft, Send, Loader2, Handshake, Plus, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ChatMessage, ChatRoom, PageResponse } from '@/types';

const WS_HTTP_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/ws';

async function fetchMessages(roomId: number, pageParam: number = 0): Promise<PageResponse<ChatMessage>> {
  const res = await api.get<PageResponse<ChatMessage>>(`/api/chat/rooms/${roomId}/messages?page=${pageParam}&size=20`);
  return res.data;
}

async function fetchRoomInfo(roomId: number) {
  const res = await api.get<ChatRoom>(`/api/chat/rooms/${roomId}`);
  const r = res.data;
  return { 
    id: r.id, 
    partnerNickname: r.partner.nickname, 
    partnerId: r.partner.id,
    productTitle: r.product.title,
    productId: r.product.id,
    isSeller: r.product.isSeller,
    productThumbnail: r.product.thumbnailUrl,
    productPrice: r.product.price,
    productStatus: r.product.status,
    productIsDeleted: r.product.isDeleted || (r.product as any).deleted || false,
    productHasTrade: r.product.hasTrade || false,
    partnerMannerScore: r.partner.mannerScore
  };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function getMannerRank(score: number) {
  if (score >= 50) return '달인';
  if (score >= 40) return '우수';
  if (score >= 36) return '일반';
  return '초보';
}

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  
  
  const roomIdNum = Number(params.roomId);
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const stompRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  const { data: room } = useQuery({
    queryKey: ['chatRoom', roomIdNum],
    queryFn: () => fetchRoomInfo(roomIdNum),
  });

  const { data: historyData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['chatMessages', roomIdNum],
    queryFn: ({ pageParam = 0 }) => fetchMessages(roomIdNum, pageParam as number),
    getNextPageParam: (lastPage) => {
      if (!lastPage.last) return lastPage.number + 1;
      return undefined;
    },
    initialPageParam: 0,
  });

  const messages = React.useMemo(() => {
    const map = new Map<number, ChatMessage>();
    if (historyData) {
      historyData.pages.forEach(page => {
        page.content.forEach(m => map.set(m.id, m));
      });
    }
    newMessages.forEach(m => map.set(m.id, m));
    return Array.from(map.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [historyData, newMessages]);

  useEffect(() => {
    if (scrollRef.current && prevScrollHeight > 0) {
      const newScrollHeight = scrollRef.current.scrollHeight;
      scrollRef.current.scrollTop = newScrollHeight - prevScrollHeight;
      setPrevScrollHeight(0);
    }
  }, [messages, prevScrollHeight]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight } = e.currentTarget;
    if (scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      setPrevScrollHeight(scrollHeight);
      fetchNextPage();
    }
  };

  useEffect(() => {
    if (messages.length > 0 && prevScrollHeight === 0 && newMessages.length === 0) {
      bottomRef.current?.scrollIntoView();
    }
  }, [messages, prevScrollHeight, newMessages]);

  const tradeMutation = useMutation({
    mutationFn: () => api.post('/api/trades', {
      productId: room?.productId,
      buyerId: room?.partnerId,
    }),
    onSuccess: () => {
      toast.success(`${room?.partnerNickname}님과 거래를 완료했습니다!`);
      router.push(`/products/${room?.productId}?review=true`);
      qc.invalidateQueries({ queryKey: ['chatRoom', roomIdNum] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: unknown) => {
      toast.error((err as any)?.response?.data?.message || '실패했습니다.');
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: () => api.delete(`/api/chat/rooms/${roomIdNum}`),
    onSuccess: () => {
      toast.success('채팅방이 삭제되었습니다.');
      router.replace('/chat');
      qc.invalidateQueries({ queryKey: ['chatRooms'] });
    },
    onError: () => toast.error('채팅방 삭제에 실패했습니다.'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/api/products/${room?.productId}/status`, { status }),
    onSuccess: () => {
      toast.success('상태가 변경되었습니다.');
      qc.invalidateQueries({ queryKey: ['chatRoom', roomIdNum] });
      qc.invalidateQueries({ queryKey: ['product', room?.productId] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: unknown) => {
      console.error('Status mutation failed:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any)?.response?.data?.message || (err as any)?.message || '상태 변경에 실패했습니다.');
    },
  });

  // STOMP 연결
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const client = new Client({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webSocketFactory: () => new (SockJS as any)(token ? `${WS_HTTP_URL}?token=${token}` : WS_HTTP_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        
        // 채팅 메시지 수신
        client.subscribe(`/topic/chat/${roomIdNum}`, (frame) => {
          const msg: ChatMessage = JSON.parse(frame.body);
          setNewMessages((prev) => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          
          // 상대방이 보낸 메시지면 읽음 처리 요청
          if (msg.sender.id !== user?.id) {
            client.publish({ destination: `/app/chat/${roomIdNum}/read` });
          }
        });

        // 읽음 처리 수신
        client.subscribe(`/topic/chat/${roomIdNum}/read`, (frame) => {
          const payload = JSON.parse(frame.body);
          if (payload.type === 'READ' && payload.reader !== user?.email) {
            setNewMessages(prev => prev.map(m => 
              (!m.isRead && m.sender.id === user?.id) ? { ...m, isRead: true } : m
            ));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            qc.setQueryData(['chatMessages', roomIdNum], (oldData: any) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                pages: oldData.pages.map((p: any) => ({
                  ...p,
                  content: p.content.map((m: ChatMessage) => (!m.isRead && m.sender.id === user?.id) ? { ...m, isRead: true } : m)
                }))
              };
            });
          }
        });

        // 연결 직후 안 읽은 메시지 읽음 처리 요청
        client.publish({ destination: `/app/chat/${roomIdNum}/read` });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
      stompRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomIdNum, user?.id, user?.email]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || !stompRef.current?.connected) return;

    stompRef.current.publish({
      destination: `/app/chat/${roomIdNum}`,
      body: JSON.stringify({ content }),
    });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !stompRef.current?.connected) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { url: imageUrl } = await uploadImage(file);
      
      stompRef.current.publish({
        destination: `/app/chat/${roomIdNum}`,
        body: JSON.stringify({ content: imageUrl, type: 'IMAGE' }),
      });
    } catch (err: unknown) { 
      console.error('Image upload error:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((err as any)?.response?.data?.message || '이미지 업로드에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white max-w-screen-md mx-auto relative border-x border-gray-50">
      {/* 헤더 */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-gray-100 bg-white relative">
        <div className="flex items-center z-10">
          <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100">
            <ChevronLeft size={22} className="text-gray-700" />
          </button>
        </div>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="font-semibold text-gray-900 text-[15px] leading-tight">
            {room?.partnerNickname ?? '채팅'}
          </p>
          {room?.partnerMannerScore !== undefined && (
            <p className="text-[11px] text-gray-500 mt-0.5">
              매너 {room.partnerMannerScore.toFixed(1)}점 ({getMannerRank(room.partnerMannerScore)})
            </p>
          )}
        </div>

        <div className="flex items-center z-10">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="p-1.5 -mr-1.5 rounded-full hover:bg-gray-100 text-gray-700">
                <MoreVertical size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white rounded-xl shadow-lg border border-gray-100 p-1">
              <DropdownMenuItem 
                onClick={() => setShowDeleteModal(true)}
                className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-lg px-3 py-2.5 text-sm"
              >
                삭제하기
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  toast.success('신고가 접수되었습니다.');
                }}
                className="cursor-pointer focus:bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-700"
              >
                신고하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 상품 정보 배너 */}
      {room && (
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <Link href={`/products/${room.productId}`} className="flex-1 flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
            <div className="relative w-10 h-10 rounded-md overflow-hidden bg-white border border-gray-200 flex-shrink-0">
              {room.productIsDeleted ? (
                <>
                  {room.productThumbnail ? (
                    <Image src={room.productThumbnail} alt="삭제됨" fill className="object-cover" sizes="40px" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <span className="text-white text-[8px] font-bold px-1 text-center leading-tight">삭제된<br/>상품</span>
                  </div>
                </>
              ) : room.productThumbnail ? (
                <Image src={room.productThumbnail} alt="상품 이미지" fill className="object-cover" sizes="40px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              {room.productIsDeleted ? (
                <p className="text-sm font-semibold text-gray-500">삭제된 상품입니다.</p>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', 
                      room.productStatus === 'SOLD' ? 'bg-gray-500 text-white' :
                      room.productStatus === 'RESERVED' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white')}>
                      {room.productStatus === 'SOLD' ? '판매완료' : room.productStatus === 'RESERVED' ? '예약중' : '판매중'}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {room.productPrice?.toLocaleString() ?? 0}원
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{room.productTitle}</p>
                </>
              )}
            </div>
          </Link>
          {room.isSeller && !room.productIsDeleted && !room.productHasTrade && (
            <div className="flex gap-1.5 shrink-0">
              {room.productStatus !== 'SALE' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs bg-white text-gray-700 border-gray-200 px-2"
                  onClick={() => statusMutation.mutate('SALE')}
                  disabled={statusMutation.isPending}
                >
                  판매중
                </Button>
              )}
              {room.productStatus !== 'RESERVED' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs bg-white text-gray-700 border-gray-200 px-2"
                  onClick={() => statusMutation.mutate('RESERVED')}
                  disabled={statusMutation.isPending}
                >
                  예약중
                </Button>
              )}
              {room.productStatus !== 'SOLD' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs bg-white text-gray-700 border-gray-200 px-2"
                  onClick={() => {
                    if (confirm(`${room.partnerNickname}님과 거래를 완료하시겠습니까?`)) {
                      tradeMutation.mutate();
                    }
                  }}
                  disabled={tradeMutation.isPending}
                >
                  <Handshake size={14} className="mr-1" /> 거래 완료
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 메시지 목록 */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3" 
        ref={scrollRef} 
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {(isLoading || isFetchingNextPage) && (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gray-300" />
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = msg.sender.id === user?.id;
          
          // 날짜 구분선 로직
          const currentDate = new Date(msg.createdAt).toLocaleDateString();
          const prevDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toLocaleDateString() : null;
          const showDateSeparator = currentDate !== prevDate;
          
          return (
            <div key={msg.id} className="flex flex-col gap-3">
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                    {new Date(msg.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                  </span>
                </div>
              )}
              <div className={cn('flex items-end gap-2', isMine ? 'flex-row-reverse' : 'flex-row')}>
                {!isMine && (
                  msg.sender.profileImage ? (
                    <Image src={msg.sender.profileImage} alt={msg.sender.nickname} width={32} height={32} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-gray-500">
                      {msg.sender.nickname.slice(0, 2)}
                    </div>
                  )
                )}
                <div className={cn('max-w-[70%]', isMine ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                  {!isMine && (
                    <span className="text-xs text-gray-400 px-1">{msg.sender.nickname}</span>
                  )}
                  <div
                    className={cn(
                      'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed overflow-hidden',
                      isMine
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm',
                      msg.type === 'IMAGE' && 'p-0 bg-transparent'
                    )}
                  >
                    {msg.type === 'IMAGE' ? (
                      <div 
                        className="relative w-48 h-48 rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
                        onClick={() => setSelectedImage(msg.content)}
                      >
                        <Image src={msg.content} alt="전송된 이미지" fill className="object-cover" />
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <div className={cn("flex items-center gap-1 px-1", isMine ? "justify-end" : "justify-start")}>
                    {isMine && !msg.isRead && (
                      <span className="text-[10px] font-bold text-orange-500">1</span>
                    )}
                    <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {messages.length === 0 && !isLoading && (
          <div className="flex justify-center py-12">
            <p className="text-sm text-gray-300">대화를 시작해보세요</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3 flex items-end gap-2">
        <label className={cn("flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors", room?.productIsDeleted ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer")}>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={room?.productIsDeleted} />
          <Plus size={22} />
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={room?.productIsDeleted ? "삭제된 상품은 채팅할 수 없습니다" : "메시지를 입력하세요"}
          disabled={room?.productIsDeleted}
          rows={1}
          className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 max-h-32 overflow-y-auto disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          style={{ lineHeight: '1.5' }}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || !connected || room?.productIsDeleted}
          className="flex-shrink-0 w-10 h-10 p-0 bg-orange-500 hover:bg-orange-600 rounded-full disabled:opacity-40"
        >
          <Send size={16} />
        </Button>
      </div>

      {/* 이미지 크게 보기 모달 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-2xl aspect-square">
            <Image 
              src={selectedImage} 
              alt="확대된 이미지" 
              fill 
              className="object-contain" 
            />
          </div>
          <button 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 rounded-full"
            onClick={() => setSelectedImage(null)}
          >
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-[#242428] rounded-[20px] p-6 w-full max-w-[320px] flex flex-col shadow-2xl">
            <p className="text-[#E5E5EA] text-[16px] leading-[1.6] mb-8 font-medium whitespace-pre-line tracking-tight">
              채팅방을 나가면 채팅 목록 및 대화 내용이{"\n"}
              삭제되고 복구할 수 없어요.{"\n"}
              채팅방에서 나가시겠어요?
            </p>
            <div className="flex gap-2.5">
              <button
                className="flex-1 py-3.5 rounded-xl text-[#E5E5EA] font-semibold bg-[#3A3A3C] hover:bg-[#4A4A4C] transition-colors text-[15px]"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button
                className="flex-1 py-3.5 rounded-xl text-white font-semibold bg-[#FF3B30] hover:bg-[#FF453A] transition-colors text-[15px]"
                disabled={deleteRoomMutation.isPending}
                onClick={() => {
                  deleteRoomMutation.mutate();
                  setShowDeleteModal(false);
                }}
              >
                네, 나갈래요.
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
