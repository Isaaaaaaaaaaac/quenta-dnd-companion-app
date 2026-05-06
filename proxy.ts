import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/join');

  if (isPublic) return NextResponse.next();

  const sessionToken =
    req.cookies.get('__Secure-authjs.session-token') ??
    req.cookies.get('authjs.session-token');

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte|ttf|woff2?|png|jpg|webp|gif|svg)).*)',
  ],
};
