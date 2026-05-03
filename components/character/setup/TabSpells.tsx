'use client';

import { useState, useEffect } from 'react';
import type { KnownSpell, CharacterStats } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { CLASSES } from '@/lib/srd/classes';
import {
  CASTER_TYPE, cantripsKnownAt, spellsKnownAt, maxPreparedSpells,
  maxSpellLevelForClass, wizardSpellbookCapacity,
  casterTypeLabel, casterRulesDescription,
  type CasterType,
} from '@/lib/srd/spellcastingRules';

interface SrdSpell {
  index: string;
  name: string;
  level: number;
  school: string;
  concentration: boolean;
  ritual: boolean;
}

interface Props {
  classKey: string;
  level: number;
  stats: CharacterStats;
  knownSpells: KnownSpell[];
  setKnownSpells: (s: KnownSpell[]) => void;
}

// ─── Costanti UI ────────────────────────────────────────────────────────────
const badge = (color: string, bg: string, text: string) => (
  <span style={{ border: `1px solid ${color}`, color, backgroundColor: bg, fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '1px 6px', letterSpacing: '0.04em' }}>
    {text}
  </span>
);

const countBadge = (current: number, max: number, label: string) => {
  const over = current > max;
  const full = current === max;
  return (
    <span style={{
      border: `1px solid ${over ? '#8b2020' : full ? '#4a7c4e' : '#5a4020'}`,
      color: over ? '#8b2020' : full ? '#4a7c4e' : '#a08060',
      fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '2px 8px',
    }}>
      {label}: {current}/{max}
    </span>
  );
};

