// D&D 5e SRD 2014 — armi e armature

export type WeaponCategory = 'semplice_mischia' | 'semplice_distanza' | 'marziale_mischia' | 'marziale_distanza';
export type DamageType = 'perforante' | 'tagliente' | 'contundente';
export type WeaponProperty = 'accurata' | 'versatile' | 'leggera' | 'pesante' | 'a_due_mani' | 'lanciabile' | 'munizioni' | 'portata' | 'speciale';

export interface SrdWeapon {
  key: string;
  name: string;
  category: WeaponCategory;
  damageDice: string;
  damageDice2h?: string;    // per armi versatili
  damageType: DamageType;
  properties: WeaponProperty[];
  range?: string;           // es. "18/60m"
  weight: number;           // kg
  cost: string;             // es. "2 PO"
  icon: string;             // nome icona @iconify-json/game-icons (es. "daggers")
}

export const WEAPONS: SrdWeapon[] = [
  // ─── Semplici mischia ──────────────────────────────────────────
  { key: 'club',          name: 'Clava',            category: 'semplice_mischia',   damageDice: '1d4', damageType: 'contundente', properties: ['leggera'],              weight: 1,   cost: '1 PA', icon: 'wood-club' },
  { key: 'dagger',        name: 'Pugnale',          category: 'semplice_mischia',   damageDice: '1d4', damageType: 'perforante',  properties: ['accurata','lanciabile','leggera'], range: '6/18m', weight: 0.5, cost: '2 PO', icon: 'daggers' },
  { key: 'greatclub',     name: 'Clava Grande',     category: 'semplice_mischia',   damageDice: '1d8', damageType: 'contundente', properties: ['a_due_mani'],           weight: 5,   cost: '2 PA', icon: 'wood-club' },
  { key: 'handaxe',       name: 'Ascia a Mano',     category: 'semplice_mischia',   damageDice: '1d6', damageType: 'tagliente',   properties: ['leggera','lanciabile'], range: '6/18m', weight: 1,   cost: '5 PO', icon: 'battle-axe' },
  { key: 'javelin',       name: 'Giavellotto',      category: 'semplice_mischia',   damageDice: '1d6', damageType: 'perforante',  properties: ['lanciabile'],          range: '9/36m', weight: 1,   cost: '5 PA', icon: 'thrown-spear' },
  { key: 'light_hammer',  name: 'Martello Leggero', category: 'semplice_mischia',   damageDice: '1d4', damageType: 'contundente', properties: ['leggera','lanciabile'], range: '6/18m', weight: 1,   cost: '2 PO', icon: 'warhammer' },
  { key: 'mace',          name: 'Mazza',            category: 'semplice_mischia',   damageDice: '1d6', damageType: 'contundente', properties: [],                       weight: 2,   cost: '5 PO', icon: 'mace-head' },
  { key: 'quarterstaff',  name: 'Bastone',          category: 'semplice_mischia',   damageDice: '1d6', damageType: 'contundente', damageDice2h: '1d8', properties: ['versatile'],  weight: 2,   cost: '2 PA', icon: 'wizard-staff' },
  { key: 'sickle',        name: 'Falcetto',         category: 'semplice_mischia',   damageDice: '1d4', damageType: 'tagliente',   properties: ['leggera'],              weight: 1,   cost: '1 PO', icon: 'sickle' },
  { key: 'spear',         name: 'Lancia',           category: 'semplice_mischia',   damageDice: '1d6', damageType: 'perforante',  damageDice2h: '1d8', properties: ['lanciabile','versatile'], range: '6/18m', weight: 1.5, cost: '1 PO', icon: 'spear-feather' },
  // ─── Semplici distanza ─────────────────────────────────────────
  { key: 'crossbow_light',name: 'Balestra Leggera', category: 'semplice_distanza',  damageDice: '1d8', damageType: 'perforante',  properties: ['munizioni','pesante'],  range: '24/96m', weight: 2.5, cost: '25 PO', icon: 'crossbow' },
  { key: 'dart',          name: 'Dardo',            category: 'semplice_distanza',  damageDice: '1d4', damageType: 'perforante',  properties: ['accurata','lanciabile'],range: '6/18m', weight: 0.1, cost: '5 PR', icon: 'dart' },
  { key: 'shortbow',      name: 'Arco Corto',       category: 'semplice_distanza',  damageDice: '1d6', damageType: 'perforante',  properties: ['munizioni','a_due_mani'],range: '24/96m', weight: 1,   cost: '25 PO', icon: 'bow-string' },
  { key: 'sling',         name: 'Fionda',           category: 'semplice_distanza',  damageDice: '1d4', damageType: 'contundente', properties: ['munizioni'],            range: '9/36m', weight: 0,   cost: '1 PA', icon: 'sling' },
  // ─── Marziali mischia ──────────────────────────────────────────
  { key: 'battleaxe',     name: 'Ascia da Battaglia',category: 'marziale_mischia',  damageDice: '1d8', damageType: 'tagliente',  damageDice2h: '1d10', properties: ['versatile'],  weight: 2,   cost: '10 PO', icon: 'battle-axe' },
  { key: 'flail',         name: 'Flagello',         category: 'marziale_mischia',   damageDice: '1d8', damageType: 'contundente', properties: [],                       weight: 1,   cost: '10 PO', icon: 'flail' },
  { key: 'glaive',        name: 'Glaive',           category: 'marziale_mischia',   damageDice: '1d10',damageType: 'tagliente',   properties: ['pesante','portata','a_due_mani'], weight: 3,   cost: '20 PO', icon: 'glaive' },
  { key: 'greataxe',      name: 'Ascia Grande',     category: 'marziale_mischia',   damageDice: '1d12',damageType: 'tagliente',   properties: ['pesante','a_due_mani'], weight: 3.5, cost: '30 PO', icon: 'war-axe' },
  { key: 'greatsword',    name: 'Spada a Due Mani', category: 'marziale_mischia',   damageDice: '2d6', damageType: 'tagliente',   properties: ['pesante','a_due_mani'], weight: 3,   cost: '50 PO', icon: 'two-handed-sword' },
  { key: 'longsword',     name: 'Spada Lunga',      category: 'marziale_mischia',   damageDice: '1d8', damageType: 'tagliente',  damageDice2h: '1d10', properties: ['versatile'],  weight: 1.5, cost: '15 PO', icon: 'broadsword' },
  { key: 'rapier',        name: 'Stocco',           category: 'marziale_mischia',   damageDice: '1d8', damageType: 'perforante',  properties: ['accurata'],             weight: 1,   cost: '25 PO', icon: 'piercing-sword' },
  { key: 'scimitar',      name: 'Scimitarra',       category: 'marziale_mischia',   damageDice: '1d6', damageType: 'tagliente',   properties: ['accurata','leggera'],   weight: 1.5, cost: '25 PO', icon: 'crescent-blade' },
  { key: 'shortsword',    name: 'Spada Corta',      category: 'marziale_mischia',   damageDice: '1d6', damageType: 'perforante',  properties: ['accurata','leggera'],   weight: 1,   cost: '10 PO', icon: 'shard-sword' },
  { key: 'warhammer',     name: 'Martello da Guerra',category: 'marziale_mischia',  damageDice: '1d8', damageType: 'contundente', damageDice2h: '1d10', properties: ['versatile'],  weight: 2,   cost: '15 PO', icon: 'warhammer' },
  { key: 'lance',         name: 'Lancia da Cavaliere',category: 'marziale_mischia', damageDice: '1d12',damageType: 'perforante',  properties: ['portata','speciale'],  weight: 3,   cost: '10 PO', icon: 'barbed-spear' },
  { key: 'maul',          name: 'Mazza Ferrata',    category: 'marziale_mischia',   damageDice: '2d6', damageType: 'contundente', properties: ['pesante','a_due_mani'], weight: 5,   cost: '10 PO', icon: 'warhammer' },
  { key: 'morningstar',   name: 'Spada Stellata',   category: 'marziale_mischia',   damageDice: '1d8', damageType: 'perforante',  properties: [],                       weight: 2,   cost: '15 PO', icon: 'spiked-mace' },
  { key: 'pike',          name: 'Picca',            category: 'marziale_mischia',   damageDice: '1d10',damageType: 'perforante',  properties: ['pesante','portata','a_due_mani'], weight: 9, cost: '5 PO', icon: 'spears' },
  { key: 'trident',       name: 'Tridente',         category: 'marziale_mischia',   damageDice: '1d6', damageType: 'perforante', damageDice2h: '1d8', properties: ['lanciabile','versatile'], range: '6/18m', weight: 2, cost: '5 PO', icon: 'trident' },
  { key: 'war_pick',      name: 'Piccozza da Guerra',category: 'marziale_mischia',  damageDice: '1d8', damageType: 'perforante',  properties: [],                       weight: 1,   cost: '5 PO', icon: 'war-pick' },
  { key: 'whip',          name: 'Frustino',         category: 'marziale_mischia',   damageDice: '1d4', damageType: 'tagliente',   properties: ['accurata','portata'],  weight: 1,   cost: '2 PO', icon: 'whip' },
  { key: 'hand_crossbow', name: 'Balestra a Mano',  category: 'marziale_distanza',  damageDice: '1d6', damageType: 'perforante',  properties: ['leggera','munizioni'],  range: '9/36m',  weight: 1.5, cost: '75 PO', icon: 'crossbow' },
  { key: 'crossbow_heavy',name: 'Balestra Pesante', category: 'marziale_distanza',  damageDice: '1d10',damageType: 'perforante',  properties: ['pesante','munizioni','a_due_mani'], range: '30/120m', weight: 9, cost: '50 PO', icon: 'crossbow' },
  { key: 'blowgun',       name: 'Cerbottana',       category: 'marziale_distanza',  damageDice: '1',   damageType: 'perforante',  properties: ['munizioni'],            range: '7,5/30m', weight: 1, cost: '10 PO', icon: 'straight-pipe' },
  { key: 'longbow',       name: 'Arco Lungo',       category: 'marziale_distanza',  damageDice: '1d8', damageType: 'perforante',  properties: ['munizioni','pesante','a_due_mani'], range: '45/180m', weight: 1, cost: '50 PO', icon: 'bow-arrow' },
];

