'use client';

import { useState } from 'react';
import HpControls from '@/components/dashboard/HpControls';
import ConditionBadge from '@/components/dashboard/ConditionBadge';
import AddConditionButton from '@/components/dashboard/AddConditionButton';
import DeathSavesTracker from '@/components/character/sheet/DeathSavesTracker';
import PinnedActiveResources from '@/components/character/features/PinnedActiveResources';
import PinnedPassiveSection from '@/components/character/features/PinnedPassiveSection';
import InventoryCard from '@/components/character/sheet/InventoryCard';
import SpellSectionTabs from '@/components/character/spell/SpellSectionTabs';
import AddSpellButton from '@/components/character/sheet/AddSpellButton';
import FeatureButton from '@/components/character/features/FeatureButton';
import BackstoryCard from '@/components/character/sheet/BackstoryCard';
import PendingRestBanner from '@/components/character/rest/PendingRestBanner';
import MobileFab from './MobileFab';
import { CONDITIONS } from '@/lib/srd/conditions';
import { abilityModifier, formatModifier, skillBonus } from '@/lib/rules/calculations';
import { SKILLS, ABILITY_NAMES, ABILITY_SHORT, type Ability } from '@/lib/srd/skills';
import { getUnlockedFeatures } from '@/lib/srd/classFeatures';
import { getRacialTraits } from '@/lib/srd/racialTraits';
import type { CharacterSheet, CharacterResource, PinnedFeature, KnownSpell } from '@/lib/db/schema';

// ─── types ────────────────────────────────────────────────────

type Tab = 'combat' | 'equipment' | 'spells' | 'bio';

interface Props {
  characterId: string;
  charName: string;
  classLabel: string;
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
  hpPct: number;
  hpColor: string;
  level: number;
  xp: number;
  xpPct: number;
  canLevelUp: boolean;
  prof: number;
  hitDie: number;
  passPerc: number;
  spellDC: number | null;
  spellAtk: number | null;
  carriedKg: number;
  carryMax: number;
  carryPct: number;
  carryOverloaded: boolean;
  canCast: boolean;
  sheet: CharacterSheet;
  conditions: Array<{ id: string; conditionKey: string; characterId: string }>;
  resources: CharacterResource[];
  knownSpells: KnownSpell[];
  activeSpellSlots: Array<{ slotLevel: number; total: number; used: number; characterId: string }>;
  pinnedPassive: PinnedFeature[];
  pinnedActive: PinnedFeature[];
  casterClassKeys: string[];
  isDm: boolean;
  isActiveCharacter: boolean;
}

// ─── constants ────────────────────────────────────────────────

const SCHOOL_ABBR: Record<string, string> = {
  abjuration: 'Abj.', conjuration: 'Inv.', divination: 'Div.',
  enchantment: 'Inc.', evocation: 'Evo.', illusion: 'Ill.',
  necromancy: 'Nec.', transmutation: 'Tra.',
};

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'combat',    icon: '⚔',  label: 'Scontro'  },
  { id: 'equipment', icon: '🎒', label: 'Oggetti'  },
  { id: 'spells',    icon: '✨', label: 'Magia'    },
  { id: 'bio',       icon: '🧙', label: 'Bio'      },
];

const CARD: React.CSSProperties = {
  background: 'var(--bg-deep)',
  border: '1px solid var(--border-leather-dim)',
  borderRadius: 'var(--r-lg)',
  padding: 'var(--s-2)',
  marginBottom: 'var(--s-2)',
};

// ─── helpers ──────────────────────────────────────────────────

function SH({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600,
      letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', gap: 'var(--s-1)',
      marginBottom: 'var(--s-1)',
    }}>
      {children}
      <span style={{ flex: 1, height: .5, background: 'var(--border-leather-dim)' }} />
    </div>
  );
}

function SB({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1)', textAlign: 'center' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--fg-2)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', display: 'block' }}>{value}</span>
    </div>
  );
}

// ─── component ────────────────────────────────────────────────

