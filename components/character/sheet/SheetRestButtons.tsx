'use client';

import { shortRest, longRest } from '@/lib/db/actions';

export default function SheetRestButtons({ characterId }: { characterId: string }) {
  const btn = (label: string, action: () => Promise<void>, color: string) => (
    <button onClick={action}
      style={{
        border: `1px solid ${color}`, color, backgroundColor: 'transparent',
        fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '6px 12px',
        cursor: 'pointer', letterSpacing: '0.04em',
      }}>
      {label}
    </button>
  );

  return (
    <div className="flex gap-2">
      {btn('Riposo Breve', () => shortRest(characterId), '#5a7a9a')}
      {btn('Riposo Lungo', () => longRest(characterId), '#4a7c4e')}
    </div>
  );
}
