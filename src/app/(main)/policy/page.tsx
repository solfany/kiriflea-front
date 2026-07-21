'use client';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PolicyPage() {
  const router = useRouter();

  return (
    <div className="bg-white min-h-[calc(100vh-3.5rem)] -mx-4 px-4 pt-4 pb-12 -mt-4 sm:mt-0 sm:bg-transparent sm:min-h-0 sm:mx-0 sm:px-0 sm:pt-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 py-1">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">운영정책</h1>
      </div>
      
      {/* Main Content Area */}
      <div className="bg-white rounded-none sm:rounded-2xl border-y sm:border border-gray-100 shadow-none sm:shadow-sm px-5 py-6 sm:p-8 pb-16 animate-fadeIn -mx-4 sm:mx-0">
        <div className="text-sm text-gray-700 leading-relaxed font-sans space-y-6">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">1. 운영 목적</h2>
          <p>
            '모여봐요 너굴상점'은 회원 간의 건전하고 자발적인 물품 교환 및 나눔을 장려하기 위해 마련된 커뮤니티입니다. 본 운영정책은 모두가 안전하고 기분 좋게 서비스를 이용할 수 있도록 기본적인 규칙을 정한 것입니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">2. 금지된 활동 및 게시물</h2>
          <p>
            다음에 해당하는 활동이나 게시물 등록 시 경고 조치되거나 서비스 이용이 제한될 수 있습니다.<br />
            - 금전 거래 요구: 본 서비스는 무상 나눔 및 교환을 원칙으로 하며, 어떠한 형태의 현금 결제나 계좌 이체를 요구하는 행위를 금지합니다.<br />
            - 불법 및 위험 물품 등록: 마약, 총기, 의약품 등 법적으로 유통이 금지된 품목의 등록<br />
            - 비매너 행위: 욕설, 비방, 사기, 거래 파기 등 타 회원에게 피해를 주는 행위<br />
            - 도배 및 스팸: 동일한 물품을 반복적으로 올리거나 광고성 게시물을 올리는 행위
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">3. 매너 온도 및 제재 규정</h2>
          <p>
            회원 간의 거래 후 남기는 후기를 바탕으로 '매너 점수'가 산정됩니다.<br />
            - 비매너 행위 누적 또는 심각한 운영정책 위반 시, 운영진의 판단하에 매너 점수가 하락하거나 즉시 이용 정지(또는 영구 제명) 처리될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">4. 분쟁의 해결</h2>
          <p>
            회원 간에 발생한 분쟁은 상호 간에 자율적으로 해결하는 것을 원칙으로 합니다. 단, 명백한 사기나 범죄 행위가 의심될 경우, 피해 회원은 수사기관에 신고할 수 있으며 운영자는 법적 절차에 따라 수사기관의 요청 시 적극 협조합니다.
          </p>
        </section>

        <p className="text-gray-400 mt-8 text-xs">
          본 정책은 2026년 7월 21일부터 시행됩니다.
        </p>
        </div>
      </div>
    </div>
  );
}
