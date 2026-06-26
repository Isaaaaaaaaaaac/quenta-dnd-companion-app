import { WEAPONS, ARMORS, type WeaponProperty, type WeaponCategory } from './equipment';
import { findGearItem } from './gear';
import { findMagicItem } from './magicItems';

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

function describeWeapon(srdKey: string): string | null {
  const w = WEAPONS.find(x => x.key === srdKey);
  if (!w) return null;
  const damage = w.damageDice2h ? `${w.damageDice} ${w.damageType} (${w.damageDice2h} a due mani)` : `${w.damageDice} ${w.damageType}`;
  const parts = [`${WEAPON_CATEGORY_LABELS[w.category]}, danno ${damage}.`];
  if (w.properties.length > 0) {
    parts.push(`Proprietà: ${w.properties.map(p => WEAPON_PROPERTY_LABELS[p]).join(', ')}.`);
  }
  if (w.range) parts.push(`Gittata: ${w.range}.`);
  return parts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function describeArmor(srdKey: string): string | null {
  const a = ARMORS.find(x => x.key === srdKey);
  if (!a) return null;
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
 * Restituisce la descrizione SRD per una voce di inventario, se disponibile.
 * Oggetti magici: testo narrativo reale dell'SRD. Armi/armature: frase
 * riassuntiva generata dalle statistiche reali (l'SRD non ha prosa per
 * queste). Oggetti comuni: nota meccanica reale dell'SRD, se presente.
 * Ritorna null se non c'è alcuna voce SRD corrispondente.
 */
export function getSrdItemDescription(srdKey: string | undefined): string | null {
  if (!srdKey) return null;
  const magicItem = findMagicItem(srdKey);
  if (magicItem) return magicItem.description;
  const weaponDesc = describeWeapon(srdKey);
  if (weaponDesc) return weaponDesc;
  const armorDesc = describeArmor(srdKey);
  if (armorDesc) return armorDesc;
  const gearItem = findGearItem(srdKey);
  if (gearItem?.note) return gearItem.note;
  return null;
}
