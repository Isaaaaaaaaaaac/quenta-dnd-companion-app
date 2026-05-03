import type { CharacterStats } from '@/lib/db/schema';

export type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface RacialBonus {
  type: 'fixed';
  bonuses: Partial<Record<StatKey, number>>;
}

export interface RacialBonusChoice {
  type: 'choice';
  count: number;          // quante caratteristiche scegliere
  amount: number;         // di quanto aumentarle (+1 ciascuna)
  exclude?: StatKey[];    // caratteristiche escluse dalla scelta
}

export interface SubRace {
  key: string;
  name: string;
  bonus: RacialBonus;
  speed?: number;
  traits?: string[];
}

export interface Race {
  key: string;
  name: string;
  description: string;
  speed: number;
  baseBonus: RacialBonus | RacialBonusChoice | null;
  subRaces?: SubRace[];
  traits: string[];
}

export const RACES: Race[] = [
  {
    key: 'human',
    name: 'Umano',
    description: 'Adattabili e ambiziosi. +1 a tutte le caratteristiche.',
    speed: 9,
    baseBonus: { type: 'fixed', bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 } },
    traits: ['Versatilità delle lingue'],
  },
  {
    key: 'human_variant',
    name: 'Umano (Variante)',
    description: '+1 a due caratteristiche a scelta, una competenza, un talento.',
    speed: 9,
    baseBonus: { type: 'choice', count: 2, amount: 1 },
    traits: ['Competenza (1 abilità a scelta)', 'Talento (1 talento a scelta)'],
  },
  {
    key: 'elf',
    name: 'Elfo',
    description: 'Creature magiche della natura, antiche e sagge.',
    speed: 9,
    baseBonus: { type: 'fixed', bonuses: { dex: 2 } },
    subRaces: [
      { key: 'high_elf', name: 'Alto Elfo', bonus: { type: 'fixed', bonuses: { int: 1 } }, traits: ['Trucchetto da Mago'] },
      { key: 'wood_elf', name: 'Elfo del Bosco', bonus: { type: 'fixed', bonuses: { wis: 1 } }, speed: 10.5, traits: ['Maschera della Natura Selvaggia'] },
      { key: 'dark_elf', name: 'Drow', bonus: { type: 'fixed', bonuses: { cha: 1 } }, traits: ['Magia Drow', 'Sensibilità alla Luce del Sole'] },
    ],
    traits: ['Visione nel Buio', 'Sensi Acuti', 'Discendenza Fatata', 'Trance'],
  },
  {
    key: 'dwarf',
    name: 'Nano',
    description: 'Creature robuste delle montagne, maestri nell\'artigianato.',
    speed: 7.5,
    baseBonus: { type: 'fixed', bonuses: { con: 2 } },
    subRaces: [
      { key: 'hill_dwarf', name: 'Nano delle Colline', bonus: { type: 'fixed', bonuses: { wis: 1 } }, traits: ['Tenacia Nanica (+1 HP per livello)'] },
      { key: 'mountain_dwarf', name: 'Nano delle Montagne', bonus: { type: 'fixed', bonuses: { str: 2 } }, traits: ['Addestramento con le Armature Naniche'] },
    ],
    traits: ['Visione nel Buio', 'Resilienza Nanica', 'Addestramento con le Armi Naniche', 'Conoscenza della Pietra'],
  },
  {
    key: 'halfling',
    name: 'Halfling',
    description: 'Piccoli e agili, con un talento speciale per la fortuna.',
    speed: 7.5,
    baseBonus: { type: 'fixed', bonuses: { dex: 2 } },
    subRaces: [
      { key: 'lightfoot', name: 'Piede Lesto', bonus: { type: 'fixed', bonuses: { cha: 1 } }, traits: ['Naturalmente Furtivo'] },
      { key: 'stout', name: 'Tarchiato', bonus: { type: 'fixed', bonuses: { con: 1 } }, traits: ['Resilienza Tarchiata'] },
    ],
    traits: ['Fortunato', 'Coraggioso', 'Agilità Halfling'],
  },
  {
    key: 'half_elf',
    name: 'Mezzelfo',
    description: '+2 CAR e +1 a due caratteristiche a scelta. Due competenze bonus.',
    speed: 9,
    baseBonus: { type: 'fixed', bonuses: { cha: 2 } },
    traits: ['Bonus +1 a due caratteristiche a scelta', 'Visione nel Buio', 'Resistenza Fatata', 'Poliedricità (2 abilità a scelta)'],
  },
  {
    key: 'half_orc',
    name: 'Mezzorco',
    description: 'Resistenti e potenti, con una ferocia naturale.',
    speed: 9,
    baseBonus: { type: 'fixed', bonuses: { str: 2, con: 1 } },
    traits: ['Visione nel Buio', 'Minaccioso', 'Resistenza Implacabile', 'Attacchi Selvaggi'],
  },
  {
    key: 'dragonborn',
    name: 'Draconico',
    description: 'Discendenti di draghi, fieri guerrieri con soffio dragonico.',
    speed: 9,
    baseBonus: { type: 'fixed', bonuses: { str: 2, cha: 1 } },
    traits: ['Ascendenza Draconica', 'Soffio Dragonico', 'Resistenza al Danno'],
  },
  {
    key: 'gnome',
    name: 'Gnomo',
    description: 'Piccoli inventori curiosi, con una magia innata.',
    speed: 7.5,
    baseBonus: { type: 'fixed', bonuses: { int: 2 } },
    subRaces: [
      { key: 'forest_gnome', name: 'Gnomo dei Boschi', bonus: { type: 'fixed', bonuses: { dex: 1 } }, traits: ['Illusionista Naturale', 'Parlare con i Piccoli Animali'] },
      { key: 'rock_gnome', name: 'Gnomo delle Rocce', bonus: { type: 'fixed', bonuses: { con: 1 } }, traits: ['Conoscitore Artigiano', 'Chiacchierono'] },
    ],
    traits: ['Visione nel Buio', 'Astuzia Gnomica'],
  },
  {
    key: 'tiefling',
    name: 'Tiefling',
    description: 'Discendenti di patti infernali. +2 CAR, +1 INT.',
    speed: 9,
    baseBonus: { type: 'fixed', bonuses: { int: 1, cha: 2 } },
    traits: ['Visione nel Buio', 'Resistenza Infernale', 'Lascito Infernale (magia)'],
  },
];

