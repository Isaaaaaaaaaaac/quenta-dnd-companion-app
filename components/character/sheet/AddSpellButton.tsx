'use client';

import { useState } from 'react';
import SpellSearchModal from '@/components/character/spell/SpellSearchModal';
import type { KnownSpell, CharacterClass, CharacterStats } from '@/lib/db/schema';

interface Props {
  characterId: string;
  currentSpells: KnownSpell[];
  casterClassKeys: string[];
  characterClasses: CharacterClass[];
  characterStats: CharacterStats;
}

export default function AddSpellButton({ characterId, currentSpells, casterClassKeys, characterClasses, characterStats }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em',
          color: 'var(--arcane)', background: 'var(--arcane-soft)',
          border: '1px solid var(--arcane-border)', padding: '0 var(--s-1)',
          height: 24, borderRadius: 'var(--r-sm)', cursor: 'pointer', transition: 'all .2s', flexShrink: 0,
        }}
      >
        + Aggiungi
      </button>
      {open && (
        <SpellSearchModal
          characterId={characterId}
          currentSpells={currentSpells}
          casterClassKeys={casterClassKeys}
          characterClasses={characterClasses}
          characterStats={characterStats}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
