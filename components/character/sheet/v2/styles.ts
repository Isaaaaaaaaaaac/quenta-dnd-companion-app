import type { CSSProperties } from 'react';

export const card: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-leather-dim)',
  borderRadius: 'var(--r-lg)',
  padding: 'var(--s-2)',
};

export const innerBox: CSSProperties = {
  background: 'var(--bg-inner)',
  border: '1px solid var(--border-leather)',
  borderRadius: 'var(--r-sm)',
};

export const sectionLabel: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '8px',
  fontWeight: 600,
  letterSpacing: '.1em',
  color: 'var(--gold)',
  textTransform: 'uppercase',
};

export function modColor(mod: number): string {
  if (mod < 0) return 'var(--danger)';
  if (mod === 0) return 'var(--fg-2)';
  return 'var(--gold)';
}
