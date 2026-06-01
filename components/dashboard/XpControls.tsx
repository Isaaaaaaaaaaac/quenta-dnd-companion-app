'use client';

import { useState } from 'react';
import { addXp, addXpToAll } from '@/lib/db/actions';

interface Props { characterId: string; label?: string; }

export default function XpControls({ characterId, label }: Props) {
  const [amount, setAmount] = useState('');
  const [pending, setPending] = useState(false);

  async function handle() {
    const n = parseInt(amount);
    if (!n || n <= 0) return;
    setPending(true);
    if (characterId === 'all') await addXpToAll(n);
    else await addXp(characterId, n);
    setAmount('');
    setPending(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--fg-2)', letterSpacing: '.06em' }}>{label}</span>}
    <div style={{ display: 'flex', gap: 'var(--s-1)' }}>
      <input
        type="number" min="0"
        value={amount} onChange={e => setAmount(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handle(); }}
        placeholder="XP"
        style={{
          flex: 1, height: 32, textAlign: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border-leather)',
          borderRadius: 'var(--r-sm)', color: 'var(--fg-1)',
          fontFamily: 'var(--font-sans)', fontSize: '12px',
          outline: 'none', padding: '0 var(--s-1)',
        }}
      />
      <button onClick={handle} disabled={pending}
        style={{
          flex: 1, fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em',
          height: 32, borderRadius: 'var(--r-sm)', border: '1px solid var(--border-leather)',
          background: 'var(--bg-card)', color: 'var(--fg-2)',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.4 : 1, transition: 'all .2s',
        }}>
        + Assegna XP
      </button>
    </div>
    </div>
  );
}
