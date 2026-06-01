'use client';

import { useState } from 'react';
import { applyDamage, applyHealing, setTempHp } from '@/lib/db/actions';

interface Props { characterId: string; hpCurrent: number; hpMax: number; }

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

  const inp: React.CSSProperties = {
    width: 48, height: 32, padding: '0 6px', textAlign: 'center',
    background: 'var(--bg-card)', border: '1px solid var(--border-leather)',
    borderRadius: 'var(--r)', color: 'var(--fg-1)',
    fontFamily: 'var(--font-sans)', fontSize: '13px', outline: 'none',
  };
  const btn = (color: string, bg: string): React.CSSProperties => ({
    flex: 1, fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.07em',
    height: 32, borderRadius: 'var(--r)', border: `1px solid ${color}`, color,
    background: bg, cursor: pending ? 'not-allowed' : 'pointer',
    opacity: pending ? 0.4 : 1, transition: 'all .2s',
  });

  return (
    <div style={{ display: 'flex', gap: 'var(--sp-1)', alignItems: 'center' }}>
      <input
        type="number" min="0"
        value={amount} onChange={e => setAmount(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handle('damage'); }}
        placeholder="0"
        style={inp}
      />
      <button onClick={() => handle('damage')} disabled={pending}
        style={btn('var(--danger)', 'rgba(139,26,26,.07)')}>Danno</button>
      <button onClick={() => handle('heal')} disabled={pending}
        style={btn('var(--hp-healthy)', 'rgba(74,124,78,.07)')}>Cura</button>
      <button onClick={() => handle('temp')} disabled={pending}
        style={btn('var(--gold)', 'rgba(184,134,11,.06)')}>Temp</button>
    </div>
  );
}
