import { PROFICIENCY_BONUS, CARRY_CAPACITY } from '@/lib/srd/constants';
import type { CharacterStats, CharacterSheet, InventoryItem } from '@/lib/db/schema';

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level: number): number {
  return PROFICIENCY_BONUS[level] ?? 2;
}

export function skillBonus(
  score: number,
  level: number,
  proficient: boolean,
  expertise: boolean,
): number {
  const mod = abilityModifier(score);
  const prof = proficiencyBonus(level);
  if (expertise) return mod + prof * 2;
  if (proficient) return mod + prof;
  return mod;
}

export function passivePerception(
  wisScore: number,
  level: number,
  proficient: boolean,
  expertise: boolean,
): number {
  return 10 + skillBonus(wisScore, level, proficient, expertise);
}

export function spellSaveDC(castingStatScore: number, level: number): number {
  return 8 + proficiencyBonus(level) + abilityModifier(castingStatScore);
}

export function spellAttackBonus(castingStatScore: number, level: number): number {
  return proficiencyBonus(level) + abilityModifier(castingStatScore);
}

export function totalCarriedWeight(inventory: InventoryItem[]): number {
  return inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
}

export function carryStatus(strScore: number, carriedKg: number): 'normal' | 'encumbered' | 'heavily_encumbered' | 'over' {
  const max = CARRY_CAPACITY.max(strScore);
  const heavy = CARRY_CAPACITY.heavilyEncumbered(strScore);
  const normal = CARRY_CAPACITY.normal(strScore);
  if (carriedKg > max) return 'over';
  if (carriedKg > heavy) return 'heavily_encumbered';
  if (carriedKg > normal) return 'encumbered';
  return 'normal';
}

export function initiative(sheet: CharacterSheet): number {
  return (sheet.initiativeBonus ?? 0) + abilityModifier(sheet.stats.dex);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function hpPercentage(current: number, max: number): number {
  if (max === 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / max) * 100)));
}

export function hpColor(percentage: number): 'green' | 'yellow' | 'red' | 'critical' {
  if (percentage > 60) return 'green';
  if (percentage > 30) return 'yellow';
  if (percentage > 0) return 'red';
  return 'critical';
}
