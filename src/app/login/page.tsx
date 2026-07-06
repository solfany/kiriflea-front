'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MessageCircleMore } from 'lucide-react';
import { login } from '@/lib/auth';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="relative flex items-center justify-center text-orange-500 bg-orange-50/80 rounded-[20px] p-2.5 shadow-sm">
              <MessageCircleMore size={32} strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="font-extrabold text-[28px] text-gray-800">우리</span>
              <span className="font-black text-[30px] text-orange-500 ml-[2px]">끼리플리</span>
              <span className="font-extrabold text-[28px] text-gray-800 ml-[2px]">마켓</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 font-medium">임직원 전용 중고거래 플랫폼</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">회사 이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-base"
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
              className="h-12 text-base"
            />
          </div>

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : '로그인'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link href="/register" className="text-orange-500 font-semibold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
