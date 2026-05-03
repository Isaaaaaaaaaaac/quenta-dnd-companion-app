import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

export const metadata: Metadata = {
  title: 'Aethon Companion',
  description: 'Strumento del Dungeon Master',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const isDm = userId === process.env.DM_USER_ID;

  return (
    <ClerkProvider>
      <html lang="it" className="h-full">
        <body suppressHydrationWarning className="min-h-full flex flex-col" style={{ backgroundColor: '#1a1410' }}>
          <header className="border-b px-6 py-3 flex items-center justify-between"
            style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
            <a href={isDm ? '/' : '/my-character'} style={{ fontFamily: 'Cinzel Decorative, serif', color: '#c8922a', fontSize: '1.2rem', textDecoration: 'none' }}>
              Aethon
            </a>
            <div className="flex items-center gap-6">
              {isDm && (
                <nav className="flex gap-6 text-sm" style={{ fontFamily: 'Crimson Text, serif', color: '#a08060' }}>
                  <a href="/campaigns"  className="hover:text-amber-300 transition-colors">Campagne</a>
                  <a href="/characters" className="hover:text-amber-300 transition-colors">Personaggi</a>
                </nav>
              )}
              {userId && <UserButton />}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
