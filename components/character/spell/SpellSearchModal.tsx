'use client';

import { useState, useMemo } from 'react';
import { saveKnownSpells } from '@/lib/db/actions';
import { SRD_SPELLS, SCHOOLS_IT } from '@/lib/srd/spells';
import { generateId } from '@/lib/utils';
import { CASTER_TYPE, maxPreparedSpells } from '@/lib/srd/spellcastingRules';
import { getDomainSpells } from '@/lib/srd/subclasses';
import type { KnownSpell, CharacterClass, CharacterStats } from '@/lib/db/schema';

interface Props {
  characterId: string;
  currentSpells: KnownSpell[];
  casterClassKeys: string[];
  characterClasses: CharacterClass[];
  characterStats: CharacterStats;
  onClose: () => void;
}

// ─── Stili costanti ────────────────────────────────────────────────────────────
const OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 200,
  backgroundColor: 'rgba(12,10,9,.85)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const MODAL: React.CSSProperties = {
  background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)',
  borderRadius: 'var(--r2)', width: '100%', maxWidth: 900, maxHeight: '90vh',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
};
const CHIP = (active: boolean, color = 'var(--arcane)', bg = 'rgba(91,33,182,.08)'): React.CSSProperties => ({
  fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em',
  padding: '0 10px', height: 24, borderRadius: 'var(--r)', cursor: 'pointer',
  border: active ? `1px solid ${color}` : '1px solid var(--border-leather)',
  color: active ? color : 'var(--fg-2)',
  background: active ? bg : 'none', transition: 'all .2s', flexShrink: 0,
});

const LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const LEVEL_LABEL = (l: number) => l === 0 ? 'Cantrip' : `Lv ${l}`;
const PREPARED_CLASSES = ['cleric', 'druid', 'paladin', 'wizard'] as const;

// ─── Sub-components ────────────────────────────────────────────────────────────
function SchoolBadge({ school }: { school: string }) {
  return (
    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, color: 'var(--arcane)', opacity: .8, letterSpacing: '.04em', padding: '1px 5px', border: '1px solid rgba(91,33,182,.3)', borderRadius: 2, flexShrink: 0 }}>
      {(SCHOOLS_IT[school] ?? school).slice(0, 5).toUpperCase()}
    </span>
  );
}

function LevelPips({ level }: { level: number }) {
  return (
    <span style={{
      fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600,
      letterSpacing: '.06em', color: 'var(--arcane)',
      minWidth: 40, flexShrink: 0,
    }}>
      {level === 0 ? 'CANT.' : `LIV. ${level}`}
    </span>
  );
}

type SpellEntry = (typeof SRD_SPELLS)[number];

function SpellRow({ spell, inSel, onAdd }: { spell: SpellEntry; inSel: boolean; onAdd: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ borderBottom: '.5px solid var(--bg-elevated)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <LevelPips level={spell.level} />
        <span style={{ flex: 1, fontSize: '12px', color: 'var(--fg-1)' }}>{spell.name}</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          {spell.concentration && <span style={{ fontSize: 8, color: 'var(--info)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>C</span>}
          {spell.ritual        && <span style={{ fontSize: 8, color: 'var(--gold)',     fontFamily: 'var(--font-sans)', fontWeight: 600 }}>R</span>}
          <SchoolBadge school={spell.school} />
          <button onClick={e => { e.stopPropagation(); onAdd(); }} disabled={inSel}
            style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em', width: 52, height: 22, borderRadius: 'var(--r)', border: `1px solid ${inSel ? 'var(--border-leather)' : 'rgba(91,33,182,.4)'}`, color: inSel ? 'var(--fg-3)' : 'var(--arcane)', background: inSel ? 'transparent' : 'rgba(91,33,182,.06)', cursor: inSel ? 'default' : 'pointer', transition: 'all .2s' }}>
            {inSel ? '✓' : '+ Apprendi'}
          </button>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '0 16px 10px 60px' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 6 }}>
            {[['Gittata', spell.range], ['Durata', spell.duration], ['Lancio', spell.castingTime]].map(([l, v]) => (
              <div key={l}><span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', color: 'var(--fg-3)', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block' }}>{l}</span><span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-2)' }}>{v}</span></div>
            ))}
          </div>
          <div style={{ fontSize: '8px', color: 'var(--fg-3)', fontFamily: 'var(--font-sans)', marginBottom: 4 }}>Componenti: {spell.components}</div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', lineHeight: 1.55 }}>{spell.description}</p>
        </div>
      )}
    </div>
  );
}

