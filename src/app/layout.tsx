import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';
import { GlobalConfirmModal } from '@/components/GlobalConfirmModal';

export const metadata: Metadata = {
  title: '우리끼리 플리마켓',
  description: '사내 중고거래 마켓',
  manifest: '/manifest.json',
  themeColor: '#f97316',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '끼리플리',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" as="style" crossOrigin="" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
      </head>
      <body className="font-pretendard" suppressHydrationWarning>
        <Providers>
          {children}
          <GlobalConfirmModal />
        </Providers>
      </body>
    </html>
  );
}
