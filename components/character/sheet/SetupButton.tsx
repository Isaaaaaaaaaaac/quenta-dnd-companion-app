'use client';

import { useState } from 'react';
import SetupWizard from '@/components/character/setup/SetupWizard';
import type { Character } from '@/lib/db/schema';

export default function SetupButton({ character }: { character: Character }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-ghost" style={{ padding: '6px 12px' }}>
        ⚙ Equipaggiamento & Incantesimi
      </button>
      {open && <SetupWizard character={character} onClose={() => setOpen(false)} />}
    </>
  );
}
