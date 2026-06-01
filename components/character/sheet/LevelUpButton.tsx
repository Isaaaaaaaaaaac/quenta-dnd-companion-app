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
          height: 32, marginTop: 'var(--s-1)', borderRadius: 'var(--r)',
          border: `1px solid ${canLevelUp ? 'rgba(184,134,11,.6)' : 'rgba(184,134,11,.35)'}`,
          background: canLevelUp ? 'rgba(184,134,11,.1)' : 'rgba(184,134,11,.04)',
          color: 'var(--gold)', cursor: 'pointer', transition: 'all .2s',
          boxShadow: canLevelUp ? '0 0 16px rgba(184,134,11,.15)' : 'none',
        }}>
        ↑ Aumenta Livello
      </button>
      {open && <LevelUpWizard character={character} onClose={() => setOpen(false)} />}
    </>
  );
}
