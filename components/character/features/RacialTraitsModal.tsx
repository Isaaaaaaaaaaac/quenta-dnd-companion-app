'use client';

import { useState, useTransition } from 'react';
import { getRacialTraits } from '@/lib/srd/racialTraits';
import { saveRacialChoices, togglePinFeature } from '@/lib/db/actions';
import type { PinnedFeature } from '@/lib/db/schema';
import { ABILITY_NAMES } from '@/lib/srd/skills';

interface Props {
  characterId: string;
  raceKey: string;
  raceName: string;
  subraceKey?: string;
  racialChoices: { traitKey: string; value: string | string[] }[];
  pinnedFeatures?: PinnedFeature[];
  onClose: () => void;
}

const STAT_NAMES: Record<string, string> = {
  str: 'Forza', dex: 'Destrezza', con: 'Costituzione',
  int: 'Intelligenza', wis: 'Saggezza', cha: 'Carisma',
};
const STAT_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const DRAGON_TYPES = ['Nero', 'Blu', 'Ottone', 'Bronzo', 'Rame', 'Oro', 'Verde', 'Rosso', 'Argento', 'Bianco'];

const SKILL_OPTIONS = [
  'Acrobazia', 'Addestrare Animali', 'Arcano', 'Atletica', 'Furtività',
  'Historia', 'Inganno', 'Intimidire', 'Intuizione', 'Investigare',
  'Medicina', 'Natura', 'Percezione', 'Persuasione', 'Rapidità di Mano',
  'Religione', 'Sopravvivenza',
];

const CANTRIP_OPTIONS = [
  'Dardo di Fuoco', 'Raggio di Gelo', 'Luce', 'Prestidigitazione',
  'Mano del Mago', 'Illusione Minore', 'Tocco Gelido', 'Danza delle Luci',
];

