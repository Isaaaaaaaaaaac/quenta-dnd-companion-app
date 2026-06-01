'use client';

import { useState, useTransition } from 'react';
import AddEquipmentButton from './AddEquipmentButton';
import { equipInventoryItem } from '@/lib/db/actions';
import type { InventoryItem } from '@/lib/db/schema';

interface Props {
  characterId: string;
  inventory: InventoryItem[];
  money: { pp: number; gp: number; ep: number; sp: number; cp: number };
}

const CARD: React.CSSProperties = {
  background: 'var(--bg-deep)',
  border: '1px solid var(--border-leather-dim)',
  borderRadius: 'var(--r2)',
  padding: 'var(--sp-2)',
};

function categoryIcon(cat?: string): string {
  switch (cat) {
    case 'Arma':     return '⚔';
    case 'Armatura': return '🛡';
    case 'Scudo':    return '🔰';
    case 'Magico':   return '✨';
    case 'Pergamena':return '📜';
    case 'Pozione':  return '⚗';
    default:         return '📦';
  }
}

function ItemRow({ item, characterId }: { item: InventoryItem; characterId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEquippable = ['Arma', 'Armatura', 'Scudo'].includes(item.category ?? '');
  const isMagic      = item.category === 'Magico';

  function handleEquip(action: 'equip' | 'unequip' | 'attune' | 'unattune') {
    setError(null);
    startTransition(async () => {
      const result = await equipInventoryItem(characterId, item.id, action);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px var(--sp-1)', borderRadius: 'var(--r)',
        opacity: isPending ? 0.5 : 1, transition: 'opacity .15s',
        background: item.equipped ? 'rgba(184,134,11,.04)' : 'transparent',
      }}>
        {/* Icona categoria */}
        <span style={{ fontSize: 11, flexShrink: 0, width: 16, textAlign: 'center' }}>
          {categoryIcon(item.category)}
        </span>

        {/* Nome */}
        <span style={{ flex: 1, fontSize: '12px', color: item.equipped ? 'var(--gold)' : 'var(--fg-1)', fontWeight: item.equipped ? 500 : 400, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.quantity > 1 && <span style={{ color: 'var(--fg-3)', marginRight: 4 }}>×{item.quantity}</span>}
          {item.name}
        </span>

        {/* Nota / peso */}
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--fg-3)', flexShrink: 0 }}>
          {item.notes ?? (item.weight > 0 ? `${(item.weight * item.quantity).toFixed(1)}kg` : '')}
        </span>

        {/* Toggle Equipaggia */}
        {isEquippable && (
          <button
            onClick={() => handleEquip(item.equipped ? 'unequip' : 'equip')}
            disabled={isPending}
            title={item.equipped ? 'Rimuovi' : 'Equipaggia'}
            style={{
              fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.05em',
              padding: '1px 6px', height: 20, borderRadius: 'var(--r)', flexShrink: 0,
              border: item.equipped ? '1px solid var(--gold)' : '1px solid var(--border-leather)',
              color: item.equipped ? 'var(--gold)' : 'var(--fg-3)',
              background: item.equipped ? 'rgba(184,134,11,.08)' : 'transparent',
              cursor: isPending ? 'not-allowed' : 'pointer', transition: 'all .2s',
            }}
          >
            {item.equipped ? 'Equipaggiato' : 'Equipaggia'}
          </button>
        )}

        {/* Toggle Sintonia (solo magico) */}
        {isMagic && (
          <button
            onClick={() => handleEquip(item.attuned ? 'unattune' : 'attune')}
            disabled={isPending}
            title={item.attuned ? 'Rimuovi sintonia' : 'Sintonizza'}
            style={{
              fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.05em',
              padding: '1px 6px', height: 20, borderRadius: 'var(--r)', flexShrink: 0,
              border: item.attuned ? '1px solid var(--arcane)' : '1px solid var(--border-leather)',
              color: item.attuned ? 'var(--arcane)' : 'var(--fg-3)',
              background: item.attuned ? 'rgba(91,33,182,.08)' : 'transparent',
              cursor: isPending ? 'not-allowed' : 'pointer', transition: 'all .2s',
            }}
          >
            {item.attuned ? '✦ Sintonizzato' : 'Sintonizza'}
          </button>
        )}
      </div>

      {/* Messaggio di errore (es. conflitti slot) */}
      {error && (
        <div style={{ padding: '3px var(--sp-1)', fontSize: '10px', color: 'var(--danger)', fontFamily: 'var(--font-sans)' }}>
          ⚠ {error}
        </div>
      )}
    </>
  );
}

export default function InventoryCard({ characterId, inventory, money }: Props) {
  const [tab, setTab] = useState<'all' | 'equipped'>('all');
  const filtered = tab === 'equipped' ? inventory.filter(i => i.equipped) : inventory;

  const attunedCount = inventory.filter(i => i.attuned).length;

  return (
    <div style={CARD}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-1)' }}>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600,
          letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', flex: 1,
        }}>
          Equipaggiamento
          <span style={{ flex: 1, height: '.5px', background: 'linear-gradient(to right, rgba(184,134,11,.35), transparent)' }} />
        </div>
        <AddEquipmentButton characterId={characterId} inventory={inventory} money={money} />
      </div>

      {/* Sintonia badge */}
      {attunedCount > 0 && (
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--arcane)', marginBottom: 6 }}>
          ✦ Sintonia: {attunedCount}/3
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--sp-1)' }}>
        {(['all', 'equipped'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em',
              padding: '0 var(--sp-1)', height: 24, lineHeight: '24px',
              borderRadius: 'var(--r)',
              border: `1px solid ${tab === t ? 'var(--border-leather)' : 'transparent'}`,
              background: tab === t ? 'var(--bg-card)' : 'none',
              color: tab === t ? 'var(--fg-1)' : 'var(--fg-2)',
              cursor: 'pointer', transition: 'all .2s',
            }}>
            {t === 'all' ? `Tutto (${inventory.length})` : `Equipaggiato (${inventory.filter(i => i.equipped).length})`}
          </button>
        ))}
      </div>

      {/* Items */}
      {filtered.length === 0 && (
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)', padding: '4px var(--sp-1)' }}>
          Nessun oggetto
        </p>
      )}
      {filtered.map(item => (
        <ItemRow key={item.id} item={item} characterId={characterId} />
      ))}
    </div>
  );
}
