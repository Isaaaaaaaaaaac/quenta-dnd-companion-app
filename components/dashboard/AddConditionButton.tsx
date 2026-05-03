'use client';

import { useState } from 'react';
import { addCondition } from '@/lib/db/actions';
import { CONDITIONS } from '@/lib/srd/conditions';

interface Props {
  characterId: string;
}

export default function AddConditionButton({ characterId }: Props) {
  const [open, setOpen] = useState(false);

  async function handleAdd(key: string) {
    await addCondition(characterId, key);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="px-2 py-0.5 text-xs transition-opacity hover:opacity-70"
        style={{
          border: '1px solid #5a4020',
          color: '#a08060',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          fontFamily: 'Cinzel, serif',
        }}
      >
        + Condizione
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 max-h-60 overflow-y-auto"
            style={{ backgroundColor: '#221c14', border: '1px solid #5a4020', minWidth: '180px' }}>
            {CONDITIONS.map(c => (
              <button
                key={c.key}
                onClick={() => handleAdd(c.key)}
                className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors hover:bg-[#2a2018]"
                style={{ color: '#e8d5a3', fontFamily: 'Crimson Text, serif', cursor: 'pointer' }}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
