import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('jwt_token')?.value;

  // Protect Admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login/admin';
      return NextResponse.redirect(url);
    }
  }

  // Protect Operator routes
  if (pathname.startsWith('/operator') && pathname !== '/operator/login') {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login/operator';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/operator/:path*',
  ],
};
