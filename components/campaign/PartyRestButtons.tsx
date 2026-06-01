'use client';

import { useState } from 'react';
import { shortRestParty, longRestParty } from '@/lib/db/actions';

interface Props { campaignId: string; }

export default function PartyRestButtons({ campaignId }: Props) {
  const [pending, setPending] = useState<'short' | 'long' | null>(null);

  async function handleRest(type: 'short' | 'long') {
    setPending(type);
    if (type === 'short') await shortRestParty(campaignId);
    else await longRestParty(campaignId);
    setPending(null);
  }

  const btn = (type: 'short' | 'long', label: string, color: string): React.CSSProperties => ({
    flex: 1, fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.07em',
    height: 32, borderRadius: 'var(--r)', border: `1px solid ${color}`,
    color, background: 'transparent',
    cursor: pending ? 'not-allowed' : 'pointer',
    opacity: pending && pending !== type ? 0.4 : 1,
    transition: 'all .2s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--fg-3)', letterSpacing: '.05em' }}>
        Dichiara riposo per i personaggi attivi nel party
      </div>
      <div style={{ display: 'flex', gap: 'var(--sp-1)' }}>
        <button
          onClick={() => handleRest('short')} disabled={!!pending}
          style={btn('short', 'var(--info)', 'var(--info)')}>
          {pending === 'short' ? '…' : '☽ Riposo Breve'}
        </button>
        <button
          onClick={() => handleRest('long')} disabled={!!pending}
          style={btn('long', 'var(--arcane)', 'var(--arcane)')}>
          {pending === 'long' ? '…' : '☾ Riposo Lungo'}
        </button>
      </div>
    </div>
  );
}
