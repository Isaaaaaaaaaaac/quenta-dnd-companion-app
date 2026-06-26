'use client';

import { startTransition, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import ListDetailPanel from '../ListDetailPanel';
import { useToast } from '../useToast';
import { equipInventoryItem, saveInventory } from '@/lib/db/actions';
import { card, innerBox } from '../styles';
import type { InventoryItem, CharacterSheet } from '@/lib/db/schema';

export interface InventoryTabProps {
  characterId: string;
  inventory: InventoryItem[];
  money: CharacterSheet['money'];
  carriedKg: number;
  carryMax: number;
}

const COIN_LABELS: Record<keyof CharacterSheet['money'], string> = { pp: 'PP', gp: 'MO', ep: 'ME', sp: 'MA', cp: 'MR' };
const COIN_KEYS = Object.keys(COIN_LABELS) as (keyof CharacterSheet['money'])[];

export default function InventoryTab({ characterId, inventory, money, carriedKg, carryMax }: InventoryTabProps) {
  const { show } = useToast();
  const [tab, setTab] = useState<'all' | 'equipped'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [coinInputs, setCoinInputs] = useState<Record<string, string>>({ pp: '', gp: '', ep: '', sp: '', cp: '' });

  function adjustCoin(key: keyof CharacterSheet['money'], sign: 1 | -1) {
    const amount = parseInt(coinInputs[key], 10) || 1;
    const next = { ...money, [key]: Math.max(0, money[key] + sign * amount) };
    startTransition(async () => {
      await saveInventory(characterId, inventory, next);
      show(`${sign > 0 ? '+' : '-'}${amount} ${COIN_LABELS[key]}`);
      setCoinInputs(prev => ({ ...prev, [key]: '' }));
    });
  }

  function handleEquipToggle(item: InventoryItem) {
    startTransition(async () => {
      const result = await equipInventoryItem(characterId, item.id, item.equipped ? 'unequip' : 'equip');
      if (result.error) { show(result.error); return; }
      show(item.equipped ? `${item.name} rimosso` : `${item.name} equipaggiato`);
      setOpenMenuId(null);
    });
  }

  function handleDrop(item: InventoryItem) {
    startTransition(async () => {
      await saveInventory(characterId, inventory.filter(i => i.id !== item.id), money);
      show(`${item.name} lasciato`);
      setOpenMenuId(null);
      if (selectedId === item.id) setSelectedId(null);
    });
  }

  const filtered = tab === 'equipped' ? inventory.filter(i => i.equipped) : inventory;
  const equippedCount = inventory.filter(i => i.equipped).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--warning)', textTransform: 'uppercase' }}>Denaro</span>
          <span style={{ fontSize: '9px', color: 'var(--fg-1)' }}>{carriedKg} / {carryMax} kg</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {COIN_KEYS.map(key => (
            <div key={key} style={{ flex: 1, minWidth: 0, ...innerBox, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '8px', fontWeight: 700, color: 'var(--gold)' }}>{COIN_LABELS[key]}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: 'var(--fg-1)' }}>{money[key]}</span>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                <button
                  type="button"
                  data-testid={`coin-minus-${key}`}
                  onClick={() => adjustCoin(key, -1)}
                  style={{ width: 20, height: 20, borderRadius: 5, border: '1px solid var(--border-leather)', background: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  −
                </button>
                <input
                  data-testid={`coin-input-${key}`}
                  value={coinInputs[key]}
                  onChange={e => setCoinInputs(prev => ({ ...prev, [key]: e.target.value }))}
                  style={{ flex: 1, minWidth: 0, height: 20, textAlign: 'center', background: 'var(--bg-deep)', border: '1px solid var(--border-leather)', borderRadius: 5, color: 'var(--fg-1)', fontSize: '9px' }}
                  placeholder="1"
                />
                <button
                  type="button"
                  data-testid={`coin-plus-${key}`}
                  onClick={() => adjustCoin(key, 1)}
                  style={{ width: 20, height: 20, borderRadius: 5, border: '1px solid var(--border-leather)', background: 'none', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={() => setTab('all')}
          style={{
            flex: 1, padding: '8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-leather)',
            background: tab === 'all' ? 'var(--bg-card)' : 'none', color: tab === 'all' ? 'var(--fg-1)' : 'var(--fg-3)',
            fontSize: '10px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Tutti ({inventory.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('equipped')}
          style={{
            flex: 1, padding: '8px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-leather)',
            background: tab === 'equipped' ? 'var(--bg-card)' : 'none', color: tab === 'equipped' ? 'var(--fg-1)' : 'var(--fg-3)',
            fontSize: '10px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Equipaggiato ({equippedCount})
        </button>
      </div>

      <ListDetailPanel
        items={filtered}
        selectedId={selectedId}
        onSelect={setSelectedId}
        emptyDetailText="Seleziona un oggetto dalla lista per vederne i dettagli"
        renderListItem={(item) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', color: item.equipped ? 'var(--fg-1)' : 'var(--fg-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
              </div>
              <div style={{ fontSize: '8px', color: 'var(--fg-3)' }}>{item.category}</div>
            </div>
            {item.equipped && <span style={{ fontSize: '7px', color: 'var(--success)' }}>E</span>}
            <span style={{ fontSize: '9px', color: 'var(--fg-3)' }}>{item.weight * item.quantity} kg</span>
            <Popover.Root open={openMenuId === item.id} onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  data-testid={`item-menu-${item.id}`}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Altre azioni per ${item.name}`}
                  style={{ width: 22, height: 22, border: 'none', background: 'none', color: 'var(--fg-3)', cursor: 'pointer', fontSize: '14px' }}
                >
                  ⋯
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content style={{ background: 'var(--bg-inner)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 4, minWidth: 120, zIndex: 50 }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleEquipToggle(item); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', fontSize: '10px', border: 'none', background: 'none', color: item.equipped ? 'var(--danger)' : 'var(--success)', cursor: 'pointer' }}
                  >
                    {item.equipped ? 'Rimuovi' : 'Indossa'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDrop(item); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', fontSize: '10px', border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                  >
                    Lascia
                  </button>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        )}
        renderDetail={(item) => (
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', marginBottom: 4 }}>{item.name}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', marginBottom: 12 }}>{item.category}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Peso</div><div style={{ fontSize: '13px', color: 'var(--fg-1)' }}>{item.weight * item.quantity} kg</div></div>
              {item.quantity > 1 && <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Quantità</div><div style={{ fontSize: '13px', color: 'var(--fg-1)' }}>{item.quantity}</div></div>}
            </div>
            {item.notes && <p style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--fg-2)', lineHeight: 1.65 }}>{item.notes}</p>}
          </div>
        )}
      />
    </div>
  );
}
