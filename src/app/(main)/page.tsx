import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { fetchProducts, fetchTrending } from '@/lib/products';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const qc = new QueryClient();

  // 서버 사이드에서 상품 목록과 급상승 아이템을 미리 로드하여
  // 클라이언트에서 접속 즉시 볼 수 있게 합니다 (SSR).
  try {
    await Promise.all([
      qc.prefetchInfiniteQuery({
        queryKey: ['products', undefined],
        queryFn: () => fetchProducts({ cursor: undefined, limit: 20, category: undefined, sort: 'LATEST' }),
        initialPageParam: undefined,
      }),
      qc.prefetchQuery({
        queryKey: ['trending'],
        queryFn: fetchTrending,
      })
    ]);
  } catch (error) {
    console.error('Failed to prefetch data for HomePage', error);
  }

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <HomeClient />
    </HydrationBoundary>
  );
}
