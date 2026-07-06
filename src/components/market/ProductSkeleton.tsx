export default function ProductSkeleton() {
  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 px-1 animate-pulse">
      <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-10" />
        </div>
      </div>
    </div>
  );
}
