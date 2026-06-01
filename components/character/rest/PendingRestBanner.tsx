'use client';

import { useState } from 'react';
import ShortRestModal from './ShortRestModal';
import LongRestModal from './LongRestModal';
import type { CharacterClass, CharacterStats, KnownSpell } from '@/lib/db/schema';

interface Props {
  characterId: string;
  pendingRest: 'short' | 'long';
  classes: CharacterClass[];
  conModifier: number;
  hitDiceUsed: number;
  hpCurrent: number;
  hpMax: number;
  isPreparedCaster: boolean;
  currentSpells: KnownSpell[];
  casterClassKeys: string[];
  characterStats: CharacterStats;
}

export default function PendingRestBanner({
  characterId, pendingRest, classes, conModifier, hitDiceUsed,
  hpCurrent, hpMax, isPreparedCaster, currentSpells, casterClassKeys, characterStats,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const isShort = pendingRest === 'short';
  const accent = isShort ? 'var(--info)' : 'var(--arcane)';
  const bgColor = isShort ? 'rgba(14,116,144,.08)' : 'rgba(91,33,182,.08)';
  const border = isShort ? 'rgba(14,116,144,.35)' : 'rgba(91,33,182,.35)';

  return (
    <>
      <div style={{
        margin: '0 0 16px 0', padding: '10px 16px',
        background: bgColor, border: `1px solid ${border}`,
        borderRadius: 'var(--r)', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', color: accent, textTransform: 'uppercase', marginBottom: 2 }}>
            {isShort ? '☽ Riposo Breve dichiarato' : '☾ Riposo Lungo dichiarato'}
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)' }}>
            {isShort
              ? 'Il DM ha dichiarato un Riposo Breve. Puoi spendere Dadi Vita per recuperare PF.'
              : 'Il DM ha dichiarato un Riposo Lungo. PF e slot recuperati. Scegli i tuoi incantesimi.'}
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em', fontWeight: 600,
            color: accent, background: bgColor, border: `1px solid ${border}`,
            padding: '0 12px', height: 28, borderRadius: 'var(--r)',
            cursor: 'pointer', transition: 'all .2s', flexShrink: 0,
          }}
        >
          {isShort ? 'Gestisci riposo' : 'Scegli incantesimi'}
        </button>
      </div>

      {modalOpen && isShort && (
        <ShortRestModal
          characterId={characterId}
          classes={classes}
          conModifier={conModifier}
          hitDiceUsed={hitDiceUsed}
          hpCurrent={hpCurrent}
          hpMax={hpMax}
          onClose={() => setModalOpen(false)}
        />
      )}

      {modalOpen && !isShort && (
        <LongRestModal
          characterId={characterId}
          isPreparedCaster={isPreparedCaster}
          currentSpells={currentSpells}
          casterClassKeys={casterClassKeys}
          characterClasses={classes}
          characterStats={characterStats}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
