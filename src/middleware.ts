import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value
    ?? req.headers.get('authorization')?.replace('Bearer ', '');

  console.log(`[MIDDLEWARE] Path: ${req.nextUrl.pathname}, Has Token: ${!!token}`);

  const isPublic = PUBLIC_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));

  if (!token && !isPublic) {
    console.log(`[MIDDLEWARE] Redirecting to /login (no token, private path)`);
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (token && isPublic) {
    console.log(`[MIDDLEWARE] Redirecting to / (has token, public path)`);
    return NextResponse.redirect(new URL('/', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
