import type {
  Character, CharacterSheet, CharacterSpellSlot, CharacterStats, PinnedFeature, KnownSpell, CharacterClass,
} from '@/lib/db/schema';
import {
  proficiencyBonus, passivePerception, spellSaveDC, spellAttackBonus,
  totalCarriedWeight, carryStatus, hpPercentage,
} from '@/lib/rules/calculations';
import { CLASSES, SPELLCASTING_SUBCLASSES } from '@/lib/srd/classes';
import { XP_THRESHOLDS, getXpForNextLevel } from '@/lib/srd/constants';
import type { Ability } from '@/lib/srd/skills';

export interface SheetViewModel {
  level: number;
  prof: number;
  stats: CharacterStats;
  savingThrows: Record<Ability, boolean>;
  skillMap: CharacterSheet['skills'];
  hpPct: number;
  hpColor: string;
  passPerc: number;
  spellDC: number | null;
  spellAtk: number | null;
  carriedKg: number;
  carryMax: number;
  carryPct: number;
  carryOverloaded: boolean;
  nextXp: number | null;
  xpPct: number;
  canLevelUp: boolean;
  classLabel: string;
  hitDie: number;
  casterClassKeys: string[];
  canCast: boolean;
  pinnedAll: PinnedFeature[];
  pinnedPassive: PinnedFeature[];
  pinnedActive: PinnedFeature[];
  classesWithSubclass: CharacterClass[];
  activeSpellSlots: CharacterSpellSlot[];
  knownSpells: KnownSpell[];
}

export function buildSheetViewModel(
  char: Character,
  sheet: CharacterSheet,
  spellSlots: CharacterSpellSlot[],
): SheetViewModel {
  const level = char.level;
  const prof = proficiencyBonus(level);
  const stats = sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const savingThrows = sheet.savingThrowProficiencies ?? { str: false, dex: false, con: false, int: false, wis: false, cha: false };
  const skillMap = sheet.skills ?? {};
  const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);

  const hpPct = hpPercentage(char.hpCurrent, char.hpMax);
  const hpColor = hpPct > 60 ? 'var(--hp-healthy)' : hpPct > 30 ? 'var(--hp-wounded)' : 'var(--danger)';

  const perceptionSkill = skillMap['perception'];
  const passPerc = passivePerception(stats.wis, level, perceptionSkill?.proficient ?? false, perceptionSkill?.expertise ?? false);

  const castingAbility = cls?.spellcastingAbility as Ability | undefined;
  const castingScore = castingAbility ? stats[castingAbility] : 0;
  const spellDC = castingAbility ? spellSaveDC(castingScore, level) : null;
  const spellAtk = castingAbility ? spellAttackBonus(castingScore, level) : null;

  const carriedKg = totalCarriedWeight(sheet.inventory ?? []);
  const carryMax = Math.floor(stats.str * 7.5);
  const carryPct = Math.min(100, carryMax > 0 ? (carriedKg / carryMax) * 100 : 0);
  const carryOverloaded = carryStatus(stats.str, carriedKg) !== 'normal';

  const nextXp = getXpForNextLevel(level);
  const currentLevelXp = XP_THRESHOLDS[level] ?? 0;
  const xpPct = nextXp ? Math.min(100, Math.round(((char.xp - currentLevelXp) / (nextXp - currentLevelXp)) * 100)) : 100;
  const canLevelUp = nextXp !== null && char.xp >= nextXp;

  const classLabel = sheet.classes?.map(c => {
    const found = CLASSES.find(cl => cl.key === c.classKey);
    return `${found?.name ?? c.classKey} ${c.level}`;
  }).join(' / ') ?? '';

  const hitDie = cls?.hitDie ?? 8;

  const casterClassKeys: string[] = [];
  for (const c of sheet.classes ?? []) {
    const classDef = CLASSES.find(cl => cl.key === c.classKey);
    if (classDef && classDef.spellcastingType !== 'none') {
      if (!casterClassKeys.includes(c.classKey)) casterClassKeys.push(c.classKey);
    }
    const subclassSpells = SPELLCASTING_SUBCLASSES[c.classKey];
    if (subclassSpells && c.subclass) {
      const match = subclassSpells.find(s => s.subclassName === c.subclass);
      if (match && !casterClassKeys.includes(match.spellList)) {
        casterClassKeys.push(match.spellList);
      }
    }
  }
  const canCast = casterClassKeys.length > 0;

  const pinnedAll = sheet.pinnedFeatures ?? [];
  const pinnedPassive = pinnedAll.filter(f => !f.resourceKey);
  const pinnedActive = pinnedAll.filter(f => !!f.resourceKey);

  const classesWithSubclass = (sheet.classes ?? []).filter(c => c.subclass);

  const activeSpellSlots = spellSlots.filter(s => s.total > 0).sort((a, b) => a.slotLevel - b.slotLevel);
  const knownSpells = sheet.knownSpells ?? [];

  return {
    level, prof, stats, savingThrows, skillMap, hpPct, hpColor, passPerc,
    spellDC, spellAtk, carriedKg, carryMax, carryPct, carryOverloaded,
    nextXp, xpPct, canLevelUp, classLabel, hitDie, casterClassKeys, canCast,
    pinnedAll, pinnedPassive, pinnedActive, classesWithSubclass,
    activeSpellSlots, knownSpells,
  };
}
