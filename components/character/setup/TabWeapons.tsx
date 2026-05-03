'use client';

import { useState } from 'react';
import { WEAPONS, ARMORS, type SrdWeapon } from '@/lib/srd/equipment';
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

const label: React.CSSProperties = { fontSize: '0.7rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', display: 'block', marginBottom: 4 };
const inp: React.CSSProperties = { backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', width: '100%', padding: '3px 0' };
const sel: React.CSSProperties = { ...inp, backgroundColor: '#2a2018', padding: '4px 2px', cursor: 'pointer' };

export default function TabWeapons({ sheet, weapons, setWeapons, equippedArmorKey, setEquippedArmorKey, equippedArmorName, setEquippedArmorName, hasShield, setHasShield, magicItems, setMagicItems, computedAC }: Props) {
  const [addingWeapon, setAddingWeapon] = useState(false);
  const [selectedSrd, setSelectedSrd] = useState<string>('');

  function addFromSrd() {
    const srd = WEAPONS.find(w => w.key === selectedSrd);
    if (!srd) return;
    const weapon: CharacterWeapon = {
      id: generateId(),
      name: srd.name,
      srdKey: srd.key,
      damageDice: srd.damageDice,
      damageDice2h: srd.damageDice2h,
      damageType: srd.damageType,
      properties: srd.properties,
      range: srd.range,
      attackStat: srd.properties.includes('accurata') ? 'dex' : 'str',
      magic: false,
      weight: srd.weight,
    };
    setWeapons([...weapons, weapon]);
    setSelectedSrd('');
    setAddingWeapon(false);
  }

  function addCustomWeapon() {
    const weapon: CharacterWeapon = {
      id: generateId(), name: 'Arma Personalizzata',
      damageDice: '1d6', damageType: 'tagliente',
      properties: [], attackStat: 'str', magic: false, weight: 0,
    };
    setWeapons([...weapons, weapon]);
  }

  function removeWeapon(id: string) { setWeapons(weapons.filter(w => w.id !== id)); }

  function updateWeapon(id: string, field: keyof CharacterWeapon, value: unknown) {
    setWeapons(weapons.map(w => w.id === id ? { ...w, [field]: value } : w));
  }

  const sectionHead = (text: string) => (
    <div className="flex items-center gap-3 mb-3">
      <h3 style={{ marginBottom: 0 }}>{text}</h3>
      <div style={{ flex: 1, height: 1, backgroundColor: '#5a4020' }} />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Armatura ── */}
      <div>
        {sectionHead('Armatura & Difesa')}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-3">
          <div className="md:col-span-2">
            <label style={label}>Armatura indossata</label>
            <select value={equippedArmorKey ?? ''}
              onChange={e => {
                const key = e.target.value || null;
                setEquippedArmorKey(key);
                const found = ARMORS.find(a => a.key === key);
                setEquippedArmorName(found?.name ?? '');
              }}
              style={sel}>
              <option value="">Nessuna armatura (CA = 10 + DES)</option>
              {ARMORS.filter(a => a.type !== 'scudo').map(a => (
                <option key={a.key} value={a.key}>
                  {a.name} — CA {a.baseAC}{a.maxDexBonus === null ? '+DES' : a.maxDexBonus > 0 ? `+DES(max+${a.maxDexBonus})` : ''} · {a.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Scudo (+2 CA)</label>
            <div className="flex items-center gap-3 mt-1">
              <button onClick={() => setHasShield(!hasShield)}
                style={{ border: `1px solid ${hasShield ? '#c8922a' : '#5a4020'}`, backgroundColor: hasShield ? '#2a2010' : 'transparent', color: hasShield ? '#c8922a' : '#a08060', fontFamily: 'Cinzel, serif', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
                {hasShield ? '◆ Equipaggiato' : '◇ Non equipaggiato'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3" style={{ backgroundColor: '#2a2010', border: '1px solid #c8922a' }}>
          <span style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.06em' }}>CA CALCOLATA</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', color: '#c8922a' }}>{computedAC}</span>
          <span style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem' }}>
            {equippedArmorKey ? `(${equippedArmorName}${hasShield ? ' + Scudo' : ''})` : `(10 + DES${hasShield ? ' + Scudo' : ''})`}
          </span>
        </div>
      </div>

      {/* ── Armi ── */}
      <div>
        {sectionHead('Armi')}

        {weapons.map(w => (
          <div key={w.id} className="mb-3 p-3" style={{ border: '1px solid #5a4020', backgroundColor: '#1e1810' }}>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 mb-2">
              <div className="md:col-span-2">
                <label style={label}>Nome</label>
                <input value={w.name} onChange={e => updateWeapon(w.id, 'name', e.target.value)} style={inp} />
              </div>
              <div>
                <label style={label}>Danno</label>
                <input value={w.damageDice} onChange={e => updateWeapon(w.id, 'damageDice', e.target.value)} style={inp} placeholder="1d8" />
              </div>
              <div>
                <label style={label}>Tipo danno</label>
                <select value={w.damageType} onChange={e => updateWeapon(w.id, 'damageType', e.target.value)} style={sel}>
                  <option>tagliente</option><option>perforante</option><option>contundente</option>
                </select>
              </div>
              <div>
                <label style={label}>Caratteristica</label>
                <select value={w.attackStat} onChange={e => updateWeapon(w.id, 'attackStat', e.target.value)} style={sel}>
                  <option value="str">FOR</option><option value="dex">DES</option>
                </select>
              </div>
              <div>
                <label style={label}>Gittata</label>
                <input value={w.range ?? ''} onChange={e => updateWeapon(w.id, 'range', e.target.value || undefined)} style={inp} placeholder="1.5m" />
              </div>
              <div>
                <label style={label}>Bonus magico</label>
                <input type="number" min={0} max={3} value={w.magicBonus ?? 0}
                  onChange={e => { const v = Number(e.target.value); updateWeapon(w.id, 'magicBonus', v); updateWeapon(w.id, 'magic', v > 0); }}
                  style={inp} placeholder="0" />
              </div>
              <div>
                <label style={label}>Peso (kg)</label>
                <input type="number" min={0} step={0.5} value={w.weight} onChange={e => updateWeapon(w.id, 'weight', Number(e.target.value))} style={inp} />
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem' }}>
                {w.srdKey && `SRD: ${w.srdKey}`}
                {w.magic && w.magicBonus && ` · Magica +${w.magicBonus}`}
              </div>
              <button onClick={() => removeWeapon(w.id)}
                style={{ border: '1px solid #8b2020', color: '#8b2020', backgroundColor: 'transparent', cursor: 'pointer', padding: '3px 10px', fontSize: '0.75rem', fontFamily: 'Cinzel, serif' }}>
                Rimuovi
              </button>
            </div>
          </div>
        ))}

        {addingWeapon ? (
          <div className="p-3" style={{ border: '1px solid #5a4020', backgroundColor: '#1a1810' }}>
            <div className="flex gap-2 mb-2">
              <select value={selectedSrd} onChange={e => setSelectedSrd(e.target.value)} style={{ ...sel, flex: 1 }}>
                <option value="">— Scegli dalla lista SRD —</option>
                <optgroup label="Semplici da mischia">
                  {WEAPONS.filter(w => w.category === 'semplice_mischia').map(w => <option key={w.key} value={w.key}>{w.name} ({w.damageDice} {w.damageType})</option>)}
                </optgroup>
                <optgroup label="Semplici a distanza">
                  {WEAPONS.filter(w => w.category === 'semplice_distanza').map(w => <option key={w.key} value={w.key}>{w.name} ({w.damageDice} {w.damageType})</option>)}
                </optgroup>
                <optgroup label="Marziali da mischia">
                  {WEAPONS.filter(w => w.category === 'marziale_mischia').map(w => <option key={w.key} value={w.key}>{w.name} ({w.damageDice} {w.damageType})</option>)}
                </optgroup>
                <optgroup label="Marziali a distanza">
                  {WEAPONS.filter(w => w.category === 'marziale_distanza').map(w => <option key={w.key} value={w.key}>{w.name} ({w.damageDice} {w.damageType})</option>)}
                </optgroup>
              </select>
              <button onClick={addFromSrd} disabled={!selectedSrd}
                style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '6px 14px', cursor: selectedSrd ? 'pointer' : 'not-allowed', opacity: selectedSrd ? 1 : 0.4, fontSize: '0.8rem' }}>
                Aggiungi
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={addCustomWeapon}
                style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem' }}>
                + Arma personalizzata
              </button>
              <button onClick={() => setAddingWeapon(false)}
                style={{ border: '1px solid #3a3020', color: '#5a4020', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem' }}>
                Annulla
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingWeapon(true)}
            style={{ border: '1px dashed #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '8px 16px', cursor: 'pointer', fontSize: '0.8rem', width: '100%' }}>
            + Aggiungi Arma
          </button>
        )}
      </div>

      {/* ── Oggetti magici — ricerca SRD ── */}
      <div>
        {sectionHead('Oggetti Magici & Meravigliosi')}
        <p className="mb-3" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic' }}>
          Cerca nel SRD di Wizard of the Coast — descrizione e sintonizzazione vengono importate automaticamente.
        </p>
        <MagicItemSearch magicItems={magicItems} setMagicItems={setMagicItems} />
      </div>
    </div>
  );
}
