'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// GlobalNotification은 @stomp/stompjs + sockjs-client를 불러오는데, 정적으로 import하면
// 그 라이브러리들이 로그아웃 상태를 포함한 모든 페이지의 첫 로드 JS에 끼어든다.
// 별도 청크로 분리해서 필요할 때만 받아오도록 한다.
const GlobalNotification = dynamic(
  () => import('@/components/GlobalNotification').then((m) => m.GlobalNotification),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        // 채팅/입찰 등 실시간성이 중요한 화면은 이미 STOMP 소켓이나 짧은 폴링으로
        // 최신 상태를 반영하고 있어서, 탭 전환마다 전체 refetch가 또 도는 건 낭비다.
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster richColors position="top-center" />
      <GlobalNotification />
    </QueryClientProvider>
  );
}
