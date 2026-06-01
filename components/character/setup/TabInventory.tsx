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

const lbl: React.CSSProperties = {
  fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.08em',
  textTransform: 'uppercase', color: 'var(--fg-3)', display: 'block', marginBottom: 6,
};
const inp: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)',
  color: 'var(--fg-1)', fontFamily: 'var(--font-body)',
  fontSize: '0.9rem', padding: '7px 12px', outline: 'none', borderRadius: 0,
};
const sectionLbl: React.CSSProperties = {
  fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.8,
  marginBottom: 16, display: 'block',
};
const btnGhost: React.CSSProperties = {
  fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.3em',
  textTransform: 'uppercase', padding: '6px 14px',
  border: '1px solid var(--border-leather)', backgroundColor: 'transparent',
  color: 'var(--fg-3)', cursor: 'pointer',
};

const COIN_COLORS: Record<string, string> = {
  pp: 'var(--fg-1)', gp: 'var(--gold)',
  ep: '#a0a0c8', sp: '#a8a8a8', cp: '#b06030',
};

export default function TabInventory({ inventory, setInventory, money, setMoney, carriedKg, carryMax }: Props) {
  function addItem() { setInventory([...inventory, { id: generateId(), name: 'Oggetto', quantity: 1, weight: 0 }]); }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Denaro ── */}
      <div>
        <span style={sectionLbl}>Denaro</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 8 }}>
          {(['pp', 'gp', 'ep', 'sp', 'cp'] as const).map(coin => (
            <div key={coin} style={{ textAlign: 'center', padding: '12px 8px', border: '1px solid var(--border-leather)', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: COIN_COLORS[coin], marginBottom: 8 }}>
                {coin}
              </div>
              <input type="number" min={0} value={money?.[coin] ?? 0}
                onChange={e => setMoneyCoin(coin, Number(e.target.value))}
                style={{ ...inp, backgroundColor: 'transparent', border: 'none', fontSize: '1.3rem', fontWeight: 700, color: COIN_COLORS[coin], textAlign: 'center', width: '100%', padding: 0 }} />
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem', textAlign: 'right', fontStyle: 'italic' }}>
          Equivalente: {((money?.pp ?? 0) * 10 + (money?.gp ?? 0) + (money?.ep ?? 0) * 0.5 + (money?.sp ?? 0) * 0.1 + (money?.cp ?? 0) * 0.01).toFixed(1)} PO totali
        </div>
      </div>

      {/* ── Peso ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ ...lbl, marginBottom: 0 }}>Peso trasportato</span>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: overweight ? 'var(--danger)' : 'var(--fg-1)', fontSize: '0.875rem' }}>
            {carriedKg.toFixed(1)} / {carryMax} kg
          </span>
        </div>
        <div style={{ height: 3, backgroundColor: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, backgroundColor: overweight ? 'var(--danger)' : pct > 75 ? 'var(--gold)' : 'var(--info)', transition: 'width 0.3s' }} />
        </div>
        {overweight && <div style={{ fontFamily: 'var(--font-body)', color: 'var(--danger)', fontSize: '0.82rem', fontStyle: 'italic' }}>⚠ Sovraccarico</div>}
      </div>

      {/* ── Inventario ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={sectionLbl}>Oggetti &amp; Effetti Personali</span>
          <button onClick={addItem} style={{ ...btnGhost, borderColor: 'var(--border-leather-dim)', color: 'var(--gold)' }}>
            + Aggiungi
          </button>
        </div>

        {inventory.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontStyle: 'italic' }}>
            Nessun oggetto nell'inventario.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {inventory.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-leather)' }}>
              <input value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
                style={{ ...inp, flex: 2 }} placeholder="Nome oggetto" />
              <input type="number" min={1} value={item.quantity}
                onChange={e => updateItem(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                style={{ ...inp, width: 52, textAlign: 'center', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem', flexShrink: 0 }}>×</span>
              <input type="number" min={0} step={0.1} value={item.weight}
                onChange={e => updateItem(item.id, 'weight', Number(e.target.value))}
                style={{ ...inp, width: 60, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.75rem', flexShrink: 0 }}>kg</span>
              <input value={item.notes ?? ''} onChange={e => updateItem(item.id, 'notes', e.target.value || undefined)}
                style={{ ...inp, flex: 2, fontSize: '0.85rem' }} placeholder="Note…" />
              <button onClick={() => removeItem(item.id)}
                style={{ border: 'none', color: 'var(--danger)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, padding: '0 4px', lineHeight: 1 }}>
                ✕
              </button>
            </div>
          ))}
        </div>

        {inventory.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            <span>{inventory.length} oggett{inventory.length === 1 ? 'o' : 'i'}</span>
            <span>Peso totale: {carriedKg.toFixed(1)} kg</span>
          </div>
        )}
      </div>
    </div>
  );
}
