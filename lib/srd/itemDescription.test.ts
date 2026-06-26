import { describe, it, expect } from 'vitest';
import { getSrdItemDescription, getSrdItemIcon, FALLBACK_ITEM_ICON } from './itemDescription';
import { WEAPONS, ARMORS } from './equipment';
import { GEAR_ITEMS } from './gear';
import { MAGIC_ITEMS, MAGIC_ITEM_ICON } from './magicItems';

describe('getSrdItemDescription', () => {
  it('returns null when nothing matches by key or name', () => {
    expect(getSrdItemDescription({ srdKey: 'not-a-real-key', name: 'Oggetto Inesistente' })).toBeNull();
  });

  it('returns the real SRD description for a magic item matched by key', () => {
    const desc = getSrdItemDescription({ srdKey: 'amulet_health', name: 'Amuleto della Salute' });
    expect(desc).toBe('La tua Costituzione è 19 mentre indossi questo amuleto.');
  });

  it('generates a summary sentence for a simple weapon matched by key', () => {
    const desc = getSrdItemDescription({ srdKey: 'mace', name: 'Mazza' });
    expect(desc).toContain('Arma semplice da mischia');
    expect(desc).toContain('1d6 contundente');
  });

  it('includes the two-handed damage die for a versatile weapon', () => {
    const desc = getSrdItemDescription({ srdKey: 'longsword', name: 'Spada Lunga' });
    expect(desc).toContain('1d8 tagliente (1d10 a due mani)');
    expect(desc).toContain('Versatile');
  });

  it('describes a shield by its AC bonus', () => {
    const desc = getSrdItemDescription({ srdKey: 'shield', name: 'Scudo' });
    expect(desc).toBe('Scudo: +2 alla Classe Armatura.');
  });

  it('mentions strength requirement and stealth disadvantage for heavy armor', () => {
    const desc = getSrdItemDescription({ srdKey: 'plate', name: 'A Piastre' });
    expect(desc).toContain('Richiede Forza 15');
    expect(desc).toContain('Svantaggio alle prove di Furtività');
  });

  it('returns the real SRD note for a gear item matched by key', () => {
    const desc = getSrdItemDescription({ srdKey: 'caltrops', name: 'Triboli (20)' });
    expect(desc).toContain('velocità');
  });

  it('returns a flavor description for a gear item with no official SRD rules text', () => {
    // 'Libro' non ha testo meccanico nell'SRD ufficiale, ma ogni voce del
    // dataset deve avere comunque una descrizione (anche solo funzionale/flavor).
    expect(getSrdItemDescription({ srdKey: 'book', name: 'Libro' })).not.toBeNull();
  });

  it('every gear item in the dataset has a description', () => {
    for (const item of GEAR_ITEMS) {
      const desc = getSrdItemDescription({ srdKey: item.key, name: item.name });
      expect(desc, `oggetto senza descrizione: ${item.name} (${item.key})`).not.toBeNull();
    }
  });

  it('every weapon in the dataset has a description', () => {
    for (const weapon of WEAPONS) {
      const desc = getSrdItemDescription({ srdKey: weapon.key, name: weapon.name });
      expect(desc, `arma senza descrizione: ${weapon.name} (${weapon.key})`).not.toBeNull();
    }
  });

  it('every armor in the dataset has a description', () => {
    for (const armor of ARMORS) {
      const desc = getSrdItemDescription({ srdKey: armor.key, name: armor.name });
      expect(desc, `armatura senza descrizione: ${armor.name} (${armor.key})`).not.toBeNull();
    }
  });

  it('every magic item in the dataset has a description', () => {
    for (const item of MAGIC_ITEMS) {
      const desc = getSrdItemDescription({ srdKey: item.key, name: item.name });
      expect(desc, `oggetto magico senza descrizione: ${item.name} (${item.key})`).not.toBeNull();
    }
  });

  // ── Dati reali osservati nel database: molti item non hanno mai avuto
  // srdKey impostato correttamente, o usano id legacy mai mappati. ──────────

  it('falls back to a name match when srdKey is undefined', () => {
    const desc = getSrdItemDescription({ srdKey: undefined, name: 'Spada Lunga' });
    expect(desc).toContain('Versatile');
  });

  it('falls back to a name match when srdKey is an untranslated legacy id', () => {
    // srdKey reale osservato: 'stocco' (nessuna voce SRD con quella key), nome 'Stocco' -> rapier
    const desc = getSrdItemDescription({ srdKey: 'stocco', name: 'Stocco' });
    expect(desc).toContain('Accurata');
  });

  it('translates a known legacy modal id via the alias table before falling back to name', () => {
    // 'daga' è un alias legacy mappato esplicitamente a 'dagger' in LEGACY_SRD_KEY_ALIASES
    const desc = getSrdItemDescription({ srdKey: 'daga', name: 'Daga' });
    expect(desc).toContain('Accurata');
    expect(desc).toContain('Lanciabile');
  });

  it('matches common gear by name when srdKey is an untranslated legacy id', () => {
    // srdKey reale osservato: 'torcia' (nessuna voce SRD con quella key), nome 'Torcia' -> torch
    const desc = getSrdItemDescription({ srdKey: 'torcia', name: 'Torcia' });
    expect(desc).not.toBeNull();
  });

  // ── Voci aggiunte perché assenti dal dataset SRD pur esistendo nell'SRD reale ──

  it('describes the previously-missing rope item', () => {
    const desc = getSrdItemDescription({ srdKey: 'rope_hempen', name: 'Corda di Canapa (15 m)' });
    expect(desc).toContain('CD 17 Forza');
  });

  it('describes a previously-missing martial melee weapon (lance)', () => {
    const desc = getSrdItemDescription({ srdKey: 'lance', name: 'Lancia da Cavaliere' });
    expect(desc).toContain('1d12 perforante');
    expect(desc).toContain('Portata');
  });

  it('describes a previously-missing martial ranged weapon (heavy crossbow)', () => {
    const desc = getSrdItemDescription({ srdKey: 'crossbow_heavy', name: 'Balestra Pesante' });
    expect(desc).toContain('Gittata: 30/120m.');
  });
});

