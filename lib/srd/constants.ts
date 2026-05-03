// D&D 5e (2014) — static game constants, never change
// ASI levels verificati dal SRD ufficiale via dnd5eapi.co/api/2014

export const ASI_LEVELS: Record<string, number[]> = {
  default:   [4, 8, 12, 16, 19],
  fighter:   [4, 6, 8, 12, 14, 16, 19],
  rogue:     [4, 8, 10, 12, 16, 19],
};

export function getAsiLevels(classKey: string): number[] {
  return ASI_LEVELS[classKey] ?? ASI_LEVELS.default;
}

export function isAsiLevel(classKey: string, level: number): boolean {
  return getAsiLevels(classKey).includes(level);
}

// Numero di abilità da classe in cui si può essere competenti (scelta del giocatore)
export const CLASS_SKILL_CHOICES: Record<string, number> = {
  barbarian: 2, bard: 3, cleric: 2, druid: 2,
  fighter: 2, monk: 2, paladin: 2, ranger: 3,
  rogue: 4, sorcerer: 2, warlock: 2, wizard: 2,
};

export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
};

export const PROFICIENCY_BONUS: Record<number, number> = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
};

// Slots per slot level [1,2,3,4,5,6,7,8,9] — 0 = no slots at that level
export const SPELL_SLOTS_FULL: Record<number, number[]> = {
  1:  [2,0,0,0,0,0,0,0,0],
  2:  [3,0,0,0,0,0,0,0,0],
  3:  [4,2,0,0,0,0,0,0,0],
  4:  [4,3,0,0,0,0,0,0,0],
  5:  [4,3,2,0,0,0,0,0,0],
  6:  [4,3,3,0,0,0,0,0,0],
  7:  [4,3,3,1,0,0,0,0,0],
  8:  [4,3,3,2,0,0,0,0,0],
  9:  [4,3,3,3,1,0,0,0,0],
  10: [4,3,3,3,2,0,0,0,0],
  11: [4,3,3,3,2,1,0,0,0],
  12: [4,3,3,3,2,1,0,0,0],
  13: [4,3,3,3,2,1,1,0,0],
  14: [4,3,3,3,2,1,1,0,0],
  15: [4,3,3,3,2,1,1,1,0],
  16: [4,3,3,3,2,1,1,1,0],
  17: [4,3,3,3,2,1,1,1,1],
  18: [4,3,3,3,3,1,1,1,1],
  19: [4,3,3,3,3,2,1,1,1],
  20: [4,3,3,3,3,2,2,1,1],
};

export const SPELL_SLOTS_HALF: Record<number, number[]> = {
  1:  [0,0,0,0,0],
  2:  [2,0,0,0,0],
  3:  [3,0,0,0,0],
  4:  [3,0,0,0,0],
  5:  [4,2,0,0,0],
  6:  [4,2,0,0,0],
  7:  [4,3,0,0,0],
  8:  [4,3,0,0,0],
  9:  [4,3,2,0,0],
  10: [4,3,2,0,0],
  11: [4,3,3,0,0],
  12: [4,3,3,0,0],
  13: [4,3,3,1,0],
  14: [4,3,3,1,0],
  15: [4,3,3,2,0],
  16: [4,3,3,2,0],
  17: [4,3,3,3,1],
  18: [4,3,3,3,1],
  19: [4,3,3,3,2],
  20: [4,3,3,3,2],
};

// Warlock pact magic: { slots, slotLevel }
export const SPELL_SLOTS_PACT: Record<number, { slots: number; slotLevel: number }> = {
  1:  { slots: 1, slotLevel: 1 },
  2:  { slots: 2, slotLevel: 1 },
  3:  { slots: 2, slotLevel: 2 },
  4:  { slots: 2, slotLevel: 2 },
  5:  { slots: 2, slotLevel: 3 },
  6:  { slots: 2, slotLevel: 3 },
  7:  { slots: 2, slotLevel: 4 },
  8:  { slots: 2, slotLevel: 4 },
  9:  { slots: 2, slotLevel: 5 },
  10: { slots: 2, slotLevel: 5 },
  11: { slots: 3, slotLevel: 5 },
  12: { slots: 3, slotLevel: 5 },
  13: { slots: 3, slotLevel: 5 },
  14: { slots: 3, slotLevel: 5 },
  15: { slots: 3, slotLevel: 5 },
  16: { slots: 3, slotLevel: 5 },
  17: { slots: 4, slotLevel: 5 },
  18: { slots: 4, slotLevel: 5 },
  19: { slots: 4, slotLevel: 5 },
  20: { slots: 4, slotLevel: 5 },
};

// Third caster (Eldritch Knight, Arcane Trickster) — starts at class level 3
export const SPELL_SLOTS_THIRD: Record<number, number[]> = {
  1:  [0,0,0,0], 2:  [0,0,0,0],
  3:  [2,0,0,0], 4:  [3,0,0,0],
  5:  [3,0,0,0], 6:  [3,0,0,0],
  7:  [4,2,0,0], 8:  [4,2,0,0],
  9:  [4,2,0,0], 10: [4,3,0,0],
  11: [4,3,0,0], 12: [4,3,0,0],
  13: [4,3,2,0], 14: [4,3,2,0],
  15: [4,3,2,0], 16: [4,3,3,0],
  17: [4,3,3,0], 18: [4,3,3,0],
  19: [4,3,3,1], 20: [4,3,3,1],
};

// kg carry capacity thresholds
export const CARRY_CAPACITY = {
  normal: (str: number) => str * 7.5,
  encumbered: (str: number) => str * 7.5,
  heavilyEncumbered: (str: number) => str * 11.25,
  max: (str: number) => str * 15,
};

export function getLevelFromXp(xp: number): number {
  let level = 1;
  for (let l = 20; l >= 2; l--) {
    if (xp >= XP_THRESHOLDS[l]) { level = l; break; }
  }
  return level;
}

export function getXpForNextLevel(level: number): number | null {
  return XP_THRESHOLDS[level + 1] ?? null;
}