export type ArmorType = 'leggera' | 'media' | 'pesante' | 'scudo';

export interface SrdArmor {
  key: string;
  name: string;
  type: ArmorType;
  baseAC: number;
  maxDexBonus: number | null;   // null = nessun limite
  stealthDisadvantage: boolean;
  strRequired?: number;
  weight: number;
  cost: string;
  icon: string;             // nome icona @iconify-json/game-icons (es. "shield")
}

export const ARMORS: SrdArmor[] = [
  // Leggere
  { key: 'padded',          name: 'Imbottita',          type: 'leggera',  baseAC: 11, maxDexBonus: null, stealthDisadvantage: true,  weight: 4,   cost: '5 PO', icon: 'armor-vest' },
  { key: 'leather',         name: 'Di Cuoio',           type: 'leggera',  baseAC: 11, maxDexBonus: null, stealthDisadvantage: false, weight: 5,   cost: '10 PO', icon: 'leather-armor' },
  { key: 'studded_leather', name: 'Di Cuoio Borchiato', type: 'leggera',  baseAC: 12, maxDexBonus: null, stealthDisadvantage: false, weight: 6.5, cost: '45 PO', icon: 'spiked-armor' },
  // Medie
  { key: 'hide',            name: 'Di Pelle Grezza',    type: 'media',    baseAC: 12, maxDexBonus: 2,    stealthDisadvantage: false, weight: 6,   cost: '10 PO', icon: 'layered-armor' },
  { key: 'chain_shirt',     name: 'Cotta di Maglia',    type: 'media',    baseAC: 13, maxDexBonus: 2,    stealthDisadvantage: false, weight: 10,  cost: '50 PO', icon: 'chain-mail' },
  { key: 'scale_mail',      name: 'Di Scaglie',         type: 'media',    baseAC: 14, maxDexBonus: 2,    stealthDisadvantage: true,  weight: 20,  cost: '50 PO', icon: 'scale-mail' },
  { key: 'breastplate',     name: 'Pettorale',          type: 'media',    baseAC: 14, maxDexBonus: 2,    stealthDisadvantage: false, weight: 10,  cost: '400 PO', icon: 'breastplate' },
  { key: 'half_plate',      name: 'Mezza Armatura',     type: 'media',    baseAC: 15, maxDexBonus: 2,    stealthDisadvantage: true,  weight: 20,  cost: '750 PO', icon: 'armor-cuisses' },
  // Pesanti
  { key: 'ring_mail',       name: 'Di Anelli',          type: 'pesante',  baseAC: 14, maxDexBonus: 0,    stealthDisadvantage: true,  weight: 20,  cost: '30 PO', icon: 'lamellar' },
  { key: 'chain_mail',      name: 'Cotta di Piastre',   type: 'pesante',  baseAC: 16, maxDexBonus: 0,    stealthDisadvantage: true,  strRequired: 13, weight: 27.5, cost: '75 PO', icon: 'metal-plate' },
  { key: 'splint',          name: 'A Stecche',          type: 'pesante',  baseAC: 17, maxDexBonus: 0,    stealthDisadvantage: true,  strRequired: 15, weight: 30,  cost: '200 PO', icon: 'chest-armor' },
  { key: 'plate',           name: 'A Piastre',          type: 'pesante',  baseAC: 18, maxDexBonus: 0,    stealthDisadvantage: true,  strRequired: 15, weight: 32.5, cost: '1500 PO', icon: 'trench-body-armor' },
  // Scudo
  { key: 'shield',          name: 'Scudo',              type: 'scudo',    baseAC: 2,  maxDexBonus: null, stealthDisadvantage: false, weight: 3,   cost: '10 PO', icon: 'shield' },
];

