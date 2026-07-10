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
import { ReviewModal } from '@/components/market/ReviewModal';
import { ChevronLeft, Send, Loader2, Handshake, Plus, MoreVertical, Package } from 'lucide-react';
import { toast } from 'sonner';
import { cn, getWebSocketHttpUrl, getMannerRank } from '@/lib/utils';
import { useConfirmStore } from '@/store/confirm';
import type { ChatMessage, ChatRoom, PageResponse } from '@/types';

const WS_HTTP_URL = getWebSocketHttpUrl();

// 이미지 리사이즈 및 WebP 압축을 수행하는 유틸리티
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const MAX_SIZE = 1080;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(newFile);
        },
        'image/webp',
        0.8
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
  });
};

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
    productIsAuction: r.product.isAuction || false,
    partnerMannerScore: r.partner.mannerScore
  };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

const renderMessageContent = (content: string, isMine: boolean = true) => {
  if (content.startsWith('[안내]')) {
    const text = content.replace(/^\[안내\]\s*(🎉|🤝|🔄)?\s*/, '');
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <div className="flex flex-col min-w-[220px]">
        <div className={cn("font-bold text-[14.5px] pb-2.5 border-b border-dashed mb-2.5 whitespace-nowrap tracking-tight", isMine ? "border-white/40 text-white" : "border-gray-300 text-gray-900")}>
          끼리플리 안내톡 ✨
        </div>
        <div className={cn("leading-relaxed", isMine ? "text-white" : "text-gray-800")}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </div>
      </div>
    );
  }
  return content;
};

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {


  const roomIdNum = Number(params.roomId);
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { openConfirm } = useConfirmStore();

  const [newMessages, setNewMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const stompRef = useRef<Client | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  const { data: room } = useQuery({
    queryKey: ['chatRoom', roomIdNum],
    queryFn: () => fetchRoomInfo(roomIdNum),
  });

  const { data: trade } = useQuery({
    queryKey: ['trade', room?.productId],
    queryFn: () => api.get(`/api/trades/products/${room?.productId}`).then(res => res.data?.data ?? null).catch(() => null),
    enabled: !!room?.productId,
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

  // Invalidate chat rooms list and read notifications on mount or when roomIdNum changes
  useEffect(() => {
    qc.invalidateQueries({ queryKey: ['chatRooms'] });
    window.dispatchEvent(new Event('chatRead'));
  }, [roomIdNum, qc]);

  // Restore scroll position when fetching next page (pagination)
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

  const hasInitialScrolled = useRef(false);

  useEffect(() => {
    hasInitialScrolled.current = false;
  }, [roomIdNum]);

  // Scroll to bottom on initial message load
  useEffect(() => {
    if (messages.length > 0 && !hasInitialScrolled.current) {
      bottomRef.current?.scrollIntoView();
      hasInitialScrolled.current = true;
    }
  }, [messages]);

  const tradeMutation = useMutation({
    mutationFn: () => api.post('/api/trades', {
      productId: room?.productId,
      buyerId: room?.partnerId,
    }),
    onSuccess: () => {
      if (stompRef.current?.connected) {
        stompRef.current.publish({
          destination: `/app/chat/${roomIdNum}`,
          body: JSON.stringify({
            content: `[안내] ${user?.nickname}님이 ${room?.partnerNickname}님과\n**'${room?.productTitle}'** 상품의 거래를 **완료**했어요!`
          }),
        });
      }
      toast.success(`${room?.partnerNickname}님과 거래를 완료했습니다!`);
      qc.invalidateQueries({ queryKey: ['chatRoom', roomIdNum] });
      qc.invalidateQueries({ queryKey: ['trade', room?.productId] }).then(() => {
        setShowReviewModal(true);
      });
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
    onSuccess: (data, status) => {
      if (stompRef.current?.connected) {
        let msg = '';
        if (status === 'RESERVED') {
          msg = `[안내] ${user?.nickname}님이 ${room?.partnerNickname}님에게 물건을 판매하도록 **'${room?.productTitle}'** 상품을 **예약중**으로 변경했어요!`;
        } else if (status === 'SALE') {
          msg = `[안내] ${user?.nickname}님이 **'${room?.productTitle}'** 상품의 예약을 **취소**했어요.`;
        }
        if (msg) {
          stompRef.current.publish({
            destination: `/app/chat/${roomIdNum}`,
            body: JSON.stringify({ content: msg }),
          });
        }
      }
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
    const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new (SockJS as any)(`${WS_HTTP_URL}?token=${token}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
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
  }, [roomIdNum, user?.id, user?.email, accessToken, qc]);

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
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !stompRef.current?.connected) return;

    try {
      // 모바일 대용량 파일 업로드 실패 및 HEIC 파일 문제를 방지하기 위해 업로드 전 리사이즈/WebP 압축 적용
      const compressedFile = await compressImage(file);
      const { url: imageUrl } = await uploadImage(compressedFile);

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

  const isTradeWithPartner = trade && (
    (trade.buyerId === user?.id && trade.sellerId === room?.partnerId) ||
    (trade.sellerId === user?.id && trade.buyerId === room?.partnerId)
  );

  const hasReviewed = trade && (
    (trade.buyerId === user?.id && trade.buyerReviewed) ||
    (trade.sellerId === user?.id && trade.sellerReviewed)
  );

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
            <DropdownMenuTrigger className="p-1.5 -mr-1.5 rounded-full hover:bg-gray-100 text-gray-700 outline-none">
              <MoreVertical size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 !ring-0 !outline-none border-t-0">
              <DropdownMenuItem
                onClick={() => {
                  openConfirm({
                    title: '채팅방을 나가면 채팅 목록 및 대화 내용이\n삭제되고 복구할 수 없어요.\n채팅방에서 나가시겠어요?',
                    confirmText: '네, 나갈래요',
                    onConfirm: () => {
                      deleteRoomMutation.mutate();
                    }
                  });
                }}
                className="text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 cursor-pointer rounded-none px-4 py-2 text-sm focus:outline-none"
              >
                삭제하기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.success('신고가 접수되었습니다.');
                }}
                className="cursor-pointer text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-700 rounded-none px-4 py-2 text-sm focus:outline-none"
              >
                신고하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 상품 정보 배너 */}
      {room && (
        <div className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
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
                    <span className="text-white text-[8px] font-bold px-1 text-center leading-tight">삭제된<br />상품</span>
                  </div>
                </>
              ) : room.productThumbnail ? (
                <Image src={room.productThumbnail} alt="상품 이미지" fill className="object-cover" sizes="40px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package size={16} className="opacity-50" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              {room.productIsDeleted ? (
                <p className="text-sm font-semibold text-gray-500">삭제된 상품입니다.</p>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-sm">
                    {(room.productStatus !== 'SALE' || room.productIsAuction) && (
                      <span className="font-bold text-gray-900 shrink-0">
                        {room.productStatus === 'SOLD' ? '거래완료' : room.productStatus === 'RESERVED' ? '예약중' : room.productIsAuction ? '경매' : ''}
                      </span>
                    )}
                    <span className="text-gray-900 truncate">
                      {room.productTitle}
                    </span>
                  </div>
                  <div className="mt-0.5">
                    <span className={cn("text-sm font-bold", room.productStatus === 'SOLD' ? "text-gray-400" : "text-gray-900")}>
                      {room.productPrice?.toLocaleString() ?? 0}원
                    </span>
                  </div>
                </>
              )}
            </div>
          </Link>

          {!room.productIsDeleted && (
            <div className="flex gap-1.5 shrink-0 ml-2">
              {isTradeWithPartner && !hasReviewed && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[13px] bg-white text-gray-700 border-gray-200 px-3 font-semibold shadow-sm hover:bg-gray-50 rounded-[10px]"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowReviewModal(true);
                  }}
                >
                  후기 보내기
                </Button>
              )}

              {room.isSeller && room.productStatus === 'SALE' && !room.productHasTrade && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[13px] bg-white text-gray-700 border-gray-200 px-3 font-semibold shadow-sm hover:bg-gray-50 rounded-[10px]"
                  onClick={(e) => {
                    e.preventDefault();
                    statusMutation.mutate('RESERVED');
                  }}
                  disabled={statusMutation.isPending}
                >
                  예약하기
                </Button>
              )}

              {room.isSeller && room.productStatus === 'RESERVED' && !room.productHasTrade && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[13px] bg-white text-gray-700 border-gray-200 px-3 font-semibold shadow-sm hover:bg-gray-50 rounded-[10px]"
                  onClick={(e) => {
                    e.preventDefault();
                    statusMutation.mutate('SALE');
                  }}
                  disabled={statusMutation.isPending}
                >
                  예약 취소
                </Button>
              )}

              {room.isSeller && room.productStatus !== 'SOLD' && !room.productHasTrade && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[13px] bg-white text-gray-700 border-gray-200 px-3 font-semibold shadow-sm hover:bg-gray-50 rounded-[10px]"
                  onClick={(e) => {
                    e.preventDefault();
                    openConfirm({
                      title: `${room.partnerNickname}님과 거래를 완료하시겠습니까?`,
                      confirmText: '거래 완료',
                      onConfirm: () => tradeMutation.mutate()
                    });
                  }}
                  disabled={tradeMutation.isPending}
                >
                  거래 완료하기
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
                  <span suppressHydrationWarning className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
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
                      'px-3.5 py-2.5 rounded-2xl text-[14px] leading-relaxed overflow-hidden whitespace-pre-wrap',
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
                      renderMessageContent(msg.content, isMine)
                    )}
                  </div>
                  <div className={cn("flex items-center gap-1 px-1", isMine ? "justify-end" : "justify-start")}>
                    {isMine && !msg.isRead && (
                      <span className="text-[10px] font-bold text-orange-500">1</span>
                    )}
                    <span suppressHydrationWarning className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
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

      {/* 빠른 인사말 칩 (입력창 위) */}
      {messages.length === 0 && !isLoading && !room?.productIsDeleted && (
        <div className="flex-shrink-0 bg-white px-4 pt-2 pb-2">
          <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-1">
            {['안녕하세요! 😊', '아직 판매 중이신가요?', '제가 살게요!', '직거래 가능한가요?'].map(text => (
              <button 
                key={text}
                onClick={() => {
                  setInput(text);
                  setTimeout(() => {
                    if (stompRef.current?.connected) {
                      stompRef.current.publish({
                        destination: `/app/chat/${roomIdNum}`,
                        body: JSON.stringify({ content: text }),
                      });
                      setInput('');
                    }
                  }, 50);
                }}
                className="flex-shrink-0 px-3.5 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[13px] font-medium hover:bg-orange-100 transition-colors border border-orange-100"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력창 */}
      <div className="flex-shrink-0 bg-white px-4 py-3 flex items-end gap-2">
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

      {showReviewModal && trade && (
        <ReviewModal
          tradeId={trade.id}
          partnerNickname={room?.partnerNickname || ''}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}