export default function RacialTraitsModal({ characterId, raceKey, raceName, subraceKey, racialChoices, pinnedFeatures = [], onClose }: Props) {
  const [localChoices, setLocalChoices] = useState<{ traitKey: string; value: string | string[] }[]>([...racialChoices]);
  const [isPending, startTransition] = useTransition();
  const [localPinned, setLocalPinned] = useState<Set<string>>(
    new Set(pinnedFeatures.map(f => `racial:${f.key}`))
  );

  function handlePin(trait: ReturnType<typeof getRacialTraits>[number]) {
    const id = `racial:${trait.key}`;
    const isPinned = localPinned.has(id);
    setLocalPinned(prev => { const n = new Set(prev); isPinned ? n.delete(id) : n.add(id); return n; });
    const pf: PinnedFeature = { key: trait.key, type: 'racial', name: trait.name, description: trait.description };
    startTransition(() => togglePinFeature(characterId, pf, !isPinned));
  }

  const allTraits = getRacialTraits(raceKey);
  // Filtra tratti per sottorazza corrente (mostra quelli senza subraceOnly + quelli della sottorazza)
  const visibleTraits = allTraits.filter(t =>
    !t.subraceOnly || (subraceKey && t.subraceOnly.includes(subraceKey))
  );

  function getChoice(traitKey: string) {
    return localChoices.find(c => c.traitKey === traitKey)?.value ?? null;
  }

  function setChoice(traitKey: string, value: string | string[]) {
    setLocalChoices(prev => {
      const filtered = prev.filter(c => c.traitKey !== traitKey);
      return [...filtered, { traitKey, value }];
    });
  }

  function handleSave() {
    startTransition(async () => {
      await saveRacialChoices(characterId, localChoices);
      onClose();
    });
  }

  const hasChoices = visibleTraits.some(t => t.choice);

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(12,10,9,.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r2)', width: '100%', maxWidth: 960, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: 'var(--sp-2) var(--sp-2) var(--sp-1)', borderBottom: '1px solid var(--border-leather)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                Tratti Razziali
              </span>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: 'var(--fg-1)', marginTop: 2 }}>{raceName}</div>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 'var(--r)', color: 'var(--fg-2)', fontSize: 16, cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* Trait list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--sp-2)' }}>
          {visibleTraits.length === 0 && (
            <p style={{ padding: 24, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px', color: 'var(--fg-3)', textAlign: 'center' }}>
              Nessun tratto trovato per questa razza.
            </p>
          )}

          <div className="modal-grid-2col">
          {visibleTraits.map(trait => {
            const currentVal = getChoice(trait.key);

            return (
              <div key={trait.key} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', padding: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
                {/* Trait header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {trait.choice && <span style={{ fontSize: 10 }}>⚡</span>}
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, color: 'var(--fg-1)', flex: 1 }}>{trait.name}</span>
                  {trait.subraceOnly && (
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', color: 'var(--fg-3)', border: '1px solid var(--border-leather)', borderRadius: 2, padding: '1px 5px' }}>Sottorazza</span>
                  )}
                  <button onClick={() => handlePin(trait)} title={localPinned.has(`racial:${trait.key}`) ? 'Rimuovi pin' : 'Pinna sulla scheda'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, opacity: localPinned.has(`racial:${trait.key}`) ? 1 : 0.25, transition: 'opacity .2s', padding: 2, flexShrink: 0 }}>
                    📌
                  </button>
                </div>

                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: trait.choice ? 10 : 0 }}>
                  {trait.description}
                </p>

                {/* Scelta richiesta */}
                {trait.choice && (() => {
                  const ch = trait.choice;

                  if (ch.type === 'stat_bonus') {
                    // Scegli N caratteristiche
                    const selected = Array.isArray(currentVal) ? currentVal as string[] : [];
                    const excludes = ch.excludeStats ?? [];
                    return (
                      <div style={{ borderTop: '1px solid var(--border-leather)', paddingTop: 10 }}>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
                          Scegli {ch.count} caratteristiche (+{ch.statAmount ?? 1} ciascuna):
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {STAT_KEYS.filter(k => !excludes.includes(k)).map(k => {
                            const isSelected = selected.includes(k);
                            const canSelect = isSelected || selected.length < ch.count;
                            return (
                              <button key={k}
                                onClick={() => {
                                  const next = isSelected ? selected.filter(s => s !== k) : canSelect ? [...selected, k] : selected;
                                  setChoice(trait.key, next);
                                }}
                                style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em', padding: '0 10px', height: 24, borderRadius: 'var(--r)', border: isSelected ? '1px solid var(--gold)' : '1px solid var(--border-leather)', color: isSelected ? 'var(--gold)' : canSelect ? 'var(--fg-2)' : 'var(--fg-3)', background: isSelected ? 'rgba(184,134,11,.08)' : 'none', cursor: canSelect || isSelected ? 'pointer' : 'not-allowed', opacity: !canSelect && !isSelected ? 0.35 : 1 }}>
                                {STAT_NAMES[k]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  if (ch.type === 'skill_proficiency') {
                    const selected = Array.isArray(currentVal) ? currentVal as string[] : [];
                    return (
                      <div style={{ borderTop: '1px solid var(--border-leather)', paddingTop: 10 }}>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
                          Scegli {ch.count} abilità:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {(ch.options ?? SKILL_OPTIONS).map(skill => {
                            const isSel = selected.includes(skill);
                            const canSel = isSel || selected.length < ch.count;
                            return (
                              <button key={skill}
                                onClick={() => setChoice(trait.key, isSel ? selected.filter(s => s !== skill) : canSel ? [...selected, skill] : selected)}
                                style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', padding: '0 8px', height: 22, borderRadius: 'var(--r)', border: isSel ? '1px solid var(--gold)' : '1px solid var(--border-leather)', color: isSel ? 'var(--gold)' : canSel ? 'var(--fg-2)' : 'var(--fg-3)', background: isSel ? 'rgba(184,134,11,.08)' : 'none', cursor: canSel || isSel ? 'pointer' : 'not-allowed', opacity: !canSel && !isSel ? 0.35 : 1 }}>
                                {skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  if (ch.type === 'cantrip') {
                    const val = typeof currentVal === 'string' ? currentVal : '';
                    return (
                      <div style={{ borderTop: '1px solid var(--border-leather)', paddingTop: 10 }}>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
                          Scegli un trucchetto:
                        </div>
                        <select value={val} onChange={e => setChoice(trait.key, e.target.value)}
                          style={{ height: 32, background: 'var(--bg-deep)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', color: 'var(--fg-1)', fontFamily: 'var(--font-sans)', fontSize: '11px', padding: '0 8px', outline: 'none', cursor: 'pointer' }}>
                          <option value="">— Scegli un trucchetto —</option>
                          {(ch.options ?? CANTRIP_OPTIONS).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    );
                  }

                  if (ch.type === 'language') {
                    const val = typeof currentVal === 'string' ? currentVal : '';
                    return (
                      <div style={{ borderTop: '1px solid var(--border-leather)', paddingTop: 10 }}>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
                          Lingua bonus (scrivi il nome):
                        </div>
                        <input value={val} onChange={e => setChoice(trait.key, e.target.value)} placeholder="Es. Nano, Elfico, Silvano…"
                          style={{ height: 32, width: '100%', background: 'var(--bg-deep)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', color: 'var(--fg-1)', fontFamily: 'var(--font-sans)', fontSize: '11px', padding: '0 10px', outline: 'none' }} />
                      </div>
                    );
                  }

                  if (ch.type === 'feat') {
                    const val = typeof currentVal === 'string' ? currentVal : '';
                    return (
                      <div style={{ borderTop: '1px solid var(--border-leather)', paddingTop: 10 }}>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
                          Talento a scelta (usa il pannello Talenti):
                        </div>
                        <input value={val} onChange={e => setChoice(trait.key, e.target.value)} placeholder="Nome del talento scelto…"
                          style={{ height: 32, width: '100%', background: 'var(--bg-deep)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', color: 'var(--fg-1)', fontFamily: 'var(--font-sans)', fontSize: '11px', padding: '0 10px', outline: 'none' }} />
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>
            );
          })}
          </div>
        </div>

        {/* Footer */}
        {hasChoices && (
          <div style={{ padding: 'var(--sp-2)', borderTop: '1px solid var(--border-leather)', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-1)' }}>
            <button onClick={onClose} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.06em', color: 'var(--fg-2)', background: 'none', border: '1px solid var(--border-leather)', padding: '0 var(--sp-2)', height: 36, borderRadius: 'var(--r)', cursor: 'pointer' }}>
              Annulla
            </button>
            <button onClick={handleSave} disabled={isPending}
              style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.06em', fontWeight: 600, color: 'var(--bg-deep)', background: 'var(--gold)', border: 'none', padding: '0 var(--sp-3)', height: 36, borderRadius: 'var(--r)', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.5 : 1 }}>
              {isPending ? 'Salvataggio…' : 'Salva Scelte'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
