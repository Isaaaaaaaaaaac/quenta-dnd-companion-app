'use client';

import { useState } from 'react';
import { addCondition } from '@/lib/db/actions';
import { CONDITIONS } from '@/lib/srd/conditions';

interface Props { characterId: string; }

export default function AddConditionButton({ characterId }: Props) {
  const [open, setOpen] = useState(false);

  async function handleAdd(key: string) {
    await addCondition(characterId, key);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.07em',
          color: 'var(--fg-3)', background: 'none',
          border: '1px dashed var(--fg-3)', padding: '0 var(--s-1)',
          height: 24, borderRadius: 'var(--r)', cursor: 'pointer', transition: 'all .2s',
        }}>
        + Condizione
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', left: 0, top: '100%', marginTop: 4,
            zIndex: 20, maxHeight: 240, overflowY: 'auto',
            background: 'var(--bg-card)', border: '1px solid var(--border-leather)',
            borderRadius: 'var(--r)', minWidth: 180,
          }}>
            {CONDITIONS.map(c => (
              <button key={c.key} onClick={() => handleAdd(c.key)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '8px 14px',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--fg-1)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: '1px solid var(--border-leather)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
