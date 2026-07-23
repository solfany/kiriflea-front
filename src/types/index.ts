// ── Auth ──────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImage?: string;
  phone?: string;
  mannerScore: number;
  listingCount: number;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  verificationCode: string;
  password: string;
  nickname: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ── Product ───────────────────────────────────────────────────
export type ProductStatus = 'SALE' | 'RESERVED' | 'SOLD' | 'AUCTION';
export type Category = 'ELECTRONICS' | 'CLOTHING' | 'BOOKS' | 'HOUSEHOLD' | 'OTHER';

export interface Seller {
  id: number;
  nickname: string;
  mannerScore: number;
  listingCount: number;
  profileImage?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  status: ProductStatus;
  category: Category;
  imageUrls: string[];
  seller: Seller;
  viewCount: number;
  wishCount: number;
  isLiked?: boolean;
  isAuction: boolean;
  currentBid?: number;
  auctionEndAt?: string;
  isHidden?: boolean;
  isDeleted?: boolean;
  hasTrade?: boolean;
  bidCount?: number;
  buyerNickname?: string;
  buyerId?: number;
  auctionStatus?: string;
  createdAt: string;
  participantCount?: number;
}

export interface ProductListItem {
  id: number;
  title: string;
  price: number;
  status: ProductStatus;
  category: Category;
  imageUrls: string[];
  wishCount: number;
  viewCount: number;
  isLiked?: boolean;
  isAuction: boolean;
  currentBid?: number;
  auctionEndAt?: string;
  isHidden?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  tradeId?: number;
  partnerNickname?: string;
  isReviewed?: boolean;
  bidCount?: number;
  participantCount?: number;
}

export interface ProductCursor {
  items: ProductListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  category: Category;
  isAuction: boolean;
  auctionStartPrice?: number;
  auctionEndAt?: string;
  imageUrls: string[];
}

// ── Comment ───────────────────────────────────────────────────
export interface Comment {
  id: number;
  author: { id: number; nickname: string; profileImage?: string };
  content: string;
  isPrivate: boolean;
  parentId?: number;
  replies?: Comment[];
  createdAt: string;
}

// ── Auction ───────────────────────────────────────────────────
export interface Bid {
  id: number;
  bidder: { id: number; nickname: string; profileImage?: string };
  amount: number;
  createdAt: string;
}

export interface MyBid {
  id: number;
  amount: number;
  createdAt: string;
  currentHighestBid: number;
  isWinning: boolean;
  product: {
    id: number;
    title: string;
    thumbnailUrl: string;
    status: ProductStatus;
    auctionEndAt?: string;
    isDeleted?: boolean;
  };
}

// STOMP real-time payload from /topic/product/{id}/auction
export interface AuctionUpdateMessage {
  productId: number;
  currentBid: number;
  bidCount: number;
  lastBidderNickname: string;
  remainingMs: number;
  status: ProductStatus;
}

// ── Chat ──────────────────────────────────────────────────────
export interface ChatRoom {
  id: number;
  product: Pick<Product, 'id' | 'title' | 'price' | 'status'> & { thumbnailUrl: string; isSeller: boolean; isDeleted?: boolean; hasTrade?: boolean; isAuction?: boolean };
  partner: Pick<User, 'id' | 'nickname' | 'profileImage' | 'mannerScore'>;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  sender: { id: number; nickname: string; profileImage?: string };
  content: string;
  type: 'TEXT' | 'IMAGE';
  isRead?: boolean;
  createdAt: string;
}

// ── Trending ──────────────────────────────────────────────────
export interface TrendingProduct extends ProductListItem {
  trendScore: number;
}

// ── Pagination helpers ────────────────────────────────────────
export interface PageResponse<T> {
  content: T[];
  number: number;
  last: boolean;
}

export interface PageParams {
  cursor?: string;
  limit?: number;
  category?: Category;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  sort?: 'LATEST' | 'POPULAR';
}

// ── Trade & Review ─────────────────────────────────────────────
export interface Trade {
  id: number;
  productId: number;
  productTitle: string;
  productThumbnail: string | null;
  sellerId: number;
  sellerNickname: string;
  buyerId: number;
  buyerNickname: string;
  createdAt: string;
  buyerReviewed: boolean;
  sellerReviewed: boolean;
}

export interface Review {
  id: number;
  tradeId: number;
  reviewerNickname: string;
  score: number;
  comment: string;
  createdAt: string;
}
