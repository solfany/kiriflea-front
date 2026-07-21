import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

// 참고: 이 미들웨어는 access_token 쿠키의 "존재 여부"만으로 라우팅을 가드하는 UX용 게이트다.
// 서명/만료 검증은 하지 않으며(Edge 런타임에서 검증하려면 jose로 서명 확인이 필요),
// 실제 인가는 백엔드가 매 요청마다 JWT를 검증하는 것으로 보장된다.
export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  const isPublic = PUBLIC_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
