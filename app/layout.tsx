import type { Metadata } from 'next';
import './globals.css';
import { auth, signOut } from '@/auth';
import { getSessionUser } from '@/lib/auth-helpers';
import NavLinks from '@/components/layout/NavLinks';
import MobileNavDrawer from '@/components/layout/MobileNavDrawer';
import { Source_Serif_4, Public_Sans } from 'next/font/google';

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Quenta',
  description: 'D&D Companion App',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessionUser = await getSessionUser();
  const isDm = sessionUser?.role === 'dm' || sessionUser?.role === 'superadmin';
  const isSuperAdmin = sessionUser?.role === 'superadmin';
  const session = await auth();

  // User initials from full name (e.g. "Isacco Nencioni" → "IN")
  const initials = session?.user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?';

  return (
    <html lang="it" className={`h-full ${sourceSerif4.variable} ${publicSans.variable}`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <header className="site-header">

          {/* Logo */}
          <a href={isDm ? '/' : '/my-character'} style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: '16px', fontWeight: 700, letterSpacing: '.12em', color: 'var(--gold)' }}>
              QUENTA
            </span>
          </a>

          {/* ── Desktop nav (≥ 768px) ── */}
          <div className="header-full-nav">
            <NavLinks isDm={isDm} isSuperAdmin={isSuperAdmin} />

            {session && (
              <>
                <div style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: '11px', fontWeight: 600,
                  background: 'var(--gold)', color: 'var(--bg-deep)',
                  padding: '0 8px', height: 32, lineHeight: '32px',
                  borderRadius: '5px', minWidth: 32, textAlign: 'center',
                  marginLeft: 4, flexShrink: 0,
                }}>
                  {initials}
                </div>
                <form action={async () => { 'use server'; await signOut({ redirectTo: '/sign-in' }); }}>
                  <button type="submit" style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: '11px', fontWeight: 500, letterSpacing: '.04em',
                    color: 'var(--fg-2)', background: 'none',
                    border: '1px solid var(--border-leather)', padding: '0 8px',
                    height: 32, lineHeight: '30px', borderRadius: '5px',
                    cursor: 'pointer', transition: 'all .2s',
                  }}>
                    Esci
                  </button>
                </form>
              </>
            )}
          </div>

          {/* ── Mobile hamburger (< 768px) ── */}
          <div className="header-hamburger">
            {session && (
              <MobileNavDrawer
                isDm={isDm}
                isSuperAdmin={isSuperAdmin}
                initials={initials}
                userName={session.user?.name ?? ''}
                userRole={sessionUser?.role ?? 'player'}
                signOutSlot={
                  <form action={async () => { 'use server'; await signOut({ redirectTo: '/sign-in' }); }}>
                    <button type="submit" style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', background: 'none',
                      border: '1px solid var(--border-leather)',
                      borderRadius: 'var(--r)', padding: '0 12px',
                      height: 36, cursor: 'pointer',
                      fontFamily: "var(--font-sans)",
                      fontSize: '12px', fontWeight: 500, letterSpacing: '.04em',
                      color: 'var(--fg-2)',
                    }}>
                      <span style={{ fontSize: 14 }}>→</span> Esci dall&apos;account
                    </button>
                  </form>
                }
              />
            )}
          </div>
        </header>

        <main style={{ flex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
