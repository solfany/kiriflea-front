'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { api } from '@/lib/api';

export default function FindPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/password/send-code', { email });
      toast.success('인증 코드가 이메일로 전송되었습니다.');
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || '이메일 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/email/verify', { email, code });
      toast.success('이메일 인증이 완료되었습니다.');
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || '인증 코드가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/password/reset', { email, newPassword });
      toast.success('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 relative">
      <div className="absolute top-8 left-6">
        <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">로그인으로 돌아가기</span>
        </Link>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-4">
            <KeyRound size={28} className="text-emerald-600" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 찾기</h1>
          <p className="text-sm text-gray-500">
            {step === 1 && '가입하신 이메일 주소를 입력해주세요.'}
            {step === 2 && '이메일로 전송된 6자리 인증 코드를 입력해주세요.'}
            {step === 3 && '새로운 비밀번호를 입력해주세요.'}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@nplohs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold text-white" disabled={loading || !email}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : '인증 코드 받기'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">인증 코드</Label>
              <Input
                id="code"
                type="text"
                placeholder="6자리 숫자 입력"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                required
                className="h-12 text-base tracking-widest text-center"
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold text-white" disabled={loading || code.length !== 6}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : '코드 인증하기'}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="새 비밀번호 입력 (8자 이상)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-12 text-base"
                minLength={8}
              />
            </div>
            <div className="space-y-1.5 mt-4">
              <Label htmlFor="newPasswordConfirm">새 비밀번호 확인</Label>
              <Input
                id="newPasswordConfirm"
                type="password"
                placeholder="새 비밀번호 다시 입력"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                required
                className="h-12 text-base"
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold text-white mt-6" disabled={loading || !newPassword || !newPasswordConfirm}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : '비밀번호 재설정'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
