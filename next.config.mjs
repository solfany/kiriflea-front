/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.25',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '211.234.108.224',
        port: '10005',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      }
    ],
  },

  // 모든 /api/* 요청을 백엔드(8080)로 프록시
  // → 핸드폰에서도 localhost:8080 직접 호출 없이 동작
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: '/ws/:path*',
        destination: `${backendUrl}/ws/:path*`,
      },
    ];
  },

  // 모바일 접속 허용 (Cross Origin dev warning 제거)
  allowedDevOrigins: ['192.168.0.25'],

  // 로컬 빌드 결과물 패키징을 위한 독립 실행 모드 활성화
  output: 'standalone',

  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    // script-src에 'unsafe-inline'이 필요한 이유: Next.js App Router가 하이드레이션 데이터를
    // 인라인 <script>(__next_f.push)로 내려주기 때문. nonce 기반으로 바꾸려면 미들웨어 작업이
    // 추가로 필요해 이번에는 범위에서 제외. 개발 모드는 Fast Refresh가 eval을 쓰므로 unsafe-eval도 허용.
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "img-src 'self' data: blob: https://api.dicebear.com https://*.amazonaws.com http://localhost:8080 http://192.168.0.25:8080 http://211.234.108.224:10005",
      "font-src 'self' data: https://cdn.jsdelivr.net",
      "connect-src 'self' ws: wss: http://localhost:8080 http://localhost:10005 http://192.168.0.25:8080 http://192.168.0.25:10005 http://211.234.108.224:10005 https://cdn.jsdelivr.net",
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
