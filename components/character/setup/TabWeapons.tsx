'use client';

import { useState } from 'react';
import { WEAPONS, ARMORS } from '@/lib/srd/equipment';
import type { CharacterWeapon, CharacterSheet, MagicItem } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import MagicItemSearch from './MagicItemSearch';

interface Props {
  sheet: CharacterSheet;
  weapons: CharacterWeapon[];
  setWeapons: (w: CharacterWeapon[]) => void;
  equippedArmorKey: string | null;
  setEquippedArmorKey: (k: string | null) => void;
  equippedArmorName: string;
  setEquippedArmorName: (n: string) => void;
  hasShield: boolean;
  setHasShield: (v: boolean) => void;
  magicItems: MagicItem[];
  setMagicItems: (m: MagicItem[]) => void;
  computedAC: number;
}

// ── DS style constants (inline — avoids @layer cascade issues) ────────────
const lbl: React.CSSProperties = {
  fontFamily: 'var(--font-label)',
  fontSize: '8px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--fg-3)',
  display: 'block',
  marginBottom: 6,
};

const inp: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-leather)',
  color: 'var(--fg-1)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  padding: '7px 12px',
  outline: 'none',
  borderRadius: 'var(--r-sm)',
  appearance: 'none' as const,
};

const sel: React.CSSProperties = { ...inp, cursor: 'pointer' };

const btnGhost: React.CSSProperties = {
  fontFamily: 'var(--font-label)',
  fontSize: '8px',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  padding: '6px 14px',
  border: '1px solid var(--border-leather)',
  backgroundColor: 'transparent',
  color: 'var(--fg-3)',
  cursor: 'pointer',
};

const sectionLbl: React.CSSProperties = {
  fontFamily: 'var(--font-label)',
  fontSize: '8px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  opacity: 0.8,
  marginBottom: 20,
  display: 'block',
};

