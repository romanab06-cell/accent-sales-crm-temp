// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================
// Save as: middleware.ts (in root directory, same level as app/)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];
  
  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // For client-side routing, we'll check auth in the app
  // This middleware just ensures /login is accessible
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
