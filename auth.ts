import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getOrCreateUser, getUserByEmail } from '@/lib/db/userActions';

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
      if (account?.provider === 'google' && user.email) {
        // Usa il Google sub (providerAccountId) come ID stabile — è lo stesso su qualsiasi dispositivo
        const stableId = account.providerAccountId ?? user.id ?? user.email;
        await getOrCreateUser(stableId, user.email, user.name ?? '');
      }
      return true;
    },
    async jwt({ token }) {
      // Legge sempre da DB via email — stabile indipendentemente dall'ID usato
      if (token.email) {
        const dbUser = await getUserByEmail(token.email as string);
        token.role = dbUser?.role ?? 'pending';
        token.onboarded = dbUser?.onboarded ?? false;
        if (dbUser) token.dbUserId = dbUser.id;
      }
      return token;
    },
    session({ session, token }) {
      const u = session.user as unknown as Record<string, unknown>;
      u.id = token.dbUserId ?? token.sub;
      u.role = token.role;
      u.onboarded = token.onboarded;
      return session;
    },
  },
});