// ─── Modal principale ──────────────────────────────────────────────────────────
export default function SpellSearchModal({ characterId, currentSpells, casterClassKeys, characterClasses, characterStats, onClose }: Props) {
  const [sel, setSel] = useState<KnownSpell[]>(() => currentSpells.map(s => ({ ...s })));
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [classOnly, setClassOnly] = useState(true);
  const [hbOpen, setHbOpen] = useState(false);
  const [hbName, setHbName] = useState('');
  const [hbLevel, setHbLevel] = useState(1);
  const [hbSchool, setHbSchool] = useState('evocation');
  const [hbConc, setHbConc] = useState(false);
  const [pending, setPending] = useState(false);

  // ── Domain spells (sempre preparati) ──────────────────────────────────────
  const domainSpellIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of characterClasses) {
      const charLevel = characterClasses.reduce((s, cl) => s + cl.level, 0);
      getDomainSpells(c.classKey, c.subclass, charLevel).forEach(ds => ids.add(ds.id));
    }
    return ids;
  }, [characterClasses]);

  // ── Calcolo limiti preparazione per classe ─────────────────────────────────
  const prepLimits = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of characterClasses) {
      if (PREPARED_CLASSES.includes(c.classKey as (typeof PREPARED_CLASSES)[number])) {
        out[c.classKey] = maxPreparedSpells(c.classKey, c.level, characterStats);
      }
    }
    return out;
  }, [characterClasses, characterStats]);

  // Conteggio spell preparate per classe (escluso cantrip e domain spells)
  const preparedCount = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of characterClasses) {
      out[c.classKey] = sel.filter(s =>
        s.prepared &&
        s.level > 0 &&
        !domainSpellIds.has(s.id) &&
        (s.sourceClass === c.classKey || !s.sourceClass)
      ).length;
    }
    return out;
  }, [sel, characterClasses, domainSpellIds]);

  // ── Catalogo filtrato ──────────────────────────────────────────────────────
  const catalog = useMemo(() => {
    return SRD_SPELLS.filter(sp => {
      if (classOnly && casterClassKeys.length > 0 && !sp.classes.some(c => casterClassKeys.includes(c))) return false;
      if (levelFilter !== null && sp.level !== levelFilter) return false;
      if (schoolFilter && sp.school !== schoolFilter) return false;
      if (query && !sp.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, levelFilter, schoolFilter, classOnly, casterClassKeys]);

  const selIds = new Set(sel.map(s => s.id));

  // ── Azioni ────────────────────────────────────────────────────────────────
  function addSpell(id: string) {
    const sp = SRD_SPELLS.find(s => s.id === id);
    if (!sp || selIds.has(sp.id)) return;
    // Determina la classe sorgente (primo match con le classi del PG)
    const sourceClass = casterClassKeys.find(k => sp.classes.includes(k));
    setSel(prev => [...prev, {
      id: sp.id, name: sp.name, level: sp.level, prepared: sp.level === 0, // cantrip auto-preparati
      ritual: sp.ritual, concentration: sp.concentration, school: sp.school,
      sourceClass,
    }]);
  }

  function removeSpell(id: string) {
    if (domainSpellIds.has(id)) return; // domain spells non rimovibili
    setSel(prev => prev.filter(s => s.id !== id));
  }

  function togglePrepared(spell: KnownSpell) {
    if (spell.level === 0 || domainSpellIds.has(spell.id)) return; // cantrip/domain sempre preparati
    const isPrepared = spell.prepared;
    // Se stiamo preparando, controlla il limite
    if (!isPrepared) {
      const cls = spell.sourceClass ?? casterClassKeys[0];
      const limit = prepLimits[cls ?? ''];
      const count = preparedCount[cls ?? ''] ?? 0;
      if (limit !== undefined && count >= limit) return; // blocco al limite
    }
    setSel(prev => prev.map(s => s.id === spell.id ? { ...s, prepared: !s.prepared } : s));
  }

  function addHomebrew() {
    if (!hbName.trim()) return;
    const sourceClass = casterClassKeys[0];
    setSel(prev => [...prev, {
      id: `homebrew-${generateId()}`, name: hbName.trim(), level: hbLevel,
      prepared: hbLevel === 0, ritual: false, concentration: hbConc, school: hbSchool, sourceClass,
    }]);
    setHbName(''); setHbLevel(1); setHbSchool('evocation'); setHbConc(false); setHbOpen(false);
  }

  async function handleConfirm() {
    setPending(true);
    await saveKnownSpells(characterId, sel);
    setPending(false);
    onClose();
  }

  const inp: React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', color: 'var(--fg-1)', fontFamily: 'var(--font-sans)', fontSize: '13px', outline: 'none', padding: '0 12px' };

  return (
    <div style={OVERLAY} className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={MODAL}>

        {/* ── Header ── */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-leather)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--arcane)', textTransform: 'uppercase' }}>Gestisci Incantesimi</span>
            <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 'var(--r)', color: 'var(--fg-2)', fontSize: 16, cursor: 'pointer' }}>✕</button>
          </div>

          {/* Contatori preparazione per classe */}
          {Object.entries(prepLimits).length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
              {Object.entries(prepLimits).map(([cls, limit]) => {
                const count = preparedCount[cls] ?? 0;
                const atLimit = count >= limit;
                return (
                  <div key={cls} style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: atLimit ? 'var(--danger)' : 'var(--fg-2)', border: `1px solid ${atLimit ? 'rgba(139,26,26,.4)' : 'var(--border-leather)'}`, borderRadius: 'var(--r)', padding: '2px 8px' }}>
                    {cls.charAt(0).toUpperCase() + cls.slice(1)}: <strong style={{ color: atLimit ? 'var(--danger)' : 'var(--gold)' }}>{count}/{limit}</strong> preparati
                    {atLimit && ' (limite raggiunto)'}
                  </div>
                );
              })}
            </div>
          )}

          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca incantesimo..." style={{ ...inp, width: '100%', height: 40, fontSize: '14px', marginBottom: 10 }} />

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            <button style={CHIP(levelFilter === null)} onClick={() => setLevelFilter(null)}>Tutti</button>
            {LEVELS.map(l => (
              <button key={l} style={CHIP(levelFilter === l)} onClick={() => setLevelFilter(l === levelFilter ? null : l)}>{LEVEL_LABEL(l)}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={schoolFilter ?? ''} onChange={e => setSchoolFilter(e.target.value || null)} style={{ ...inp, height: 28, fontSize: '11px', paddingRight: 8, cursor: 'pointer' }}>
              <option value="">Tutte le scuole</option>
              {Object.keys(SCHOOLS_IT).map(k => <option key={k} value={k}>{SCHOOLS_IT[k]}</option>)}
            </select>
            {casterClassKeys.length > 0 && (
              <button style={CHIP(classOnly, 'var(--gold)', 'rgba(184,134,11,.06)')} onClick={() => setClassOnly(c => !c)}>
                Solo {casterClassKeys.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' · ')}
              </button>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Catalogo */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', borderRight: '1px solid var(--border-leather)' }}>
            {catalog.length === 0 && <p style={{ padding: '24px 20px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px', color: 'var(--fg-3)' }}>Nessun incantesimo trovato.</p>}
            {catalog.map(sp => <SpellRow key={sp.id} spell={sp} inSel={selIds.has(sp.id)} onAdd={() => addSpell(sp.id)} />)}

            {/* Homebrew */}
            <div style={{ padding: '8px 16px' }}>
              <button onClick={() => setHbOpen(o => !o)} style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em', color: 'var(--fg-2)', background: 'none', border: '1px dashed var(--border-leather)', borderRadius: 'var(--r)', padding: '0 12px', height: 28, cursor: 'pointer', width: '100%' }}>
                + Incantesimo Homebrew
              </button>
              {hbOpen && (
                <div style={{ marginTop: 8, padding: 12, background: 'var(--bg-card)', borderRadius: 'var(--r)', border: '1px solid var(--border-leather)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input value={hbName} onChange={e => setHbName(e.target.value)} placeholder="Nome incantesimo" style={{ ...inp, height: 32, width: '100%', fontSize: '12px' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select value={hbLevel} onChange={e => setHbLevel(Number(e.target.value))} style={{ ...inp, height: 32, flex: 1, fontSize: '11px', cursor: 'pointer' }}>
                      {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABEL(l)}</option>)}
                    </select>
                    <select value={hbSchool} onChange={e => setHbSchool(e.target.value)} style={{ ...inp, height: 32, flex: 2, fontSize: '11px', cursor: 'pointer' }}>
                      {Object.keys(SCHOOLS_IT).map(k => <option key={k} value={k}>{SCHOOLS_IT[k]}</option>)}
                    </select>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', color: 'var(--fg-2)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={hbConc} onChange={e => setHbConc(e.target.checked)} /> Concentrazione
                  </label>
                  <button onClick={addHomebrew} style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em', color: 'var(--arcane)', background: 'rgba(91,33,182,.06)', border: '1px solid rgba(91,33,182,.35)', borderRadius: 'var(--r)', height: 32, cursor: 'pointer' }}>Aggiungi Homebrew</button>
                </div>
              )}
            </div>
          </div>

          {/* Pannello selezione */}
          <div style={{ width: 300, overflowY: 'auto', padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '4px 16px 8px', fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--fg-3)', textTransform: 'uppercase' }}>
              Lista ({sel.length})
            </div>

            {sel.length === 0 && <p style={{ padding: '12px 16px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)' }}>Nessun incantesimo.</p>}

            {[...sel].sort((a, b) => a.level - b.level).map(sp => {
              const isDomain   = domainSpellIds.has(sp.id);
              const isCantrip  = sp.level === 0;
              const alwaysPrep = isDomain || isCantrip;
              const cls = sp.sourceClass ?? casterClassKeys[0];
              const limit = cls ? prepLimits[cls] : undefined;
              const atLimit = limit !== undefined && (preparedCount[cls ?? ''] ?? 0) >= limit && !sp.prepared;

              return (
                <div key={sp.id} style={{ padding: '6px 16px', borderBottom: '.5px solid var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LevelPips level={sp.level} />
                  <span style={{ flex: 1, fontSize: '12px', color: sp.prepared || isCantrip || isDomain ? 'var(--fg-1)' : 'var(--fg-2)', lineHeight: 1.3 }}>{sp.name}</span>

                  {/* Badge dominio */}
                  {isDomain && (
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', color: 'var(--gold)', border: '1px solid rgba(184,134,11,.35)', borderRadius: 2, padding: '1px 4px', flexShrink: 0 }}>Dom.</span>
                  )}

                  {/* Toggle preparato */}
                  {!alwaysPrep && (
                    <button
                      onClick={() => togglePrepared(sp)}
                      title={atLimit ? 'Limite raggiunto' : sp.prepared ? 'Rimuovi dalla preparazione' : 'Prepara'}
                      style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${sp.prepared ? 'var(--arcane)' : atLimit ? 'rgba(139,26,26,.5)' : 'var(--fg-3)'}`, background: sp.prepared ? 'var(--arcane)' : 'transparent', cursor: atLimit && !sp.prepared ? 'not-allowed' : 'pointer', flexShrink: 0, transition: 'all .2s', opacity: atLimit && !sp.prepared ? 0.4 : 1 }}
                    />
                  )}

                  {/* Rimuovi */}
                  {!isDomain && (
                    <button onClick={() => removeSpell(sp.id)} style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 'var(--r)', color: 'var(--fg-3)', fontSize: 10, cursor: 'pointer' }}>✕</button>
                  )}
                </div>
              );
            })}

            {/* Footer */}
            <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid var(--border-leather)', flexShrink: 0 }}>
              <div style={{ fontSize: '9px', color: 'var(--fg-3)', marginBottom: 8, fontFamily: 'var(--font-sans)', lineHeight: 1.5 }}>
                ● = preparato · ○ = non preparato · Dom. = sempre preparato
              </div>
              <button onClick={handleConfirm} disabled={pending}
                style={{ width: '100%', height: 40, fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--bg-deep)', background: 'var(--arcane)', border: 'none', borderRadius: 'var(--r)', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.5 : 1 }}>
                {pending ? 'Salvataggio…' : 'Conferma'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
