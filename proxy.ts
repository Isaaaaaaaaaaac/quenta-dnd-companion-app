import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  const isPublic = pathname.startsWith('/sign-in') || pathname.startsWith('/api/auth');
  if (isPublic) return NextResponse.next();

  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const isDm = session.user?.email === process.env.NEXT_PUBLIC_DM_EMAIL;
  if (!isDm && !pathname.startsWith('/my-character') && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/my-character', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte|ttf|woff2?|png|jpg|webp|gif|svg)).*)',
    '/(api|trpc)(.*)',
  ],
};
