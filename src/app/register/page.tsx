'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  sendVerificationCode,
  confirmVerificationCode,
  register,
  generateNickname,
} from '@/lib/auth';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, RefreshCw, CheckCircle, MessageCircleHeart } from 'lucide-react';

type Step = 'email' | 'code' | 'profile';

export default function RegisterPage() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 8) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const handleSendCode = async () => {
    const isAllowedDomain = email.endsWith('@krtranslink.com') || email.endsWith('@nplohs.com');
    if (!isAllowedDomain) {
      toast.error('회사 이메일 계정으로만 가입 가능합니다.');
      return;
    }
    setLoading(true);
    try {
      await sendVerificationCode(email);
      toast.success('인증코드를 발송했습니다. 10분 내 입력해주세요.');
      setStep('code');
    } catch (err: unknown) {
      // 백엔드 에러 메시지 우선 표시 (409: 이미 가입된 이메일 등)
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const serverMsg = axiosErr?.response?.data?.message;
      toast.error(serverMsg || '코드 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      const { valid } = await confirmVerificationCode(email, code);
      if (!valid) { toast.error('인증코드가 올바르지 않습니다.'); return; }
      toast.success('이메일 인증 완료!');
      const gen = await generateNickname();
      setNickname(gen);
      setStep('profile');
    } catch {
      toast.error('인증 실패. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomNickname = async () => {
    try {
      const gen = await generateNickname();
      setNickname(gen);
    } catch {
      toast.error('닉네임 생성 실패');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) { toast.error('비밀번호가 일치하지 않습니다.'); return; }
    if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)) {
      toast.error('비밀번호: 영문+숫자+특수문자 8자 이상');
      return;
    }
    setLoading(true);
    try {
      const res = await register({
        email,
        verificationCode: code,
        password,
        name: nickname, // 이름 입력을 받지 않으므로 DB NotNull 우회를 위해 nickname 대입
        nickname,
        phone: phone || undefined
      });
      setTokens(res.accessToken, res.refreshToken, res.user);
      toast.success(`환영합니다, ${nickname}님!`);
      router.replace('/');
    } catch {
      toast.error('회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2.5 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-50">
              <MessageCircleHeart
                size={34}
                className="text-orange-500"
                strokeWidth={1.9}
              />
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="font-extrabold text-[28px] text-gray-800">우리</span>
              <span className="font-black text-[30px] text-orange-500 ml-[2px]">끼리플리</span>
              <span className="font-extrabold text-[28px] text-gray-800 ml-[2px]">마켓</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 font-medium">회사 이메일로만 가입 가능합니다</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['email', 'code', 'profile'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-orange-500 text-white' : i < (['email', 'code', 'profile'] as Step[]).indexOf(step) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                {i < (['email', 'code', 'profile'] as Step[]).indexOf(step) ? <CheckCircle size={14} /> : i + 1}
              </div>
              {i < 2 && <div className="w-8 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {step === 'email' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>회사 이메일</Label>
              <Input
                type="email"
                placeholder="name@nplohs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <Button onClick={handleSendCode} className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : '인증코드 발송'}
            </Button>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-orange-500">{email}</span>로<br />
              6자리 인증코드를 발송했습니다.
            </p>
            <div className="space-y-1.5">
              <Label>인증코드</Label>
              <Input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="h-12 text-center text-xl tracking-widest"
              />
            </div>
            <Button onClick={handleVerifyCode} className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold" disabled={loading || code.length !== 6}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : '인증 확인'}
            </Button>
            <button onClick={() => setStep('email')} className="w-full text-sm text-gray-400 hover:text-gray-600">
              이메일 다시 입력
            </button>
          </div>
        )}

        {step === 'profile' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label>비밀번호</Label>
              <Input type="password" placeholder="영문+숫자+특수문자 8자 이상" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 text-base" />
            </div>
            <div className="space-y-1.5">
              <Label>비밀번호 확인</Label>
              <Input type="password" placeholder="비밀번호 재입력" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required className="h-12 text-base" />
            </div>
            <div className="space-y-1.5">
              <Label>닉네임</Label>
              <div className="flex gap-2">
                <Input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} minLength={2} maxLength={15} required className="h-12 text-base" />
                <Button type="button" variant="outline" size="icon" onClick={handleRandomNickname} title="랜덤 닉네임" className="h-12 w-12 flex-shrink-0">
                  <RefreshCw size={14} />
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>전화번호 <span className="text-gray-400 text-xs">(선택)</span></Label>
              <Input
                type="tel"
                placeholder="010-0000-0000"
                maxLength={13}
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                className="h-12 text-base"
              />
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold mt-2" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : '가입 완료'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-orange-500 font-semibold hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
