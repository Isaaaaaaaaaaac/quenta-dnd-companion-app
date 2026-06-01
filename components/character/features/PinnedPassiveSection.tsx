'use client';

import { useState } from 'react';
import type { PinnedFeature } from '@/lib/db/schema';

interface Props {
  features: PinnedFeature[];  // solo quelle senza resourceKey (passive)
}

const TYPE_ICON: Record<string, string> = {
  class: '⚔',
  racial: '🌿',
  feat: '✦',
};

export default function PinnedPassiveSection({ features }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (features.length === 0) return null;

  return (
    <div>
      {features.map(f => {
        const id = `${f.type}:${f.key}`;
        const isOpen = expanded === id;
        return (
          <div key={id} style={{ marginBottom: 3 }}>
            <div
              onClick={() => setExpanded(isOpen ? null : id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px var(--s-1)', borderRadius: 'var(--r)',
                cursor: f.description ? 'pointer' : 'default',
                transition: 'background .15s',
              }}
              onMouseEnter={e => { if (f.description) e.currentTarget.style.background = 'rgba(184,134,11,.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 10, flexShrink: 0, color: 'var(--gold)', opacity: .7 }}>
                {TYPE_ICON[f.type] ?? '◆'}
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-1)', flex: 1 }}>
                {f.name}
              </span>
              {f.description && (
                <span style={{ color: 'var(--fg-3)', fontSize: '10px', transition: 'transform .2s', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'none' }}>›</span>
              )}
            </div>

            {/* Descrizione espandibile */}
            {isOpen && f.description && (
              <div style={{
                marginLeft: 20, marginBottom: 4, padding: '6px 10px',
                background: 'var(--bg-card)', borderRadius: 'var(--r)',
                border: '1px solid var(--border-leather)',
              }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-2)', lineHeight: 1.6, margin: 0 }}>
                  {f.description}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
