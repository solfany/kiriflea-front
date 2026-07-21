'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth';

interface ProfileEditModalProps {
  onClose: () => void;
}

export function ProfileEditModal({ onClose }: ProfileEditModalProps) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? '');
  const [isUploading, setIsUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch('/api/me/profile', { nickname, profileImage });
      return res.data;
    },
    onSuccess: () => {
      toast.success('프로필이 수정되었습니다.');
      // user info 갱신
      if (user) {
        useAuthStore.setState({ user: { ...user, nickname, profileImage: profileImage || '' } });
        qc.invalidateQueries({ queryKey: ['user', user.id] });
      }
      onClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: unknown) => {
      toast.error((err as any)?.response?.data?.message || (err as any)?.message || '프로필 수정에 실패했습니다.');
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': undefined }
      });

      // 기존 이미지가 서버 로컬 URL이면 삭제
      if (profileImage && profileImage.includes('/uploads/products/')) {
        const key = profileImage.split('/uploads/')[1];
        if (key) {
          api.delete('/api/upload', { params: { key } }).catch((err) => {
            console.error('기존 이미지 삭제 실패:', err);
          });
        }
      }

      setProfileImage(res.data.url);
    } catch (err: unknown) {
      toast.error((err as any)?.response?.data?.message || (err as any)?.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">프로필 수정</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-700 overflow-hidden cursor-pointer group border border-gray-200" onClick={() => fileInputRef.current?.click()}>
                {profileImage ? (
                  <Image src={profileImage} alt="프로필 이미지" fill className="object-cover" sizes="80px" />
                ) : (
                  nickname.slice(0, 2)
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              <button className="text-xs text-gray-500 mt-2 hover:underline" onClick={() => fileInputRef.current?.click()}>
                이미지 변경
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="nickname" className="text-xs text-gray-500">닉네임</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={15}
                  className="mt-1.5 h-12 text-base rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-2">
            <Button variant="outline" className="flex-1 h-12 text-base font-semibold rounded-xl text-gray-600 border-gray-200" onClick={onClose}>취소</Button>
            <Button
              className="flex-1 h-12 text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || isUploading || !nickname}
            >
              {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : '저장'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