export default function TabSpells({ classKey, level, stats, knownSpells, setKnownSpells }: Props) {
  const [srdSpells, setSrdSpells] = useState<SrdSpell[]>([]);
  const [loadingSpells, setLoadingSpells] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'spellbook' | 'prepared'>('spellbook');

  const casterType: CasterType = CASTER_TYPE[classKey] ?? 'none';
  const isWizard = classKey === 'wizard';
  const isPrepared = casterType === 'prepared_full' || casterType === 'prepared_half';
  const isSpontaneous = casterType === 'spontaneous' || casterType === 'pact';
  const maxSpellLv = maxSpellLevelForClass(classKey, level);
  const cantripLimit = cantripsKnownAt(classKey, level);
  const spellsKnownLimit = isSpontaneous ? spellsKnownAt(classKey, level) : 0;
  const preparedLimit = isPrepared ? maxPreparedSpells(classKey, level, stats) : 0;
  const spellbookCapacity = isWizard ? wizardSpellbookCapacity(level) : 0;

  // Dividi incantesimi per categoria
  const cantrips = knownSpells.filter(s => s.level === 0);
  const nonCantripKnown = knownSpells.filter(s => s.level > 0);
  const preparedSpells = nonCantripKnown.filter(s => s.prepared);
  const knownIds = new Set(knownSpells.map(s => s.id));

  // Carica lista incantesimi SRD
  useEffect(() => {
    if (casterType === 'none') return;
    setLoadingSpells(true);
    setLoadError('');

    fetch(`https://www.dnd5eapi.co/api/2014/classes/${classKey}/spells`)
      .then(r => r.json())
      .then(async data => {
        const rawList: { index: string; name: string }[] = data.results ?? [];
        // Fetch dettaglio in batch (max 60 per performance)
        const batch = rawList.slice(0, 60);
        const details = await Promise.allSettled(
          batch.map(s =>
            fetch(`https://www.dnd5eapi.co/api/2014/spells/${s.index}`)
              .then(r => r.json())
              .then(d => ({
                index: s.index,
                name: d.name ?? s.name,
                level: d.level ?? 0,
                school: d.school?.name ?? '',
                concentration: d.concentration ?? false,
                ritual: d.ritual ?? false,
              }))
          )
        );
        const valid = details
          .filter(r => r.status === 'fulfilled')
          .map(r => (r as PromiseFulfilledResult<SrdSpell>).value)
          .filter(s => s.level <= maxSpellLv || s.level === 0);
        setSrdSpells(valid);
        setLoadingSpells(false);
      })
      .catch(() => {
        setLoadError('Impossibile caricare incantesimi. Connessione assente o API non disponibile.');
        setLoadingSpells(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classKey]);

  function canAddCantrip(): boolean { return cantrips.length < cantripLimit; }

  function canAddToSpellbook(): boolean {
    if (isWizard) return nonCantripKnown.length < spellbookCapacity;
    if (isSpontaneous) return nonCantripKnown.length < spellsKnownLimit;
    return true; // prepared non-wizard: lista aperta
  }

  function toggleSpell(spell: SrdSpell) {
    if (knownIds.has(spell.index)) {
      setKnownSpells(knownSpells.filter(s => s.id !== spell.index));
      return;
    }

    if (spell.level === 0) {
      if (!canAddCantrip()) return;
    } else {
      if (!canAddToSpellbook()) return;
    }

    const newSpell: KnownSpell = {
      id: spell.index,
      name: spell.name,
      level: spell.level,
      prepared: isSpontaneous || spell.level === 0, // spontanei sono sempre "pronti"
      ritual: spell.ritual,
      concentration: spell.concentration,
      school: spell.school,
    };
    setKnownSpells([...knownSpells, newSpell]);
  }

  function togglePrepared(id: string) {
    const spell = knownSpells.find(s => s.id === id);
    if (!spell || spell.level === 0) return;
    const currentPrepared = preparedSpells.length;
    if (!spell.prepared && currentPrepared >= preparedLimit) return; // limite raggiunto
    setKnownSpells(knownSpells.map(s => s.id === id ? { ...s, prepared: !s.prepared } : s));
  }

  function removeSpell(id: string) { setKnownSpells(knownSpells.filter(s => s.id !== id)); }

  const filteredSrd = srdSpells.filter(s => {
    if (filterLevel !== 'all' && s.level !== filterLevel) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (casterType === 'none') {
    return (
      <div className="text-center py-10" style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
        {CLASSES.find(c => c.key === classKey)?.name ?? classKey} non usa incantesimi.
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Intestazione: tipo di incantatore e regole ── */}
      <div className="p-3" style={{ backgroundColor: '#2a2010', border: '1px solid #5a4020' }}>
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <span style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.8rem' }}>
            {casterTypeLabel(classKey)}
          </span>
          {cantripLimit > 0 && countBadge(cantrips.length, cantripLimit, 'Trucchetti')}
          {isSpontaneous && countBadge(nonCantripKnown.length, spellsKnownLimit, 'Incantesimi noti')}
          {isWizard && countBadge(nonCantripKnown.length, spellbookCapacity, 'Nel libro')}
          {isPrepared && countBadge(preparedSpells.length, preparedLimit, 'Preparati')}
          <span style={{ border: '1px solid #5a4020', color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '1px 6px' }}>
            Max livello: {maxSpellLv}°
          </span>
        </div>
        <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
          {casterRulesDescription(classKey)}
        </p>
      </div>

      {/* ── Tab per Mago: Libro vs Preparati ── */}
      {isWizard && (
        <div className="flex" style={{ borderBottom: '1px solid #5a4020' }}>
          {[
            { id: 'spellbook' as const, label: '📖 Libro degli Incantesimi' },
            { id: 'prepared' as const, label: '✦ Preparati oggi' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: '8px', cursor: 'pointer',
                backgroundColor: 'transparent', border: 'none',
                borderBottom: `2px solid ${activeTab === t.id ? '#c8922a' : 'transparent'}`,
                color: activeTab === t.id ? '#c8922a' : '#a08060',
                fontFamily: 'Cinzel, serif', fontSize: '0.75rem',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Lista incantesimi correnti ── */}
      {(!isWizard || activeTab === 'spellbook') && (
        <section>
          <h3 className="mb-3">
            {isWizard ? 'Libro degli Incantesimi' : isSpontaneous ? 'Incantesimi Noti' : 'Incantesimi Disponibili'}
          </h3>

          {/* Trucchetti */}
          {cantrips.length > 0 && (
            <div className="mb-3">
              <div style={{ fontSize: '0.65rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', marginBottom: 6 }}>
                TRUCCHETTI ({cantrips.length}/{cantripLimit})
              </div>
              <div className="flex flex-wrap gap-1">
                {cantrips.map(s => (
                  <SpellChip key={s.id} spell={s} onRemove={removeSpell}
                    onTogglePrepared={() => {}} showPrepare={false} preparedLimit={0} preparedCount={0} />
                ))}
              </div>
            </div>
          )}

          {/* Incantesimi per livello */}
          {[1,2,3,4,5,6,7,8,9].filter(lv => lv <= maxSpellLv).map(lv => {
            const atLevel = nonCantripKnown.filter(s => s.level === lv);
            if (!isWizard && !isSpontaneous && atLevel.length === 0) return null; // prepared: mostra solo se ha qualcosa
            return (
              <div key={lv} className="mb-3">
                <div style={{ fontSize: '0.65rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', marginBottom: 4 }}>
                  LIVELLO {lv}
                </div>
                {atLevel.length === 0 ? (
                  <div style={{ color: '#3a3020', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    Nessun incantesimo di livello {lv}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {atLevel.map(s => (
                      <SpellChip key={s.id} spell={s} onRemove={removeSpell}
                        onTogglePrepared={togglePrepared}
                        showPrepare={isPrepared}
                        preparedLimit={preparedLimit}
                        preparedCount={preparedSpells.length} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {knownSpells.filter(s => s.level > 0).length === 0 && (
            <div style={{ color: '#3a3020', fontFamily: 'Crimson Text, serif', fontStyle: 'italic', padding: '8px 0' }}>
              Nessun incantesimo ancora. Aggiungi dalla lista qui sotto.
            </div>
          )}
        </section>
      )}

      {/* ── Tab preparati (solo Mago) ── */}
      {isWizard && activeTab === 'prepared' && (
        <section>
          <h3 className="mb-1">Incantesimi Preparati Oggi</h3>
          <p className="mb-3" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic' }}>
            Scegli fino a {preparedLimit} incantesimi dal tuo libro da preparare per oggi.
          </p>
          {nonCantripKnown.length === 0 ? (
            <div style={{ color: '#3a3020', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
              Aggiungi prima incantesimi al libro.
            </div>
          ) : (
            <div className="space-y-1">
              {nonCantripKnown.map(s => (
                <button key={s.id} onClick={() => togglePrepared(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 10px', textAlign: 'left', cursor: 'pointer',
                    border: `1px solid ${s.prepared ? '#c8922a' : '#5a4020'}`,
                    backgroundColor: s.prepared ? '#2a2010' : 'transparent',
                  }}>
                  <span style={{ color: s.prepared ? '#c8922a' : '#5a4020', fontSize: '0.8rem' }}>
                    {s.prepared ? '◆' : '◇'}
                  </span>
                  <span style={{ flex: 1, color: '#e8d5a3', fontFamily: 'Crimson Text, serif' }}>{s.name}</span>
                  <span style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem' }}>
                    Lv {s.level}
                  </span>
                  {!s.prepared && preparedSpells.length >= preparedLimit && (
                    <span style={{ color: '#8b2020', fontSize: '0.65rem', fontFamily: 'Cinzel, serif' }}>LIMITE</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Aggiungi dalla lista SRD ── */}
      {(!isWizard || activeTab === 'spellbook') && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ marginBottom: 0 }}>Aggiungi dalla lista SRD</h3>
            {isSpontaneous && nonCantripKnown.length >= spellsKnownLimit && (
              <span style={{ color: '#8b2020', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', border: '1px solid #8b2020', padding: '2px 6px' }}>
                Limite incantesimi raggiunto
              </span>
            )}
            {isWizard && nonCantripKnown.length >= spellbookCapacity && (
              <span style={{ color: '#8b2020', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', border: '1px solid #8b2020', padding: '2px 6px' }}>
                Libro pieno
              </span>
            )}
          </div>

          {loadError && (
            <div className="p-3 mb-3" style={{ backgroundColor: '#1a0a0a', border: '1px solid #8b2020', color: '#8b2020', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
              {loadError}
              <div className="mt-2">
                <button onClick={() => addCustomSpell()} style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '4px 12px', cursor: 'pointer', fontSize: '0.75rem' }}>
                  + Aggiungi incantesimo manualmente
                </button>
              </div>
            </div>
          )}

          {loadingSpells && (
            <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
              Caricamento incantesimi dalla SRD…
            </div>
          )}

          {!loadingSpells && !loadError && srdSpells.length > 0 && (
            <>
              <div className="flex gap-2 mb-3">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cerca per nome…"
                  style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', padding: '4px 0' }} />
                <select value={filterLevel}
                  onChange={e => setFilterLevel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  style={{ backgroundColor: '#2a2018', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', padding: '4px', cursor: 'pointer' }}>
                  <option value="all">Tutti i livelli</option>
                  <option value={0}>Trucchetti</option>
                  {Array.from({ length: maxSpellLv }, (_, i) => i + 1).map(l =>
                    <option key={l} value={l}>Livello {l}</option>
                  )}
                </select>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-0.5">
                {filteredSrd.map(spell => {
                  const isKnown = knownIds.has(spell.index);
                  const isCantrip = spell.level === 0;
                  const blockedCantrip = isCantrip && !isKnown && !canAddCantrip();
                  const blockedSpell = !isCantrip && !isKnown && !canAddToSpellbook();
                  const blocked = blockedCantrip || blockedSpell;

                  return (
                    <button key={spell.index} onClick={() => !blocked && toggleSpell(spell)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        width: '100%', padding: '6px 10px', textAlign: 'left',
                        border: `1px solid ${isKnown ? '#c8922a' : '#5a4020'}`,
                        backgroundColor: isKnown ? '#2a2010' : 'transparent',
                        cursor: blocked ? 'not-allowed' : 'pointer',
                        opacity: blocked ? 0.4 : 1,
                      }}>
                      <span style={{ color: isKnown ? '#c8922a' : '#5a4020', fontSize: '0.75rem' }}>
                        {isKnown ? '◆' : '◇'}
                      </span>
                      <span style={{ flex: 1, color: '#e8d5a3', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem' }}>
                        {spell.name}
                      </span>
                      <span style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', flexShrink: 0 }}>
                        {spell.level === 0 ? 'Trucchetto' : `Lv ${spell.level}`}
                      </span>
                      <span style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.75rem', flexShrink: 0 }}>
                        {spell.school}
                      </span>
                      <div className="flex gap-1">
                        {spell.concentration && badge('#5a7a9a', 'transparent', 'C')}
                        {spell.ritual && badge('#8a6a2a', 'transparent', 'R')}
                      </div>
                    </button>
                  );
                })}
                {filteredSrd.length === 0 && (
                  <div style={{ color: '#3a3020', fontFamily: 'Crimson Text, serif', fontStyle: 'italic', padding: '12px 0' }}>
                    Nessun incantesimo trovato.
                  </div>
                )}
              </div>
            </>
          )}

          <button onClick={addCustomSpell} className="mt-3"
            style={{ border: '1px dashed #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
            + Aggiungi incantesimo manuale / homebrew
          </button>
        </section>
      )}
    </div>
  );

  function addCustomSpell() {
    const spell: KnownSpell = {
      id: generateId(),
      name: 'Incantesimo Personalizzato',
      level: 1, prepared: isSpontaneous,
    };
    setKnownSpells([...knownSpells, spell]);
  }
}

// ─── Componente chip incantesimo ─────────────────────────────────────────────
function SpellChip({ spell, onRemove, onTogglePrepared, showPrepare, preparedLimit, preparedCount }: {
  spell: KnownSpell;
  onRemove: (id: string) => void;
  onTogglePrepared: (id: string) => void;
  showPrepare: boolean;
  preparedLimit: number;
  preparedCount: number;
}) {
  const canPrepare = spell.prepared || preparedCount < preparedLimit;
  return (
    <div className="flex items-center gap-2 p-2 mb-1"
      style={{ border: '1px solid #5a4020', backgroundColor: '#1e1810' }}>
      <span style={{ color: '#e8d5a3', fontFamily: 'Crimson Text, serif', flex: 1, fontSize: '0.9rem' }}>
        {spell.name}
      </span>
      <span style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', flexShrink: 0 }}>
        {spell.level === 0 ? 'Trucchetto' : `Lv ${spell.level}`}
        {spell.school && ` · ${spell.school}`}
      </span>
      <div className="flex gap-1">
        {spell.concentration && <span style={{ border: '1px solid #5a7a9a', color: '#5a7a9a', fontSize: '0.6rem', padding: '0 4px' }}>C</span>}
        {spell.ritual && <span style={{ border: '1px solid #8a6a2a', color: '#8a6a2a', fontSize: '0.6rem', padding: '0 4px' }}>R</span>}
      </div>
      {showPrepare && spell.level > 0 && (
        <button onClick={() => onTogglePrepared(spell.id)}
          disabled={!canPrepare}
          style={{
            border: `1px solid ${spell.prepared ? '#4a7c4e' : '#5a4020'}`,
            color: spell.prepared ? '#4a7c4e' : '#5a4020',
            backgroundColor: 'transparent', fontFamily: 'Cinzel, serif',
            padding: '1px 6px', cursor: canPrepare ? 'pointer' : 'not-allowed',
            fontSize: '0.65rem', opacity: canPrepare || spell.prepared ? 1 : 0.4,
          }}>
          {spell.prepared ? '✓ Preparato' : '○ Non prep.'}
        </button>
      )}
      <button onClick={() => onRemove(spell.id)}
        style={{ border: 'none', color: '#8b2020', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.9rem', padding: '0 2px', flexShrink: 0 }}>
        ✕
      </button>
    </div>
  );
}
