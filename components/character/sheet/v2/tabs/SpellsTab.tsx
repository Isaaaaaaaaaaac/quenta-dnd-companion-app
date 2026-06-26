'use client';

import { startTransition, useState } from 'react';
import ListDetailPanel from '../ListDetailPanel';
import { useToast } from '../useToast';
import { useSpellSlot, restoreSpellSlot } from '@/lib/db/actions';
import { SRD_SPELLS, SCHOOLS_IT } from '@/lib/srd/spells';
import { innerBox } from '../styles';
import type { CharacterSpellSlot, KnownSpell } from '@/lib/db/schema';

export interface SpellsTabProps {
  characterId: string;
  activeSpellSlots: CharacterSpellSlot[];
  knownSpells: KnownSpell[];
  canCast: boolean;
}

interface SpellItem { id: string; known: KnownSpell; srd: typeof SRD_SPELLS[number] | undefined; }

export default function SpellsTab({ characterId, activeSpellSlots, knownSpells, canCast }: SpellsTabProps) {
  const { show } = useToast();
  const [filter, setFilter] = useState<'all' | 'prepared'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleSlotClick(slot: CharacterSpellSlot) {
    startTransition(async () => {
      if (slot.used >= slot.total) {
        for (let i = 0; i < slot.total; i++) await restoreSpellSlot(characterId, slot.slotLevel);
        show(`Slot livello ${slot.slotLevel} ripristinati`);
      } else {
        // eslint-disable-next-line react-hooks/rules-of-hooks -- useSpellSlot is a server action (lib/db/actions.ts), not a React hook; its name only happens to start with "use"
        await useSpellSlot(characterId, slot.slotLevel);
        show(`Slot livello ${slot.slotLevel} consumato`);
      }
    });
  }

  function handleResetAll() {
    startTransition(async () => {
      for (const slot of activeSpellSlots) {
        for (let i = 0; i < slot.used; i++) await restoreSpellSlot(characterId, slot.slotLevel);
      }
      show('Slot ripristinati');
    });
  }

  if (!canCast) {
    return (
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px', color: 'var(--fg-3)', textAlign: 'center', padding: '40px 0' }}>
        Nessun incantesimo disponibile
      </p>
    );
  }

  const filtered = filter === 'prepared' ? knownSpells.filter(sp => sp.prepared) : knownSpells;
  const preparedCount = knownSpells.filter(sp => sp.prepared).length;
  const items: SpellItem[] = filtered.map(known => ({
    id: known.id, known, srd: SRD_SPELLS.find(s => s.id === known.id),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>Slot Incantesimo</span>
          <button
            type="button"
            onClick={handleResetAll}
            style={{ fontSize: '8px', color: 'var(--fg-3)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          >
            Reset
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {activeSpellSlots.map(slot => {
            const remaining = slot.total - slot.used;
            const allUsed = remaining === 0;
            return (
              <div
                key={slot.slotLevel}
                data-testid={`slot-badge-${slot.slotLevel}`}
                role="button"
                tabIndex={0}
                onClick={() => handleSlotClick(slot)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSlotClick(slot); }}
                style={{
                  flex: 1, minWidth: 60, display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 8px',
                  borderRadius: 'var(--r-sm)', cursor: 'pointer',
                  background: allUsed ? 'rgba(168,51,28,.06)' : 'rgba(138,92,196,.06)',
                  border: `1px solid ${allUsed ? 'rgba(168,51,28,.25)' : 'rgba(138,92,196,.25)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--arcane)' }}>{slot.slotLevel}°</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: allUsed ? 'var(--danger)' : 'var(--fg-1)' }}>{remaining}/{slot.total}</span>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: slot.total }, (_, i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: 7, background: i < remaining ? 'var(--arcane)' : 'var(--border-leather-dim)' }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => setFilter('all')} style={{ fontSize: '9px', padding: '0 10px', height: 22, borderRadius: 'var(--r-sm)', border: `1px solid ${filter === 'all' ? 'var(--gold)' : 'var(--border-leather)'}`, color: filter === 'all' ? 'var(--gold)' : 'var(--fg-2)', background: 'none', cursor: 'pointer' }}>
          Tutti
        </button>
        <button onClick={() => setFilter('prepared')} style={{ fontSize: '9px', padding: '0 10px', height: 22, borderRadius: 'var(--r-sm)', border: `1px solid ${filter === 'prepared' ? 'var(--gold)' : 'var(--border-leather)'}`, color: filter === 'prepared' ? 'var(--gold)' : 'var(--fg-2)', background: 'none', cursor: 'pointer' }}>
          Preparati ({preparedCount})
        </button>
      </div>

      <ListDetailPanel
        items={items}
        selectedId={selectedId}
        onSelect={setSelectedId}
        emptyDetailText="Seleziona un incantesimo dalla lista per vederne i dettagli"
        renderListItem={(item) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px' }}>
            <span style={{ fontSize: '7px', fontWeight: 700, color: 'var(--arcane)', minWidth: 32 }}>
              {item.known.level === 0 ? 'Truc.' : `Lv ${item.known.level}`}
            </span>
            <span style={{ flex: 1, fontSize: '11px', color: item.known.prepared ? 'var(--fg-1)' : 'var(--fg-2)' }}>{item.known.name}</span>
            {item.known.concentration && <span style={{ fontSize: '7px', color: 'var(--info)' }}>C</span>}
          </div>
        )}
        renderDetail={(item) => {
          const srd = item.srd;
          return (
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', marginBottom: 4 }}>{item.known.name}</div>
              {srd && (
                <>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', marginBottom: 10 }}>
                    {SCHOOLS_IT[srd.school] ?? srd.school}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
                    <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Tempo di Lancio</div><div style={{ fontSize: '11px', color: 'var(--fg-1)' }}>{srd.castingTime}</div></div>
                    <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Gittata</div><div style={{ fontSize: '11px', color: 'var(--fg-1)' }}>{srd.range}</div></div>
                    <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Durata</div><div style={{ fontSize: '11px', color: 'var(--fg-1)' }}>{srd.duration}</div></div>
                    <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Componenti</div><div style={{ fontSize: '11px', color: 'var(--fg-1)' }}>{srd.components}</div></div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--fg-2)', lineHeight: 1.65 }}>{srd.description}</p>
                </>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
