import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = pathname.startsWith('/sign-in') || pathname.startsWith('/api/auth');
  if (isPublic) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const isDm = token.email === process.env.NEXT_PUBLIC_DM_EMAIL;
  if (!isDm && !pathname.startsWith('/my-character') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/my-character', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte|ttf|woff2?|png|jpg|webp|gif|svg)).*)',
  ],
};