describe('getSrdItemIcon', () => {
  it('returns the fallback icon when nothing matches', () => {
    expect(getSrdItemIcon({ srdKey: 'not-a-real-key', name: 'Oggetto Inesistente' })).toBe(FALLBACK_ITEM_ICON);
  });

  it("returns the weapon's own icon", () => {
    expect(getSrdItemIcon({ srdKey: 'longsword', name: 'Spada Lunga' })).toBe('broadsword');
  });

  it("returns the armor's own icon", () => {
    expect(getSrdItemIcon({ srdKey: 'shield', name: 'Scudo' })).toBe('shield');
  });

  it("returns the gear item's own icon", () => {
    expect(getSrdItemIcon({ srdKey: 'torch', name: 'Torcia' })).toBe('torch');
  });

  it("returns the magic item type's icon, not a per-item icon", () => {
    const item = MAGIC_ITEMS.find(i => i.key === 'amulet_health')!;
    expect(getSrdItemIcon({ srdKey: item.key, name: item.name })).toBe(MAGIC_ITEM_ICON[item.type]);
  });

  it('every weapon, armor, gear and magic item resolves to a real icon name', () => {
    for (const w of WEAPONS) expect(getSrdItemIcon({ srdKey: w.key, name: w.name })).toBe(w.icon);
    for (const a of ARMORS) expect(getSrdItemIcon({ srdKey: a.key, name: a.name })).toBe(a.icon);
    for (const g of GEAR_ITEMS) expect(getSrdItemIcon({ srdKey: g.key, name: g.name })).toBe(g.icon);
    for (const m of MAGIC_ITEMS) expect(getSrdItemIcon({ srdKey: m.key, name: m.name })).toBe(MAGIC_ITEM_ICON[m.type]);
  });
});
