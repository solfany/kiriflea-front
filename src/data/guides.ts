export interface GuideItem {
  id: string;
  title: string;
  description: string;
  file: string;
}

export const GUIDES: GuideItem[] = [
  {
    id: 'service',
    title: '🛍️ 끼리플리마켓 서비스 이용 가이드',
    description: '상품 검색, 찜하기, 끼리톡 채팅, 매너 점수 등 끼리플리마켓의 모든 주요 기능과 사용법을 알아봅니다.',
    file: '/guides/service.md',
  },
  {
    id: 'manner',
    title: '🐘 끼리플리 매너 점수 및 계급 안내',
    description: '매너 점수 획득 방식과 7단계 매너 계급(아기 끼리부터 전설의 끼리까지)에 대한 상세 기준을 알아봅니다.',
    file: '/guides/manner.md',
  },
  {
    id: 'trading',
    title: '🤝 끼리플리 안전 거래 수칙',
    description: '사내 동료와의 쾌적하고 신뢰할 수 있는 직거래 규칙과 거래 금지 품목을 안내합니다.',
    file: '/guides/trading.md',
  },
];
