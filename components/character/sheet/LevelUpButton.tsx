'use client';

import { useState } from 'react';
import LevelUpWizard from '@/components/character/LevelUpWizard';
import type { Character } from '@/lib/db/schema';

interface Props {
  character: Character;
  canLevelUp: boolean;
}

export default function LevelUpButton({ character, canLevelUp }: Props) {
  const [open, setOpen] = useState(false);
  const level = character.level;

  if (level >= 20) return null;

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{
          border: `1px solid ${canLevelUp ? '#c8922a' : '#5a4020'}`,
          color: canLevelUp ? '#c8922a' : '#5a4020',
          backgroundColor: canLevelUp ? '#2a2010' : 'transparent',
          fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '6px 12px',
          cursor: 'pointer', letterSpacing: '0.04em',
        }}>
        {canLevelUp ? '⬆ Level Up!' : `→ Lv ${level + 1}`}
      </button>

      {open && (
        <LevelUpWizard character={character} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
