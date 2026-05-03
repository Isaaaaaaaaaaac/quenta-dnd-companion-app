'use client';

import { useState } from 'react';
import { applyDamage, applyHealing, setTempHp } from '@/lib/db/actions';

interface Props {
  characterId: string;
  hpCurrent: number;
  hpMax: number;
}

export default function HpControls({ characterId, hpCurrent, hpMax }: Props) {
  const [amount, setAmount] = useState('');
  const [pending, setPending] = useState(false);

  async function handle(action: 'damage' | 'heal' | 'temp') {
    const n = parseInt(amount);
    if (!n || n <= 0) return;
    setPending(true);
    if (action === 'damage') await applyDamage(characterId, n);
    else if (action === 'heal') await applyHealing(characterId, n);
    else await setTempHp(characterId, n);
    setAmount('');
    setPending(false);
  }

  const btnStyle = (color: string) => ({
    padding: '2px 10px',
    fontSize: '0.8rem',
    border: `1px solid ${color}`,
    color,
    backgroundColor: 'transparent',
    fontFamily: 'Cinzel, serif',
    cursor: pending ? 'not-allowed' : 'pointer',
    opacity: pending ? 0.5 : 1,
  });

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="number"
        min="0"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handle('damage'); }}
        placeholder="0"
        className="w-16 text-center text-sm"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: '1px solid #5a4020',
          color: '#e8d5a3',
          outline: 'none',
        }}
      />
      <button style={btnStyle('#8b2020')} onClick={() => handle('damage')} disabled={pending}>
        Danno
      </button>
      <button style={btnStyle('#4a7c4e')} onClick={() => handle('heal')} disabled={pending}>
        Cura
      </button>
      <button style={btnStyle('#5a7a9a')} onClick={() => handle('temp')} disabled={pending}>
        Temp
      </button>
    </div>
  );
}