export function getRace(key: string): Race | undefined {
  return RACES.find(r => r.key === key);
}

export function applyRacialBonuses(
  stats: CharacterStats,
  raceKey: string,
  subraceKey: string,
  choiceKeys: StatKey[],
): CharacterStats {
  const race = getRace(raceKey);
  if (!race) return stats;

  const result = { ...stats };

  function applyBonus(bonus: RacialBonus | RacialBonusChoice) {
    if (bonus.type === 'fixed') {
      for (const [k, v] of Object.entries(bonus.bonuses)) {
        result[k as StatKey] = Math.min(20, result[k as StatKey] + (v ?? 0));
      }
    } else if (bonus.type === 'choice') {
      choiceKeys.slice(0, bonus.count).forEach(k => {
        result[k] = Math.min(20, result[k] + bonus.amount);
      });
    }
  }

  if (race.baseBonus) applyBonus(race.baseBonus);

  if (subraceKey) {
    const subrace = race.subRaces?.find(s => s.key === subraceKey);
    if (subrace) applyBonus(subrace.bonus);
  }

  // Half-elf: +1 a due caratteristiche a scelta (escluso CHA già +2)
  if (raceKey === 'half_elf' && choiceKeys.length >= 2) {
    choiceKeys.slice(0, 2).forEach(k => {
      if (k !== 'cha') result[k] = Math.min(20, result[k] + 1);
    });
  }

  return result;
}
