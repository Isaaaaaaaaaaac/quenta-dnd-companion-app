export type SpellcastingType = 'full' | 'half' | 'third' | 'pact' | 'none';
export type ResetType = 'short' | 'long' | 'dawn';

export interface ClassResource {
  key: string;
  name: string;
  maxByLevel: Record<number, number>;
  resetType: ResetType;
}

export interface DndClass {
  key: string;
  name: string;
  hitDie: number;
  spellcastingType: SpellcastingType;
  spellcastingAbility?: string;
  savingThrows: string[];
  resources: ClassResource[];
}

export const CLASSES: DndClass[] = [
  {
    key: 'barbarian',
    name: 'Barbaro',
    hitDie: 12,
    spellcastingType: 'none',
    savingThrows: ['str', 'con'],
    resources: [
      {
        key: 'rage',
        name: 'Furia',
        resetType: 'long',
        maxByLevel: { 1:2,2:2,3:3,4:3,5:3,6:4,7:4,8:4,9:4,10:4,11:4,12:5,13:5,14:5,15:5,16:5,17:6,18:6,19:6,20:999 },
      },
    ],
  },
  {
    key: 'bard',
    name: 'Bardo',
    hitDie: 8,
    spellcastingType: 'full',
    spellcastingAbility: 'cha',
    savingThrows: ['dex', 'cha'],
    resources: [
      {
        key: 'bardic_inspiration',
        name: 'Ispirazione Bardica',
        resetType: 'short',
        maxByLevel: { 1:2,2:2,3:2,4:3,5:3,6:3,7:3,8:4,9:4,10:5,11:5,12:5,13:5,14:5,15:5,16:5,17:5,18:5,19:5,20:5 },
      },
    ],
  },
  {
    key: 'cleric',
    name: 'Chierico',
    hitDie: 8,
    spellcastingType: 'full',
    spellcastingAbility: 'wis',
    savingThrows: ['wis', 'cha'],
    resources: [
      {
        key: 'channel_divinity',
        name: 'Incanalare Divinità',
        resetType: 'short',
        maxByLevel: { 1:0,2:1,3:1,4:1,5:1,6:2,7:2,8:2,9:2,10:2,11:2,12:2,13:2,14:2,15:2,16:2,17:2,18:3,19:3,20:3 },
      },
    ],
  },
  {
    key: 'druid',
    name: 'Druido',
    hitDie: 8,
    spellcastingType: 'full',
    spellcastingAbility: 'wis',
    savingThrows: ['int', 'wis'],
    resources: [
      {
        key: 'wild_shape',
        name: 'Forma Selvatica',
        resetType: 'short',
        maxByLevel: { 2:2,3:2,4:2,5:2,6:2,7:2,8:2,9:2,10:2,11:2,12:2,13:2,14:2,15:2,16:2,17:2,18:2,19:2,20:2 },
      },
    ],
  },
  {
    key: 'fighter',
    name: 'Guerriero',
    hitDie: 10,
    spellcastingType: 'none',
    savingThrows: ['str', 'con'],
    resources: [
      {
        key: 'action_surge',
        name: 'Scatto d\'Azione',
        resetType: 'short',
        maxByLevel: { 1:0,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1,13:1,14:1,15:1,16:1,17:2,18:2,19:2,20:2 },
      },
      {
        key: 'second_wind',
        name: 'Secondo Respiro',
        resetType: 'short',
        maxByLevel: { 1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1,13:1,14:1,15:1,16:1,17:1,18:1,19:1,20:1 },
      },
      {
        key: 'indomitable',
        name: 'Indomabile',
        resetType: 'long',
        maxByLevel: { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:1,10:1,11:1,12:1,13:2,14:2,15:2,16:2,17:3,18:3,19:3,20:3 },
      },
    ],
  },
  {
    key: 'monk',
    name: 'Monaco',
    hitDie: 8,
    spellcastingType: 'none',
    savingThrows: ['str', 'dex'],
    resources: [
      {
        key: 'ki',
        name: 'Punti Ki',
        resetType: 'short',
        maxByLevel: { 1:0,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:12,13:13,14:14,15:15,16:16,17:17,18:18,19:19,20:20 },
      },
    ],
  },
  {
    key: 'paladin',
    name: 'Paladino',
    hitDie: 10,
    spellcastingType: 'half',
    spellcastingAbility: 'cha',
    savingThrows: ['wis', 'cha'],
    resources: [
      {
        key: 'channel_divinity',
        name: 'Incanalare Divinità',
        resetType: 'short',
        maxByLevel: { 1:0,2:0,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1,13:1,14:1,15:1,16:1,17:1,18:1,19:1,20:1 },
      },
      {
        key: 'lay_on_hands',
        name: 'Imposizione delle Mani',
        resetType: 'long',
        maxByLevel: { 1:5,2:10,3:15,4:20,5:25,6:30,7:35,8:40,9:45,10:50,11:55,12:60,13:65,14:70,15:75,16:80,17:85,18:90,19:95,20:100 },
      },
    ],
  },
  {
    key: 'ranger',
    name: 'Ranger',
    hitDie: 10,
    spellcastingType: 'half',
    spellcastingAbility: 'wis',
    savingThrows: ['str', 'dex'],
    resources: [],
  },
  {
    key: 'rogue',
    name: 'Ladro',
    hitDie: 8,
    spellcastingType: 'none',
    savingThrows: ['dex', 'int'],
    resources: [
      {
        key: 'cunning_action',
        name: 'Azione Scaltra',
        resetType: 'short',
        maxByLevel: { 2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1,13:1,14:1,15:1,16:1,17:1,18:1,19:1,20:1 },
      },
    ],
  },
  {
    key: 'sorcerer',
    name: 'Stregone',
    hitDie: 6,
    spellcastingType: 'full',
    spellcastingAbility: 'cha',
    savingThrows: ['con', 'cha'],
    resources: [
      {
        key: 'sorcery_points',
        name: 'Punti Stregoneria',
        resetType: 'long',
        maxByLevel: { 1:0,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:12,13:13,14:14,15:15,16:16,17:17,18:18,19:19,20:20 },
      },
    ],
  },
  {
    key: 'warlock',
    name: 'Warlock',
    hitDie: 8,
    spellcastingType: 'pact',
    spellcastingAbility: 'cha',
    savingThrows: ['wis', 'cha'],
    resources: [],
  },
  {
    key: 'wizard',
    name: 'Mago',
    hitDie: 6,
    spellcastingType: 'full',
    spellcastingAbility: 'int',
    savingThrows: ['int', 'wis'],
    resources: [
      {
        key: 'arcane_recovery',
        name: 'Recupero Arcano',
        resetType: 'long',
        maxByLevel: { 1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1,13:1,14:1,15:1,16:1,17:1,18:1,19:1,20:1 },
      },
    ],
  },
];

export function getClass(key: string): DndClass | undefined {
  return CLASSES.find(c => c.key === key);
}
