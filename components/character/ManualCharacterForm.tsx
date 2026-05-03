'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCharacter } from '@/lib/db/actions';
import { CLASSES } from '@/lib/srd/classes';
import { RACES } from '@/lib/srd/races';
import { BACKGROUNDS } from '@/lib/srd/backgrounds';
import { SKILLS } from '@/lib/srd/skills';
import { abilityModifier, proficiencyBonus } from '@/lib/rules/calculations';
import type { CharacterSheet } from '@/lib/db/schema';

type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
const STATS: { key: StatKey; label: string; short: string }[] = [
  { key: 'str', label: 'Forza',         short: 'FOR' },
  { key: 'dex', label: 'Destrezza',     short: 'DES' },
  { key: 'con', label: 'Costituzione',  short: 'COS' },
  { key: 'int', label: 'Intelligenza',  short: 'INT' },
  { key: 'wis', label: 'Saggezza',      short: 'SAG' },
  { key: 'cha', label: 'Carisma',       short: 'CAR' },
];

const inp: React.CSSProperties = { backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', width: '100%', padding: '4px 0' };
const lbl: React.CSSProperties = { display: 'block', fontSize: '0.7rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: 4 };
const sel: React.CSSProperties = { ...inp, backgroundColor: '#2a2018', padding: '4px 2px', cursor: 'pointer' };
const ta: React.CSSProperties = { ...inp, borderBottom: 'none', border: '1px solid #5a4020', padding: '8px', resize: 'vertical' as const };
const numInp: React.CSSProperties = { ...inp, textAlign: 'center' };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-5 border mb-4" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
    <h2 className="mb-4">{title}</h2>
    {children}
  </div>
);

interface Props { campaignId: string; }

export default function ManualCharacterForm({ campaignId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Identità
  const [name, setName] = useState('');
  const [type, setType] = useState<'pc' | 'npc_major' | 'npc_minor'>('pc');
  const [raceKey, setRaceKey] = useState('');
  const [subraceKey, setSubraceKey] = useState('');
  const [classKey, setClassKey] = useState('fighter');
  const [subclass, setSubclass] = useState('');
  const [level, setLevel] = useState(1);
  const [backgroundKey, setBackgroundKey] = useState('');
  const [alignment, setAlignment] = useState('');
  const [xp, setXp] = useState(0);

  // Caratteristiche
  const [stats, setStats] = useState<Record<StatKey, number>>({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });

  // PF e combattimento
  const [hpMax, setHpMax] = useState(10);
  const [ac, setAc] = useState(10);
  const [speed, setSpeed] = useState(9);
  const [initiativeBonus, setInitiativeBonus] = useState(0);

  // Competenze abilità
  const [skillProfs, setSkillProfs] = useState<Set<string>>(new Set());
  const [skillExpertise, setSkillExpertise] = useState<Set<string>>(new Set());

  // Tiri salvezza
  const [stProfs, setStProfs] = useState<Set<StatKey>>(new Set());

  // Narrativa
  const [personality, setPersonality] = useState('');
  const [ideals, setIdeals] = useState('');
  const [bonds, setBonds] = useState('');
  const [flaws, setFlaws] = useState('');
  const [backstory, setBackstory] = useState('');
  const [dmNotes, setDmNotes] = useState('');
  const [portraitUrl, setPortraitUrl] = useState('');

  const cls = CLASSES.find(c => c.key === classKey);
  const race = RACES.find(r => r.key === raceKey);
  const prof = proficiencyBonus(level);

  function setStat(key: StatKey, val: number) {
    setStats(prev => ({ ...prev, [key]: Math.max(1, Math.min(30, val)) }));
  }

  function toggleSkill(key: string) {
    const next = new Set(skillProfs);
    if (next.has(key)) { next.delete(key); skillExpertise.delete(key); setSkillExpertise(new Set(skillExpertise)); }
    else next.add(key);
    setSkillProfs(next);
  }

  function toggleSt(key: StatKey) {
    const next = new Set(stProfs);
    if (next.has(key)) next.delete(key); else next.add(key);
    setStProfs(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const skillMap: Record<string, { proficient: boolean; expertise: boolean }> = {};
    SKILLS.forEach(s => {
      if (skillProfs.has(s.key)) {
        skillMap[s.key] = { proficient: true, expertise: skillExpertise.has(s.key) };
      }
    });

    const bgName = BACKGROUNDS.find(b => b.key === backgroundKey)?.name ?? backgroundKey;

    const sheet: CharacterSheet = {
      race: (race?.name ?? raceKey) || undefined,
      subrace: subraceKey || undefined,
      classes: [{ classKey, level, subclass: subclass || undefined }],
      background: bgName || undefined,
      alignment: alignment || undefined,
      portraitUrl: portraitUrl || undefined,
      stats,
      armorClass: ac,
      speed,
      initiativeBonus: initiativeBonus || undefined,
      savingThrowProficiencies: {
        str: stProfs.has('str'), dex: stProfs.has('dex'), con: stProfs.has('con'),
        int: stProfs.has('int'), wis: stProfs.has('wis'), cha: stProfs.has('cha'),
      },
      skills: skillMap,
      hitDice: [{ die: `d${cls?.hitDie ?? 8}`, total: level, used: 0 }],
      inventory: [],
      money: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
      personality: personality || undefined,
      ideals: ideals || undefined,
      bonds: bonds || undefined,
      flaws: flaws || undefined,
      backstory: backstory || undefined,
      dmNotes: dmNotes || undefined,
    };

    await createCharacter({ name: name.trim(), type, level, xp, hpCurrent: hpMax, hpMax, hpTemp: 0, sheet, campaignId });
    router.push(`/campaigns/${campaignId}`);
  }

  return (
    <form onSubmit={handleSubmit}>

      <Section title="Identità">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label style={lbl}>Nome *</label>
            <input value={name} onChange={e => setName(e.target.value)} required style={inp} placeholder="Nome del personaggio" autoFocus />
          </div>
          <div>
            <label style={lbl}>Tipo</label>
            <select value={type} onChange={e => setType(e.target.value as typeof type)} style={sel}>
              <option value="pc">Personaggio Giocante</option>
              <option value="npc_major">PNG Principale</option>
              <option value="npc_minor">PNG Secondario</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Razza</label>
            <select value={raceKey} onChange={e => { setRaceKey(e.target.value); setSubraceKey(''); }} style={sel}>
              <option value="">— Nessuna / Personalizzata —</option>
              {RACES.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
            </select>
          </div>
          {race?.subRaces && race.subRaces.length > 0 && (
            <div>
              <label style={lbl}>Sottorazza</label>
              <select value={subraceKey} onChange={e => setSubraceKey(e.target.value)} style={sel}>
                <option value="">— Nessuna —</option>
                {race.subRaces.map(s => <option key={s.key} value={s.key}>{s.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={lbl}>Classe</label>
            <select value={classKey} onChange={e => setClassKey(e.target.value)} style={sel}>
              {CLASSES.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Archetipo / Sottoclasse</label>
            <input value={subclass} onChange={e => setSubclass(e.target.value)} style={inp} placeholder="Es. Campione, Scuola di Evocazione…" />
          </div>
          <div>
            <label style={lbl}>Livello</label>
            <input type="number" min={1} max={20} value={level} onChange={e => setLevel(Number(e.target.value))} style={numInp} />
          </div>
          <div>
            <label style={lbl}>XP totali</label>
            <input type="number" min={0} value={xp} onChange={e => setXp(Number(e.target.value))} style={numInp} />
          </div>
          <div>
            <label style={lbl}>Background</label>
            <select value={backgroundKey} onChange={e => setBackgroundKey(e.target.value)} style={sel}>
              <option value="">— Nessuno / Personalizzato —</option>
              {BACKGROUNDS.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Allineamento</label>
            <select value={alignment} onChange={e => setAlignment(e.target.value)} style={sel}>
              <option value="">—</option>
              {['Legale Buono','Neutrale Buono','Caotico Buono','Legale Neutrale','Neutrale','Caotico Neutrale','Legale Malvagio','Neutrale Malvagio','Caotico Malvagio'].map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>URL Ritratto</label>
            <input value={portraitUrl} onChange={e => setPortraitUrl(e.target.value)} style={inp} placeholder="https://…" />
          </div>
        </div>
      </Section>

      <Section title="Caratteristiche">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6 mb-2">
          {STATS.map(({ key, label, short }) => {
            const val = stats[key];
            const mod = abilityModifier(val);
            return (
              <div key={key} className="text-center p-3 border" style={{ borderColor: '#5a4020', backgroundColor: '#2a2018' }}>
                <label style={{ ...lbl, textAlign: 'center', display: 'block' }}>{short}</label>
                <input type="number" min={1} max={30} value={val} onChange={e => setStat(key, Number(e.target.value))}
                  style={{ ...numInp, fontSize: '1.4rem', fontFamily: 'Cinzel, serif' }} />
                <div style={{ fontSize: '0.85rem', color: mod >= 0 ? '#c8922a' : '#8b2020', marginTop: 4 }}>
                  {mod >= 0 ? `+${mod}` : mod}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', fontStyle: 'italic' }}>
          Bonus competenza al livello {level}: +{prof}
        </div>
      </Section>

      <Section title="Combattimento">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <label style={lbl}>PF Massimi</label>
            <input type="number" min={1} value={hpMax} onChange={e => setHpMax(Number(e.target.value))} style={numInp} />
          </div>
          <div>
            <label style={lbl}>Classe Armatura</label>
            <input type="number" min={1} value={ac} onChange={e => setAc(Number(e.target.value))} style={numInp} />
          </div>
          <div>
            <label style={lbl}>Velocità (m)</label>
            <input type="number" min={0} step={1.5} value={speed} onChange={e => setSpeed(Number(e.target.value))} style={numInp} />
          </div>
          <div>
            <label style={lbl}>Bonus Iniziativa extra</label>
            <input type="number" value={initiativeBonus} onChange={e => setInitiativeBonus(Number(e.target.value))} style={numInp} />
            <div style={{ color: '#5a4020', fontSize: '0.7rem', marginTop: 2 }}>
              Iniziativa totale: {abilityModifier(stats.dex) + initiativeBonus >= 0 ? '+' : ''}{abilityModifier(stats.dex) + initiativeBonus}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Tiri Salvezza">
        <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', marginBottom: 12 }}>
          Seleziona le caratteristiche in cui sei competente (il bonus sarà calcolato automaticamente).
        </p>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {STATS.map(({ key, short }) => {
            const val = stats[key];
            const mod = abilityModifier(val);
            const hasProficiency = stProfs.has(key);
            const total = mod + (hasProficiency ? prof : 0);
            return (
              <button type="button" key={key} onClick={() => toggleSt(key)}
                style={{ border: `1px solid ${hasProficiency ? '#c8922a' : '#5a4020'}`, backgroundColor: hasProficiency ? '#2a2010' : '#1e1810', padding: '8px', textAlign: 'center', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e8d5a3' }}>
                <div style={{ fontSize: '0.6rem', color: hasProficiency ? '#c8922a' : '#a08060', marginBottom: 2 }}>{short}</div>
                <div>{total >= 0 ? `+${total}` : total}</div>
                <div style={{ fontSize: '0.5rem', color: hasProficiency ? '#c8922a' : '#3a3020', marginTop: 2 }}>
                  {hasProficiency ? '◆' : '◇'}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Abilità">
        <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', marginBottom: 12 }}>
          Seleziona le abilità in cui sei competente. I bonus vengono calcolati automaticamente.
        </p>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {SKILLS.map(skill => {
            const hasProficiency = skillProfs.has(skill.key);
            const bonus = abilityModifier(stats[skill.ability]) + (hasProficiency ? prof : 0);
            return (
              <button type="button" key={skill.key} onClick={() => toggleSkill(skill.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px', textAlign: 'left', border: `1px solid ${hasProficiency ? '#8a6010' : '#2a2018'}`, backgroundColor: hasProficiency ? '#2a1e08' : 'transparent', cursor: 'pointer', marginBottom: 1 }}>
                <span style={{ color: hasProficiency ? '#c8922a' : '#3a3020', fontSize: '0.7rem' }}>{hasProficiency ? '◆' : '◇'}</span>
                <span style={{ flex: 1, color: '#e8d5a3', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem' }}>{skill.name}</span>
                <span style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem' }}>({skill.ability.toUpperCase()})</span>
                <span style={{ fontFamily: 'Cinzel, serif', color: bonus >= 0 ? '#c8922a' : '#8b2020', fontSize: '0.85rem', minWidth: 28, textAlign: 'right' }}>
                  {bonus >= 0 ? `+${bonus}` : bonus}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Narrativa">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><label style={lbl}>Tratto di personalità</label><textarea value={personality} onChange={e => setPersonality(e.target.value)} rows={2} style={ta} /></div>
          <div><label style={lbl}>Ideale</label><textarea value={ideals} onChange={e => setIdeals(e.target.value)} rows={2} style={ta} /></div>
          <div><label style={lbl}>Legame</label><textarea value={bonds} onChange={e => setBonds(e.target.value)} rows={2} style={ta} /></div>
          <div><label style={lbl}>Difetto</label><textarea value={flaws} onChange={e => setFlaws(e.target.value)} rows={2} style={ta} /></div>
          <div className="md:col-span-2"><label style={lbl}>Storia / Backstory</label><textarea value={backstory} onChange={e => setBackstory(e.target.value)} rows={4} style={ta} /></div>
          <div className="md:col-span-2"><label style={{ ...lbl, color: '#8b2020' }}>Note DM (private)</label><textarea value={dmNotes} onChange={e => setDmNotes(e.target.value)} rows={3} style={{ ...ta, border: '1px solid #8b2020', backgroundColor: '#1a0a0a' }} /></div>
        </div>
      </Section>

      <div className="flex gap-3 pb-8">
        <button type="submit" disabled={saving || !name.trim()}
          style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '10px 24px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || !name.trim() ? 0.5 : 1, fontSize: '0.85rem' }}>
          {saving ? 'Salvando…' : '✦ Salva Personaggio'}
        </button>
        <button type="button" onClick={() => router.back()}
          style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '10px 24px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Annulla
        </button>
      </div>
    </form>
  );
}
