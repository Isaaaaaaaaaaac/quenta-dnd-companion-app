import { describe, it, expect } from 'vitest';
import { abilityModifier, formatModifier } from './calculations';

describe('vitest harness smoke test', () => {
  it('computes ability modifiers correctly', () => {
    expect(abilityModifier(14)).toBe(2);
    expect(abilityModifier(8)).toBe(-1);
  });

  it('formats modifiers with sign', () => {
    expect(formatModifier(3)).toBe('+3');
    expect(formatModifier(-2)).toBe('-2');
    expect(formatModifier(0)).toBe('+0');
  });
});
