'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { login } from '@/lib/auth';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';
import { NookLogo } from '@/components/ui/NookLogo';

export default function LoginPage() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const [localPart, setLocalPart] = useState('');
  const [domainPart, setDomainPart] = useState('');
  const [rememberDomain, setRememberDomain] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ localPart?: string; domainPart?: string; password?: string }>({});

  useEffect(() => {
    const savedDomain = localStorage.getItem('savedDomain');
    if (savedDomain) {
      setDomainPart(savedDomain);
      setRememberDomain(true);
    }
  }, []);

  const validate = () => {
    const newErrors: any = {};
    const localPartTrimmed = localPart.trim();
    const domainPartTrimmed = domainPart.trim();

    // 1. 아이디 유효성 검사
    if (!localPartTrimmed) {
      newErrors.localPart = '아이디를 입력해주세요.';
    } else if (localPartTrimmed.length < 3 || localPartTrimmed.length > 64) {
      newErrors.localPart = '아이디는 3~64자 사이로 입력해주세요.';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(localPartTrimmed)) {
      newErrors.localPart = '아이디는 영문, 숫자, 마침표(.), 하이픈(-), 밑줄(_)만 가능합니다.';
    }

    // 2. 도메인 유효성 검사
    if (!domainPartTrimmed) {
      newErrors.domainPart = '도메인을 입력해주세요.';
    } else if (domainPartTrimmed.length < 3 || domainPartTrimmed.length > 255) {
      newErrors.domainPart = '도메인 길이가 올바르지 않습니다.';
    } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domainPartTrimmed)) {
      newErrors.domainPart = '올바른 도메인 형식이 아닙니다 (예: nplohs.com).';
    }

    // 3. 비밀번호 유효성 검사
    // if (!password) {
    //   newErrors.password = '비밀번호를 입력해주세요.';
    // } else if (password.length < 6) {
    //   newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    // } else if (password.length > 100) {
    //   newErrors.password = '비밀번호는 최대 100자까지 가능합니다.';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    if (rememberDomain) {
      localStorage.setItem('savedDomain', domainPart);
    } else {
      localStorage.removeItem('savedDomain');
    }

    const email = `${localPart}@${domainPart}`;

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이메일 입력 */}
          <div>
            <div className={`flex items-center h-14 rounded-2xl bg-gray-50/80 border px-4 transition-all duration-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] ${errors.localPart || errors.domainPart
              ? 'border-red-400 focus-within:border-red-500 focus-within:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
              : 'border-gray-100 focus-within:border-emerald-500'
              }`}>
              <input
                id="localPart"
                type="text"
                placeholder="아이디"
                value={localPart}
                onChange={(e) => {
                  setLocalPart(e.target.value);
                  if (errors.localPart) setErrors(prev => ({ ...prev, localPart: undefined }));
                }}
                maxLength={64}
                className="flex-1 h-full bg-transparent outline-none border-none focus:ring-0 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 w-full"
              />
              <span className="text-gray-300 font-medium px-2 select-none">@</span>
              <div className="relative flex items-center h-full">
                <input
                  id="domainPart"
                  type="text"
                  placeholder="nplohs.com"
                  value={domainPart}
                  onChange={(e) => {
                    setDomainPart(e.target.value);
                    if (errors.domainPart) setErrors(prev => ({ ...prev, domainPart: undefined }));
                  }}
                  maxLength={255}
                  className="w-[110px] h-full bg-transparent outline-none border-none focus:ring-0 text-[15px] font-medium text-gray-500 placeholder:text-gray-300 pr-7"
                />
                {domainPart && (
                  <button
                    type="button"
                    onClick={() => {
                      setDomainPart('');
                      if (errors.domainPart) setErrors(prev => ({ ...prev, domainPart: undefined }));
                    }}
                    className="absolute right-0 flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-600 transition-colors"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
            {(errors.localPart || errors.domainPart) && (
              <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.localPart || errors.domainPart}</p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <div className={`flex items-center h-14 rounded-2xl bg-gray-50/80 border px-4 transition-all duration-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] ${errors.password
              ? 'border-red-400 focus-within:border-red-500 focus-within:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
              : 'border-gray-100 focus-within:border-emerald-500'
              }`}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                maxLength={100}
                className="flex-1 h-full bg-transparent outline-none border-none focus:ring-0 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pl-3 h-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors bg-transparent"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.password}</p>
            )}
          </div>

          {/* 하단 제어부 (기억하기 + 로그인 버튼) */}
          <div className="pt-2 flex flex-col gap-4">
            <div className="flex justify-start px-1">
              <label
                className="flex items-center gap-2 cursor-pointer group"
                onClick={(e) => {
                  e.preventDefault();
                  setRememberDomain(!rememberDomain);
                }}
              >
                <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all duration-200 border ${rememberDomain
                  ? 'bg-emerald-500 border-emerald-500 shadow-sm'
                  : 'bg-white border-gray-300 group-hover:border-gray-400'
                  }`}>
                  <Check size={12} className={`text-white transition-transform duration-200 ${rememberDomain ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} strokeWidth={3.5} />
                </div>
                <span className={`text-[13px] font-medium transition-colors ${rememberDomain ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-600'} select-none`}>
                  도메인 기억하기
                </span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white h-14 rounded-2xl text-[16px] font-bold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-[1px]"
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : '이메일로 로그인'}
            </Button>
          </div>
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
