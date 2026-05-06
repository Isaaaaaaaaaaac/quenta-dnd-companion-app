import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getOrCreateUser } from '@/lib/db/userActions';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: { signIn: '/sign-in' },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.id && user.email) {
        await getOrCreateUser(user.id, user.email, user.name ?? '');
      }
      return true;
    },
    async jwt({ token, trigger }) {
      // Refresh role/onboarded on every session check
      if (token.sub && token.email) {
        const { getUserById } = await import('@/lib/db/userActions');
        const dbUser = await getUserById(token.sub);
        token.role = dbUser?.role ?? 'pending';
        token.onboarded = dbUser?.onboarded ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        const u = session.user as unknown as Record<string, unknown>;
        u.id = token.sub;
        u.role = token.role;
        u.onboarded = token.onboarded;
      }
      return session;
    },
  },
});
