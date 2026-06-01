'use client';

import { useState } from 'react';
import type { KnownSpell, CharacterSpellSlot } from '@/lib/db/schema';

interface Props {
  knownSpells: KnownSpell[];
  activeSpellSlots: CharacterSpellSlot[];
  isPreparedCaster: boolean;
  schoolAbbr: Record<string, string>;
}

const LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

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

export default function SpellSectionTabs({ knownSpells, activeSpellSlots, isPreparedCaster, schoolAbbr }: Props) {
  const [tab, setTab] = useState<'all' | 'prepared'>('all');

  const displaySpells = tab === 'prepared'
    ? knownSpells.filter(s => s.level === 0 || s.prepared) // cantrip sempre visibili
    : knownSpells;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em',
    padding: '0 10px', height: 24, borderRadius: 'var(--r)', cursor: 'pointer',
    border: active ? '1px solid var(--border-leather)' : '1px solid transparent',
    background: active ? 'var(--bg-card)' : 'none',
    color: active ? 'var(--fg-1)' : 'var(--fg-2)',
    transition: 'all .2s',
  });

  return (
    <>
      {/* Slot per livello */}
      {activeSpellSlots.map((slot, i) => {
        const available = slot.total - slot.used;
        return (
          <div key={slot.slotLevel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: i < activeSpellSlots.length - 1 ? 6 : 0 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em', color: 'var(--fg-2)' }}>Livello {slot.slotLevel}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: slot.total }).map((_, idx) => (
                <div key={idx} style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid rgba(91,33,182,.5)', backgroundColor: idx < available ? 'var(--arcane)' : 'transparent' }} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Tabs (solo per prepared casters) */}
      {knownSpells.length > 0 && (
        <>
          {activeSpellSlots.length > 0 && (
            <div style={{ height: '.5px', background: 'linear-gradient(to right, transparent, rgba(184,134,11,.35), transparent)', margin: '8px 0' }} />
          )}

          {isPreparedCaster && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
              <button style={tabStyle(tab === 'all')} onClick={() => setTab('all')}>Tutti</button>
              <button style={tabStyle(tab === 'prepared')} onClick={() => setTab('prepared')}>
                Preparati ({knownSpells.filter(s => s.level === 0 || s.prepared).length})
              </button>
            </div>
          )}

          {displaySpells.length === 0 && (
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)', padding: '4px 0' }}>
              Nessun incantesimo preparato.
            </p>
          )}

          {displaySpells.map(spell => (
            <div key={spell.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', padding: '4px var(--sp-1)', borderRadius: 'var(--r)' }}>
              <LevelPips level={spell.level} />
              <span style={{ flex: 1, fontSize: '12px', color: spell.prepared || spell.level === 0 ? 'var(--fg-1)' : 'var(--fg-2)' }}>
                {spell.name}
              </span>
              {spell.concentration && <span style={{ fontSize: '8px', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--info)', flexShrink: 0 }}>C</span>}
              {spell.school && (
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, color: 'var(--arcane)', opacity: 0.8, letterSpacing: '.04em', flexShrink: 0 }}>
                  {schoolAbbr[spell.school] ?? spell.school}
                </span>
              )}
            </div>
          ))}
        </>
      )}
    </>
  );
}
