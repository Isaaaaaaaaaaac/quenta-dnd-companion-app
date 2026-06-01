'use client';

import { useState } from 'react';
import EquipmentSearchModal from '@/components/character/setup/EquipmentSearchModal';
import type { InventoryItem } from '@/lib/db/schema';

interface Props {
  characterId: string;
  inventory: InventoryItem[];
  money: { pp: number; gp: number; ep: number; sp: number; cp: number };
}

export default function AddEquipmentButton({ characterId, inventory, money }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em',
          color: 'var(--gold)', background: 'rgba(184,134,11,.05)',
          border: '1px solid rgba(184,134,11,.35)', padding: '0 var(--sp-1)',
          height: 24, borderRadius: 'var(--r)', cursor: 'pointer', transition: 'all .2s',
          flexShrink: 0,
        }}
      >
        + Aggiungi
      </button>
      {open && (
        <EquipmentSearchModal
          characterId={characterId}
          currentInventory={inventory}
          currentMoney={money}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
