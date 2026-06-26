import { findWeaponByKeyOrName, findArmorByKeyOrName, type SrdWeapon, type SrdArmor, type WeaponProperty, type WeaponCategory } from './equipment';
import { findGearItemByKeyOrName } from './gear';
import { findMagicItemByKeyOrName, MAGIC_ITEM_ICON } from './magicItems';

/** Icona generica per un item senza alcuna corrispondenza SRD (nome/chiave inventati o errati). */
export const FALLBACK_ITEM_ICON = 'chest';

export interface SrdLookupItem {
  srdKey?: string;
  name: string;
}

const WEAPON_CATEGORY_LABELS: Record<WeaponCategory, string> = {
  semplice_mischia: 'arma semplice da mischia',
  semplice_distanza: 'arma semplice a distanza',
  marziale_mischia: 'arma marziale da mischia',
  marziale_distanza: 'arma marziale a distanza',
};

const WEAPON_PROPERTY_LABELS: Record<WeaponProperty, string> = {
  accurata: 'Accurata',
  versatile: 'Versatile',
  leggera: 'Leggera',
  pesante: 'Pesante',
  a_due_mani: 'A due mani',
  lanciabile: 'Lanciabile',
  munizioni: 'Munizioni',
  portata: 'Portata',
  speciale: 'Speciale',
};

function describeWeapon(w: SrdWeapon): string {
  const damage = w.damageDice2h ? `${w.damageDice} ${w.damageType} (${w.damageDice2h} a due mani)` : `${w.damageDice} ${w.damageType}`;
  const parts = [`${WEAPON_CATEGORY_LABELS[w.category]}, danno ${damage}.`];
  if (w.properties.length > 0) {
    parts.push(`Proprietà: ${w.properties.map(p => WEAPON_PROPERTY_LABELS[p]).join(', ')}.`);
  }
  if (w.range) parts.push(`Gittata: ${w.range}.`);
  return parts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function describeArmor(a: SrdArmor): string {
  if (a.type === 'scudo') return `Scudo: +${a.baseAC} alla Classe Armatura.`;
  const dexNote = a.maxDexBonus === null
    ? '+ modificatore Destrezza'
    : a.maxDexBonus === 0
      ? '(nessun bonus Destrezza)'
      : `+ modificatore Destrezza (max +${a.maxDexBonus})`;
  const parts = [`Armatura ${a.type}, CA base ${a.baseAC} ${dexNote}.`];
  if (a.strRequired) parts.push(`Richiede Forza ${a.strRequired}.`);
  if (a.stealthDisadvantage) parts.push('Svantaggio alle prove di Furtività.');
  return parts.join(' ');
}

/**
 * Restituisce la descrizione SRD per una voce di inventario/arma, se
 * disponibile. La ricerca usa prima `srdKey` (incluso un alias legacy per
 * id di vecchi modal), poi il nome dell'item (case-insensitive) — molti
 * item esistenti non hanno mai avuto `srdKey` impostato correttamente.
 *
 * Oggetti magici: testo narrativo reale dell'SRD. Armi/armature: frase
 * riassuntiva generata dalle statistiche reali (l'SRD non ha prosa per
 * queste). Oggetti comuni: nota meccanica reale dell'SRD, se presente.
 * Ritorna null se non c'è alcuna voce SRD corrispondente.
 */
export function getSrdItemDescription(item: SrdLookupItem): string | null {
  const magicItem = findMagicItemByKeyOrName(item);
  if (magicItem) return magicItem.description;

  const weapon = findWeaponByKeyOrName(item);
  if (weapon) return describeWeapon(weapon);

  const armor = findArmorByKeyOrName(item);
  if (armor) return describeArmor(armor);

  const gearItem = findGearItemByKeyOrName(item);
  if (gearItem?.note) return gearItem.note;

  return null;
}

/**
 * Restituisce il nome icona (@iconify-json/game-icons, senza prefisso
 * "game-icons:") per una voce di inventario/arma. Stessa risoluzione di
 * `getSrdItemDescription` (chiave SRD, alias legacy, poi nome). Gli oggetti
 * magici usano l'icona del loro tipo (`MAGIC_ITEM_ICON`), non una specifica
 * per singolo oggetto — non ottenibile da una libreria generica per 301
 * voci distinte. Ritorna `FALLBACK_ITEM_ICON` se non c'è alcuna corrispondenza.
 */
export function getSrdItemIcon(item: SrdLookupItem): string {
  const magicItem = findMagicItemByKeyOrName(item);
  if (magicItem) return MAGIC_ITEM_ICON[magicItem.type];

  const weapon = findWeaponByKeyOrName(item);
  if (weapon) return weapon.icon;

  const armor = findArmorByKeyOrName(item);
  if (armor) return armor.icon;

  const gearItem = findGearItemByKeyOrName(item);
  if (gearItem) return gearItem.icon;

  return FALLBACK_ITEM_ICON;
}
