'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { logout as authLogout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface WithdrawModalProps {
  onClose: () => void;
}

export default function WithdrawModal({ onClose }: WithdrawModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      await api.delete('/api/users/me');
      await authLogout();
      clearAuth();
      toast.success('회원 탈퇴가 완료되었습니다.');
      router.push('/login');
    } catch (error) {
      console.error(error);
      toast.error('회원 탈퇴 처리에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-xl relative animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 font-nook tracking-[1px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 font-sans tracking-normal">
            회원 탈퇴
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 pt-6 flex flex-col items-center text-center">
          <Image src="/images/logo/raccoon-mascot-face.png" alt="sad-raccoon" width={60} height={60} className="w-auto h-auto object-contain mb-4 opacity-80 grayscale" />
          <h3 className="text-red-500 font-bold mb-2 font-sans tracking-normal text-lg">정말로 떠나시겠습니까구리...?</h3>
          <p className="text-sm text-gray-600 mb-6 px-2 leading-relaxed">
            탈퇴 시 24시간의 유예 기간을 가지며,<br /> 해당 기간 동안 같은 이메일로 재가입이 제한됩니다.<br />
            (24시간 후 등록된 상품/거래 내역이 없다면 영구 삭제되며, <br />내역이 있다면 익명 처리되어 남습니다.)
          </p>

          <div className="flex flex-col gap-3 w-full font-sans tracking-normal">
            <Button
              className="w-full h-12 text-base font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm"
              onClick={handleWithdraw}
              disabled={isLoading}
            >
              {isLoading ? '처리 중...' : '네, 탈퇴하겠습니다'}
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-base font-bold border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl mb-2"
              onClick={onClose}
              disabled={isLoading}
            >
              아니요, 더 이용할게요!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
