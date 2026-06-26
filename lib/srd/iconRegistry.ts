import { addCollection } from '@iconify/react';
import gameIconsSubset from './gameIconsSubset.json';

let registered = false;

/**
 * Registra offline il sottoinsieme di icone game-icons usate dall'SRD
 * (vedi lib/srd/itemDescription.ts), evitando richieste di rete verso
 * l'API pubblica di Iconify e il bundling dell'intera libreria (4000+ icone).
 */
export function ensureGameIconsRegistered(): void {
  if (registered) return;
  addCollection(gameIconsSubset);
  registered = true;
}