export default function TabWeapons({ sheet, weapons, setWeapons, equippedArmorKey, setEquippedArmorKey, equippedArmorName, setEquippedArmorName, hasShield, setHasShield, magicItems, setMagicItems, computedAC }: Props) {
  const [addingWeapon, setAddingWeapon] = useState(false);
  const [selectedSrd, setSelectedSrd] = useState<string>('');

  function addFromSrd() {
    const srd = WEAPONS.find(w => w.key === selectedSrd);
    if (!srd) return;
    setWeapons([...weapons, {
      id: generateId(), name: srd.name, srdKey: srd.key,
      damageDice: srd.damageDice, damageDice2h: srd.damageDice2h,
      damageType: srd.damageType, properties: srd.properties, range: srd.range,
      attackStat: srd.properties.includes('accurata') ? 'dex' : 'str',
      magic: false, weight: srd.weight,
    }]);
    setSelectedSrd(''); setAddingWeapon(false);
  }

  function addCustomWeapon() {
    setWeapons([...weapons, { id: generateId(), name: 'Arma Personalizzata', damageDice: '1d6', damageType: 'tagliente', properties: [], attackStat: 'str', magic: false, weight: 0 }]);
  }

  function removeWeapon(id: string) { setWeapons(weapons.filter(w => w.id !== id)); }
  function updateWeapon(id: string, field: keyof CharacterWeapon, value: unknown) {
    setWeapons(weapons.map(w => w.id === id ? { ...w, [field]: value } : w));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Armatura ── */}
      <div>
        <span style={sectionLbl}>Armatura &amp; Difesa</span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end', marginBottom: 16 }}>
          <div>
            <label style={lbl}>Armatura indossata</label>
            <select style={sel}
              value={equippedArmorKey ?? ''}
              onChange={e => {
                const key = e.target.value || null;
                setEquippedArmorKey(key);
                setEquippedArmorName(ARMORS.find(a => a.key === key)?.name ?? '');
              }}>
              <option value="">Nessuna armatura (CA = 10 + DES)</option>
              {ARMORS.filter(a => a.type !== 'scudo').map(a => (
                <option key={a.key} value={a.key}>
                  {a.name} — CA {a.baseAC}{a.maxDexBonus === null ? '+DES' : a.maxDexBonus > 0 ? `+DES(max+${a.maxDexBonus})` : ''} · {a.type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={lbl}>Scudo (+2 CA)</label>
            <button onClick={() => setHasShield(!hasShield)} style={{
              ...btnGhost,
              border: hasShield ? '1px solid var(--gold)' : '1px solid var(--border-leather)',
              color: hasShield ? 'var(--gold)' : 'var(--fg-3)',
              padding: '7px 14px',
            }}>
              {hasShield ? '◆ Equipaggiato' : '◇ Non equipaggiato'}
            </button>
          </div>
        </div>

        {/* CA box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', backgroundColor: 'var(--gold-soft)', border: '1px solid var(--gold)' }}>
          <span style={{ ...lbl, marginBottom: 0, letterSpacing: '0.1em' }}>CA Calcolata</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '2rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{computedAC}</span>
          <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.875rem', fontStyle: 'italic' }}>
            {equippedArmorKey ? `(${equippedArmorName}${hasShield ? ' + Scudo' : ''})` : `(10 + DES${hasShield ? ' + Scudo' : ''})`}
          </span>
        </div>
      </div>

      {/* ── Armi ── */}
      <div>
        <span style={sectionLbl}>Armi</span>

        {weapons.map(w => (
          <div key={w.id} style={{ backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-leather)', padding: '20px', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--gold-border)', opacity: 0.3 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginBottom: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={lbl}>Nome</label>
                <input style={inp} value={w.name} onChange={e => updateWeapon(w.id, 'name', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Danno</label>
                <input style={inp} value={w.damageDice} onChange={e => updateWeapon(w.id, 'damageDice', e.target.value)} placeholder="1d8" />
              </div>
              <div>
                <label style={lbl}>Tipo danno</label>
                <select style={sel} value={w.damageType} onChange={e => updateWeapon(w.id, 'damageType', e.target.value)}>
                  <option>tagliente</option><option>perforante</option><option>contundente</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Caratteristica</label>
                <select style={sel} value={w.attackStat} onChange={e => updateWeapon(w.id, 'attackStat', e.target.value)}>
                  <option value="str">FOR</option><option value="dex">DES</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Gittata</label>
                <input style={inp} value={w.range ?? ''} onChange={e => updateWeapon(w.id, 'range', e.target.value || undefined)} placeholder="es. 1.5m" />
              </div>
              <div>
                <label style={lbl}>Bonus magico</label>
                <input style={inp} type="number" min={0} max={3} value={w.magicBonus ?? 0}
                  onChange={e => { const v = Number(e.target.value); updateWeapon(w.id, 'magicBonus', v); updateWeapon(w.id, 'magic', v > 0); }} />
              </div>
              <div>
                <label style={lbl}>Peso (kg)</label>
                <input style={inp} type="number" min={0} step={0.5} value={w.weight} onChange={e => updateWeapon(w.id, 'weight', Number(e.target.value))} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-leather)' }}>
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                {w.srdKey ? `SRD: ${w.srdKey}` : ''}{w.magic && w.magicBonus ? ` · Magica +${w.magicBonus}` : ''}
              </span>
              <button onClick={() => removeWeapon(w.id)} style={{ ...btnGhost, borderColor: 'var(--danger)', color: 'var(--fg-1)' }}>
                Rimuovi
              </button>
            </div>
          </div>
        ))}

        {addingWeapon ? (
          <div style={{ backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-leather)', padding: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <select style={{ ...sel, flex: 1 }} value={selectedSrd} onChange={e => setSelectedSrd(e.target.value)}>
                <option value="">— Scegli dalla lista SRD —</option>
                <optgroup label="Semplici da mischia">{WEAPONS.filter(w => w.category === 'semplice_mischia').map(w => <option key={w.key} value={w.key}>{w.name} ({w.damageDice} {w.damageType})</option>)}</optgroup>
                <optgroup label="Semplici a distanza">{WEAPONS.filter(w => w.category === 'semplice_distanza').map(w => <option key={w.key} value={w.key}>{w.name} ({w.damageDice} {w.damageType})</option>)}</optgroup>
                <optgroup label="Marziali da mischia">{WEAPONS.filter(w => w.category === 'marziale_mischia').map(w => <option key={w.key} value={w.key}>{w.name} ({w.damageDice} {w.damageType})</option>)}</optgroup>
                <optgroup label="Marziali a distanza">{WEAPONS.filter(w => w.category === 'marziale_distanza').map(w => <option key={w.key} value={w.key}>{w.name} ({w.damageDice} {w.damageType})</option>)}</optgroup>
              </select>
              <button onClick={addFromSrd} disabled={!selectedSrd} style={{ ...btnGhost, borderColor: 'var(--border-leather-dim)', color: 'var(--gold)', opacity: selectedSrd ? 1 : 0.4 }}>
                Aggiungi
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addCustomWeapon} style={btnGhost}>+ Arma personalizzata</button>
              <button onClick={() => setAddingWeapon(false)} style={btnGhost}>Annulla</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingWeapon(true)} style={{ ...btnGhost, width: '100%', padding: '12px', borderStyle: 'dashed' }}>
            + Aggiungi Arma
          </button>
        )}
      </div>

      {/* ── Oggetti magici ── */}
      <div>
        <span style={sectionLbl}>Oggetti Magici &amp; Meravigliosi</span>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.875rem', fontStyle: 'italic', marginBottom: 16 }}>
          Cerca nel SRD — descrizione e sintonizzazione vengono importate automaticamente.
        </p>
        <MagicItemSearch magicItems={magicItems} setMagicItems={setMagicItems} />
      </div>
    </div>
  );
}
