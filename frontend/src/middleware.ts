import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

const AUTH_REQUIRED_PREFIXES = [
  '/dashboard',
  '/wallet',
  '/vehicles',
  '/bills',
  '/history',
  '/charging',
  '/profile',
  '/settings',
  '/notifications',
  '/rfid',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('jwt_token')?.value;
  const session = await verifySessionToken(token);

  const redirectTo = (targetPath: string) => {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    url.search = '';
    return NextResponse.redirect(url);
  };

  // 1. Live telemetry route: shared by ADMIN and OPERATOR
  if (pathname === '/admin/live' || pathname.startsWith('/admin/live/')) {
    if (!session) return redirectTo('/auth/login/admin');
    if (session.role !== 'ADMIN' && session.role !== 'OPERATOR') {
      return redirectTo('/dashboard');
    }
    return NextResponse.next();
  }

  // 2. All other Admin routes: strictly ADMIN only
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!session) return redirectTo('/auth/login/admin');
    if (session.role !== 'ADMIN') {
      return redirectTo(session.role === 'OPERATOR' ? '/operator' : '/dashboard');
    }
    return NextResponse.next();
  }

  // 3. Operator Console routes: strictly OPERATOR or ADMIN
  if (pathname === '/operator' || pathname.startsWith('/operator/')) {
    if (!session) return redirectTo('/auth/login/operator');
    if (session.role !== 'OPERATOR' && session.role !== 'ADMIN') {
      return redirectTo('/dashboard');
    }
    return NextResponse.next();
  }

  // 4. Authenticated Driver / User portal routes
  const requiresAuth = AUTH_REQUIRED_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (requiresAuth && !session) {
    return redirectTo('/auth/login/user');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/operator/:path*',
    '/dashboard/:path*',
    '/wallet/:path*',
    '/vehicles/:path*',
    '/bills/:path*',
    '/history/:path*',
    '/charging/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/notifications/:path*',
    '/rfid/:path*',
  ],
};
