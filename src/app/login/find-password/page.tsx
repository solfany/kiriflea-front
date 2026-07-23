'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, KeyRound, X, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

export default function FindPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [localPart, setLocalPart] = useState('');
  const [domainPart, setDomainPart] = useState('');
  const email = `${localPart}@${domainPart}`;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
            <div>
              <div className="flex items-center h-14 rounded-2xl bg-gray-50/80 border border-gray-100 px-4 transition-all duration-300 focus-within:bg-white focus-within:border-emerald-500 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]">
                <input
                  type="text"
                  placeholder="아이디"
                  value={localPart}
                  onChange={(e) => setLocalPart(e.target.value)}
                  maxLength={64}
                  required
                  className="flex-1 h-full bg-transparent outline-none border-none focus:ring-0 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 w-full"
                />
                <span className="text-gray-300 font-medium px-2 select-none">@</span>
                <div className="relative flex items-center h-full">
                  <input
                    type="text"
                    placeholder="nplohs.com"
                    value={domainPart}
                    onChange={(e) => setDomainPart(e.target.value)}
                    maxLength={255}
                    required
                    className="w-[110px] h-full bg-transparent outline-none border-none focus:ring-0 text-[15px] font-medium text-gray-500 placeholder:text-gray-300 pr-7"
                  />
                  {domainPart && (
                    <button
                      type="button"
                      onClick={() => setDomainPart('')}
                      className="absolute right-0 flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-600 transition-colors"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white h-14 rounded-2xl text-[16px] font-bold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-[1px]" disabled={loading || !localPart || !domainPart}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : '인증 코드 받기'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <div className="flex items-center h-14 rounded-2xl bg-gray-50/80 border border-gray-100 px-4 transition-all duration-300 focus-within:bg-white focus-within:border-emerald-500 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]">
                <input
                  type="text"
                  placeholder="6자리 숫자 입력"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  required
                  className="flex-1 h-full bg-transparent outline-none border-none focus:ring-0 text-center text-[18px] tracking-[0.5em] font-medium text-gray-900 placeholder:text-gray-400 placeholder:tracking-normal w-full"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white h-14 rounded-2xl text-[16px] font-bold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-[1px]" disabled={loading || code.length !== 6}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : '코드 인증하기'}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <div className="flex items-center h-14 rounded-2xl bg-gray-50/80 border border-gray-100 px-4 transition-all duration-300 focus-within:bg-white focus-within:border-emerald-500 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호 입력 (8자 이상)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={100}
                  className="flex-1 h-full bg-transparent outline-none border-none focus:ring-0 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 w-full"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="pl-3 h-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-transparent" tabIndex={-1}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div>
              <div className="flex items-center h-14 rounded-2xl bg-gray-50/80 border border-gray-100 px-4 transition-all duration-300 focus-within:bg-white focus-within:border-emerald-500 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호 다시 입력"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  required
                  minLength={8}
                  maxLength={100}
                  className="flex-1 h-full bg-transparent outline-none border-none focus:ring-0 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 w-full"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white h-14 rounded-2xl text-[16px] font-bold transition-all duration-200 mt-6 shadow-sm hover:shadow-md hover:-translate-y-[1px]" disabled={loading || !newPassword || !newPasswordConfirm}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : '비밀번호 재설정'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
