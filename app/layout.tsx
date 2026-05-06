import type { Metadata } from 'next';
import './globals.css';
import { auth, signOut } from '@/auth';
import { getSessionUser } from '@/lib/auth-helpers';

export const metadata: Metadata = {
  title: 'Aethon Companion',
  description: 'Strumento del Dungeon Master',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();
  const isDm = sessionUser?.role === 'dm' || sessionUser?.role === 'superadmin';
  const isSuperAdmin = sessionUser?.role === 'superadmin';
  const session = await auth();

  return (
    <html lang="it" className="h-full">
      <body suppressHydrationWarning className="min-h-full flex flex-col" style={{ backgroundColor: '#1a1410' }}>
        <header className="border-b px-6 py-3 flex items-center justify-between"
          style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          <a href={isDm ? '/' : '/my-character'} style={{ fontFamily: 'Cinzel Decorative, serif', color: '#c8922a', fontSize: '1.2rem', textDecoration: 'none' }}>
            Aethon
          </a>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6 text-sm" style={{ fontFamily: 'Crimson Text, serif', color: '#a08060' }}>
                {isDm && <>
                  <a href="/campaigns"  className="hover:text-amber-300 transition-colors">Campagne</a>
                  <a href="/characters" className="hover:text-amber-300 transition-colors">Personaggi</a>
                </>}
                {!isDm && sessionUser && (
                  <a href="/my-characters" className="hover:text-amber-300 transition-colors">I miei personaggi</a>
                )}
                {isSuperAdmin && (
                  <a href="/admin" className="hover:text-amber-300 transition-colors" style={{ color: '#c8922a' }}>Admin</a>
                )}
              </nav>
            {session && (
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: 'Crimson Text, serif', color: '#6a5040', fontSize: '0.8rem' }}>
                  {session.user?.name}
                </span>
                <form action={async () => { 'use server'; await signOut({ redirectTo: '/sign-in' }); }}>
                  <button type="submit" style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '3px 10px', cursor: 'pointer' }}>
                    Esci
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
