import { abilityModifier, skillBonus, formatModifier, proficiencyBonus } from '@/lib/rules/calculations';
import { SKILLS, ABILITY_NAMES, ABILITY_SHORT, type Ability } from '@/lib/srd/skills';
import { card, innerBox, sectionLabel, modColor } from '../styles';
import type { CharacterStats, CharacterSheet } from '@/lib/db/schema';

export interface StatsTabProps {
  stats: CharacterStats;
  savingThrows: Record<Ability, boolean>;
  skillMap: CharacterSheet['skills'];
  level: number;
}

const ABILITIES: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export default function StatsTab({ stats, savingThrows, skillMap, level }: StatsTabProps) {
  const prof = proficiencyBonus(level);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <div style={{ display: 'flex', gap: 'var(--s-1)' }}>
        {ABILITIES.map(ab => {
          const mod = abilityModifier(stats[ab]);
          return (
            <div key={ab} style={{ flex: 1, minWidth: 0, ...innerBox, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '.06em', color: 'var(--fg-2)' }}>{ABILITY_SHORT[ab]}</span>
                <span style={{ fontSize: '10px', color: 'var(--fg-3)' }}>{stats[ab]}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, color: modColor(mod) }}>
                {formatModifier(mod)}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-2)', maxHeight: 'calc(100vh - 280px)' }}>
        <div style={{ ...card, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          <div style={{ ...sectionLabel, marginBottom: 'var(--s-1)' }}>Tiri Salvezza</div>
          {ABILITIES.map(ab => {
            const isProficient = savingThrows[ab];
            const bonus = abilityModifier(stats[ab]) + (isProficient ? prof : 0);
            return (
              <div key={ab} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '.5px solid var(--bg-elevated)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: 7, border: `1.5px solid ${isProficient ? 'var(--gold)' : 'var(--fg-3)'}`, background: isProficient ? 'var(--gold)' : 'transparent' }} />
                  <span style={{ fontSize: '12px', color: 'var(--fg-1)' }}>{ABILITY_NAMES[ab]}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, color: modColor(bonus) }}>{formatModifier(bonus)}</span>
              </div>
            );
          })}
        </div>

        <div style={{ ...card, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          <div style={{ ...sectionLabel, marginBottom: 'var(--s-1)' }}>Abilità</div>
          {SKILLS.map(sk => {
            const skill = skillMap[sk.key];
            const proficient = skill?.proficient ?? false;
            const expertise = skill?.expertise ?? false;
            const bonus = skillBonus(stats[sk.ability], level, proficient, expertise);
            const pipColor = expertise ? 'var(--arcane)' : proficient ? 'var(--gold)' : 'var(--fg-3)';
            return (
              <div key={sk.key} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 4px' }}>
                <div style={{ width: 5, height: 5, borderRadius: 5, border: `1.5px solid ${pipColor}`, background: proficient ? pipColor : 'transparent' }} />
                <span style={{ flex: 1, color: 'var(--fg-2)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sk.name}</span>
                <span style={{ fontSize: '8px', color: 'var(--fg-3)' }}>{ABILITY_SHORT[sk.ability].toLowerCase()}</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: modColor(bonus), minWidth: 22, textAlign: 'right' }}>{formatModifier(bonus)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
