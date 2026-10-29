import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || request.nextUrl.hostname;

  // Canonical apex domain redirect to www.bharatyatra.in (HTTP 308 permanent redirect)
  if (host === 'bharatyatra.in') {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://www.bharatyatra.in');
    return NextResponse.redirect(targetUrl, 308);
  }

  const { pathname } = request.nextUrl;

  // Clone headers for response to append security headers
  const response = NextResponse.next();

  // Set essential defense-in-depth HTTP security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Check for presence of auth token across cookies and Authorization header
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
  let tokenFromCookie =
    request.cookies.get('sb_auth_token')?.value ||
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('auth_token')?.value ||
    request.cookies.get('sb_refresh_token')?.value ||
    request.cookies.get('sb-refresh-token')?.value ||
    request.cookies.get('auth_refresh_token')?.value ||
    request.cookies.get('admin_token')?.value;

  if (!tokenFromCookie) {
    for (const c of request.cookies.getAll()) {
      if (c.name.startsWith('sb-') && c.name.endsWith('-auth-token')) {
        tokenFromCookie = c.value;
        break;
      }
    }
  }

  const hasAuthToken = Boolean(tokenFromHeader || tokenFromCookie);

  // Helper for safe returnTo parameter (prevent open redirects)
  const safeReturnTo = pathname.startsWith('/') && !pathname.startsWith('//') && !pathname.includes('://') ? pathname : '/';

  // 1. Admin Area Edge Guard
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value || tokenFromCookie;
    if (!adminToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnTo', safeReturnTo);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protected Customer Pages Edge Guard
  const isProtectedCustomerRoute =
    pathname.startsWith('/my-trips') ||
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/saved') ||
    pathname.startsWith('/checkout');

  if (isProtectedCustomerRoute && !hasAuthToken) {
    // If client cookies are absent, redirect to login with return path
    // Note: If request has Sec-Fetch-Dest: document, redirect cleanly
    const isDocRequest = request.headers.get('sec-fetch-dest') === 'document';
    if (isDocRequest) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', safeReturnTo);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - state-images (public assets)
     * - public files with extensions (.svg, .png, .jpg, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon.ico|state-images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js)$).*)',
  ],
};

