import { describe, it, expect } from 'vitest';
import { getSrdItemDescription } from './itemDescription';

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

  it('returns null for a gear item with no mechanical note (matches the real SRD, which has no rules text for it)', () => {
    expect(getSrdItemDescription({ srdKey: 'book', name: 'Libro' })).toBeNull();
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
});
