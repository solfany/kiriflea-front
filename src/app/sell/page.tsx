'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, updateProduct, uploadImage, fetchProduct } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Camera, X, ChevronLeft, Loader2, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'ELECTRONICS', label: '전자기기' },
  { value: 'CLOTHING', label: '의류' },
  { value: 'BOOKS', label: '도서' },
  { value: 'HOUSEHOLD', label: '생활용품' },
  { value: 'OTHER', label: '기타' },
];

interface UploadedImage { id: number; url: string }

// 1080px 기준으로 이미지 리사이즈 및 WebP 압축을 수행하는 유틸리티
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
      if (!ctx) return resolve(file); // fail safe
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          // WebP 형태로 압축 (아이폰 등 호환성 문제 시 jpeg로 가능하나 요즘은 webp 지원이 대부분 잘됨)
          // 여기서는 원본 파일명을 유지하고 확장자만 변경
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(newFile);
        },
        'image/webp',
        0.8 // 80% 퀄리티
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // 에러 시 원본 반환
    };
  });
};

function SellForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit') ? Number(searchParams.get('edit')) : undefined;
  const isEditMode = !!editId;

  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('OTHER');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isAuction, setIsAuction] = useState(false);
  const [auctionEndAt, setAuctionEndAt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Fetch existing product in edit mode
  const { data: existingProduct } = useQuery({
    queryKey: ['product', editId],
    queryFn: () => fetchProduct(editId!),
    enabled: isEditMode,
  });

  // Pre-fill form when product loads
  useEffect(() => {
    if (existingProduct && !initialized) {
      setTitle(existingProduct.title);
      setCategory(existingProduct.category);
      setPrice(String(existingProduct.price));
      setDescription(existingProduct.description);
      setIsAuction(existingProduct.isAuction);
      if (existingProduct.auctionEndAt) {
        // Convert ISO to datetime-local format (YYYY-MM-DDTHH:mm)
        setAuctionEndAt(existingProduct.auctionEndAt.slice(0, 16));
      }
      if (existingProduct.imageUrls?.length) {
        setImages(existingProduct.imageUrls.map((url, i) => ({ id: i, url })));
      }
      setInitialized(true);
    }
  }, [existingProduct, initialized]);

  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createProduct({
      title, description, price: Number(price),
      category, isAuction,
      ...(isAuction ? {
        auctionStartPrice: Number(price),
        auctionEndAt: auctionEndAt.length === 16 ? `${auctionEndAt}:00` : auctionEndAt,
      } : {}),
      imageUrls: images.map((i) => i.url),
    }),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['myListings'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('상품이 등록됐습니다!');
      router.push(`/products/${product.id}`);
    },
    onError: () => toast.error('상품 등록에 실패했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateProduct(editId!, {
      title, description, price: Number(price),
      category,
      imageUrls: images.map((i) => i.url),
    }),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['product', product.id] });
      qc.invalidateQueries({ queryKey: ['myListings'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('상품이 수정됐습니다!');
      router.push(`/products/${product.id}`);
    },
    onError: () => toast.error('상품 수정에 실패했습니다.'),
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    if (images.length + files.length > 10) { toast.error('이미지는 최대 10장까지 등록 가능합니다.'); return; }
    setUploading(true);
    try {
      // 업로드 전 이미지 최적화(압축) 적용
      const compressedFiles = await Promise.all(Array.from(files).map(compressImage));
      const uploaded = await Promise.all(compressedFiles.map(uploadImage));
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (images.length === 0) return toast.error('상품 이미지를 최소 1장 이상 등록해주세요.');
    if (!title.trim()) return toast.error('상품 제목을 입력해주세요.');
    if (!price) return toast.error(isAuction ? '경매 시작가를 입력해주세요.' : '가격을 입력해주세요.');

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return toast.error(isAuction ? '경매 시작가는 0원 이상이어야 합니다.' : '가격은 0원 이상이어야 합니다.');
    }

    if (isAuction && !auctionEndAt) return toast.error('경매 마감 시간을 설정해주세요.');

    if (isEditMode) updateMutation.mutate();
    else createMutation.mutate();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && !existingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-screen-md mx-auto">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2">
          <ChevronLeft size={22} className="text-gray-700" />
        </button>
        <h1 className="font-semibold text-gray-900">{isEditMode ? '상품 수정' : '내 물건 팔기'}</h1>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="ml-auto bg-orange-500 hover:bg-orange-600 text-sm h-8 px-4"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : isEditMode ? '수정' : '등록'}
        </Button>
      </header>

      <div className="px-4 pb-10 space-y-6 pt-4">
        {/* Image upload */}
        <div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading || images.length >= 10}
              className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-orange-300 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={22} />}
              <span className="text-xs mt-1">{images.length}/10</span>
            </button>
            {images.map((img, i) => (
              <div key={`${img.id}-${i}`} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">대표</span>
                )}
                <button onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label>제목</Label>
          <Input placeholder="물건의 이름을 입력해주세요" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50} />
          <div className="text-right text-[10px] text-gray-400">{title.length}/50</div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>카테고리</Label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm border transition-colors',
                  category === c.value ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-600 border-gray-200 hover:border-orange-300',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label>{isAuction ? '경매 시작가' : '가격'}</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="0"
              value={price ? Number(price).toLocaleString() : ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 9) setPrice(val);
              }}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
          </div>
          <div className="flex gap-2">
            {[10000, 50000, 100000].map((amt) => (
              <button
                key={amt}
                onClick={() => setPrice(String(Number(price || 0) + amt))}
                className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition-colors border border-gray-100"
              >
                +{amt.toLocaleString()}원
              </button>
            ))}
            <button
              onClick={() => setPrice('')}
              className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs hover:bg-gray-100 transition-colors border border-gray-100 ml-auto"
            >
              초기화
            </button>
          </div>
        </div>

        {/* Auction toggle — only for new products */}
        {!isEditMode && (
          <div className={cn("overflow-hidden rounded-xl border transition-all", isAuction ? "border-orange-200" : "border-orange-100")}>
            <div className={cn("flex items-center justify-between py-3 px-4 transition-colors", isAuction ? "bg-orange-50/50" : "bg-orange-50")}>
              <div className="flex items-center gap-2">
                <Gavel size={18} className="text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">경매로 판매</p>
                  <p className="text-xs text-gray-500">입찰가가 올라가는 경매 방식</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuction((v) => !v)}
                className={cn('w-11 h-6 rounded-full transition-colors relative shrink-0', isAuction ? 'bg-orange-500' : 'bg-gray-200')}
              >
                <span className={cn('absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200', isAuction ? 'translate-x-5' : 'translate-x-0')} />
              </button>
            </div>
            {isAuction && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
                <Label className="text-gray-700">경매 마감 시간</Label>
                <Input 
                  type="datetime-local" 
                  value={auctionEndAt} 
                  onChange={(e) => setAuctionEndAt(e.target.value)} 
                  className="bg-white"
                />
                <div className="flex gap-2">
                  {[1, 3, 7].map((days) => (
                    <button
                      key={days}
                      onClick={() => {
                        const d = auctionEndAt ? new Date(auctionEndAt) : new Date();
                        d.setDate(d.getDate() + days);
                        const tzOffset = d.getTimezoneOffset() * 60000;
                        const localIso = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
                        setAuctionEndAt(localIso);
                      }}
                      className="flex-1 py-2 bg-white text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                      +{days}일
                    </button>
                  ))}
                  <button
                    onClick={() => setAuctionEndAt('')}
                    className="px-4 py-2 bg-white text-gray-500 rounded-lg text-xs hover:bg-gray-50 transition-colors border border-gray-200 shrink-0"
                  >
                    초기화
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <Label>상품 설명</Label>
          <textarea
            placeholder="상품 상태, 구매 시기, 사용 기간 등을 자세히 적어주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            rows={6}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <div className="text-right text-[10px] text-gray-400">{description.length}/1000</div>
        </div>

        <div className="pt-4 pb-8">
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full h-12 text-base font-semibold bg-orange-500 hover:bg-orange-600"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : isEditMode ? '수정 완료' : '등록 완료'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SellPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <SellForm />
    </Suspense>
  );
}
