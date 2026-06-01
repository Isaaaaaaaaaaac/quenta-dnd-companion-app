'use client';

import { useState } from 'react';
import { saveCombatState } from '@/lib/db/actions';
import type { Character, CharacterSheet, CombatParticipant, CombatState } from '@/lib/db/schema';
import { abilityModifier } from '@/lib/rules/calculations';

interface Props { campaignId: string; characters: Character[]; }

export default function CombatStartButton({ campaignId, characters }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initiatives, setInitiatives] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function toggleChar(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function rollInitiative(char: Character) {
    const sheet = char.sheet as CharacterSheet;
    const dexMod = abilityModifier(sheet.stats?.dex ?? 10);
    const total = Math.floor(Math.random() * 20) + 1 + dexMod + (sheet.initiativeBonus ?? 0);
    setInitiatives(prev => ({ ...prev, [char.id]: String(total) }));
  }

  function rollAll() {
    for (const id of selected) {
      const char = characters.find(c => c.id === id);
      if (char && char.type !== 'pc') rollInitiative(char);
    }
  }

  async function startCombat() {
    setSaving(true);
    const participants: CombatParticipant[] = Array.from(selected)
      .map(id => {
        const char = characters.find(c => c.id === id)!;
        return {
          characterId: id,
          initiative: parseInt(initiatives[id] ?? '0') || 0,
          actionsUsed: { action: false, bonusAction: false, movement: false, reaction: false },
          concentrating: null,
          hpCurrent: char.hpCurrent,
          hpMax: char.hpMax,
          hpTemp: char.hpTemp,
          conditions: [],
        };
      })
      .sort((a, b) => b.initiative - a.initiative);

    await saveCombatState(campaignId, { active: true, round: 1, currentTurnIndex: 0, participants });
    setSaving(false);
    setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary" style={{ padding: '7px 16px', borderColor: 'var(--danger)', backgroundColor: 'var(--danger)' }}>
        ⚔ Combat
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)' }}>
          <div className="card" style={{ width: '90%', maxWidth: 680, maxHeight: '85vh', display: 'flex', flexDirection: 'column', borderColor: 'var(--danger)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border-leather)' }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 4, color: 'var(--fg-1)' }}>Combattimento</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--fg-1)' }}>Setup Combat</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {selected.size > 0 && (
                  <button onClick={rollAll} className="btn btn-ghost" style={{ padding: '5px 12px' }}>🎲 Tira PNG</button>
                )}
                <button onClick={() => setOpen(false)} style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--fg-3)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
              </div>
            </div>

            {/* Char list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: 16 }}>
                Seleziona i partecipanti. I PG richiedono inserimento manuale dell'iniziativa.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {characters.map(char => {
                  const isSelected = selected.has(char.id);
                  const sheet = char.sheet as CharacterSheet;
                  const dexMod = abilityModifier(sheet.stats?.dex ?? 10);
                  const initBonus = (sheet.initiativeBonus ?? 0) + dexMod;
                  return (
                    <div key={char.id} onClick={() => toggleChar(char.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '12px 16px', cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(139,26,26,0.08)' : 'var(--bg-card)',
                      border: `1px solid ${isSelected ? 'var(--danger)' : 'var(--border-leather)'}`,
                      transition: 'border-color 0.2s ease',
                    }}>
                      {sheet.portraitUrl && (
                        <img src={sheet.portraitUrl} alt="" style={{ width: 36, height: 36, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-leather)' }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--fg-1)' : 'var(--fg-1)', marginBottom: 2 }}>{char.name}</div>
                        <div style={{ fontFamily: 'var(--font-label)', fontSize: '7.5px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
                          {char.type === 'pc' ? 'PG' : char.type === 'npc_major' ? 'PNG maggiore' : 'PNG minore'} · Lv {char.level} · Init {initBonus >= 0 ? '+' : ''}{initBonus}
                        </div>
                      </div>
                      {isSelected && (
                        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="number"
                            value={initiatives[char.id] ?? ''}
                            onChange={e => setInitiatives(prev => ({ ...prev, [char.id]: e.target.value }))}
                            placeholder="Init"
                            style={{ width: 56, backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-leather)', color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: '1rem', padding: '4px 8px', textAlign: 'center', outline: 'none' }}
                          />
                          {char.type !== 'pc' && (
                            <button onClick={() => rollInitiative(char)} className="btn btn-ghost" style={{ padding: '4px 10px' }}>🎲</button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderTop: '1px solid var(--border-leather)' }}>
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                {selected.size} partecipant{selected.size === 1 ? 'e' : 'i'} selezionat{selected.size === 1 ? 'o' : 'i'}
              </span>
              <button onClick={startCombat} disabled={selected.size === 0 || saving} className="btn btn-primary"
                style={{ borderColor: 'var(--danger)', backgroundColor: selected.size === 0 || saving ? 'var(--bg-elevated)' : 'var(--danger)' }}>
                {saving ? 'Avvio…' : '⚔ Avvia Combat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
