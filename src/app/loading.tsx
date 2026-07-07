import ProductSkeleton from '@/components/market/ProductSkeleton';

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col max-w-screen-md mx-auto w-full">
      <div className="px-4 mt-2">
        <ProductSkeleton />
        <ProductSkeleton />
        <ProductSkeleton />
        <ProductSkeleton />
      </div>
    </div>
  );
}
