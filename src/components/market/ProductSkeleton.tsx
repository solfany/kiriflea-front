import { Skeleton } from "@/components/ui/skeleton";

export default function ProductSkeleton() {
  return (
    <div className="flex gap-4 p-4 border-b border-gray-100 last:border-0 bg-white">
      {/* 썸네일 스켈레톤 */}
      <Skeleton className="w-28 h-28 rounded-xl shrink-0" />
      
      {/* 텍스트 내용 스켈레톤 */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-2">
          {/* 제목 */}
          <Skeleton className="h-5 w-3/4 rounded" />
          {/* 위치 및 시간 */}
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
        
        {/* 가격 */}
        <Skeleton className="h-6 w-1/3 rounded" />
        
        {/* 좋아요, 조회수 등 */}
        <div className="flex justify-end gap-2">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}
