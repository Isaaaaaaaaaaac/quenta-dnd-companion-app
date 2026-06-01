'use client';

import { useState } from 'react';
import { setActiveCharacter } from '@/lib/db/actions';

interface Props {
  characterId: string;
  isActive: boolean;
  currentActiveName: string | null; // nome del PG attualmente attivo (se diverso)
}

export default function ActiveCharacterButton({ characterId, isActive, currentActiveName }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleActivate() {
    setPending(true);
    await setActiveCharacter(characterId);
    setPending(false);
    setShowConfirm(false);
  }

  if (isActive) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--hp-healthy)', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--hp-healthy)', textTransform: 'uppercase' }}>
          Attivo
        </span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em',
          color: 'var(--fg-2)', background: 'none',
          border: '1px solid var(--border-leather)', padding: '0 var(--s-1)',
          height: 24, borderRadius: 'var(--r-sm)', cursor: 'pointer', transition: 'all .2s',
        }}
      >
        Attiva
      </button>

      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(12,10,9,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r-lg)', padding: 'var(--s-3)', maxWidth: 360, width: '100%' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--fg-1)', lineHeight: 1.6, marginBottom: 'var(--s-2)' }}>
              {currentActiveName
                ? <>Se attivi questo personaggio, stai disattivando <strong style={{ color: 'var(--gold)' }}>{currentActiveName}</strong>.</>
                : 'Vuoi attivare questo personaggio per la campagna?'}
            </p>
            <div style={{ display: 'flex', gap: 'var(--s-1)', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirm(false)}
                style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em', color: 'var(--fg-2)', background: 'none', border: '1px solid var(--border-leather)', padding: '0 var(--s-2)', height: 32, borderRadius: 'var(--r-sm)', cursor: 'pointer' }}>
                Cancella
              </button>
              <button onClick={handleActivate} disabled={pending}
                style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em', color: 'var(--bg-deep)', background: 'var(--gold)', border: 'none', padding: '0 var(--s-2)', height: 32, borderRadius: 'var(--r-sm)', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.5 : 1 }}>
                {pending ? '…' : 'Attiva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
