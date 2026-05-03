import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return NextResponse.next();

  const { userId } = await auth.protect();
  const isDm = userId === process.env.NEXT_PUBLIC_DM_USER_ID;

  // I giocatori possono accedere solo a /my-character e alle API
  if (!isDm && !request.nextUrl.pathname.startsWith('/my-character') && !request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/my-character', request.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte|ttf|woff2?|png|jpg|webp|gif|svg)).*)',
    '/(api|trpc)(.*)',
  ],
};
