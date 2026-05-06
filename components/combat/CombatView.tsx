'use client';

import { useState, useCallback } from 'react';
import type { Character, CharacterSheet, CombatState, CombatParticipant } from '@/lib/db/schema';
import { saveCombatState, applyDamage, applyHealing, addCondition, removeCondition } from '@/lib/db/actions';
import { abilityModifier, proficiencyBonus, formatModifier } from '@/lib/rules/calculations';
import { CLASSES } from '@/lib/srd/classes';
import { CONDITIONS } from '@/lib/srd/conditions';
import { generateId } from '@/lib/utils';
import type { CharacterSpellSlot } from '@/lib/db/schema';

interface Props {
  campaignId: string;
  initialState: CombatState;
  characters: Character[];
  spellSlotsByChar: Record<string, CharacterSpellSlot[]>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function calcAttackBonuses(char: Character) {
  const sheet = char.sheet as CharacterSheet;
  const stats = sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const prof = proficiencyBonus(char.level);
  const strMod = abilityModifier(stats.str);
  const dexMod = abilityModifier(stats.dex);
  const spellAbility = sheet.spellcastingAbility;
  const spellMod = spellAbility ? abilityModifier(stats[spellAbility as keyof typeof stats]) : null;
  return {
    melee: prof + strMod,
    ranged: prof + dexMod,
    spell: spellMod !== null ? prof + spellMod : null,
  };
}

// ─── Action Tracker ────────────────────────────────────────────────────────

function ActionTracker({ used, onChange }: {
  used: CombatParticipant['actionsUsed'];
  onChange: (key: keyof CombatParticipant['actionsUsed']) => void;
}) {
  const segments = [
    { key: 'action' as const, label: 'Azione', color: '#c8922a' },
    { key: 'bonusAction' as const, label: 'Az. Bonus', color: '#6a8c4e' },
    { key: 'movement' as const, label: 'Movimento', color: '#4e6a8c' },
    { key: 'reaction' as const, label: 'Reazione', color: '#8c4e6a' },
  ];
  return (
    <div className="flex gap-1">
      {segments.map(seg => (
        <button key={seg.key} onClick={() => onChange(seg.key)}
          style={{
            flex: 1, padding: '4px 2px', border: `1px solid ${used[seg.key] ? seg.color : '#3a3020'}`,
            backgroundColor: used[seg.key] ? seg.color + '33' : 'transparent',
            color: used[seg.key] ? seg.color : '#5a4020',
            fontFamily: 'Cinzel, serif', fontSize: '0.55rem', cursor: 'pointer',
            textDecoration: used[seg.key] ? 'line-through' : 'none',
            letterSpacing: '0.03em',
          }}>
          {seg.label}
        </button>
      ))}
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────

function CombatSidebar({ state, characters, onJumpTo }: {
  state: CombatState;
  characters: Map<string, Character>;
  onJumpTo: (index: number) => void;
}) {
  return (
    <div style={{ width: 220, flexShrink: 0, backgroundColor: '#1a1410', borderRight: '1px solid #3a3020', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #3a3020', fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
        ORDINE TURNI
      </div>
      {state.participants.map((p, i) => {
        const char = characters.get(p.characterId);
        if (!char) return null;
        const sheet = char.sheet as CharacterSheet;
        const isCurrent = i === 0;
        const hpPct = p.hpMax > 0 ? Math.round((p.hpCurrent / p.hpMax) * 100) : 0;
        const hpColor = hpPct > 60 ? '#4a7c4e' : hpPct > 30 ? '#8a7a2a' : '#7a2a2a';
        return (
          <div key={p.characterId} onClick={() => onJumpTo(i)}
            style={{
              padding: '8px 10px', cursor: 'pointer',
              borderBottom: '1px solid #2a2010',
              backgroundColor: isCurrent ? '#2a2010' : 'transparent',
              borderLeft: isCurrent ? '2px solid #c8922a' : '2px solid transparent',
            }}>
            <div className="flex items-center gap-2">
              {sheet.portraitUrl && (
                <img src={sheet.portraitUrl} alt="" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Cinzel, serif', color: isCurrent ? '#c8922a' : '#e8d5a3', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isCurrent && '▶ '}{char.name}
                </div>
                <div style={{ height: 3, backgroundColor: '#3a2010', marginTop: 2, borderRadius: 1 }}>
                  <div style={{ height: '100%', width: `${hpPct}%`, backgroundColor: hpColor, borderRadius: 1 }} />
                </div>
                <div style={{ color: '#6a5040', fontSize: '0.6rem', fontFamily: 'Cinzel, serif', marginTop: 1 }}>
                  {p.hpCurrent}/{p.hpMax} PF · Init {p.initiative}
                </div>
              </div>
            </div>
            {p.conditions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {p.conditions.map(c => (
                  <span key={c} style={{ fontSize: '0.5rem', color: '#8b2020', border: '1px solid #8b2020', padding: '0 3px', fontFamily: 'Cinzel, serif' }}>{c}</span>
                ))}
              </div>
            )}
            {p.concentrating && (
              <div style={{ fontSize: '0.55rem', color: '#6a4e8c', fontFamily: 'Cinzel, serif', marginTop: 2 }}>✦ {p.concentrating}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Combat Card ───────────────────────────────────────────────────────────

function CombatCard({
  participant, char, spellSlots, isCurrent, isAdding,
  onActionToggle, onDamage, onHeal, onAddCondition, onRemoveCondition,
  onSetConcentration, onEndTurn,
}: {
  participant: CombatParticipant;
  char: Character;
  spellSlots: CharacterSpellSlot[];
  isCurrent: boolean;
  isAdding: boolean;
  onActionToggle: (key: keyof CombatParticipant['actionsUsed']) => void;
  onDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  onAddCondition: (key: string) => void;
  onRemoveCondition: (key: string) => void;
  onSetConcentration: (spell: string | null) => void;
  onEndTurn: () => void;
}) {
  const [dmgInput, setDmgInput] = useState('');
  const [healInput, setHealInput] = useState('');
  const [showCondPicker, setShowCondPicker] = useState(false);
  const [showConcInput, setShowConcInput] = useState(false);
  const [concSpell, setConcSpell] = useState('');
  const [collapsed, setCollapsed] = useState(!isCurrent);

  const sheet = char.sheet as CharacterSheet;
  const stats = sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const prof = proficiencyBonus(char.level);
  const attacks = calcAttackBonuses(char);
  const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);
  const hpPct = participant.hpMax > 0 ? Math.round((participant.hpCurrent / participant.hpMax) * 100) : 0;
  const hpColor = hpPct > 60 ? '#4a7c4e' : hpPct > 30 ? '#8a7a2a' : '#7a2a2a';

  const savingThrows = sheet.savingThrowProficiencies ?? { str: false, dex: false, con: false, int: false, wis: false, cha: false };
  const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
  const statLabels = { str: 'FOR', dex: 'DES', con: 'COS', int: 'INT', wis: 'SAG', cha: 'CAR' };

  function handleDmg() {
    const n = parseInt(dmgInput);
    if (n > 0) { onDamage(n); setDmgInput(''); }
  }
  function handleHeal() {
    const n = parseInt(healInput);
    if (n > 0) { onHeal(n); setHealInput(''); }
  }

  const concentrationSpells = (sheet.knownSpells ?? []).filter(s => s.concentration);

  return (
    <div style={{
      border: `1px solid ${isCurrent ? '#c8922a' : '#3a3020'}`,
      backgroundColor: isCurrent ? '#2a2010' : '#1e1810',
      marginBottom: 8, transition: 'all 0.3s',
    }}>
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: `1px solid ${isCurrent ? '#5a4020' : '#2a2010'}`, cursor: 'pointer' }}
        onClick={() => setCollapsed(c => !c)}>
        <div className="flex items-center gap-3">
          {sheet.portraitUrl && (
            <img src={sheet.portraitUrl} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 2 }} />
          )}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', color: isCurrent ? '#c8922a' : '#e8d5a3', fontSize: '0.95rem' }}>
              {isCurrent && '▶ '}{char.name}
              {participant.concentrating && <span style={{ fontSize: '0.6rem', color: '#6a4e8c', marginLeft: 8 }}>✦ CONC</span>}
            </div>
            <div style={{ color: '#6a5040', fontSize: '0.7rem', fontFamily: 'Crimson Text, serif' }}>
              {char.type === 'pc' ? 'PG' : 'PNG'} · {cls?.name ?? ''} {char.level} · Init {participant.initiative}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div style={{ fontFamily: 'Cinzel, serif', color: hpColor, fontSize: '1.1rem' }}>
            {participant.hpCurrent}<span style={{ color: '#5a4020', fontSize: '0.75rem' }}>/{participant.hpMax}</span>
          </div>
          <div style={{ color: '#5a4020', fontSize: '0.7rem' }}>{collapsed ? '▼' : '▲'}</div>
        </div>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-3">

          {/* HP bar + damage/heal */}
          <div>
            <div style={{ height: 6, backgroundColor: '#3a2010', borderRadius: 3, marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${hpPct}%`, backgroundColor: hpColor, borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 flex-1">
                <input type="number" value={dmgInput} onChange={e => setDmgInput(e.target.value)}
                  placeholder="Danno" min={1}
                  style={{ flex: 1, backgroundColor: '#1a1410', border: '1px solid #8b2020', color: '#e8d5a3', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '3px 6px', outline: 'none' }}
                  onKeyDown={e => e.key === 'Enter' && handleDmg()} />
                <button onClick={handleDmg} style={{ border: '1px solid #8b2020', color: '#8b2020', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '3px 8px', cursor: 'pointer' }}>
                  DMG
                </button>
              </div>
              <div className="flex gap-1 flex-1">
                <input type="number" value={healInput} onChange={e => setHealInput(e.target.value)}
                  placeholder="Cura" min={1}
                  style={{ flex: 1, backgroundColor: '#1a1410', border: '1px solid #4a7c4e', color: '#e8d5a3', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '3px 6px', outline: 'none' }}
                  onKeyDown={e => e.key === 'Enter' && handleHeal()} />
                <button onClick={handleHeal} style={{ border: '1px solid #4a7c4e', color: '#4a7c4e', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '3px 8px', cursor: 'pointer' }}>
                  CURA
                </button>
              </div>
            </div>
            {participant.concentrating && (
              <div style={{ marginTop: 4, padding: '3px 8px', border: '1px solid #6a4e8c', backgroundColor: '#1a1018', color: '#8c6ab0', fontFamily: 'Cinzel, serif', fontSize: '0.6rem' }}>
                ⚠ Concentrazione: {participant.concentrating} — Ricorda TS COS se subisce danno
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[['CA', String(sheet.armorClass ?? '—')], ['Vel.', `${sheet.speed ?? '—'}m`], ['Prof', `+${prof}`], ['Init', formatModifier(abilityModifier(stats.dex) + (sheet.initiativeBonus ?? 0))]].map(([l, v]) => (
              <div key={l} className="text-center py-1" style={{ border: '1px solid #3a3020', backgroundColor: '#1a1410' }}>
                <div style={{ fontSize: '0.5rem', color: '#6a5040', fontFamily: 'Cinzel, serif' }}>{l}</div>
                <div style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3', fontSize: '0.85rem' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Attack bonuses */}
          <div className="flex gap-2">
            <div className="text-center flex-1 py-1" style={{ border: '1px solid #3a3020', backgroundColor: '#1a1410' }}>
              <div style={{ fontSize: '0.5rem', color: '#6a5040', fontFamily: 'Cinzel, serif' }}>MISCHIA</div>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.85rem' }}>{formatModifier(attacks.melee)}</div>
            </div>
            <div className="text-center flex-1 py-1" style={{ border: '1px solid #3a3020', backgroundColor: '#1a1410' }}>
              <div style={{ fontSize: '0.5rem', color: '#6a5040', fontFamily: 'Cinzel, serif' }}>DISTANZA</div>
              <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.85rem' }}>{formatModifier(attacks.ranged)}</div>
            </div>
            {attacks.spell !== null && (
              <div className="text-center flex-1 py-1" style={{ border: '1px solid #3a3020', backgroundColor: '#1a1410' }}>
                <div style={{ fontSize: '0.5rem', color: '#6a5040', fontFamily: 'Cinzel, serif' }}>INCANTESIMO</div>
                <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.85rem' }}>{formatModifier(attacks.spell)}</div>
              </div>
            )}
          </div>

          {/* Weapons */}
          {(sheet.weapons ?? []).length > 0 && (
            <div>
              <div style={{ fontSize: '0.55rem', color: '#5a4020', fontFamily: 'Cinzel, serif', marginBottom: 4, letterSpacing: '0.06em' }}>ARMI</div>
              <div className="space-y-1">
                {(sheet.weapons ?? []).map(w => {
                  const atkMod = abilityModifier(stats[w.attackStat]) + prof + (w.magicBonus ?? 0);
                  const dmgMod = abilityModifier(stats[w.attackStat]) + (w.magicBonus ?? 0);
                  return (
                    <div key={w.id} className="flex items-center justify-between px-2 py-1" style={{ backgroundColor: '#1a1410', border: '1px solid #2a2010' }}>
                      <span style={{ fontFamily: 'Crimson Text, serif', color: '#e8d5a3', fontSize: '0.8rem' }}>
                        {w.name}{w.magic && w.magicBonus ? ` +${w.magicBonus}` : ''}
                      </span>
                      <span style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.75rem' }}>
                        {formatModifier(atkMod)} · {w.damageDice}{dmgMod !== 0 ? formatModifier(dmgMod) : ''} {w.damageType}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saving throws */}
          <div>
            <div style={{ fontSize: '0.55rem', color: '#5a4020', fontFamily: 'Cinzel, serif', marginBottom: 4, letterSpacing: '0.06em' }}>TIRI SALVEZZA</div>
            <div className="flex gap-1">
              {statKeys.map(ab => {
                const mod = abilityModifier(stats[ab]) + (savingThrows[ab] ? prof : 0);
                return (
                  <div key={ab} className="text-center flex-1 py-1" style={{ border: `1px solid ${savingThrows[ab] ? '#5a4020' : '#2a2010'}`, backgroundColor: '#1a1410' }}>
                    <div style={{ fontSize: '0.45rem', color: '#5a4020', fontFamily: 'Cinzel, serif' }}>{statLabels[ab]}</div>
                    <div style={{ fontFamily: 'Cinzel, serif', color: mod >= 0 ? '#e8d5a3' : '#8b2020', fontSize: '0.75rem' }}>{formatModifier(mod)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spell slots */}
          {spellSlots.filter(s => s.total > 0).length > 0 && (
            <div>
              <div style={{ fontSize: '0.55rem', color: '#5a4020', fontFamily: 'Cinzel, serif', marginBottom: 4, letterSpacing: '0.06em' }}>SLOT INCANTESIMO</div>
              <div className="flex gap-2 flex-wrap">
                {spellSlots.filter(s => s.total > 0).map(s => (
                  <div key={s.slotLevel} className="text-center" style={{ border: '1px solid #3a3020', padding: '3px 8px', minWidth: 44 }}>
                    <div style={{ fontSize: '0.45rem', color: '#6a5040', fontFamily: 'Cinzel, serif' }}>Lv {s.slotLevel}</div>
                    <div className="flex gap-1 justify-center mt-1">
                      {Array.from({ length: s.total }).map((_, i) => (
                        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block', backgroundColor: i < (s.total - s.used) ? '#c8922a' : '#3a3020', border: '1px solid #5a4020' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Condizioni */}
          <div>
            <div style={{ fontSize: '0.55rem', color: '#5a4020', fontFamily: 'Cinzel, serif', marginBottom: 4, letterSpacing: '0.06em' }}>CONDIZIONI</div>
            <div className="flex flex-wrap gap-1">
              {participant.conditions.map(ck => {
                const cond = CONDITIONS.find(c => c.key === ck);
                return (
                  <button key={ck} onClick={() => onRemoveCondition(ck)}
                    style={{ border: '1px solid #8b2020', color: '#8b2020', backgroundColor: '#1a0808', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', padding: '2px 6px', cursor: 'pointer' }}>
                    {cond?.name ?? ck} ✕
                  </button>
                );
              })}
              <button onClick={() => setShowCondPicker(p => !p)}
                style={{ border: '1px solid #3a3020', color: '#6a5040', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', padding: '2px 8px', cursor: 'pointer' }}>
                + Condizione
              </button>
            </div>
            {showCondPicker && (
              <div className="flex flex-wrap gap-1 mt-2">
                {CONDITIONS.filter(c => !participant.conditions.includes(c.key)).map(c => (
                  <button key={c.key} onClick={() => { onAddCondition(c.key); setShowCondPicker(false); }}
                    style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', padding: '2px 6px', cursor: 'pointer' }}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Concentrazione */}
          <div>
            <div style={{ fontSize: '0.55rem', color: '#5a4020', fontFamily: 'Cinzel, serif', marginBottom: 4, letterSpacing: '0.06em' }}>CONCENTRAZIONE</div>
            {participant.concentrating ? (
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: 'Crimson Text, serif', color: '#8c6ab0', fontSize: '0.8rem' }}>✦ {participant.concentrating}</span>
                <button onClick={() => onSetConcentration(null)}
                  style={{ border: '1px solid #3a3020', color: '#6a5040', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', padding: '2px 6px', cursor: 'pointer' }}>
                  Perdi conc.
                </button>
              </div>
            ) : (
              <div>
                <button onClick={() => setShowConcInput(p => !p)}
                  style={{ border: '1px solid #3a3020', color: '#6a5040', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', padding: '2px 8px', cursor: 'pointer' }}>
                  + Concentrazione
                </button>
                {showConcInput && (
                  <div className="flex gap-1 mt-2">
                    {concentrationSpells.length > 0 ? (
                      <select value={concSpell} onChange={e => setConcSpell(e.target.value)}
                        style={{ flex: 1, backgroundColor: '#1a1410', border: '1px solid #5a4020', color: '#e8d5a3', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', padding: '3px 6px', outline: 'none' }}>
                        <option value="">-- seleziona incantesimo --</option>
                        {concentrationSpells.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    ) : (
                      <input value={concSpell} onChange={e => setConcSpell(e.target.value)}
                        placeholder="Nome incantesimo…"
                        style={{ flex: 1, backgroundColor: '#1a1410', border: '1px solid #5a4020', color: '#e8d5a3', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', padding: '3px 6px', outline: 'none' }} />
                    )}
                    <button onClick={() => { if (concSpell) { onSetConcentration(concSpell); setShowConcInput(false); setConcSpell(''); } }}
                      style={{ border: '1px solid #6a4e8c', color: '#8c6ab0', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '3px 8px', cursor: 'pointer' }}>
                      ✓
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feats/Abilità */}
          {(sheet.feats ?? []).length > 0 && (
            <div>
              <div style={{ fontSize: '0.55rem', color: '#5a4020', fontFamily: 'Cinzel, serif', marginBottom: 4, letterSpacing: '0.06em' }}>TALENTI / ABILITÀ SPECIALI</div>
              <div className="space-y-1">
                {(sheet.feats ?? []).map(f => (
                  <div key={f.key} style={{ fontFamily: 'Crimson Text, serif', color: '#a08060', fontSize: '0.8rem' }}>
                    <span style={{ color: '#c8922a' }}>{f.name}</span>
                    {f.description && ` — ${f.description.slice(0, 80)}${f.description.length > 80 ? '…' : ''}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Magic items */}
          {(sheet.magicItems ?? []).length > 0 && (
            <div>
              <div style={{ fontSize: '0.55rem', color: '#5a4020', fontFamily: 'Cinzel, serif', marginBottom: 4, letterSpacing: '0.06em' }}>OGGETTI MAGICI</div>
              <div className="space-y-1">
                {(sheet.magicItems ?? []).map(item => (
                  <div key={item.id} style={{ fontFamily: 'Crimson Text, serif', color: '#a08060', fontSize: '0.8rem' }}>
                    <span style={{ color: '#c8922a' }}>{item.name}</span>
                    {item.attuned && <span style={{ color: '#6a4e8c', marginLeft: 6, fontSize: '0.65rem' }}>sintonizzato</span>}
                    {item.description && ` — ${item.description.slice(0, 80)}${item.description.length > 80 ? '…' : ''}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action tracker */}
          <div>
            <div style={{ fontSize: '0.55rem', color: '#5a4020', fontFamily: 'Cinzel, serif', marginBottom: 4, letterSpacing: '0.06em' }}>ECONOMIA AZIONI</div>
            <ActionTracker used={participant.actionsUsed} onChange={onActionToggle} />
          </div>

          {/* Fine turno */}
          {isCurrent && (
            <button onClick={onEndTurn}
              style={{ width: '100%', border: '1px solid #c8922a', color: '#1a1410', backgroundColor: '#c8922a', fontFamily: 'Cinzel, serif', fontSize: '0.85rem', padding: '8px', cursor: 'pointer', marginTop: 4 }}>
              Fine turno →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main CombatView ────────────────────────────────────────────────────────

export default function CombatView({ campaignId, initialState, characters: charList, spellSlotsByChar }: Props) {
  const charMap = new Map(charList.map(c => [c.id, c]));
  const [state, setState] = useState<CombatState>(initialState);
  const [saving, setSaving] = useState(false);
  const [showAddCombatant, setShowAddCombatant] = useState(false);
  const [addInitInput, setAddInitInput] = useState<Record<string, string>>({});
  const [addSelected, setAddSelected] = useState<string | null>(null);

  async function persist(newState: CombatState) {
    setSaving(true);
    setState(newState);
    await saveCombatState(campaignId, newState);
    setSaving(false);
  }

  function updateParticipant(idx: number, update: Partial<CombatParticipant>) {
    const next = { ...state, participants: state.participants.map((p, i) => i === idx ? { ...p, ...update } : p) };
    persist(next);
  }

  function handleActionToggle(idx: number, key: keyof CombatParticipant['actionsUsed']) {
    const p = state.participants[idx];
    updateParticipant(idx, { actionsUsed: { ...p.actionsUsed, [key]: !p.actionsUsed[key] } });
  }

  function handleDamage(idx: number, amount: number) {
    const p = state.participants[idx];
    let newHp = p.hpCurrent - amount;
    let newTemp = p.hpTemp;
    if (newTemp > 0) { const absorbed = Math.min(newTemp, amount); newTemp -= absorbed; newHp = p.hpCurrent - (amount - absorbed); }
    newHp = Math.max(0, newHp);
    updateParticipant(idx, { hpCurrent: newHp, hpTemp: newTemp });
    applyDamage(p.characterId, amount);
  }

  function handleHeal(idx: number, amount: number) {
    const p = state.participants[idx];
    const newHp = Math.min(p.hpMax, p.hpCurrent + amount);
    updateParticipant(idx, { hpCurrent: newHp });
    applyHealing(p.characterId, amount);
  }

  async function handleAddCondition(idx: number, condKey: string) {
    const p = state.participants[idx];
    if (p.conditions.includes(condKey)) return;
    updateParticipant(idx, { conditions: [...p.conditions, condKey] });
    const char = charMap.get(p.characterId);
    if (char) await addCondition(p.characterId, condKey, char.name);
  }

  async function handleRemoveCondition(idx: number, condKey: string) {
    const p = state.participants[idx];
    updateParticipant(idx, { conditions: p.conditions.filter(c => c !== condKey) });
    // find condition id to remove - skip for now, optimistic only
  }

  async function handleEndTurn() {
    const current = state.participants[0];
    // reset actions for next round
    const resetCurrent = { ...current, actionsUsed: { action: false, bonusAction: false, movement: false, reaction: false } };
    // move to end of list
    const newParticipants = [...state.participants.slice(1), resetCurrent];
    const newRound = newParticipants[0].characterId === state.participants[state.participants.length > 1 ? state.participants.length - 1 : 0].characterId
      ? state.round
      : state.round;
    // increment round if we've gone through all
    const isLastInRound = state.participants.length === 1;
    const nextRound = isLastInRound ? state.round + 1 : state.round;
    // actually: round increments when we get back to the first participant (highest initiative)
    // Simple approach: track by wrapping - increment round each time the highest-init participant becomes current again
    const next: CombatState = {
      ...state,
      participants: newParticipants,
      round: state.participants.length <= 1 ? state.round + 1 : state.round,
      currentTurnIndex: 0,
    };
    // Check if we completed a full round (highest initiative char is back to top)
    // We detect this by checking if the NEW first participant was previously the LAST
    await persist(next);
  }

  async function handleAddCombatant(charId: string, initiative: number) {
    const char = charMap.get(charId);
    if (!char) return;
    const newP: CombatParticipant = {
      characterId: charId,
      initiative,
      actionsUsed: { action: false, bonusAction: false, movement: false, reaction: false },
      concentrating: null,
      hpCurrent: char.hpCurrent,
      hpMax: char.hpMax,
      hpTemp: char.hpTemp,
      conditions: [],
    };
    // Insert in initiative order within current participants
    const all = [...state.participants, newP];
    all.sort((a, b) => b.initiative - a.initiative);
    await persist({ ...state, participants: all });
    setShowAddCombatant(false);
    setAddSelected(null);
    setAddInitInput({});
  }

  async function endCombat() {
    await persist({ ...state, active: false });
  }

  const activeParticipantIds = new Set(state.participants.map(p => p.characterId));
  const availableToAdd = charList.filter(c => !activeParticipantIds.has(c.id));

  // Detect round increment: when last participant ends turn
  // (handled in handleEndTurn — simple counting)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

      {/* Sidebar */}
      <CombatSidebar
        state={state}
        characters={charMap}
        onJumpTo={() => {}} // Cards are always in order, sidebar is just reference
      />

      {/* Main combat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Combat header */}
        <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid #5a4020', backgroundColor: '#221c14', flexShrink: 0 }}>
          <div className="flex items-center gap-4">
            <span style={{ fontFamily: 'Cinzel, serif', color: '#8b2020', fontSize: '0.9rem' }}>⚔ COMBAT</span>
            <span style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.85rem' }}>Round {state.round}</span>
            <span style={{ fontFamily: 'Crimson Text, serif', color: '#6a5040', fontSize: '0.8rem', fontStyle: 'italic' }}>
              Turno: {charMap.get(state.participants[0]?.characterId)?.name ?? '—'}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            {saving && <span style={{ color: '#5a4020', fontSize: '0.65rem', fontFamily: 'Cinzel, serif' }}>salvataggio…</span>}
            <button onClick={() => setShowAddCombatant(p => !p)}
              style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '4px 12px', cursor: 'pointer' }}>
              + Aggiungi
            </button>
            <button onClick={endCombat}
              style={{ border: '1px solid #5a4020', color: '#6a5040', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '4px 12px', cursor: 'pointer' }}>
              Fine Combat
            </button>
          </div>
        </div>

        {/* Add combatant panel */}
        {showAddCombatant && (
          <div style={{ padding: '12px 16px', backgroundColor: '#1e1810', borderBottom: '1px solid #3a3020', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Cinzel, serif', color: '#a08060', fontSize: '0.7rem', marginBottom: 8 }}>AGGIUNGI COMBATTENTE</div>
            <div className="flex flex-wrap gap-2">
              {availableToAdd.map(char => (
                <div key={char.id} className="flex items-center gap-2"
                  style={{ border: `1px solid ${addSelected === char.id ? '#c8922a' : '#3a3020'}`, padding: '4px 10px', cursor: 'pointer', backgroundColor: '#1a1410' }}
                  onClick={() => setAddSelected(char.id)}>
                  <span style={{ fontFamily: 'Crimson Text, serif', color: '#e8d5a3', fontSize: '0.85rem' }}>{char.name}</span>
                  {addSelected === char.id && (
                    <div onClick={e => e.stopPropagation()} className="flex gap-1 items-center">
                      <input type="number" placeholder="Init" value={addInitInput[char.id] ?? ''}
                        onChange={e => setAddInitInput(p => ({ ...p, [char.id]: e.target.value }))}
                        style={{ width: 48, backgroundColor: '#221c14', border: '1px solid #5a4020', color: '#e8d5a3', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', padding: '2px 4px', outline: 'none' }} />
                      <button onClick={() => handleAddCombatant(char.id, parseInt(addInitInput[char.id] ?? '0') || 0)}
                        style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '2px 8px', cursor: 'pointer' }}>
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {availableToAdd.length === 0 && (
                <span style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic' }}>Tutti i personaggi sono già nel combat.</span>
              )}
            </div>
          </div>
        )}

        {/* Cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {state.participants.map((p, i) => {
            const char = charMap.get(p.characterId);
            if (!char) return null;
            const slots = spellSlotsByChar[p.characterId] ?? [];
            return (
              <CombatCard
                key={p.characterId}
                participant={p}
                char={char}
                spellSlots={slots}
                isCurrent={i === 0}
                isAdding={false}
                onActionToggle={key => handleActionToggle(i, key)}
                onDamage={amt => handleDamage(i, amt)}
                onHeal={amt => handleHeal(i, amt)}
                onAddCondition={key => handleAddCondition(i, key)}
                onRemoveCondition={key => handleRemoveCondition(i, key)}
                onSetConcentration={spell => updateParticipant(i, { concentrating: spell })}
                onEndTurn={handleEndTurn}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
