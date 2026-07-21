import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';
import { GlobalConfirmModal } from '@/components/GlobalConfirmModal';

export const metadata: Metadata = {
  title: '모여봐요 너굴상점 ',
  description: '너굴 사장님과 함께하는 숲속 사내 중고장터',
  manifest: '/manifest.json',
  themeColor: '#46834B',
  appleWebApp: {
    statusBarStyle: 'default',
    title: '모여봐요 너굴상점',
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
        <meta name="mobile-web-app-capable" content="yes" />
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
