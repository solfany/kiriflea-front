'use client';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="bg-white min-h-[calc(100vh-3.5rem)] -mx-4 px-4 pt-4 pb-12 -mt-4 sm:mt-0 sm:bg-transparent sm:min-h-0 sm:mx-0 sm:px-0 sm:pt-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 py-1">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">이용약관</h1>
      </div>
      
      {/* Main Content Area */}
      <div className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-gray-100 shadow-none sm:shadow-sm px-5 py-6 sm:p-8 pb-16 animate-fadeIn -mx-4 sm:mx-0">
        <div className="text-sm text-gray-700 leading-relaxed font-sans space-y-6">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">제1조 (목적)</h2>
          <p>
            본 약관은 개인 개발자 김솔비(이하 &quot;운영자&quot;)가 제공하는 '모여봐요 너굴상점' 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 운영자와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">제2조 (서비스의 성격)</h2>
          <p>
            1. 본 서비스는 회원 상호 간의 자율적인 물품 교환, 나눔 및 커뮤니케이션을 위한 온라인 공간을 제공하는 것을 목적으로 합니다.<br />
            2. 본 서비스 내에서는 어떠한 형태의 전자결제나 현금 거래 기능도 제공하지 않으며, 운영자는 통신판매의 당사자가 아닙니다.<br />
            3. 회원 간에 이루어지는 물품 교환이나 나눔에 관한 모든 책임은 회원 본인에게 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">제3조 (회원의 의무)</h2>
          <p>
            회원은 서비스를 이용함에 있어 다음의 행위를 하여서는 안 됩니다.<br />
            1. 타인의 정보 도용 및 허위 정보 등록<br />
            2. 법령에서 유통을 금지하는 불법 물품(마약, 총기류, 불법 의약품 등)의 게시<br />
            3. 타인에게 불쾌감을 주거나 사기 등 범죄와 관련된 행위<br />
            4. 운영자의 서버 및 인프라에 무리를 주거나 정상적인 서비스 운영을 방해하는 행위
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">제4조 (운영자의 면책)</h2>
          <p>
            1. 운영자는 회원 간의 교환, 나눔 등 상호작용에 대해 개입할 의무가 없으며 이로 인해 발생하는 손해에 대해 책임을 지지 않습니다.<br />
            2. 운영자는 천재지변, 디도스(DDoS) 공격 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.<br />
            3. 회원이 등록한 게시물의 신뢰도 및 정확성에 대해 운영자는 보증하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">제5조 (서비스의 중단 및 탈퇴)</h2>
          <p>
            1. 회원은 언제든지 설정(내 정보) 메뉴를 통해 회원 탈퇴를 요청할 수 있습니다.<br />
            2. 탈퇴 시 24시간의 유예 기간이 부여되며, 해당 기간 내에는 재가입이 제한됩니다.<br />
            3. 유예 기간 경과 후 회원과 연관된 데이터(게시물, 채팅 내역 제외)는 즉시 파기되거나 익명 처리됩니다.
          </p>
        </section>

        <p className="text-gray-400 mt-8 text-xs">
          본 약관은 2026년 7월 21일부터 시행됩니다.
        </p>
        </div>
      </div>
    </div>
  );
}
