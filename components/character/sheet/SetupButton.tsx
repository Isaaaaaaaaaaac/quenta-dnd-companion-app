'use client';

import { useState } from 'react';
import SetupWizard from '@/components/character/setup/SetupWizard';
import type { Character } from '@/lib/db/schema';

export default function SetupButton({ character }: { character: Character }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{
          border: '1px solid #5a4020', color: '#a08060',
          backgroundColor: 'transparent', fontFamily: 'Cinzel, serif',
          fontSize: '0.7rem', padding: '6px 12px', cursor: 'pointer',
          letterSpacing: '0.04em',
        }}>
        ⚙ Equipaggiamento & Incantesimi
      </button>
      {open && <SetupWizard character={character} onClose={() => setOpen(false)} />}
    </>
  );
}
