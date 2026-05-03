'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCharacter } from '@/lib/db/actions';
import { CLASSES } from '@/lib/srd/classes';
import type { CharacterSheet } from '@/lib/db/schema';

const inputStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: '1px solid #5a4020',
  color: '#e8d5a3',
  outline: 'none',
  fontFamily: 'Crimson Text, serif',
  fontSize: '1rem',
  width: '100%',
  padding: '4px 0',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  color: '#a08060',
  fontFamily: 'Cinzel, serif',
  letterSpacing: '0.05em',
  marginBottom: '4px',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  backgroundColor: '#221c14',
};

export default function NewCharacterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<'pc' | 'npc_major' | 'npc_minor'>('pc');
  const [race, setRace] = useState('');
  const [classKey, setClassKey] = useState('fighter');
  const [level, setLevel] = useState(1);
  const [hpMax, setHpMax] = useState(10);
  const [str, setStr] = useState(10);
  const [dex, setDex] = useState(10);
  const [con, setCon] = useState(10);
  const [int, setInt] = useState(10);
  const [wis, setWis] = useState(10);
  const [cha, setCha] = useState(10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);

    const sheet: CharacterSheet = {
      race,
      classes: [{ classKey, level }],
      stats: { str, dex, con, int, wis, cha },
      savingThrowProficiencies: { str: false, dex: false, con: false, int: false, wis: false, cha: false },
      skills: {},
      inventory: [],
      money: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
      hitDice: [{ die: `d${CLASSES.find(c => c.key === classKey)?.hitDie ?? 8}`, total: level, used: 0 }],
    };

    await createCharacter({
      name: name.trim(),
      type,
      level,
      xp: 0,
      hpCurrent: hpMax,
      hpMax,
      hpTemp: 0,
      sheet,
    });

    router.push('/');
  }

  const statField = (label: string, val: number, set: (n: number) => void) => (
    <div className="text-center">
      <label style={{ ...labelStyle, display: 'block' }}>{label}</label>
      <input type="number" min="1" max="30" value={val}
        onChange={e => set(Number(e.target.value))}
        className="w-14 text-center"
        style={{ ...inputStyle, width: '56px' }} />
      <div style={{ color: '#a08060', fontSize: '0.8rem', marginTop: 2 }}>
        {Math.floor((val - 10) / 2) >= 0 ? '+' : ''}{Math.floor((val - 10) / 2)}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
        <h2 className="mb-4">Identità</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label style={labelStyle}>Nome *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              required style={inputStyle} placeholder="Nome del personaggio" />
          </div>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select value={type} onChange={e => setType(e.target.value as typeof type)} style={selectStyle}>
              <option value="pc">Personaggio Giocante</option>
              <option value="npc_major">PNG Principale</option>
              <option value="npc_minor">PNG Secondario</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Razza</label>
            <input value={race} onChange={e => setRace(e.target.value)}
              style={inputStyle} placeholder="Es. Umano, Elfo..." />
          </div>
          <div>
            <label style={labelStyle}>Classe</label>
            <select value={classKey} onChange={e => setClassKey(e.target.value)} style={selectStyle}>
              {CLASSES.map(c => (
                <option key={c.key} value={c.key}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Livello</label>
            <input type="number" min="1" max="20" value={level}
              onChange={e => setLevel(Number(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>PF Massimi</label>
            <input type="number" min="1" value={hpMax}
              onChange={e => setHpMax(Number(e.target.value))} style={inputStyle} />
          </div>
        </div>
      </div>

      <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
        <h2 className="mb-4">Caratteristiche</h2>
        <div className="flex flex-wrap gap-4 justify-around">
          {statField('FOR', str, setStr)}
          {statField('DES', dex, setDex)}
          {statField('COS', con, setCon)}
          {statField('INT', int, setInt)}
          {statField('SAG', wis, setWis)}
          {statField('CAR', cha, setCha)}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={pending}
          className="px-6 py-2 transition-opacity hover:opacity-80"
          style={{
            border: '1px solid #c8922a', color: '#c8922a',
            fontFamily: 'Cinzel, serif', backgroundColor: 'transparent',
            cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.5 : 1,
          }}>
          {pending ? 'Creando...' : 'Crea Personaggio'}
        </button>
        <button type="button" onClick={() => router.back()}
          style={{ border: '1px solid #5a4020', color: '#a08060',
            fontFamily: 'Cinzel, serif', backgroundColor: 'transparent',
            cursor: 'pointer', padding: '8px 24px' }}>
          Annulla
        </button>
      </div>
    </form>
  );
}
