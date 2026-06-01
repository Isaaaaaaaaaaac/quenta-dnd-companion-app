'use client';

import { usePathname } from 'next/navigation';

interface Props { isDm: boolean; isSuperAdmin: boolean; }

export default function NavLinks({ isDm, isSuperAdmin }: Props) {
  const pathname = usePathname();

  const link = (path: string, label: string, gold = false): React.CSSProperties => {
    const active = pathname === path || pathname.startsWith(path + '/');
    return {
      fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, letterSpacing: '.04em',
      color: active || gold ? 'var(--gold)' : 'var(--fg-2)',
      textDecoration: 'none', padding: '0 8px', height: 32, lineHeight: '32px',
      borderRadius: '5px',
      border: `1px solid ${active ? 'rgba(184,134,11,.35)' : 'transparent'}`,
      background: active ? 'rgba(184,134,11,.06)' : 'none',
      transition: 'all .2s', display: 'inline-block',
    };
  };

  return (
    <nav style={{ display: 'flex', gap: 4 }}>
      {isDm && (
        <>
          <a href="/campaigns"  style={link('/campaigns',  'Campagne')}>Campagne</a>
          <a href="/characters" style={link('/characters', 'Personaggi')}>Personaggi</a>
        </>
      )}
      {!isDm && (
        <a href="/my-characters" style={link('/my-characters', 'I miei personaggi')}>I miei personaggi</a>
      )}
      {isSuperAdmin && (
        <a href="/admin" style={link('/admin', 'Admin', true)}>Admin</a>
      )}
    </nav>
  );
}
