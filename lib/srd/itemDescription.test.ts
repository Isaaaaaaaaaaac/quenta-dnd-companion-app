import { describe, it, expect } from 'vitest';
import { getSrdItemDescription } from './itemDescription';

describe('getSrdItemDescription', () => {
  it('returns null when no srdKey is given', () => {
    expect(getSrdItemDescription(undefined)).toBeNull();
  });

  it('returns null when the srdKey matches no entry in any SRD table', () => {
    expect(getSrdItemDescription('not-a-real-key')).toBeNull();
  });

  it('returns the real SRD description for a magic item', () => {
    const desc = getSrdItemDescription('amulet_health');
    expect(desc).toBe('La tua Costituzione è 19 mentre indossi questo amuleto.');
  });

  it('generates a summary sentence for a simple weapon with no versatile/range', () => {
    const desc = getSrdItemDescription('mace');
    expect(desc).toContain('Arma semplice da mischia');
    expect(desc).toContain('1d6 contundente');
  });

  it('includes the two-handed damage die for a versatile weapon', () => {
    const desc = getSrdItemDescription('longsword');
    expect(desc).toContain('1d8 tagliente (1d10 a due mani)');
    expect(desc).toContain('Versatile');
  });

  it('includes range for a ranged weapon', () => {
    const desc = getSrdItemDescription('longbow');
    expect(desc).toContain('Gittata: 45/180m.');
  });

  it('generates a summary sentence for light armor with unlimited Dex bonus', () => {
    const desc = getSrdItemDescription('leather');
    expect(desc).toContain('Armatura leggera');
    expect(desc).toContain('CA base 11');
    expect(desc).toContain('modificatore Destrezza');
  });

  it('mentions strength requirement and stealth disadvantage for heavy armor', () => {
    const desc = getSrdItemDescription('plate');
    expect(desc).toContain('Richiede Forza 15');
    expect(desc).toContain('Svantaggio alle prove di Furtività');
  });

  it('describes a shield by its AC bonus', () => {
    const desc = getSrdItemDescription('shield');
    expect(desc).toBe('Scudo: +2 alla Classe Armatura.');
  });

  it('returns the real SRD note for a gear item that has one', () => {
    const desc = getSrdItemDescription('caltrops');
    expect(desc).toContain('velocità');
  });

  it('returns null for a gear item with no mechanical note (matches the real SRD, which has no rules text for it)', () => {
    expect(getSrdItemDescription('book')).toBeNull();
  });
});
