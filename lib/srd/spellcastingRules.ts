// D&D 5e SRD 2014 — regole complete sugli incantesimi per classe
// Fonte: SRD 5.1 verificato su dnd5eapi.co

import { SPELL_SLOTS_FULL, SPELL_SLOTS_HALF } from './constants';
import type { CharacterStats } from '@/lib/db/schema';
import { abilityModifier } from '@/lib/rules/calculations';

export type CasterType = 'prepared_full' | 'prepared_half' | 'spontaneous' | 'pact' | 'none';

// Cantrip noti a ogni livello (indice 0 = livello 1)
export const CANTRIPS_KNOWN: Record<string, number[]> = {
  bard:     [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  cleric:   [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
  druid:    [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  sorcerer: [4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6],
  warlock:  [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  wizard:   [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
};

// Incantesimi noti (incantatori spontanei) — indice 0 = livello 1
// Mago: non usa questa tabella (usa il libro degli incantesimi)
export const SPELLS_KNOWN: Record<string, number[]> = {
  bard:     [4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22],
  ranger:   [0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11],
  sorcerer: [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15],
  warlock:  [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,14,15],
};

// Capacità libro degli incantesimi del Mago: 6 + (livello-1)*2
export function wizardSpellbookCapacity(level: number): number {
  return 6 + (level - 1) * 2;
}

// Tipo incantatore per classe
export const CASTER_TYPE: Record<string, CasterType> = {
  bard:     'spontaneous',
  cleric:   'prepared_full',
  druid:    'prepared_full',
  paladin:  'prepared_half',
  ranger:   'spontaneous',
  sorcerer: 'spontaneous',
  warlock:  'pact',
  wizard:   'prepared_full',
};

// Caratteristica usata per il calcolo degli incantesimi
export const SPELLCASTING_ABILITY: Record<string, keyof CharacterStats> = {
  bard:     'cha',
  cleric:   'wis',
  druid:    'wis',
  paladin:  'cha',
  ranger:   'wis',
  sorcerer: 'cha',
  warlock:  'cha',
  wizard:   'int',
};

/** Livello massimo di slot a cui il personaggio ha accesso */
export function maxSpellLevelForClass(classKey: string, level: number): number {
  const cType = CASTER_TYPE[classKey];
  if (cType === 'none' || !cType) return 0;

  let slots: number[];
  if (cType === 'prepared_half' || (cType === 'spontaneous' && classKey === 'ranger')) {
    slots = SPELL_SLOTS_HALF[level] ?? [];
  } else if (cType === 'pact') {
    // Warlock: slot_level calcolato separatamente, qui restituiamo il livello di slot corrente
    const pactLevels = [1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5];
    return pactLevels[level - 1] ?? 0;
  } else {
    slots = SPELL_SLOTS_FULL[level] ?? [];
  }

  for (let i = slots.length - 1; i >= 0; i--) {
    if ((slots[i] ?? 0) > 0) return i + 1;
  }
  return 0;
}

/** Numero di cantrip conosciuti a questo livello */
export function cantripsKnownAt(classKey: string, level: number): number {
  return CANTRIPS_KNOWN[classKey]?.[level - 1] ?? 0;
}

/** Numero di incantesimi noti (spontanei) a questo livello */
export function spellsKnownAt(classKey: string, level: number): number {
  return SPELLS_KNOWN[classKey]?.[level - 1] ?? 0;
}

/** Numero massimo di incantesimi preparati (prepared casters) */
export function maxPreparedSpells(
  classKey: string,
  level: number,
  stats: CharacterStats,
): number {
  const ability = SPELLCASTING_ABILITY[classKey];
  if (!ability) return 0;
  const mod = abilityModifier(stats[ability]);

  if (classKey === 'wizard') {
    return Math.max(1, mod + level);
  }
  if (classKey === 'cleric' || classKey === 'druid') {
    return Math.max(1, mod + level);
  }
  if (classKey === 'paladin') {
    return Math.max(1, mod + Math.floor(level / 2));
  }
  return Math.max(1, mod + level);
}

/** Etichette italiane per il tipo di incantatore */
export function casterTypeLabel(classKey: string): string {
  const type = CASTER_TYPE[classKey];
  switch (type) {
    case 'spontaneous':  return 'Incantatore Spontaneo';
    case 'prepared_full': return classKey === 'wizard' ? 'Mago (Libro degli Incantesimi)' : 'Incantatore Preparato';
    case 'prepared_half': return 'Incantatore Preparato (½)';
    case 'pact':         return 'Magia del Patto (Warlock)';
    default:             return '';
  }
}

/** Spiega le regole del caster in italiano */
export function casterRulesDescription(classKey: string): string {
  const type = CASTER_TYPE[classKey];
  switch (type) {
    case 'spontaneous':
      return 'Conosci un numero fisso di incantesimi che puoi lanciare in qualsiasi momento. Non puoi cambiare gli incantesimi noti senza salire di livello (dove puoi sostituire 1 incantesimo).';
    case 'prepared_full':
      if (classKey === 'wizard')
        return 'Il tuo libro degli incantesimi contiene tutti gli incantesimi che hai imparato. Ogni giorno scegli quali preparare (INT mod + livello) dalla tua lista nel libro.';
      return 'Ogni giorno scegli quali incantesimi preparare dalla lista completa della tua classe (mod caratteristica + livello). Puoi preparare incantesimi di qualsiasi livello accessibile.';
    case 'prepared_half':
      return 'Ogni giorno scegli quali incantesimi preparare (mod CAR + metà livello, min. 1). Puoi preparare qualsiasi incantesimo della lista di classe di livello accessibile.';
    case 'pact':
      return 'Conosci un numero fisso di incantesimi (Magia del Patto). Recuperi tutti gli slot a ogni riposo breve o lungo.';
    default: return '';
  }
}
