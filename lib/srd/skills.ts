export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface Skill {
  key: string;
  name: string;
  ability: Ability;
}

export const SKILLS: Skill[] = [
  { key: 'acrobatics',      name: 'Acrobazia',          ability: 'dex' },
  { key: 'animal_handling', name: 'Addestrare Animali', ability: 'wis' },
  { key: 'arcana',          name: 'Arcano',              ability: 'int' },
  { key: 'athletics',       name: 'Atletica',            ability: 'str' },
  { key: 'deception',       name: 'Inganno',             ability: 'cha' },
  { key: 'history',         name: 'Storia',              ability: 'int' },
  { key: 'insight',         name: 'Intuizione',          ability: 'wis' },
  { key: 'intimidation',    name: 'Intimidire',          ability: 'cha' },
  { key: 'investigation',   name: 'Investigare',         ability: 'int' },
  { key: 'medicine',        name: 'Medicina',            ability: 'wis' },
  { key: 'nature',          name: 'Natura',              ability: 'int' },
  { key: 'perception',      name: 'Percezione',          ability: 'wis' },
  { key: 'performance',     name: 'Intrattenere',        ability: 'cha' },
  { key: 'persuasion',      name: 'Persuasione',         ability: 'cha' },
  { key: 'religion',        name: 'Religione',           ability: 'int' },
  { key: 'sleight_of_hand', name: 'Rapidità di Mano',   ability: 'dex' },
  { key: 'stealth',         name: 'Furtività',           ability: 'dex' },
  { key: 'survival',        name: 'Sopravvivenza',       ability: 'wis' },
];

export const ABILITY_NAMES: Record<Ability, string> = {
  str: 'Forza',
  dex: 'Destrezza',
  con: 'Costituzione',
  int: 'Intelligenza',
  wis: 'Saggezza',
  cha: 'Carisma',
};

export const ABILITY_SHORT: Record<Ability, string> = {
  str: 'FOR',
  dex: 'DES',
  con: 'COS',
  int: 'INT',
  wis: 'SAG',
  cha: 'CAR',
};

export function getSkill(key: string): Skill | undefined {
  return SKILLS.find(s => s.key === key);
}
