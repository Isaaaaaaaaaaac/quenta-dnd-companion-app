import { describe, it, expect } from 'vitest';
import { modColor } from './styles';

describe('modColor', () => {
  it('returns danger for negative modifiers', () => {
    expect(modColor(-2)).toBe('var(--danger)');
  });
  it('returns muted text for a zero modifier', () => {
    expect(modColor(0)).toBe('var(--fg-2)');
  });
  it('returns gold for positive modifiers', () => {
    expect(modColor(3)).toBe('var(--gold)');
  });
});