export default function MobileSheet({
  characterId, charName, classLabel,
  hpCurrent, hpMax, hpTemp, hpPct, hpColor,
  level, xp: _xp, xpPct, canLevelUp, prof, hitDie,
  passPerc, spellDC, spellAtk,
  carriedKg, carryMax, carryPct, carryOverloaded,
  canCast, sheet, conditions, resources,
  knownSpells, activeSpellSlots,
  pinnedPassive, pinnedActive,
  casterClassKeys, isDm, isActiveCharacter,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(isActiveCharacter ? 'combat' : 'bio');

  const stats       = sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const savingThrows = sheet.savingThrowProficiencies ?? ({} as Record<string, boolean>);
  const skillMap    = sheet.skills ?? {};
  const isPreparedCaster = ['cleric', 'druid', 'paladin', 'wizard'].some(k => casterClassKeys.includes(k));
  const allPinned   = [...pinnedPassive, ...pinnedActive];

  const classFeatureCount = (sheet.classes ?? []).reduce(
    (s, c) => s + getUnlockedFeatures(c.classKey, c.level).length, 0
  );
  const racialTraitCount = sheet.race
    ? getRacialTraits(sheet.race).filter(t =>
        !t.subraceOnly || (sheet.subrace && t.subraceOnly.includes(sheet.subrace))
      ).length
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: 'var(--bg-deep)' }}>

      {/* ── HP Strip (sticky header) ─────────────────────────── */}
      <div style={{
        padding: 'var(--s-2)',
        background: 'var(--bg-deep)',
        borderBottom: '1px solid var(--border-leather-dim)',
        flexShrink: 0,
      }}>
        {/* Row 1: portrait + name + HP number */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-1)' }}>
          {/* Portrait */}
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--r-sm)', flexShrink: 0,
            overflow: 'hidden', border: '1.5px solid var(--border-leather-dim)',
            background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {sheet.portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sheet.portraitUrl} alt={charName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 700, color: 'var(--gold)' }}>
                {charName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {/* Name + class */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', fontWeight: 700, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {charName}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--fg-3)' }}>{classLabel}</div>
          </div>
          {/* HP number */}
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: hpColor, lineHeight: 1 }}>
              {hpCurrent}<span style={{ fontSize: 11, color: 'var(--fg-2)', fontWeight: 400 }}>/{hpMax}</span>
            </div>
            {hpTemp > 0 && (
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', color: 'var(--info)' }}>+{hpTemp} temp</div>
            )}
          </div>
        </div>
        {/* Row 2: HP bar */}
        <div style={{ height: 3, backgroundColor: 'var(--bg-card)', borderRadius: 'var(--r-sm)', overflow: 'hidden', marginBottom: 'var(--s-1)' }}>
          <div style={{ height: '100%', width: `${hpPct}%`, background: hpColor, borderRadius: 'var(--r-sm)', transition: 'width .5s, background .6s' }} />
        </div>
        {/* Row 3: HP controls */}
        <HpControls characterId={characterId} hpCurrent={hpCurrent} hpMax={hpMax} />
        {hpCurrent === 0 && (
          <div style={{ marginTop: 'var(--s-1)', paddingTop: 'var(--s-1)', borderTop: '1px solid var(--danger-border)' }}>
            <DeathSavesTracker characterId={characterId} sheet={sheet} />
          </div>
        )}
      </div>

      {/* ── Content area ─────────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: 'var(--s-2)',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      }}>

        {/* Pending rest banner — sempre visibile al giocatore */}
        {!isDm && sheet.pendingRest && (
          <div style={{ marginBottom: 'var(--s-2)' }}>
            <PendingRestBanner
              characterId={characterId}
              pendingRest={sheet.pendingRest}
              classes={sheet.classes ?? []}
              conModifier={abilityModifier(stats.con)}
              hitDiceUsed={sheet.hitDiceUsed ?? 0}
              hpCurrent={hpCurrent}
              hpMax={hpMax}
              isPreparedCaster={isPreparedCaster}
              currentSpells={knownSpells}
              casterClassKeys={casterClassKeys}
              characterStats={stats}
            />
          </div>
        )}

        {/* ════════════════ TAB: COMBAT ══════════════════════ */}
        {activeTab === 'combat' && (
          <>
            {/* Statistiche di combattimento */}
            <div style={CARD}>
              <SH>Statistiche</SH>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-1)', marginBottom: 'var(--s-1)' }}>
                <SB label="C.A."       value={sheet.armorClass ?? (10 + abilityModifier(stats.dex))} />
                <SB label="Iniziativa" value={formatModifier(abilityModifier(stats.dex) + (sheet.initiativeBonus ?? 0))} />
                <SB label="Velocità"   value={`${sheet.speed ?? 9}m`} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-1)' }}>
                {[
                  ['Bonus Comp.',   `+${prof}`],
                  ['Perc. Passiva', passPerc],
                  ...(spellDC !== null ? [['CD Incant.', spellDC], ['Att. Incant.', formatModifier(spellAtk!)]] : []),
                  ['Dado Vita', `d${hitDie}`],
                ].map(([label, value]) => (
                  <SB key={String(label)} label={String(label)} value={value} />
                ))}
              </div>
            </div>

            {/* Caratteristiche */}
            <div style={CARD}>
              <SH>Caratteristiche</SH>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-1)' }}>
                {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(key => {
                  const val = stats[key];
                  const mod = abilityModifier(val);
                  const isNeg = mod < 0;
                  const isZero = mod === 0;
                  return (
                    <div key={key} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1)', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--fg-2)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        {ABILITY_NAMES[key]}
                      </span>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, color: isNeg ? 'var(--danger)' : isZero ? 'var(--fg-2)' : 'var(--gold)', lineHeight: 1, display: 'block' }}>
                        {formatModifier(mod)}
                      </span>
                      <span style={{ display: 'inline-block', marginTop: 4, backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-2)', padding: '1px var(--s-1)', minWidth: 24 }}>
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tiri Salvezza */}
            <div style={CARD}>
              <SH>Tiri Salvezza</SH>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(key => {
                  const proficient = (savingThrows as Record<string, boolean>)[key] ?? false;
                  const bonus = abilityModifier(stats[key]) + (proficient ? prof : 0);
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 'var(--r-sm)', border: `1.5px solid ${proficient ? 'var(--gold)' : 'var(--fg-3)'}`, backgroundColor: proficient ? 'var(--gold)' : 'transparent', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'var(--fg-1)' }}>{ABILITY_NAMES[key]}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: bonus > 0 ? 'var(--gold)' : bonus < 0 ? 'var(--danger)' : 'var(--fg-2)' }}>
                        {formatModifier(bonus)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Abilità — lista flat, più compatta sul mobile */}
            <div style={CARD}>
              <SH>Abilità</SH>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {SKILLS.map(skill => {
                  const sk = skillMap[skill.key] ?? { proficient: false, expertise: false };
                  const bonus = skillBonus(stats[skill.ability as Ability], level, sk.proficient, sk.expertise);
                  return (
                    <div key={skill.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px var(--s-1)', borderRadius: 'var(--r-sm)' }}>
                      <div style={{ width: 7, height: 7, borderRadius: 'var(--r-sm)', border: `1.5px solid ${sk.expertise ? 'var(--arcane)' : sk.proficient ? 'var(--gold)' : 'var(--fg-3)'}`, backgroundColor: sk.proficient ? (sk.expertise ? 'var(--arcane)' : 'var(--gold)') : 'transparent', flexShrink: 0 }} />
                      <span style={{ flex: 1, color: 'var(--fg-2)', fontSize: '12px' }}>{skill.name}</span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', color: 'var(--fg-3)', flexShrink: 0 }}>
                        {ABILITY_SHORT[skill.ability as Ability]}
                      </span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: bonus > 0 ? 'var(--gold)' : bonus < 0 ? 'var(--danger)' : 'var(--fg-2)', minWidth: 28, textAlign: 'right', flexShrink: 0 }}>
                        {formatModifier(bonus)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risorse Attive */}
            {pinnedActive.length > 0 && (
              <div style={{ marginBottom: 'var(--s-2)' }}>
                <PinnedActiveResources characterId={characterId} features={pinnedActive} resources={resources} />
              </div>
            )}

            {/* Condizioni */}
            <div style={CARD}>
              <SH>Condizioni Attive</SH>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-1)', alignItems: 'center', minHeight: 24 }}>
                {conditions.length === 0 && (
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)' }}>
                    Nessuna condizione
                  </span>
                )}
                {conditions.map(c => {
                  const def = CONDITIONS.find(d => d.key === c.conditionKey);
                  return def
                    ? <ConditionBadge key={c.id} conditionId={c.id} characterId={characterId} name={def.name} icon={def.icon} />
                    : null;
                })}
                <AddConditionButton characterId={characterId} />
              </div>
            </div>

            {/* Attacchi */}
            <div style={CARD}>
              <SH>Attacchi</SH>
              {(sheet.weapons?.length ?? 0) === 0 ? (
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)' }}>
                  Nessuna arma equipaggiata.
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {['Arma', 'Danno', 'Acc.'].map(h => (
                        <th key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.09em', color: 'var(--fg-2)', textAlign: 'left', paddingBottom: 'var(--s-1)', borderBottom: '1px solid var(--border-leather)', fontWeight: 400, textTransform: 'uppercase' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(sheet.weapons ?? []).map(w => {
                      const atkMod = abilityModifier(stats[w.attackStat as Ability]) + prof + (w.magicBonus ?? 0);
                      const dmgMod = abilityModifier(stats[w.attackStat as Ability]) + (w.magicBonus ?? 0);
                      return (
                        <tr key={w.id}>
                          <td style={{ padding: '6px 0', borderBottom: '.5px solid var(--bg-elevated)', color: 'var(--fg-1)' }}>
                            {w.name}{w.magic && w.magicBonus ? ` +${w.magicBonus}` : ''}
                          </td>
                          <td style={{ padding: '6px 0', borderBottom: '.5px solid var(--bg-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--gold)', fontSize: '11px', fontWeight: 500 }}>
                            {w.damageDice}{dmgMod !== 0 ? formatModifier(dmgMod) : ''}
                          </td>
                          <td style={{ padding: '6px 0', borderBottom: '.5px solid var(--bg-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--hp-healthy)', fontSize: '11px' }}>
                            {formatModifier(atkMod)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ════════════════ TAB: EQUIPMENT ══════════════════ */}
        {activeTab === 'equipment' && (
          <>
            <InventoryCard
              characterId={characterId}
              inventory={sheet.inventory ?? []}
              money={sheet.money ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }}
            />

            {/* Trasporto */}
            <div style={CARD}>
              <SH>Capacità di Trasporto</SH>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--fg-2)', marginBottom: 'var(--s-1)' }}>
                <span>Peso trasportato</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: carryOverloaded ? 'var(--danger)' : 'var(--fg-1)' }}>
                  {carriedKg.toFixed(1)} / {carryMax} kg
                </span>
              </div>
              <div style={{ height: 4, backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${carryPct}%`, backgroundColor: carryOverloaded ? 'var(--danger)' : 'var(--gold)', borderRadius: 'var(--r-sm)', opacity: 0.7 }} />
              </div>
            </div>

            {/* Denaro */}
            {sheet.money && (
              <div style={CARD}>
                <SH>Denaro</SH>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--s-1)' }}>
                  {([
                    ['PP', 'var(--fg-1)', sheet.money.pp],
                    ['PO', 'var(--gold)',    sheet.money.gp],
                    ['PE', '#a0a0c8',               sheet.money.ep],
                    ['PA', '#a8a8a8',               sheet.money.sp],
                    ['PR', '#b06030',               sheet.money.cp],
                  ] as [string, string, number][]).map(([label, color, val]) => (
                    <div key={label} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1) 4px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.08em', color, display: 'block', marginBottom: 2, textTransform: 'uppercase' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 600, color: 'var(--fg-1)', display: 'block' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note DM (solo per DM) */}
            {sheet.dmNotes && isDm && (
              <div style={{ ...CARD, border: '1px solid var(--danger-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s-1)' }}>
                  <div style={{ width: 2, height: 14, backgroundColor: 'var(--danger)', opacity: 0.7, borderRadius: 'var(--r-sm)' }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-1)' }}>Note DM</span>
                </div>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                  {sheet.dmNotes}
                </p>
              </div>
            )}
          </>
        )}

        {/* ════════════════ TAB: SPELLS ══════════════════════ */}
        {activeTab === 'spells' && (
          <div style={{ ...CARD, opacity: canCast ? 1 : 0.55 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-1)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>
                ✨ Incantesimi
              </span>
              {canCast && (
                <AddSpellButton
                  characterId={characterId}
                  currentSpells={knownSpells}
                  casterClassKeys={casterClassKeys}
                  characterClasses={sheet.classes ?? []}
                  characterStats={stats}
                />
              )}
            </div>
            {!canCast && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', lineHeight: 1.6 }}>
                Il tuo personaggio non possiede le capacità per lanciare incantesimi.
              </p>
            )}
            {knownSpells.length === 0 && activeSpellSlots.length === 0 && canCast && (
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)', padding: '4px 0' }}>
                Nessun incantesimo — usa + Aggiungi per iniziare.
              </p>
            )}
            <SpellSectionTabs
              knownSpells={knownSpells}
              activeSpellSlots={activeSpellSlots}
              isPreparedCaster={isPreparedCaster}
              schoolAbbr={SCHOOL_ABBR}
            />
          </div>
        )}

        {/* ════════════════ TAB: BIO ═════════════════════════ */}
        {activeTab === 'bio' && (
          <>
            {/* Portrait + Info + XP */}
            <div style={CARD}>
              <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'flex-start' }}>
                {/* Portrait */}
                <div style={{
                  width: 72, height: 72, borderRadius: 'var(--r-lg)', flexShrink: 0,
                  overflow: 'hidden', border: '2px solid var(--border-leather-dim)',
                  background: 'var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {sheet.portraitUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sheet.portraitUrl} alt={charName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, color: 'var(--gold)' }}>
                      {charName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Nome + Classe + XP */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: 'var(--fg-1)', marginBottom: 2 }}>{charName}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', marginBottom: 'var(--s-1)' }}>{classLabel}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--fg-3)', marginBottom: 4 }}>
                    <span>XP</span>
                    <span style={{ color: canLevelUp ? 'var(--gold)' : 'var(--fg-2)' }}>
                      {canLevelUp ? '⬆ Level Up!' : `${xpPct}%`}
                    </span>
                  </div>
                  <div style={{ height: 4, backgroundColor: 'var(--bg-card)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${xpPct}%`, background: 'var(--gold)', borderRadius: 'var(--r-sm)' }} />
                  </div>
                </div>
              </div>

              {/* Identità sotto */}
              <div style={{ marginTop: 'var(--s-2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  ['Razza',          [sheet.race, sheet.subrace].filter(Boolean).join(' — ')],
                  ['Background',     sheet.background],
                  ['Allineamento',   sheet.alignment],
                ].filter(([, v]) => v).map(([label, val]) => (
                  <div key={String(label)} style={{ display: 'flex', gap: 'var(--s-1)', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--fg-3)', textTransform: 'uppercase', flexShrink: 0, minWidth: 80 }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--fg-1)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature buttons */}
            <div style={CARD}>
              <SH>Capacità</SH>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
                <FeatureButton
                  mode="class"
                  label="Caratteristiche di Classe"
                  count={classFeatureCount || null}
                  characterClasses={sheet.classes ?? []}
                  resources={resources}
                  characterId={characterId}
                  pinnedFeatures={allPinned}
                />
                {sheet.race && (
                  <FeatureButton
                    mode="racial"
                    label="Tratti Razziali"
                    count={racialTraitCount}
                    characterId={characterId}
                    raceKey={sheet.race}
                    raceName={sheet.race ?? sheet.race}
                    subraceKey={sheet.subrace}
                    racialChoices={sheet.racialChoices ?? []}
                    pinnedFeatures={allPinned}
                  />
                )}
                <FeatureButton
                  mode="feats"
                  label="Talenti"
                  count={(sheet.feats?.length ?? 0) || null}
                  characterId={characterId}
                  currentFeats={sheet.feats ?? []}
                  asiHistory={sheet.asiHistory ?? []}
                  stats={stats}
                  characterClasses={sheet.classes ?? []}
                  pinnedFeatures={allPinned}
                />
              </div>
            </div>

            {/* Pinned passive */}
            {pinnedPassive.length > 0 && (
              <div style={{ marginBottom: 'var(--s-2)' }}>
                <PinnedPassiveSection features={pinnedPassive} />
              </div>
            )}

            {/* Storia */}
            <BackstoryCard
              characterId={characterId}
              charName={charName}
              initialBackstory={sheet.backstory ?? ''}
              personality={sheet.personality}
              ideals={sheet.ideals}
              bonds={sheet.bonds}
              flaws={sheet.flaws}
              isOwner={!isDm}
              vertical
            />
          </>
        )}
      </div>

      {/* ── Bottom tab bar (fixed) ───────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex',
        background: 'var(--bg-deep)',
        borderTop: '1px solid var(--border-leather-dim)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 50,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center',
                height: 64,
                padding: '0 2px',
                background: 'none', border: 'none',
                borderTop: `2px solid ${active ? (tab.id === 'spells' ? 'var(--arcane)' : 'var(--gold)') : 'transparent'}`,
                cursor: 'pointer', transition: 'all .18s',
              }}>
              <span style={{ fontSize: 18, marginBottom: 4, lineHeight: 1 }}>{tab.icon}</span>
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600,
                letterSpacing: '.06em', textTransform: 'uppercase',
                color: active ? (tab.id === 'spells' ? 'var(--arcane)' : 'var(--gold)') : 'var(--fg-3)',
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── FAB ──────────────────────────────────────────────── */}
      <MobileFab
        characterId={characterId}
        isDm={isDm}
        canCast={canCast}
        hpCurrent={hpCurrent}
        hpMax={hpMax}
        inventory={sheet.inventory ?? []}
        money={sheet.money ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }}
        knownSpells={knownSpells}
        casterClassKeys={casterClassKeys}
        characterClasses={sheet.classes ?? []}
        characterStats={stats}
      />
    </div>
  );
}
