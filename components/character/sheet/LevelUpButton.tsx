'use client';

import { useState } from 'react';
import LevelUpWizard from '@/components/character/LevelUpWizard';
import type { Character } from '@/lib/db/schema';

interface Props { character: Character; canLevelUp: boolean; }

export default function LevelUpButton({ character, canLevelUp }: Props) {
  const [open, setOpen] = useState(false);
  if (character.level >= 20) return null;

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{
          width: '100%', fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.09em',
          height: 32, marginTop: 'var(--s-1)', borderRadius: 'var(--r-sm)',
          border: `1px solid ${canLevelUp ? 'var(--gold)' : 'var(--gold-border)'}`,
          background: canLevelUp ? 'var(--gold-soft)' : 'var(--gold-soft)',
          color: 'var(--gold)', cursor: 'pointer', transition: 'all .2s',
          boxShadow: 'none',
        }}>
        ↑ Aumenta Livello
      </button>
      {open && <LevelUpWizard character={character} onClose={() => setOpen(false)} />}
    </>
  );
}
