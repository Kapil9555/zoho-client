// middleware.js (or middleware.ts)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessTokenSales')?.value || null;

  // console.log("tokentoken",token)

  const isAuthPage = pathname === '/login';

  // If not logged in: allow only /login
  if (!token) {
    if (isAuthPage) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in: block /login and send to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Logged in & accessing any other page -> allow
  return NextResponse.next();
}

export const config = {
  // skip Next internals and API routes
  matcher: ['/((?!_next|favicon.ico|api|assets|callback).*)'],
};
