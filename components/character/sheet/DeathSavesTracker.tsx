'use client';

import { useState } from 'react';
import { updateCharacterSheet } from '@/lib/db/actions';
import type { CharacterSheet } from '@/lib/db/schema';

interface Props {
  characterId: string;
  sheet: CharacterSheet;
}

export default function DeathSavesTracker({ characterId, sheet }: Props) {
  const [saves, setSaves] = useState(sheet.deathSaves ?? { successes: 0, failures: 0 });

  async function update(type: 'successes' | 'failures', val: number) {
    const updated = { ...saves, [type]: Math.max(0, Math.min(3, val)) };
    setSaves(updated);
    await updateCharacterSheet(characterId, { deathSaves: updated });
  }

  const dot = (filled: boolean, danger: boolean) => (
    <div style={{
      width: '14px', height: '14px', borderRadius: '50%',
      backgroundColor: filled ? (danger ? '#8b2020' : '#4a7c4e') : 'transparent',
      border: `2px solid ${danger ? '#8b2020' : '#4a7c4e'}`,
    }} />
  );

  return (
    <div>
      <div style={{ color: '#8b2020', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.06em', marginBottom: '8px' }}>
        TIRI SALVEZZA VS MORTE
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span style={{ color: '#4a7c4e', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', minWidth: '60px' }}>Successi</span>
          <div className="flex gap-1 cursor-pointer" onClick={() => update('successes', saves.successes < 3 ? saves.successes + 1 : 0)}>
            {[0, 1, 2].map(i => dot(i < saves.successes, false))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: '#8b2020', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', minWidth: '60px' }}>Fallimenti</span>
          <div className="flex gap-1 cursor-pointer" onClick={() => update('failures', saves.failures < 3 ? saves.failures + 1 : 0)}>
            {[0, 1, 2].map(i => dot(i < saves.failures, true))}
          </div>
        </div>
      </div>
      {saves.failures >= 3 && (
        <div className="mt-2" style={{ color: '#8b2020', fontFamily: 'Cinzel, serif', fontSize: '0.8rem' }}>
          ✝ Il personaggio è morto
        </div>
      )}
      {saves.successes >= 3 && (
        <div className="mt-2" style={{ color: '#4a7c4e', fontFamily: 'Cinzel, serif', fontSize: '0.8rem' }}>
          ♥ Stabile
        </div>
      )}
    </div>
  );
}
