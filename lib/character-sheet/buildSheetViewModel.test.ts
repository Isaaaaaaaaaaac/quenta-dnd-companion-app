import { describe, it, expect } from 'vitest';
import { buildSheetViewModel } from './buildSheetViewModel';
import type { Character, CharacterSheet, CharacterSpellSlot } from '@/lib/db/schema';

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-1', name: 'Thorin', type: 'pc',
    hpCurrent: 42, hpMax: 56, hpTemp: 0,
    level: 6, xp: 14000,
    sheet: {} as CharacterSheet,
    campaignId: null, userId: null,
    createdAt: '', updatedAt: '',
    ...overrides,
  } as Character;
}

function makeSheet(overrides: Partial<CharacterSheet> = {}): CharacterSheet {
  return {
    classes: [{ classKey: 'cleric', level: 6 }],
    stats: { str: 14, dex: 12, con: 15, int: 10, wis: 17, cha: 8 },
    savingThrowProficiencies: { str: false, dex: false, con: true, int: false, wis: true, cha: false },
    skills: { perception: { proficient: true, expertise: false } },
    inventory: [],
    money: { pp: 0, gp: 45, ep: 0, sp: 12, cp: 30 },
    pinnedFeatures: [],
    ...overrides,
  } as CharacterSheet;
}

describe('buildSheetViewModel', () => {
  it('computes proficiency bonus, hp percentage and color for a level 6 character', () => {
    const model = buildSheetViewModel(makeCharacter(), makeSheet(), []);
    expect(model.prof).toBe(3);
    expect(model.hpPct).toBe(75);
    expect(model.hpColor).toBe('var(--hp-healthy)');
  });

  it('flags the character as a caster when its class has a spellcasting ability', () => {
    const model = buildSheetViewModel(makeCharacter(), makeSheet(), []);
    expect(model.canCast).toBe(true);
    expect(model.spellDC).not.toBeNull();
  });

  it('flags the character as a non-caster when no class casts spells', () => {
    const sheet = makeSheet({ classes: [{ classKey: 'fighter', level: 6 }] });
    const model = buildSheetViewModel(makeCharacter(), sheet, []);
    expect(model.canCast).toBe(false);
    expect(model.spellDC).toBeNull();
    expect(model.spellAtk).toBeNull();
  });

  it('computes xp progress toward next level', () => {
    const model = buildSheetViewModel(makeCharacter({ level: 6, xp: 14000 }), makeSheet(), []);
    expect(model.nextXp).toBe(23000);
    expect(model.xpPct).toBe(0);
    expect(model.canLevelUp).toBe(false);
  });

  it('marks canLevelUp true once xp reaches the next threshold', () => {
    const model = buildSheetViewModel(makeCharacter({ level: 6, xp: 23000 }), makeSheet(), []);
    expect(model.canLevelUp).toBe(true);
  });

  it('splits pinnedFeatures into passive and active by resourceKey presence', () => {
    const sheet = makeSheet({
      pinnedFeatures: [
        { key: 'a', type: 'class', name: 'Passiva' },
        { key: 'b', type: 'class', name: 'Attiva', resourceKey: 'channel_divinity', resetType: 'short' },
      ],
    });
    const model = buildSheetViewModel(makeCharacter(), sheet, []);
    expect(model.pinnedAll).toHaveLength(2);
    expect(model.pinnedPassive).toHaveLength(1);
    expect(model.pinnedActive).toHaveLength(1);
    expect(model.pinnedActive[0].key).toBe('b');
  });

  it('only includes spell slots with a positive total, sorted by level', () => {
    const slots = [
      { characterId: 'char-1', slotLevel: 3, total: 3, used: 0 },
      { characterId: 'char-1', slotLevel: 1, total: 4, used: 1 },
      { characterId: 'char-1', slotLevel: 5, total: 0, used: 0 },
    ] as CharacterSpellSlot[];
    const model = buildSheetViewModel(makeCharacter(), makeSheet(), slots);
    expect(model.activeSpellSlots.map(s => s.slotLevel)).toEqual([1, 3]);
  });
});
