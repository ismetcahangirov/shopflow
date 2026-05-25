// src/middleware.ts
// Middleware managing localization routing and client-side route protection

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// List of protected routes that require authentication
const protectedRoutes = ['/checkout', '/orders', '/profile', '/settings'];
const adminRoutes = ['/admin'];
const vendorRoutes = ['/vendor'];
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Determine if the current route is protected or auth-related
  // Remove locale prefix if present (e.g. /az/checkout -> /checkout)
  const pathnameWithoutLocale = pathname.replace(/^\/(az|en|ru)/, '') || '/';

  const isProtected = protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route));
  const isAdmin = adminRoutes.some((route) => pathnameWithoutLocale.startsWith(route));
  const isVendor = vendorRoutes.some((route) => pathnameWithoutLocale.startsWith(route));
  const isAuth = authRoutes.some((route) => pathnameWithoutLocale.startsWith(route));

  // Retrieve auth cookies (e.g. refresh_token or logged_in indicator)
  // Access token is usually in-memory, so we check the refresh_token cookie or a logged_in cookie
  const isAuthenticated = request.cookies.has('refreshToken');
  const userRole = request.cookies.get('userRole')?.value ?? 'CUSTOMER';

  // Get requested locale for redirect paths
  const locale = request.cookies.get('NEXT_LOCALE')?.value ?? 'az';

  // 1. If trying to access protected route but not authenticated, redirect to login
  if ((isProtected || isAdmin || isVendor) && !isAuthenticated) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    // Remember the original destination for post-login redirect
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Role-based authorization
  if (isAdmin && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
  }

  if (isVendor && userRole !== 'VENDOR' && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
  }

  // 3. If authenticated and trying to access login/register, redirect to home
  if (isAuth && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}/`, request.url));
  }

  // Let next-intl handle language routing
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames and exclude api, static assets, etc.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)'],
};
