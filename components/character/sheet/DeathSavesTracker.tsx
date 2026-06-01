'use client';

import { useState } from 'react';
import { updateCharacterSheet } from '@/lib/db/actions';
import type { CharacterSheet } from '@/lib/db/schema';

interface Props { characterId: string; sheet: CharacterSheet; }

export default function DeathSavesTracker({ characterId, sheet }: Props) {
  const [saves, setSaves] = useState(sheet.deathSaves ?? { successes: 0, failures: 0 });

  async function update(type: 'successes' | 'failures', val: number) {
    const updated = { ...saves, [type]: Math.max(0, Math.min(3, val)) };
    setSaves(updated);
    await updateCharacterSheet(characterId, { deathSaves: updated });
  }

  return (
    <div>
      <div className="label" style={{ color: 'var(--fg-1)', marginBottom: 10 }}>Tiri Salvezza vs Morte</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {([
          { key: 'successes' as const, label: 'Successi', color: 'var(--info)' },
          { key: 'failures' as const,  label: 'Fallimenti', color: 'var(--danger)' },
        ]).map(({ key, label, color }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.875rem', minWidth: 70, fontStyle: 'italic' }}>
              {label}
            </span>
            <div style={{ display: 'flex', gap: 6, cursor: 'pointer' }}
              onClick={() => update(key, saves[key] < 3 ? saves[key] + 1 : 0)}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: 'var(--r-sm)',
                  backgroundColor: i < saves[key] ? color : 'transparent',
                  border: `2px solid ${color}`,
                  transition: 'background-color 0.15s ease',
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {saves.failures >= 3 && (
        <div style={{ fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.3em', color: 'var(--fg-1)', marginTop: 10 }}>
          ✝ Il personaggio è morto
        </div>
      )}
      {saves.successes >= 3 && (
        <div style={{ fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.3em', color: 'var(--fg-1)', marginTop: 10 }}>
          ♥ Stabile
        </div>
      )}
    </div>
  );
}
