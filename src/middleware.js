import { NextResponse } from 'next/server';

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Always allow login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for Firebase-based admin session cookie
    const adminUid = request.cookies.get('admin-uid');
    const adminRole = request.cookies.get('admin-role');

    if (!adminUid?.value || !adminRole?.value) {
      // Not logged in — redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
