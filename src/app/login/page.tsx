'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { login } from '@/lib/auth';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { NookLogo } from '@/components/ui/NookLogo';

export default function LoginPage() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login({ email, password });
      setTokens(res.accessToken, res.refreshToken, res.user);
      window.location.href = '/';
    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      toast.error('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* 상단 로고 & 안녕하는 너구리 캐릭터 (hi 이미지) */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center mb-3">
            {/* 너구리가 안녕하는 사진 (raccoon-mascot-hi.png) */}
            <div className="relative w-24 h-24 mb-2 hover:scale-105 transition-transform">
              <Image
                src="/images/logo/raccoon-mascot-hi.png"
                alt="안녕하는 너구리"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* 로고 & 브랜드 타이틀 */}
            <NookLogo size="lg" variant="logo" />
          </div>
          <p className="mt-2 text-sm text-gray-500 font-medium">임직원 전용 중고거래 플랫폼</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">회사 이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@nplohs.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-base border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 text-base border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-semibold transition-colors" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : '로그인'}
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
          <p>
            계정이 없으신가요?{' '}
            <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
              회원가입
            </Link>
          </p>
          <Link href="/login/find-password" className="text-gray-400 hover:text-gray-600 hover:underline">
            비밀번호를 잊으셨나요?
          </Link>
        </div>

      </div>
    </div>
  );
}
