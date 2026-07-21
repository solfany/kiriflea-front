export interface GuideItem {
  id: string;
  title: string;
  description: string;
  file: string;
}

export const GUIDES: GuideItem[] = [
  {
    id: 'registration',
    title: '상품 등록 및 상태 변경 가이드',
    description: '상품 등록부터 판매 완료까지, 판매중/예약중/판매완료 변경 기준을 안내합니다.',
    file: '/guides/registration.md',
  },
  {
    id: 'auction',
    title: '경매(Auction) 시스템 상세 가이드',
    description: '입찰 규칙, 팝콘 타임(자동 연장), 조기 낙찰 등 경매 룰과 알고리즘을 알아봅니다.',
    file: '/guides/auction.md',
  },
  {
    id: 'trending',
    title: '급상승 중고(Trending) 알고리즘',
    description: '홈 화면 상단 급상승 TOP 10에 오르는 기준과 실시간 집계 방식을 안내합니다.',
    file: '/guides/trending.md',
  },
  {
    id: 'daramtalk',
    title: '다람톡(채팅) 이용 가이드 및 페널티',
    description: '실시간 채팅 이용 규칙, 매너 온도 반영 및 비매너 행위(노쇼 등) 페널티를 안내합니다.',
    file: '/guides/daramtalk.md',
  },
  {
    id: 'manner',
    title: '너굴상점 매너 점수 및 계급 안내',
    description: '매너 점수 획득 방식과 6단계 매너 계급(새싹 주민부터 명예 주민까지)에 대한 상세 기준을 알아봅니다.',
    file: '/guides/manner.md',
  },
  {
    id: 'trading',
    title: '너굴상점 안전 거래 수칙',
    description: '사내 동료와의 쾌적하고 신뢰할 수 있는 직거래 규칙과 거래 금지 품목을 안내합니다.',
    file: '/guides/trading.md',
  },
];