export const ITEM_RARITIES = ['comune', 'non comune', 'raro', 'molto raro', 'leggendario', 'artefatto'] as const;
export type ItemRarity = typeof ITEM_RARITIES[number];

export function calcAC(
  armorKey: string | null,
  hasShield: boolean,
  dexMod: number,
  classKey?: string,
  strScore?: number,
  monkLevel?: number,
  wisBonus?: number,
): number {
  if (!armorKey) {
    // Senza armatura
    if (classKey === 'barbarian' && strScore) {
      const conMod = 0; // passed separately if needed
      return 10 + dexMod;
    }
    if (classKey === 'monk' && wisBonus !== undefined) {
      return 10 + dexMod + wisBonus;
    }
    return 10 + dexMod + (hasShield ? 2 : 0);
  }
  const armor = ARMORS.find(a => a.key === armorKey);
  if (!armor) return 10 + dexMod + (hasShield ? 2 : 0);

  let ac = armor.baseAC;
  if (armor.maxDexBonus === null) ac += dexMod;
  else if (armor.maxDexBonus > 0) ac += Math.min(dexMod, armor.maxDexBonus);
  if (hasShield) ac += 2;
  return ac;
}

// ── Mappa legacy: ID italiano di vecchi modal → chiave SRD inglese ──────────
// Necessaria per item salvati prima che i modal fossero allineati ai key SRD.
export const LEGACY_SRD_KEY_ALIASES: Record<string, string> = {
  // Armi — nomi italiani diversi dalla traduzione SRD
  'daga':       'dagger',      // Daga → Pugnale
  'randello':   'club',        // Randello → Clava
  'lancia':     'javelin',     // Lancia → Giavellotto
  'spadone':    'greatsword',  // Spadone → Spada a Due Mani
  'alabarda':   'glaive',      // Alabarda → Glaive (halberd in SRD è separato)
  'balestra-l': 'crossbow_light',
  'balestra-m': 'hand_crossbow',
  // Armature
  'cuoio':      'leather',     // Cuoio → Di Cuoio
  'cuoio-b':    'studded_leather', // Cuoio Borchiato → Di Cuoio Borchiato
  'pettorale':  'breastplate', // Corazza Pettorale → Pettorale
  'arm-piastre':'plate',       // Armatura di Piastre → A Piastre
  'giaco':      'chain_mail',  // Giaco di Maglia → Cotta di Piastre (CA 16, pesante)
  'arm-anelli': 'ring_mail',
};

/** Traduce un id legacy in chiave SRD, se mappato; altrimenti lo lascia invariato. */
export function resolveSrdKey(srdKey?: string): string | undefined {
  return LEGACY_SRD_KEY_ALIASES[srdKey ?? ''] ?? srdKey;
}

/** Cerca un'arma per chiave SRD (con alias legacy), poi per nome (case-insensitive). */
export function findWeaponByKeyOrName(item: { srdKey?: string; name: string }): SrdWeapon | undefined {
  const key = resolveSrdKey(item.srdKey);
  return WEAPONS.find(w => w.key === key || w.name.toLowerCase() === item.name.toLowerCase());
}

/** Cerca un'armatura per chiave SRD (con alias legacy), poi per nome (case-insensitive). */
export function findArmorByKeyOrName(item: { srdKey?: string; name: string }): SrdArmor | undefined {
  const key = resolveSrdKey(item.srdKey);
  return ARMORS.find(a => a.key === key || a.name.toLowerCase() === item.name.toLowerCase());
}
