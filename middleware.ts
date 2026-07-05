import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/tasks', '/annotate', '/analytics'];

// Routes that should redirect away if already authenticated
const AUTH_ROUTES = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read JWT access token from cookies (set at login time)
  const token = request.cookies.get('access_token')?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // ── No token → trying to access a protected route → redirect to /login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Has token → trying to access /login → redirect to /tasks
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  // ── Root path → redirect based on auth state
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(token ? '/tasks' : '/login', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all routes EXCEPT:
   *   - Next.js internals (_next/static, _next/image)
   *   - API routes (/api/...)
   *   - Public files (favicon.ico, images, etc.)
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
