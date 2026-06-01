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
          color: 'var(--gold)', background: 'var(--gold-soft)',
          border: '1px solid var(--gold-border)', padding: '0 var(--s-1)',
          height: 24, borderRadius: 'var(--r-sm)', cursor: 'pointer', transition: 'all .2s',
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
