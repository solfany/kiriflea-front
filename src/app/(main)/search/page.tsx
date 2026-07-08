'use client';

import { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { fetchProducts } from '@/lib/products';
import ProductCard from '@/components/market/ProductCard';
import type { Category, ProductStatus } from '@/types';

const CATEGORIES: { value: Category | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'ELECTRONICS', label: '전자기기' },
  { value: 'CLOTHING', label: '의류' },
  { value: 'BOOKS', label: '도서' },
  { value: 'HOUSEHOLD', label: '생활용품' },
  { value: 'OTHER', label: '기타' },
];

const STATUSES: { value: ProductStatus | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'SALE', label: '판매중' },
  { value: 'AUCTION', label: '경매중' },
  { value: 'RESERVED', label: '예약중' },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';

  const [keyword, setKeyword] = useState(initialQ);
  const [category, setCategory] = useState<Category | ''>('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [sort, setSort] = useState<'LATEST' | 'POPULAR'>('LATEST');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const debouncedKeyword = useDebounce(keyword, 300);

  const queryParams = {
    keyword: debouncedKeyword || undefined,
    category: (category || undefined) as Category | undefined,
    status: (status || undefined) as ProductStatus | undefined,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    limit: 20,
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ['products', 'search', queryParams],
      queryFn: ({ pageParam }) =>
        fetchProducts({ ...queryParams, cursor: pageParam as string | undefined }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.hasMore ? last.nextCursor ?? undefined : undefined,
    });

  const products = data?.pages.flatMap((p) => p.items) ?? [];

  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const clearFilters = useCallback(() => {
    setCategory('');
    setStatus('');
    setMinPrice('');
    setMaxPrice('');
    setSort('LATEST');
  }, []);

  const hasActiveFilter = !!(category || status || minPrice || maxPrice || sort !== 'LATEST');

  return (
    <div className="pb-4">
      {/* Search input */}
      <div className="sticky top-0 z-30 bg-gray-50 pb-2 pt-1">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 h-11 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="상품명으로 검색"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            autoFocus
          />
          {keyword && (
            <button onClick={() => setKeyword('')}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.filter((c) => c.value).map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(category === c.value ? '' : c.value as Category)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  category === c.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ml-2 ${
              hasActiveFilter ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            필터
          </button>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="mt-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">상태</p>
              <div className="flex gap-1.5 flex-wrap">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value as ProductStatus)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      status === s.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">정렬</p>
              <div className="flex gap-1.5">
                {(['LATEST', 'POPULAR'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      sort === s
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-600'
                    }`}
                  >
                    {s === 'LATEST' ? '최신순' : '인기순'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">가격</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="최소"
                  className="flex-1 h-8 px-3 rounded-lg border border-gray-200 text-xs outline-none focus:border-orange-400"
                />
                <span className="text-gray-400 text-xs">~</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="최대"
                  className="flex-1 h-8 px-3 rounded-lg border border-gray-200 text-xs outline-none focus:border-orange-400"
                />
              </div>
            </div>
            {hasActiveFilter && (
              <button onClick={clearFilters} className="w-full py-1.5 text-xs text-orange-500 font-medium">
                필터 초기화
              </button>
            )}
          </div>
        )}
      </div>

      {/* Result count */}
      {!isLoading && debouncedKeyword && (
        <p className="text-xs text-gray-400 px-1 mb-2">
          {products.length > 0
            ? `"${debouncedKeyword}" 검색 결과 ${products.length}건`
            : `"${debouncedKeyword}" 검색 결과가 없습니다`}
        </p>
      )}

      {/* Skeleton */}
      {isLoading && (
        <div className="space-y-px animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-4 border-b border-gray-100">
              <div className="w-[110px] h-[110px] rounded-lg bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-5 bg-gray-100 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4">
            🔍
          </div>
          {debouncedKeyword ? (
            <>
              <p className="text-base font-semibold text-gray-700">검색 결과가 없어요</p>
              <p className="text-sm text-gray-400 mt-1.5">다른 키워드나 필터를 시도해보세요</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-gray-700">검색어를 입력하세요</p>
              <p className="text-sm text-gray-400 mt-1.5">찾고 싶은 상품명을 입력해보세요!</p>
            </>
          )}
        </div>
      )}

      {/* Product list */}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      <div ref={bottomRef} className="h-8 flex items-center justify-center">
        {isFetchingNextPage && (
          <LoadingSpinner size="sm" />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="space-y-px animate-pulse pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 py-4 border-b border-gray-100">
            <div className="w-24 h-24 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
