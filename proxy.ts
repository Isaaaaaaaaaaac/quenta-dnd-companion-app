import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = pathname.startsWith('/sign-in') || pathname.startsWith('/api/auth');
  if (isPublic) return NextResponse.next();

  // Optimistic check: verifica solo la presenza del cookie di sessione
  const sessionToken =
    req.cookies.get('__Secure-authjs.session-token') ??
    req.cookies.get('authjs.session-token');

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Il routing DM vs giocatore è gestito nelle singole pagine
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte|ttf|woff2?|png|jpg|webp|gif|svg)).*)',
  ],
};
