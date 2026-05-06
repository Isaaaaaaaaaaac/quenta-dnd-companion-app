'use client';

import { useState } from 'react';
import { saveCombatState } from '@/lib/db/actions';
import type { Character, CharacterSheet, CombatParticipant, CombatState } from '@/lib/db/schema';
import { abilityModifier, proficiencyBonus } from '@/lib/rules/calculations';

interface Props {
  campaignId: string;
  characters: Character[];
}

export default function CombatStartButton({ campaignId, characters }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initiatives, setInitiatives] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function toggleChar(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function rollInitiative(char: Character) {
    const sheet = char.sheet as CharacterSheet;
    const dexMod = abilityModifier(sheet.stats?.dex ?? 10);
    const initBonus = sheet.initiativeBonus ?? 0;
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + dexMod + initBonus;
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

    const state: CombatState = {
      active: true,
      round: 1,
      currentTurnIndex: 0,
      participants,
    };

    await saveCombatState(campaignId, state);
    setSaving(false);
    setOpen(false);
  }

  const selectedChars = characters.filter(c => selected.has(c.id));

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ border: '1px solid #8b2020', color: '#8b2020', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '6px 16px', cursor: 'pointer' }}>
        ⚔ Avvia Combat
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ backgroundColor: '#1a1410', border: '1px solid #5a4020', width: '90%', maxWidth: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #5a4020' }}>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1.1rem' }}>⚔ Setup Combat</div>
              <div className="flex gap-2">
                {selected.size > 0 && (
                  <button onClick={rollAll}
                    style={{ border: '1px solid #8a6010', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '4px 12px', cursor: 'pointer' }}>
                    🎲 Tira tutti PNG
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  style={{ border: '1px solid #5a4020', color: '#6a5040', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '4px 10px', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Character list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <p style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: 12 }}>
                Seleziona i partecipanti al combat. I PG richiedono inserimento manuale dell'iniziativa.
              </p>
              {characters.map(char => {
                const isSelected = selected.has(char.id);
                const sheet = char.sheet as CharacterSheet;
                const dexMod = abilityModifier(sheet.stats?.dex ?? 10);
                const initBonus = (sheet.initiativeBonus ?? 0) + dexMod;
                return (
                  <div key={char.id}
                    onClick={() => toggleChar(char.id)}
                    style={{
                      border: `1px solid ${isSelected ? '#c8922a' : '#3a3020'}`,
                      backgroundColor: isSelected ? '#2a2010' : '#221c14',
                      padding: '10px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>

                    {sheet.portraitUrl && (
                      <img src={sheet.portraitUrl} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Cinzel, serif', color: isSelected ? '#c8922a' : '#e8d5a3', fontSize: '0.9rem' }}>{char.name}</div>
                      <div style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontSize: '0.75rem' }}>
                        {char.type === 'pc' ? 'PG' : char.type === 'npc_major' ? 'PNG maggiore' : 'PNG minore'} · Lv {char.level} · Init bonus {initBonus >= 0 ? '+' : ''}{initBonus}
                      </div>
                    </div>

                    {isSelected && (
                      <div onClick={e => e.stopPropagation()} className="flex items-center gap-2">
                        <input
                          type="number"
                          value={initiatives[char.id] ?? ''}
                          onChange={e => setInitiatives(prev => ({ ...prev, [char.id]: e.target.value }))}
                          placeholder="Init"
                          style={{ width: 60, backgroundColor: '#1a1410', border: '1px solid #5a4020', color: '#e8d5a3', fontFamily: 'Cinzel, serif', fontSize: '1rem', padding: '4px 8px', textAlign: 'center', outline: 'none' }}
                        />
                        {char.type !== 'pc' && (
                          <button onClick={() => rollInitiative(char)}
                            style={{ border: '1px solid #5a4020', backgroundColor: '#2a2010', color: '#c8922a', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', padding: '4px 10px', cursor: 'pointer' }}>
                            🎲
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 flex items-center justify-between" style={{ borderTop: '1px solid #5a4020' }}>
              <div style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
                {selected.size} partecipant{selected.size === 1 ? 'e' : 'i'} selezionat{selected.size === 1 ? 'o' : 'i'}
              </div>
              <button onClick={startCombat}
                disabled={selected.size === 0 || saving}
                style={{
                  border: '1px solid #8b2020', color: '#1a1410',
                  backgroundColor: selected.size === 0 || saving ? '#5a4020' : '#8b2020',
                  fontFamily: 'Cinzel, serif', fontSize: '0.85rem',
                  padding: '8px 24px', cursor: selected.size === 0 || saving ? 'not-allowed' : 'pointer',
                }}>
                {saving ? 'Avvio…' : '⚔ Avvia Combat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
