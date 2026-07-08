'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { fetchProduct, toggleLike, fetchComments, postComment, fetchBids, placeBid, closeAuctionEarly, reopenAuction, extendAuction, deleteProduct } from '@/lib/products';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ReviewModal } from '@/components/market/ReviewModal';
import { toast } from 'sonner';
import {
  Heart, ChevronLeft, ChevronRight, MessageCircle,
  Eye, Gavel, Wifi, WifiOff, Timer, Trash2, Lock, Share2, MoreVertical, Edit2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Product, AuctionUpdateMessage } from '@/types';
import { cn, getMannerRank, getWebSocketHttpUrl } from '@/lib/utils';
import { MannerIcon } from '@/components/market/MannerIcon';
import { useConfirmStore } from '@/store/confirm';

const STATUS_LABEL: Record<string, string> = {
  SALE: '판매중', RESERVED: '예약중', SOLD: '판매완료', AUCTION: '경매중',
};
const STATUS_COLOR: Record<string, string> = {
  SALE: 'bg-green-100 text-green-700',
  RESERVED: 'bg-orange-100 text-orange-700',
  SOLD: 'bg-gray-100 text-gray-500',
  AUCTION: 'bg-orange-100 text-orange-600',
};

export default function ProductDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { review?: string } }) {
  const productId = Number(params.id);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const { openConfirm } = useConfirmStore();

  const [imgIdx, setImgIdx] = useState(0);
  const [comment, setComment] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [extendDays, setExtendDays] = useState(1);
  const [reopenDays, setReopenDays] = useState(1);
  
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  // Fun elements state
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', productId],
    queryFn: () => fetchComments(productId),
    enabled: !!product,
  });

  const { data: bids = [] } = useQuery({
    queryKey: ['bids', productId],
    queryFn: () => fetchBids(productId),
    enabled: !!product?.isAuction,
    refetchInterval: 10_000,
  });

  const { data: trade } = useQuery({
    queryKey: ['trade', productId],
    queryFn: () => api.get(`/api/trades/products/${productId}`).then(res => res.data.data),
    enabled: product?.status === 'SOLD',
  });

  useEffect(() => {
    if (searchParams.review === 'true' && trade && user) {
      const isSellerTrade = user.id === trade.sellerId;
      const hasReviewed = isSellerTrade ? trade.sellerReviewed : trade.buyerReviewed;
      if (!hasReviewed) {
        setShowReviewModal(true);
        // Remove the query param from URL so it doesn't reopen on refresh
        router.replace(`/products/${productId}`, { scroll: false });
      }
    }
  }, [searchParams.review, trade, user, router, productId]);

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(productId),
    onSuccess: ({ liked, count }) => {
      qc.setQueryData(['product', productId], (old: Product | undefined) =>
        old ? { ...old, isLiked: liked, wishCount: count } : old,
      );
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => postComment(productId, comment, isPrivate),
    onSuccess: () => {
      setComment('');
      qc.invalidateQueries({ queryKey: ['comments', productId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => api.delete(`/api/products/${productId}/comments/${commentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', productId] });
      toast.success('댓글이 삭제되었습니다.');
    },
    onError: () => toast.error('댓글 삭제에 실패했습니다.'),
  });

  const editCommentMutation = useMutation({
    mutationFn: (data: { commentId: number; content: string; isPrivate: boolean }) =>
      api.patch(`/api/products/${productId}/comments/${data.commentId}`, { content: data.content, isPrivate: data.isPrivate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', productId] });
      setEditingCommentId(null);
      toast.success('댓글이 수정되었습니다.');
    },
    onError: () => toast.error('댓글 수정에 실패했습니다.'),
  });

  const deleteProductMutation = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      toast.success('상품이 삭제되었습니다.');
      router.replace('/my');
    },
    onError: () => toast.error('상품 삭제에 실패했습니다.')
  });

  const reopenAuctionMutation = useMutation({
    mutationFn: (days: number) => {
      const newEndAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      const isoString = newEndAt.toISOString().slice(0, 19);
      return reopenAuction(productId, isoString);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      qc.invalidateQueries({ queryKey: ['bids', productId] });
      toast.success('경매가 재시작되었습니다.');
      setShowReopenModal(false);
    },
    onError: (err: unknown) => toast.error((err as any)?.response?.data?.message || '실패했습니다.')
  });

  const extendAuctionMutation = useMutation({
    mutationFn: (days: number) => {
      const currentEndAt = product?.auctionEndAt ? new Date(product.auctionEndAt).getTime() : Date.now();
      const newEndAt = new Date(currentEndAt + days * 24 * 60 * 60 * 1000);
      const isoString = newEndAt.toISOString().slice(0, 19);
      return extendAuction(productId, isoString);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('시간이 연장되었습니다.');
      setShowExtendModal(false);
    },
    onError: (err: unknown) => toast.error((err as any)?.response?.data?.message || '실패했습니다.')
  });

  const closeAuctionEarlyMutation = useMutation({
    mutationFn: () => closeAuctionEarly(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      qc.invalidateQueries({ queryKey: ['bids', productId] });
      toast.success('조기 낙찰 처리되었습니다.');
    },
    onError: (err: unknown) => {
      toast.error((err as any)?.response?.data?.message || '조기 낙찰 처리에 실패했습니다.');
    }
  });

  const cancelEarlyCloseMutation = useMutation({
    mutationFn: () => api.post(`/api/products/${productId}/auctions/cancel-early-close`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('조기 낙찰이 취소되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '조기 낙찰 취소에 실패했습니다.');
    }
  });

  const cancelTopBidMutation = useMutation({
    mutationFn: () => api.delete(`/api/products/${productId}/auctions/top-bid`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      qc.invalidateQueries({ queryKey: ['bids', productId] });
      toast.success('최고 입찰 내역이 취소되었습니다.');
    },
    onError: (err: unknown) => {
      toast.error((err as any)?.response?.data?.message || '입찰 취소에 실패했습니다.');
    }
  });

  const completeTradeMutation = useMutation({
    mutationFn: () => api.post('/api/trades', {
      productId: product?.id,
      buyerId: product?.buyerId
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('거래가 완료되었습니다.');
    },
    onError: () => toast.error('거래 완료 처리에 실패했습니다.'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/api/products/${productId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('판매 상태가 변경되었습니다.');
    },
    onError: (err: unknown) => {
      toast.error((err as any)?.response?.data?.message || '상태 변경에 실패했습니다.');
    }
  });

  const chatMutation = useMutation({
    mutationFn: () =>
      api.post<{ id: number }>('/api/chat/rooms', {
        sellerId: product?.seller.id,
        productId,
      }),
    onSuccess: (res) => router.push(`/chat/${res.data.id}`),
    onError: () => toast.error('채팅방 개설에 실패했습니다.'),
  });

  const sellerChatMutation = useMutation({
    mutationFn: () =>
      api.post<{ id: number }>('/api/chat/rooms/seller-initiate', {
        buyerId: product?.buyerId,
        productId,
      }),
    onSuccess: (res) => router.push(`/chat/${res.data.id}`),
    onError: () => toast.error('채팅방 개설에 실패했습니다.'),
  });

  const bidMutation = useMutation({
    mutationFn: () => placeBid(productId, Number(bidAmount)),
    onSuccess: () => {
      setBidAmount('');
      toast.success('입찰 완료!');
      qc.invalidateQueries({ queryKey: ['bids', productId] });
      qc.invalidateQueries({ queryKey: ['product', productId] });
    },
    onError: () => toast.error('입찰에 실패했습니다. 현재 최고가보다 높은 금액을 입력해주세요.'),
  });

  // STOMP real-time subscription for auction products
  const [stompConnected, setStompConnected] = useState(false);
  const stompRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!product?.isAuction) return;

    if (['SOLD', 'RESERVED'].includes(product.status) || ['CLOSED', 'CANCELLED'].includes(product.auctionStatus || '')) {
      setTimeLeft('마감됨');
    } else if (product.auctionEndAt) {
      const interval = setInterval(() => {
        const diff = new Date(product.auctionEndAt!).getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft('마감됨');
          clearInterval(interval);
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${h}시간 ${m}분 ${s}초`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [product?.isAuction, product?.auctionEndAt, product?.status, product?.auctionStatus]);

  useEffect(() => {
    if (!product?.isAuction) return;
    const token = localStorage.getItem('access_token') ?? '';
    const wsUrl = getWebSocketHttpUrl();

    const client = new Client({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webSocketFactory: () => new (SockJS as any)(token ? `${wsUrl}?token=${token}` : wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setStompConnected(true);
        client.subscribe(`/topic/product/${productId}/auction`, (msg) => {
          try {
            const update: AuctionUpdateMessage = JSON.parse(msg.body);
            qc.setQueryData<Product>(['product', productId], (old) =>
              old ? { ...old, currentBid: update.currentBid } : old,
            );
            qc.invalidateQueries({ queryKey: ['bids', productId] });

            // Trigger pulse animation
          } catch { /* ignore */ }
        });
      },
      onDisconnect: () => setStompConnected(false),
    });

    client.activate();
    stompRef.current = client;
    return () => { client.deactivate(); };
  }, [product?.isAuction, productId, qc]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  if (!product) return <div className="p-8 text-center text-gray-400">상품을 찾을 수 없습니다.</div>;

  if (product.isDeleted || (product as any).deleted) {
    return (
      <div className="min-h-screen bg-white max-w-screen-md mx-auto flex flex-col items-center justify-center p-8">
        <div className="text-6xl mb-4 opacity-70">🗑️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">삭제된 상품입니다.</h2>
        <p className="text-sm text-gray-500 mb-6">판매자에 의해 삭제되어 더 이상 볼 수 없는 상품이에요.</p>
        <Button onClick={() => router.back()} className="bg-orange-500 hover:bg-orange-600 px-6">
          뒤로 가기
        </Button>
      </div>
    );
  }

  const images = product.imageUrls;
  const isSeller = user?.id === product.seller.id;

  return (
    <div className="min-h-screen bg-white max-w-screen-md mx-auto relative">

      {/* Image gallery */}
      <div className="relative bg-gray-100 aspect-square">
        {images.length > 0 ? (
          <Image src={images[imgIdx]} alt={product.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">📦</div>
        )}
        <button onClick={() => router.back()} className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors">
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* Menu moved to profile area */}
        </div>
        {images.length > 1 && (
          <>
            <button onClick={() => setImgIdx((i) => Math.max(0, i - 1))} disabled={imgIdx === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setImgIdx((i) => Math.min(images.length - 1, i + 1))} disabled={imgIdx === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={cn('w-1.5 h-1.5 rounded-full transition-colors', i === imgIdx ? 'bg-white' : 'bg-white/40')} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-4 pb-32">
        {/* Profile and Menu */}
        <div className="flex items-center justify-between py-3 mt-2 -mx-4 px-4 rounded-xl hover:bg-gray-50 transition-colors relative">
          <Link href={isSeller ? '/my' : `/users/${product.seller.id}`} className="flex items-center gap-3 flex-1 cursor-pointer">
            {product.seller.profileImage ? (
              <Image src={product.seller.profileImage} alt={product.seller.nickname} width={40} height={40} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-orange-600 flex-shrink-0">
                {product.seller.nickname.slice(0, 2)}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{product.seller.nickname}</p>
              <div className="flex flex-col gap-0.5 text-xs text-gray-400 mt-0.5">
                <span>매너 점수 {product.seller.mannerScore.toFixed(1)}점</span>
                <div className="flex items-center gap-1">
                  <span className="text-orange-500 font-medium flex items-center gap-1">
                    <MannerIcon score={product.seller.mannerScore} className="w-3.5 h-3.5" />
                    {getMannerRank(product.seller.mannerScore)}
                  </span>
                  <span>· 판매 {product.seller.listingCount}건</span>
                </div>
              </div>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 outline-none">
              <MoreVertical size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-100 rounded-xl shadow-lg !ring-0 !outline-none p-1">
              <DropdownMenuItem
                className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer rounded-lg text-sm text-gray-700 font-medium"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('상품 링크가 복사되었습니다.');
                }}
              >
                <Share2 size={16} className="text-gray-500" />
                공유하기
              </DropdownMenuItem>
              {isSeller && !(product.isDeleted || (product as any).deleted) && (
                <>
                  <Separator className="my-1 bg-gray-100" />
                  {!product.isAuction && (
                    <>
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer rounded-lg text-sm text-gray-700 font-medium"
                        onClick={() => statusMutation.mutate('SALE')}
                      >
                        상태: 판매중으로 변경
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer rounded-lg text-sm text-gray-700 font-medium"
                        onClick={() => statusMutation.mutate('RESERVED')}
                      >
                        상태: 예약중으로 변경
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer rounded-lg text-sm text-gray-700 font-medium"
                        onClick={() => statusMutation.mutate('SOLD')}
                      >
                        상태: 판매완료로 변경
                      </DropdownMenuItem>
                      <Separator className="my-1 bg-gray-100" />
                    </>
                  )}
                  <DropdownMenuItem
                    className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer rounded-lg text-sm text-gray-700 font-medium"
                    onClick={() => router.push(`/sell?edit=${product.id}`)}
                  >
                    <Edit2 size={16} className="text-gray-500" />
                    수정하기
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 p-3 hover:bg-red-50 cursor-pointer rounded-lg text-sm text-red-600 font-medium"
                    onClick={() => {
                      openConfirm({
                        title: '이 상품을 정말 삭제하시겠습니까?\n(복구할 수 없습니다)',
                        confirmText: '삭제하기',
                        onConfirm: () => {
                          deleteProductMutation.mutate();
                        }
                      });
                    }}
                  >
                    <Trash2 size={16} className="text-red-500" />
                    삭제하기
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />
        {/* Status + title */}
        <div className="pt-4 pb-3">
          {product.status === 'SOLD' && product.buyerNickname && (
            <div className="text-gray-600 font-bold text-sm mb-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              🏆 {product.buyerNickname}님과 거래가 완료되었습니다.
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900 flex items-center flex-wrap gap-2">
            {product.status === 'SOLD' && (
              <span className="text-sm px-2 py-0.5 rounded-md font-bold bg-gray-100 text-gray-500 tracking-tight">
                판매완료
              </span>
            )}
            {product.status === 'RESERVED' && (
              <span className="text-sm px-2 py-0.5 rounded-md font-bold bg-teal-50 text-teal-600 border border-teal-100 tracking-tight">
                예약중
              </span>
            )}
            {product.isAuction && product.auctionStatus === 'CANCELLED' && (
              <span className="text-sm px-2 py-0.5 rounded-md font-bold bg-gray-100 text-gray-500 border border-gray-200 tracking-tight">
                유찰
              </span>
            )}
            {product.isAuction && product.auctionStatus !== 'CANCELLED' && (
              <span className="text-sm px-2 py-0.5 rounded-md font-bold bg-orange-50 text-orange-500 border border-orange-100 tracking-tight">
                경매
              </span>
            )}
            {product.isHidden && (
              <span className="text-sm px-2 py-0.5 rounded-md font-bold bg-gray-100 text-gray-500 tracking-tight">
                숨김
              </span>
            )}
            {product.title}
          </h1>
        </div>

        {/* Trade Information (if SOLD) */}
        {product.status === 'SOLD' && trade && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">🎉 거래 완료</p>
              <p className="text-xs text-gray-600">
                <span className="font-semibold text-gray-900">{trade.buyerNickname}</span>님이 구매하셨습니다!
              </p>
            </div>
            {user && (user.id === trade.sellerId || user.id === trade.buyerId) && (
              (() => {
                const isSellerTrade = user.id === trade.sellerId;
                const hasReviewed = isSellerTrade ? trade.sellerReviewed : trade.buyerReviewed;

                if (hasReviewed) {
                  return (
                    <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-md">
                      리뷰 작성 완료
                    </div>
                  );
                }

                return (
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 shadow-sm" onClick={() => setShowReviewModal(true)}>
                    거래 후기 남기기
                  </Button>
                );
              })()
            )}
          </div>
        )}

        {/* Description */}
        <div className="py-1">
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Eye size={12} /> {product.viewCount}</span>
            <span className="flex items-center gap-1"><Heart size={12} /> {product.wishCount}</span>
          </div></div>

        {/* Auction section */}
        {product.isAuction && (
          <>
            <Separator />
            <div className="py-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Gavel size={16} className="text-gray-500" /> {product.status === 'SOLD' ? '경매 결과' : '경매 입찰'}
                {stompConnected
                  ? <span className="flex items-center gap-1 text-[10px] text-gray-500 font-normal ml-auto"><Wifi size={11} />실시간</span>
                  : <span className="flex items-center gap-1 text-[10px] text-gray-400 font-normal ml-auto"><WifiOff size={11} />연결 중</span>
                }
              </h3>
              {product.currentBid !== undefined && (
                <div className="rounded-2xl px-5 py-4 mb-4 flex items-center justify-between bg-gray-50 border border-gray-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium mb-1 text-gray-500">
                      {product.status === 'SOLD' ? '최종 낙찰가' : '현재 최고가'}
                    </span>
                    <span className="text-2xl font-black tracking-tight text-gray-900">
                      {product.currentBid.toLocaleString()}원
                    </span>
                  </div>
                  {timeLeft && (
                    <div className="flex flex-col items-end text-orange-500">
                      <span className="text-[10px] font-bold flex items-center gap-1">
                        <Timer size={10} /> 남은 시간
                      </span>
                      <span className="text-sm font-black tabular-nums tracking-tight">{timeLeft}</span>
                    </div>
                  )}
                </div>
              )}

              {bids.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3 max-h-48 overflow-y-auto border border-gray-100">
                  {bids.slice(0, 5).map((bid, i) => (
                    <div key={bid.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                          i === 0 ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500")}>
                          {i + 1}
                        </div>
                        <span className="text-gray-600 font-medium">{bid.bidder.nickname}</span>
                      </div>
                      <span className={cn("font-bold", i === 0 ? "text-gray-900 text-base" : "text-gray-500")}>
                        {bid.amount.toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!(product.isDeleted || (product as any).deleted) && user && !isSeller && product.status === 'SALE' && product.auctionStatus === 'ACTIVE' && timeLeft !== '마감됨' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bidAmount ? Number(bidAmount).toLocaleString() : ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d]/g, '');
                      if (!val || Number(val) <= 1000000000) setBidAmount(val);
                    }}
                    maxLength={13}
                    placeholder={`${((product.currentBid ?? product.price) + 1000).toLocaleString()}원 이상`}
                    className="flex-1 border border-gray-200 rounded-xl px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <Button onClick={() => bidMutation.mutate()} disabled={!bidAmount || Number(bidAmount) < ((product.currentBid ?? product.price) + 1000) || bidMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-sm font-semibold h-10 px-4 rounded-xl">
                    입찰
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Comments */}
        <Separator />
        <div className="py-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle size={16} className="text-gray-500" />
            댓글 {comments.length}
          </h3>
          <div className="space-y-4 mb-4">
            {comments.map((c) => {
              const d = new Date(c.createdAt);
              const diff = (Date.now() - d.getTime()) / 1000;
              let dateStr = `${d.getMonth() + 1}월 ${d.getDate()}일`;
              if (diff < 60) dateStr = '방금 전';
              else if (diff < 3600) dateStr = `${Math.floor(diff / 60)}분 전`;
              else if (diff < 86400) dateStr = `${Math.floor(diff / 3600)}시간 전`;

              return (
                <div key={c.id} className="flex gap-3 relative">
                  <Link href={user?.id === c.author.id ? '/my' : `/users/${c.author.id}`} className="shrink-0">
                    {c.author.profileImage ? (
                      <Image src={c.author.profileImage} alt={c.author.nickname} width={32} height={32} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-gray-500 hover:bg-gray-200 transition-colors">
                        {c.author.nickname.slice(0, 2)}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                        {c.author.nickname}
                        {c.isPrivate && <Lock size={12} className="text-gray-400" />}
                      </span>
                      {c.author.id === product.seller.id && (
                        <span className="text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-sm font-semibold">작성자</span>
                      )}
                      <span className="text-[10px] text-gray-400">{dateStr}</span>
                    </div>
                    {editingCommentId === c.id ? (
                      <div className="mt-2 space-y-2 pr-4">
                        <div className="flex items-start gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-gray-500 mt-2.5 flex-shrink-0 cursor-pointer">
                            <input type="checkbox" checked={editIsPrivate} onChange={(e) => setEditIsPrivate(e.target.checked)} className="w-3 h-3" />
                            비공개
                          </label>
                          <input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="flex-1 border border-gray-200 rounded-xl px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                            autoFocus
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingCommentId(null)} className="h-8 text-xs">취소</Button>
                          <Button size="sm" onClick={() => editCommentMutation.mutate({ commentId: c.id, content: editContent, isPrivate: editIsPrivate })} disabled={!editContent.trim() || editCommentMutation.isPending} className="bg-orange-500 hover:bg-orange-600 h-8 text-xs text-white">수정 완료</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 mt-0.5 pr-8">{c.content}</p>
                    )}
                  </div>
                  {user && c.author.id === user.id && editingCommentId !== c.id && (
                    <div className="absolute right-0 top-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 text-gray-400 hover:bg-gray-100 rounded-full transition-colors outline-none">
                          <MoreVertical size={16} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 bg-white border border-gray-100 rounded-xl shadow-lg !ring-0 !outline-none p-1">
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded-lg text-sm text-gray-700"
                            onClick={() => {
                              setEditingCommentId(c.id);
                              setEditContent(c.content);
                              setEditIsPrivate(c.isPrivate);
                            }}
                          >
                            <Edit2 size={14} className="text-gray-500" />
                            수정하기
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-2 hover:bg-red-50 cursor-pointer rounded-lg text-sm text-red-600"
                            onClick={() => {
                              openConfirm({
                                title: '댓글을 삭제하시겠습니까?',
                                confirmText: '삭제하기',
                                onConfirm: () => {
                                  deleteCommentMutation.mutate(c.id);
                                }
                              });
                            }}
                          >
                            <Trash2 size={14} className="text-red-500" />
                            삭제하기
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {!(product.isDeleted || (product as any).deleted) && product.status !== 'SOLD' && user && (
            <div className="flex items-start gap-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 mt-2.5 flex-shrink-0 cursor-pointer">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="w-3 h-3" />
                비공개
              </label>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                className="flex-1 border border-gray-200 rounded-xl px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                onKeyDown={(e) => { if (e.key === 'Enter' && comment.trim()) commentMutation.mutate(); }}
              />
              <Button size="sm" onClick={() => commentMutation.mutate()} disabled={!comment.trim() || commentMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-sm font-semibold h-10 px-4 rounded-xl">
                등록
              </Button>
            </div>
          )}
        </div>
      </div>

      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">경매 마감시간 연장</h3>
            <p className="text-sm text-gray-500 mb-4">현재 마감시간에서 며칠을 더 연장하시겠습니까?</p>
            <div className="flex gap-2 mb-6">
              {[1, 3, 7].map(days => (
                <button
                  key={days}
                  onClick={() => setExtendDays(days)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors",
                    extendDays === days ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-gray-200 text-gray-600"
                  )}
                >
                  +{days}일
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-11" onClick={() => setShowExtendModal(false)}>취소</Button>
              <Button
                className="flex-1 h-11 bg-orange-500 hover:bg-orange-600"
                disabled={extendAuctionMutation.isPending}
                onClick={() => extendAuctionMutation.mutate(extendDays)}
              >
                연장하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">경매 재시작</h3>
            <p className="text-sm text-gray-500 mb-2">기존 입찰 내역과 낙찰자가 모두 취소되고, 경매가 다시 시작됩니다.</p>
            <p className="text-sm text-gray-500 mb-4 font-medium text-orange-500">오늘부터 며칠 뒤로 마감시간을 설정할까요?</p>
            <div className="flex gap-2 mb-6">
              {[1, 3, 7].map(days => (
                <button
                  key={days}
                  onClick={() => setReopenDays(days)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors",
                    reopenDays === days ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-gray-200 text-gray-600"
                  )}
                >
                  {days}일 뒤
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-11" onClick={() => setShowReopenModal(false)}>취소</Button>
              <Button
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white"
                disabled={reopenAuctionMutation.isPending}
                onClick={() => reopenAuctionMutation.mutate(reopenDays)}
              >
                재시작 확정
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      {!(product.isDeleted || (product as any).deleted) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex flex-wrap gap-2 z-10 max-w-screen-md mx-auto w-full">
          {!isSeller && product.status !== 'SOLD' ? (
            <>
              <button
                onClick={() => user ? likeMutation.mutate() : router.push('/login')}
                className={cn('flex flex-col items-center gap-0.5 text-xs px-2', product.isLiked ? 'text-red-500' : 'text-gray-400')}
              >
                <Heart size={22} fill={product.isLiked ? 'currentColor' : 'none'} />
                <span>{product.wishCount}</span>
              </button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold"
                onClick={() => user ? chatMutation.mutate() : router.push('/login')}
                disabled={chatMutation.isPending}
              >
                채팅으로 연락하기
              </Button>
            </>
          ) : !isSeller && product.status === 'SOLD' && (
            <Button disabled className="flex-1 bg-gray-300 text-white h-12 text-base font-semibold">
              판매 완료된 상품입니다
            </Button>
          )}

          {isSeller && product.status === 'RESERVED' && product.isAuction && product.buyerId && (
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold text-white"
              onClick={() => sellerChatMutation.mutate()}
              disabled={sellerChatMutation.isPending}
            >
              낙찰자와 채팅하기
            </Button>
          )}

          {isSeller && product.status === 'RESERVED' && product.isAuction && (
            <div className="flex gap-2 w-full">
              {product.auctionStatus === 'CLOSED' && (
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-base font-semibold border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    openConfirm({
                      title: '조기 낙찰을 취소하시겠습니까?\n(경매가 다시 진행됩니다.)',
                      confirmText: '낙찰 취소',
                      onConfirm: () => cancelEarlyCloseMutation.mutate()
                    });
                  }}
                  disabled={cancelEarlyCloseMutation.isPending}
                >
                  조기 낙찰 취소
                </Button>
              )}
              <Button
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-12 text-base font-semibold text-white"
                onClick={() => {
                  openConfirm({
                    title: '실제 거래가 완료되었습니까?\n확인 시 판매완료 처리됩니다.',
                    confirmText: '거래완료',
                    onConfirm: () => {
                      completeTradeMutation.mutate();
                    }
                  });
                }}
                disabled={completeTradeMutation.isPending}
              >
                거래완료로 변경
              </Button>
            </div>
          )}

          {isSeller && product.isAuction && product.status === 'SALE' && product.auctionStatus !== 'CANCELLED' && (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 h-12 text-base font-semibold border-gray-200 text-gray-700"
                onClick={() => setShowExtendModal(true)}
              >
                시간 연장
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 h-12 text-base font-semibold text-white"
                onClick={() => {
                  if (product.bidCount === 0) {
                    toast.error('입찰자가 없어 조기 낙찰할 수 없습니다.');
                    return;
                  }
                  openConfirm({
                    title: '현재 최고가로 경매를 종료하고\n낙찰하시겠습니까?',
                    confirmText: '낙찰하기',
                    onConfirm: () => {
                      closeAuctionEarlyMutation.mutate();
                    }
                  });
                }}
                disabled={product.bidCount === 0 || closeAuctionEarlyMutation.isPending}
              >
                {product.bidCount === 0 ? '입찰자 없음' : '조기 낙찰'}
              </Button>
            </div>
          )}

          {isSeller && product.isAuction && (
            (product.auctionStatus === 'CANCELLED') ||
            (!product.hasTrade && (product.status === 'RESERVED' || product.status === 'SOLD'))
          ) && (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-base font-semibold border-gray-200 text-gray-700"
                  onClick={() => setShowReopenModal(true)}
                >
                  다시 경매 시작
                </Button>
                {product.auctionStatus !== 'CANCELLED' && (product.bidCount ?? 0) > 0 ? (
                  <Button
                    variant="outline"
                    className="flex-1 h-12 text-base font-semibold border-red-200 text-red-500 hover:bg-red-50"
                    onClick={() => {
                      openConfirm({
                        title: '최고 입찰 내역을 취소하시겠습니까?\n(차순위 입찰가로 변경되며, 차순위가 없으면 원래 판매 상태로 돌아갑니다.)',
                        confirmText: '입찰 취소',
                        onConfirm: () => cancelTopBidMutation.mutate()
                      });
                    }}
                    disabled={cancelTopBidMutation.isPending}
                  >
                    최고 입찰 취소
                  </Button>
                ) : null}
              </div>
            )}

          {isSeller && !product.isAuction && !product.hasTrade && (
            <div className="flex gap-2 w-full">
              {product.status !== 'SALE' && (
                <Button
                  variant="outline"
                  className="flex-1 h-12 font-semibold text-gray-700 bg-white border-gray-200"
                  onClick={() => statusMutation.mutate('SALE')}
                  disabled={statusMutation.isPending}
                >
                  판매중
                </Button>
              )}
              {product.status !== 'RESERVED' && (
                <Button
                  variant="outline"
                  className="flex-1 h-12 font-semibold text-gray-700 bg-white border-gray-200"
                  onClick={() => statusMutation.mutate('RESERVED')}
                  disabled={statusMutation.isPending}
                >
                  예약중
                </Button>
              )}
              {product.status !== 'SOLD' && (
                <Button
                  className="flex-1 h-12 font-semibold bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => statusMutation.mutate('SOLD')}
                  disabled={statusMutation.isPending}
                >
                  판매완료
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {showReviewModal && trade && (
        <ReviewModal
          tradeId={trade.id}
          partnerNickname={user?.id === trade.sellerId ? trade.buyerNickname : trade.sellerNickname}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}
