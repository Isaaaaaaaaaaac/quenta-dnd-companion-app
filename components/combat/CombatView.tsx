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

function calcAttackBonuses(char: Character) {
  const sheet = char.sheet as CharacterSheet;
  const stats = sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const prof = proficiencyBonus(char.level);
  const strMod = abilityModifier(stats.str);
  const dexMod = abilityModifier(stats.dex);
  const spellAbility = sheet.spellcastingAbility;
  const spellMod = spellAbility ? abilityModifier(stats[spellAbility as keyof typeof stats]) : null;
  return { melee: prof + strMod, ranged: prof + dexMod, spell: spellMod !== null ? prof + spellMod : null };
}

// ─── Action Tracker ────────────────────────────────────────────────────────

function ActionTracker({ used, onChange }: {
  used: CombatParticipant['actionsUsed'];
  onChange: (key: keyof CombatParticipant['actionsUsed']) => void;
}) {
  const segments = [
    { key: 'action' as const,      label: 'Azione',    color: 'var(--gold)' },
    { key: 'bonusAction' as const, label: 'Az. Bonus', color: 'var(--info)' },
    { key: 'movement' as const,    label: 'Movimento', color: 'var(--info)' },
    { key: 'reaction' as const,    label: 'Reazione',  color: 'var(--arcane)' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {segments.map(seg => (
        <button key={seg.key} onClick={() => onChange(seg.key)} style={{
          flex: 1, padding: '4px 2px',
          border: `1px solid ${used[seg.key] ? seg.color : 'var(--border-leather)'}`,
          backgroundColor: used[seg.key] ? seg.color + '22' : 'transparent',
          color: used[seg.key] ? seg.color : 'var(--fg-3)',
          fontFamily: 'var(--font-label)', fontSize: '7px', letterSpacing: '0.2em',
          textTransform: 'uppercase', cursor: 'pointer',
          textDecoration: used[seg.key] ? 'line-through' : 'none',
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
    <div style={{ width: 220, flexShrink: 0, backgroundColor: 'var(--bg-deep)', borderRight: '1px solid var(--border-leather)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-leather)' }}>
        <div className="label">Ordine Turni</div>
      </div>
      {state.participants.map((p, i) => {
        const char = characters.get(p.characterId);
        if (!char) return null;
        const sheet = char.sheet as CharacterSheet;
        const isCurrent = i === 0;
        const hpPct = p.hpMax > 0 ? Math.round((p.hpCurrent / p.hpMax) * 100) : 0;
        const hpColor = hpPct > 60 ? 'var(--info)' : hpPct > 30 ? 'var(--gold)' : 'var(--danger)';
        return (
          <div key={p.characterId} onClick={() => onJumpTo(i)} style={{
            padding: '10px 12px', cursor: 'pointer',
            borderBottom: '1px solid var(--border-leather)',
            backgroundColor: isCurrent ? 'rgba(184,134,11,0.08)' : 'transparent',
            borderLeft: `2px solid ${isCurrent ? 'var(--gold)' : 'transparent'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {sheet.portraitUrl && (
                <img src={sheet.portraitUrl} alt="" style={{ width: 28, height: 28, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-leather)' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: isCurrent ? 'var(--gold)' : 'var(--fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                  {isCurrent && '▶ '}{char.name}
                </div>
                <div className="hp-bar-track">
                  <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor, boxShadow: 'none' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-label)', fontSize: '7px', letterSpacing: '0.2em', color: 'var(--fg-3)', marginTop: 3 }}>
                  {p.hpCurrent}/{p.hpMax} PF · Init {p.initiative}
                </div>
              </div>
            </div>
            {p.conditions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {p.conditions.map(c => (
                  <span key={c} className="badge badge-danger" style={{ fontSize: '6.5px' }}>{c}</span>
                ))}
              </div>
            )}
            {p.concentrating && (
              <div style={{ fontFamily: 'var(--font-label)', fontSize: '7px', color: 'var(--fg-1)', marginTop: 4 }}>✦ {p.concentrating}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Combat Card ───────────────────────────────────────────────────────────

function CombatCard({
  participant, char, spellSlots, isCurrent,
  onActionToggle, onDamage, onHeal, onAddCondition, onRemoveCondition,
  onSetConcentration, onEndTurn,
}: {
  participant: CombatParticipant; char: Character; spellSlots: CharacterSpellSlot[];
  isCurrent: boolean; isAdding: boolean;
  onActionToggle: (key: keyof CombatParticipant['actionsUsed']) => void;
  onDamage: (amount: number) => void; onHeal: (amount: number) => void;
  onAddCondition: (key: string) => void; onRemoveCondition: (key: string) => void;
  onSetConcentration: (spell: string | null) => void; onEndTurn: () => void;
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
  const hpColor = hpPct > 60 ? 'var(--info)' : hpPct > 30 ? 'var(--gold)' : 'var(--danger)';
  const savingThrows = sheet.savingThrowProficiencies ?? { str: false, dex: false, con: false, int: false, wis: false, cha: false };
  const statKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
  const statLabels = { str: 'FOR', dex: 'DES', con: 'COS', int: 'INT', wis: 'SAG', cha: 'CAR' };
  const concentrationSpells = (sheet.knownSpells ?? []).filter(s => s.concentration);

  function handleDmg() { const n = parseInt(dmgInput); if (n > 0) { onDamage(n); setDmgInput(''); } }
  function handleHeal() { const n = parseInt(healInput); if (n > 0) { onHeal(n); setHealInput(''); } }

  const inpStyle: React.CSSProperties = {
    flex: 1, backgroundColor: 'var(--bg-deep)',
    border: '1px solid var(--border-leather)', color: 'var(--fg-1)',
    fontFamily: 'var(--font-body)', fontSize: '0.8rem', padding: '4px 8px', outline: 'none',
  };

  return (
    <div style={{ border: `1px solid ${isCurrent ? 'var(--gold)' : 'var(--border-leather)'}`, backgroundColor: isCurrent ? 'rgba(184,134,11,0.05)' : 'var(--bg-deep)', marginBottom: 8, transition: 'border-color 0.2s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${isCurrent ? 'var(--border-leather)' : 'var(--border-leather)'}`, cursor: 'pointer' }}
        onClick={() => setCollapsed(c => !c)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {sheet.portraitUrl && (
            <img src={sheet.portraitUrl} alt="" style={{ width: 32, height: 32, objectFit: 'cover', border: '1px solid var(--border-leather)', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: isCurrent ? 'var(--gold)' : 'var(--fg-1)', marginBottom: 2 }}>
              {isCurrent && '▶ '}{char.name}
              {participant.concentrating && <span style={{ fontFamily: 'var(--font-label)', fontSize: '7px', color: 'var(--fg-1)', marginLeft: 10, letterSpacing: '0.3em' }}>✦ CONC</span>}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.78rem', fontStyle: 'italic' }}>
              {char.type === 'pc' ? 'PG' : 'PNG'} · {cls?.name ?? ''} {char.level} · Init {participant.initiative}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: hpColor, fontSize: '1.1rem' }}>
            {participant.hpCurrent}<span style={{ color: 'var(--fg-3)', fontSize: '0.75rem', fontWeight: 400 }}>/{participant.hpMax}</span>
          </div>
          <div style={{ color: 'var(--fg-3)', fontSize: '0.7rem' }}>{collapsed ? '▼' : '▲'}</div>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* HP bar + damage/heal */}
          <div>
            <div className="hp-bar-track" style={{ marginBottom: 10 }}>
              <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                <input type="number" value={dmgInput} onChange={e => setDmgInput(e.target.value)}
                  placeholder="Danno" min={1} style={{ ...inpStyle, borderColor: 'rgba(139,26,26,0.6)' }}
                  onKeyDown={e => e.key === 'Enter' && handleDmg()} />
                <button onClick={handleDmg} className="btn btn-ghost" style={{ padding: '4px 10px', borderColor: 'var(--danger)', color: 'var(--fg-1)' }}>DMG</button>
              </div>
              <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                <input type="number" value={healInput} onChange={e => setHealInput(e.target.value)}
                  placeholder="Cura" min={1} style={{ ...inpStyle, borderColor: 'rgba(14,116,144,0.6)' }}
                  onKeyDown={e => e.key === 'Enter' && handleHeal()} />
                <button onClick={handleHeal} className="btn btn-ghost" style={{ padding: '4px 10px', borderColor: 'var(--info)', color: 'var(--fg-1)' }}>CURA</button>
              </div>
            </div>
            {participant.concentrating && (
              <div style={{ marginTop: 8, padding: '4px 10px', border: '1px solid rgba(91,33,182,0.5)', backgroundColor: 'rgba(91,33,182,0.06)', fontFamily: 'var(--font-body)', color: 'var(--fg-1)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                ⚠ Concentrazione: {participant.concentrating} — TS COS se subisce danno
              </div>
            )}
          </div>

          {/* Combat stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {[['CA', String(sheet.armorClass ?? '—')], ['Vel.', `${sheet.speed ?? '—'}m`], ['Prof', `+${prof}`], ['Init', formatModifier(abilityModifier(stats.dex) + (sheet.initiativeBonus ?? 0))]].map(([l, v]) => (
              <div key={l} style={{ textAlign: 'center', padding: '6px 4px', border: '1px solid var(--border-leather)', backgroundColor: 'var(--bg-card)' }}>
                <div className="label" style={{ marginBottom: 2, fontSize: '6.5px' }}>{l}</div>
                <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-1)', fontSize: '0.9rem', fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Attack bonuses */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[['Mischia', formatModifier(attacks.melee)], ['Distanza', formatModifier(attacks.ranged)], ...(attacks.spell !== null ? [['Incantesimo', formatModifier(attacks.spell)]] : [])].map(([l, v]) => (
              <div key={l} style={{ flex: 1, textAlign: 'center', padding: '6px 4px', border: '1px solid var(--border-leather)', backgroundColor: 'var(--bg-card)' }}>
                <div className="label" style={{ marginBottom: 2, fontSize: '6.5px' }}>{l}</div>
                <div style={{ fontFamily: 'var(--font-body)', color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Weapons */}
          {(sheet.weapons ?? []).length > 0 && (
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Armi</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {(sheet.weapons ?? []).map(w => {
                  const atkMod = abilityModifier(stats[w.attackStat]) + prof + (w.magicBonus ?? 0);
                  const dmgMod = abilityModifier(stats[w.attackStat]) + (w.magicBonus ?? 0);
                  return (
                    <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)' }}>
                      <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-1)', fontSize: '0.85rem' }}>
                        {w.name}{w.magic && w.magicBonus ? ` +${w.magicBonus}` : ''}
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 700 }}>
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
            <div className="label" style={{ marginBottom: 6 }}>Tiri Salvezza</div>
            <div style={{ display: 'flex', gap: 3 }}>
              {statKeys.map(ab => {
                const mod = abilityModifier(stats[ab]) + (savingThrows[ab] ? prof : 0);
                return (
                  <div key={ab} style={{ flex: 1, textAlign: 'center', padding: '5px 2px', border: `1px solid ${savingThrows[ab] ? 'var(--gold)' : 'var(--border-leather)'}`, backgroundColor: 'var(--bg-card)' }}>
                    <div style={{ fontFamily: 'var(--font-label)', fontSize: '6.5px', letterSpacing: '0.2em', color: 'var(--fg-3)', marginBottom: 2 }}>{statLabels[ab]}</div>
                    <div style={{ fontFamily: 'var(--font-body)', color: mod >= 0 ? 'var(--fg-1)' : 'var(--danger)', fontSize: '0.8rem', fontWeight: 700 }}>{formatModifier(mod)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spell slots */}
          {spellSlots.filter(s => s.total > 0).length > 0 && (
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Slot Incantesimo</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {spellSlots.filter(s => s.total > 0).map(s => (
                  <div key={s.slotLevel} style={{ textAlign: 'center', border: '1px solid var(--border-leather)', padding: '4px 10px', minWidth: 44, backgroundColor: 'var(--bg-card)' }}>
                    <div className="label" style={{ marginBottom: 4, fontSize: '6.5px' }}>Lv {s.slotLevel}</div>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                      {Array.from({ length: s.total }).map((_, i) => (
                        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block', backgroundColor: i < (s.total - s.used) ? 'var(--arcane)' : 'var(--bg-elevated)', border: '1px solid var(--border-leather)' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Condizioni */}
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Condizioni</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {participant.conditions.map(ck => {
                const cond = CONDITIONS.find(c => c.key === ck);
                return (
                  <button key={ck} onClick={() => onRemoveCondition(ck)} className="badge badge-danger" style={{ cursor: 'pointer' }}>
                    {cond?.name ?? ck} ✕
                  </button>
                );
              })}
              <button onClick={() => setShowCondPicker(p => !p)} className="badge badge-default" style={{ cursor: 'pointer' }}>
                + Condizione
              </button>
            </div>
            {showCondPicker && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {CONDITIONS.filter(c => !participant.conditions.includes(c.key)).map(c => (
                  <button key={c.key} onClick={() => { onAddCondition(c.key); setShowCondPicker(false); }}
                    className="badge badge-default" style={{ cursor: 'pointer' }}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Concentrazione */}
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Concentrazione</div>
            {participant.concentrating ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-1)', fontSize: '0.875rem', fontStyle: 'italic' }}>✦ {participant.concentrating}</span>
                <button onClick={() => onSetConcentration(null)} className="badge badge-default" style={{ cursor: 'pointer' }}>Perdi conc.</button>
              </div>
            ) : (
              <div>
                <button onClick={() => setShowConcInput(p => !p)} className="badge badge-default" style={{ cursor: 'pointer' }}>+ Concentrazione</button>
                {showConcInput && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {concentrationSpells.length > 0 ? (
                      <select value={concSpell} onChange={e => setConcSpell(e.target.value)}
                        style={{ flex: 1, backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-leather)', color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', padding: '4px 8px', outline: 'none' }}>
                        <option value="">-- seleziona --</option>
                        {concentrationSpells.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    ) : (
                      <input value={concSpell} onChange={e => setConcSpell(e.target.value)} placeholder="Nome incantesimo…"
                        style={{ flex: 1, backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-leather)', color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', padding: '4px 8px', outline: 'none' }} />
                    )}
                    <button onClick={() => { if (concSpell) { onSetConcentration(concSpell); setShowConcInput(false); setConcSpell(''); } }}
                      className="btn btn-ghost" style={{ padding: '4px 10px', borderColor: 'var(--arcane)', color: 'var(--fg-1)' }}>✓</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feats */}
          {(sheet.feats ?? []).length > 0 && (
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Talenti</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(sheet.feats ?? []).map(f => (
                  <div key={f.key} style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--gold)' }}>{f.name}</span>
                    {f.description && ` — ${f.description.slice(0, 80)}${f.description.length > 80 ? '…' : ''}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Magic items */}
          {(sheet.magicItems ?? []).length > 0 && (
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Oggetti Magici</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(sheet.magicItems ?? []).map(item => (
                  <div key={item.id} style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--gold)' }}>{item.name}</span>
                    {item.attuned && <span style={{ color: 'var(--fg-1)', marginLeft: 8, fontSize: '0.75rem' }}>sintonizzato</span>}
                    {item.description && ` — ${item.description.slice(0, 80)}${item.description.length > 80 ? '…' : ''}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action economy */}
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Economia Azioni</div>
            <ActionTracker used={participant.actionsUsed} onChange={onActionToggle} />
          </div>

          {/* Fine turno */}
          {isCurrent && (
            <button onClick={onEndTurn} className="btn btn-secondary" style={{ width: '100%', marginTop: 4 }}>
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
    persist({ ...state, participants: state.participants.map((p, i) => i === idx ? { ...p, ...update } : p) });
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
    updateParticipant(idx, { hpCurrent: Math.max(0, newHp), hpTemp: newTemp });
    applyDamage(p.characterId, amount);
  }

  function handleHeal(idx: number, amount: number) {
    const p = state.participants[idx];
    updateParticipant(idx, { hpCurrent: Math.min(p.hpMax, p.hpCurrent + amount) });
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
  }

  async function handleEndTurn() {
    const current = state.participants[0];
    const resetCurrent = { ...current, actionsUsed: { action: false, bonusAction: false, movement: false, reaction: false } };
    const newParticipants = [...state.participants.slice(1), resetCurrent];
    await persist({ ...state, participants: newParticipants, round: state.participants.length <= 1 ? state.round + 1 : state.round, currentTurnIndex: 0 });
  }

  async function handleAddCombatant(charId: string, initiative: number) {
    const char = charMap.get(charId);
    if (!char) return;
    const newP: CombatParticipant = {
      characterId: charId, initiative,
      actionsUsed: { action: false, bonusAction: false, movement: false, reaction: false },
      concentrating: null, hpCurrent: char.hpCurrent, hpMax: char.hpMax, hpTemp: char.hpTemp, conditions: [],
    };
    const all = [...state.participants, newP].sort((a, b) => b.initiative - a.initiative);
    await persist({ ...state, participants: all });
    setShowAddCombatant(false);
    setAddSelected(null);
    setAddInitInput({});
  }

  async function endCombat() { await persist({ ...state, active: false }); }

  const activeParticipantIds = new Set(state.participants.map(p => p.characterId));
  const availableToAdd = charList.filter(c => !activeParticipantIds.has(c.id));

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

      <CombatSidebar state={state} characters={charMap} onJumpTo={() => {}} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--border-leather)', backgroundColor: 'var(--bg-deep)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--fg-1)' }}>⚔ Combat</span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem' }}>Round {state.round}</span>
            <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              {charMap.get(state.participants[0]?.characterId)?.name ?? '—'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saving && <span style={{ fontFamily: 'var(--font-label)', fontSize: '7.5px', letterSpacing: '0.3em', color: 'var(--fg-3)' }}>salvataggio…</span>}
            <button onClick={() => setShowAddCombatant(p => !p)} className="btn btn-ghost" style={{ padding: '5px 12px' }}>+ Aggiungi</button>
            <button onClick={endCombat} className="btn btn-ghost" style={{ padding: '5px 12px' }}>Fine Combat</button>
          </div>
        </div>

        {/* Add combatant panel */}
        {showAddCombatant && (
          <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-leather)', flexShrink: 0 }}>
            <div className="label" style={{ marginBottom: 10 }}>Aggiungi combattente</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {availableToAdd.map(char => (
                <div key={char.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${addSelected === char.id ? 'var(--gold)' : 'var(--border-leather)'}`, padding: '6px 12px', cursor: 'pointer', backgroundColor: 'var(--bg-deep)' }}
                  onClick={() => setAddSelected(char.id)}>
                  <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-1)', fontSize: '0.875rem' }}>{char.name}</span>
                  {addSelected === char.id && (
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="number" placeholder="Init" value={addInitInput[char.id] ?? ''}
                        onChange={e => setAddInitInput(p => ({ ...p, [char.id]: e.target.value }))}
                        style={{ width: 48, backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-leather)', color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', padding: '3px 6px', outline: 'none', textAlign: 'center' }} />
                      <button onClick={() => handleAddCombatant(char.id, parseInt(addInitInput[char.id] ?? '0') || 0)}
                        className="btn btn-secondary" style={{ padding: '3px 10px' }}>+</button>
                    </div>
                  )}
                </div>
              ))}
              {availableToAdd.length === 0 && (
                <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.875rem', fontStyle: 'italic' }}>Tutti i personaggi sono già nel combat.</span>
              )}
            </div>
          </div>
        )}

        {/* Cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {state.participants.map((p, i) => {
            const char = charMap.get(p.characterId);
            if (!char) return null;
            return (
              <CombatCard
                key={p.characterId}
                participant={p} char={char}
                spellSlots={spellSlotsByChar[p.characterId] ?? []}
                isCurrent={i === 0} isAdding={false}
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
