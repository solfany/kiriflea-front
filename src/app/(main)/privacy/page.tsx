'use client';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="bg-white min-h-[calc(100vh-3.5rem)] -mx-4 px-4 pt-4 pb-12 -mt-4 sm:mt-0 sm:bg-transparent sm:min-h-0 sm:mx-0 sm:px-0 sm:pt-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 py-1">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">개인정보처리방침</h1>
      </div>
      
      {/* Main Content Area */}
      <div className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-gray-100 shadow-none sm:shadow-sm px-5 py-6 sm:p-8 pb-16 animate-fadeIn -mx-4 sm:mx-0">
        <div className="text-sm text-gray-700 leading-relaxed font-sans space-y-6">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">1. 개인정보의 수집 및 이용 목적</h2>
          <p>
            모여봐요 너굴상점(운영자 김솔비)은 다음의 목적을 위하여 개인정보를 처리합니다.<br />
            - 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별 및 인증<br />
            - 회원 간 원활한 커뮤니케이션(채팅, 알림 등) 및 서비스 운영<br />
            - 불량 회원의 부정 이용 방지 및 비인가 사용 방지
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">2. 수집하는 개인정보 항목</h2>
          <p>
            운영자는 회원가입 및 서비스 이용 과정에서 다음과 같은 최소한의 개인정보를 수집합니다.<br />
            - 필수항목: 이메일 주소, 비밀번호, 닉네임, 프로필 사진<br />
            - 자동수집항목: 서비스 이용 기록, 접속 로그, 쿠키(Cookie), 기기 정보
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            원칙적으로 회원의 개인정보는 회원 탈퇴 시 지체 없이 파기됩니다. 단, 어뷰징 방지를 위해 다음과 같이 보존합니다.<br />
            - 회원 탈퇴 요청 시: 24시간 동안 계정 비활성화 및 보존 (유예 기간 내 재가입 방지)<br />
            - 24시간 경과 후: 즉시 완전 파기(Hard Delete) 또는 작성한 게시물 보존을 위한 익명화 처리(Soft Delete)
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">4. 개인정보의 제3자 제공</h2>
          <p>
            운영자는 원칙적으로 회원의 개인정보를 외부에 제공하지 않습니다. 단, 범죄 수사 등 법령의 규정에 의거하여 수사기관의 적법한 요구가 있는 경우에는 예외로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">5. 이용자의 권리 및 행사 방법</h2>
          <p>
            이용자는 언제든지 '내 정보 &gt; 프로필 수정'을 통해 자신의 개인정보를 조회하거나 수정할 수 있으며, '회원탈퇴'를 통해 개인정보의 수집 및 이용 동의를 철회할 수 있습니다.
          </p>
        </section>

        <p className="text-gray-400 mt-8 text-xs">
          본 방침은 2026년 7월 21일부터 시행됩니다.
        </p>
        </div>
      </div>
    </div>
  );
}
