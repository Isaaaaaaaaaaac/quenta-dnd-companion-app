'use client';

import { useState } from 'react';
import type { InventoryItem, CharacterSheet } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';

interface Props {
  inventory: InventoryItem[];
  setInventory: (i: InventoryItem[]) => void;
  money: CharacterSheet['money'];
  setMoney: (m: CharacterSheet['money']) => void;
  carriedKg: number;
  carryMax: number;
}

const label: React.CSSProperties = { fontSize: '0.7rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', display: 'block', marginBottom: 4 };
const inp: React.CSSProperties = { backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', width: '100%', padding: '3px 0' };

const COIN_COLORS: Record<string, string> = { pp: '#e8d5a3', gp: '#c8922a', ep: '#a0a0c8', sp: '#a8a8a8', cp: '#b06030' };

export default function TabInventory({ inventory, setInventory, money, setMoney, carriedKg, carryMax }: Props) {
  function addItem() {
    setInventory([...inventory, { id: generateId(), name: 'Oggetto', quantity: 1, weight: 0 }]);
  }

  function removeItem(id: string) { setInventory(inventory.filter(i => i.id !== id)); }

  function updateItem(id: string, field: keyof InventoryItem, value: unknown) {
    setInventory(inventory.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  function setMoneyCoin(coin: keyof CharacterSheet['money'], value: number) {
    setMoney({ ...money, [coin]: Math.max(0, value) });
  }

  const pct = Math.min(100, (carriedKg / carryMax) * 100);
  const overweight = carriedKg > carryMax;

  return (
    <div className="space-y-6">

      {/* ── Denaro ── */}
      <div>
        <h3 className="mb-3">Denaro</h3>
        <div className="grid grid-cols-5 gap-2">
          {(['pp', 'gp', 'ep', 'sp', 'cp'] as const).map(coin => (
            <div key={coin} className="text-center p-2" style={{ border: '1px solid #5a4020', backgroundColor: '#1e1810' }}>
              <label style={{ ...label, color: COIN_COLORS[coin], textAlign: 'center', display: 'block' }}>
                {coin.toUpperCase()}
              </label>
              <input type="number" min={0} value={money?.[coin] ?? 0}
                onChange={e => setMoneyCoin(coin, Number(e.target.value))}
                style={{ ...inp, textAlign: 'center', fontSize: '1.2rem', fontFamily: 'Cinzel, serif', color: COIN_COLORS[coin] }} />
            </div>
          ))}
        </div>
        <div className="mt-1 text-xs" style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', textAlign: 'right' }}>
          Equivalente: {((money?.pp ?? 0) * 10 + (money?.gp ?? 0) + (money?.ep ?? 0) * 0.5 + (money?.sp ?? 0) * 0.1 + (money?.cp ?? 0) * 0.01).toFixed(1)} PO totali
        </div>
      </div>

      {/* ── Capacità di carico ── */}
      <div>
        <div className="flex justify-between text-sm mb-1" style={{ color: '#a08060' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em' }}>PESO TRASPORTATO</span>
          <span style={{ fontFamily: 'Cinzel, serif', color: overweight ? '#8b2020' : '#e8d5a3' }}>
            {carriedKg.toFixed(1)} / {carryMax} kg
          </span>
        </div>
        <div className="w-full h-2 border" style={{ borderColor: '#5a4020', backgroundColor: '#1a1410' }}>
          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: overweight ? '#8b2020' : pct > 75 ? '#8a7a2a' : '#4a7c4e', transition: 'width 0.3s' }} />
        </div>
        {overweight && <div className="text-xs mt-1" style={{ color: '#8b2020', fontFamily: 'Crimson Text, serif' }}>⚠ Sovraccarico</div>}
      </div>

      {/* ── Inventario ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ marginBottom: 0 }}>Oggetti & Effetti Personali</h3>
          <button onClick={addItem}
            style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '4px 12px', cursor: 'pointer', fontSize: '0.75rem' }}>
            + Aggiungi
          </button>
        </div>

        {inventory.length === 0 && (
          <div className="text-center py-6" style={{ color: '#3a3020', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
            Nessun oggetto nell'inventario.
          </div>
        )}

        {inventory.map(item => (
          <div key={item.id} className="flex gap-2 items-center py-2" style={{ borderBottom: '1px solid #2a2018' }}>
            <input value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
              style={{ ...inp, flex: 2 }} placeholder="Nome oggetto" />
            <input type="number" min={1} value={item.quantity}
              onChange={e => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
              style={{ ...inp, width: '48px', flex: 'none', textAlign: 'center' }} />
            <span style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', flexShrink: 0 }}>×</span>
            <input type="number" min={0} step={0.1} value={item.weight}
              onChange={e => updateItem(item.id, 'weight', Number(e.target.value))}
              style={{ ...inp, width: '52px', flex: 'none' }} />
            <span style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.75rem', flexShrink: 0 }}>kg</span>
            <input value={item.notes ?? ''} onChange={e => updateItem(item.id, 'notes', e.target.value || undefined)}
              style={{ ...inp, flex: 2, fontSize: '0.85rem' }} placeholder="Note…" />
            <button onClick={() => removeItem(item.id)}
              style={{ border: 'none', color: '#8b2020', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, padding: '0 4px' }}>
              ✕
            </button>
          </div>
        ))}

        {inventory.length > 0 && (
          <div className="flex justify-between mt-2 text-xs" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif' }}>
            <span>{inventory.length} oggett{inventory.length === 1 ? 'o' : 'i'}</span>
            <span>Peso totale: {carriedKg.toFixed(1)} kg</span>
          </div>
        )}
      </div>
    </div>
  );
}
