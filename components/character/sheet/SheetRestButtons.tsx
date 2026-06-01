'use client';

import { shortRest, longRest } from '@/lib/db/actions';

const BTN: React.CSSProperties = {
  flex: 1, fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em',
  height: 32, borderRadius: 'var(--r)', background: 'var(--bg-card)',
  border: '1px solid var(--border-leather)', color: 'var(--fg-2)',
  cursor: 'pointer', transition: 'all .2s', textAlign: 'center',
};

export default function SheetRestButtons({ characterId }: { characterId: string }) {
  return (
    <>
      <button onClick={() => shortRest(characterId)} style={BTN}>Riposo Breve</button>
      <button onClick={() => longRest(characterId)} style={BTN}>Riposo Lungo</button>
    </>
  );
}
