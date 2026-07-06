import { api } from './api';
import type { Product, ProductCursor, CreateProductRequest, Comment, PageParams, TrendingProduct, Bid, MyBid } from '@/types';

export async function fetchProducts(params: PageParams): Promise<ProductCursor> {
  const res = await api.get<ProductCursor>('/api/products', { params });
  return res.data;
}

export async function fetchTrending(): Promise<TrendingProduct[]> {
  const res = await api.get<TrendingProduct[]>('/api/products/trending');
  return res.data;
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await api.get<Product>(`/api/products/${id}`);
  return res.data;
}

export async function createProduct(data: CreateProductRequest): Promise<Product> {
  const res = await api.post<Product>('/api/products', data);
  return res.data;
}

export async function updateProduct(id: number, data: Partial<CreateProductRequest>): Promise<Product> {
  const res = await api.patch<Product>(`/api/products/${id}`, data);
  return res.data;
}

export async function uploadImage(file: File): Promise<{ id: number; url: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<{ id: number; url: string }>('/api/images/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function toggleLike(productId: number): Promise<{ liked: boolean; count: number }> {
  const res = await api.post<{ liked: boolean; count: number }>(`/api/products/${productId}/like`);
  return res.data;
}

export async function fetchComments(productId: number): Promise<Comment[]> {
  const res = await api.get<Comment[]>(`/api/products/${productId}/comments`);
  return res.data;
}

export async function postComment(productId: number, content: string, isPrivate: boolean, parentId?: number) {
  const res = await api.post<Comment>(`/api/products/${productId}/comments`, {
    content, isPrivate, parentId,
  });
  return res.data;
}

export async function fetchBids(productId: number): Promise<Bid[]> {
  const res = await api.get<Bid[]>(`/api/products/${productId}/bids`);
  return res.data;
}

export async function placeBid(productId: number, amount: number): Promise<Bid> {
  const res = await api.post<Bid>(`/api/products/${productId}/bids`, { amount });
  return res.data;
}

export async function fetchMyLikes(cursor?: string): Promise<ProductCursor> {
  const res = await api.get<ProductCursor>('/api/me/likes', { params: { cursor } });
  return res.data;
}

export async function fetchMyListings(cursor?: string, tab?: string): Promise<ProductCursor> {
  const res = await api.get<ProductCursor>('/api/me/listings', { params: { cursor, tab } });
  return res.data;
}

export async function fetchMyPurchases(cursor?: string): Promise<ProductCursor> {
  const res = await api.get<ProductCursor>('/api/me/purchases', { params: { cursor } });
  return res.data;
}

export async function fetchMyBids(cursor?: string): Promise<{ items: MyBid[]; nextCursor: string | null; hasMore: boolean }> {
  const res = await api.get<{ items: MyBid[]; nextCursor: string | null; hasMore: boolean }>('/api/me/bids', { params: { cursor } });
  return res.data;
}

export async function closeAuctionEarly(productId: number): Promise<void> {
  await api.post(`/api/products/${productId}/auctions/close-early`);
}

export async function reopenAuction(productId: number, endAt: string): Promise<void> {
  await api.post(`/api/products/${productId}/auctions/reopen`, { endAt });
}

export async function extendAuction(productId: number, endAt: string): Promise<void> {
  await api.patch(`/api/products/${productId}/auctions/extend`, { endAt });
}

export async function deleteProduct(productId: number): Promise<void> {
  await api.delete(`/api/products/${productId}`);
}
