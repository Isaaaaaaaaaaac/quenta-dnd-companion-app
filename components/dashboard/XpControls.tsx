'use client';

import { useState } from 'react';
import { addXp, addXpToAll } from '@/lib/db/actions';

interface Props {
  characterId: string;
  label?: string;
}

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
    <div className="flex items-center gap-2">
      {label && <span className="text-sm" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif' }}>{label}</span>}
      <input
        type="number"
        min="0"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handle(); }}
        placeholder="XP"
        className="w-20 text-center text-sm"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: '1px solid #5a4020',
          color: '#e8d5a3',
          outline: 'none',
        }}
      />
      <button
        onClick={handle}
        disabled={pending}
        className="px-3 py-1 text-xs transition-opacity hover:opacity-70"
        style={{
          border: '1px solid #c8922a',
          color: '#c8922a',
          backgroundColor: 'transparent',
          fontFamily: 'Cinzel, serif',
          cursor: pending ? 'not-allowed' : 'pointer',
          opacity: pending ? 0.5 : 1,
        }}
      >
        + XP
      </button>
    </div>
  );
}
