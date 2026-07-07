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
};

export default nextConfig;
