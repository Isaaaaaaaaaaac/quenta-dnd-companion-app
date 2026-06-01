'use client';

import { useTransition } from 'react';
import { useClassResource } from '@/lib/db/actions';
import type { PinnedFeature, CharacterResource } from '@/lib/db/schema';

interface Props {
  characterId: string;
  features: PinnedFeature[];      // solo quelle con resourceKey (attive)
  resources: CharacterResource[];
}

export default function PinnedActiveResources({ characterId, features, resources }: Props) {
  const [isPending, startTransition] = useTransition();
  const resourceMap = new Map(resources.map(r => [r.resourceKey, r]));

  if (features.length === 0) return null;

  return (
    <div style={{
      background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)',
      borderRadius: 'var(--r-lg)', padding: 'var(--s-2)', marginBottom: 'var(--s-2)',
    }}>
      {/* Header */}
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600,
        letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 'var(--s-1)', marginBottom: 'var(--s-1)',
      }}>
        ⚡ Risorse Attive
        <span style={{ flex: 1, height: '.5px', background: 'linear-gradient(to right, rgba(184,134,11,.35), transparent)' }} />
      </div>

      {features.map(f => {
        const resource = f.resourceKey ? resourceMap.get(f.resourceKey) : undefined;
        const accentColor = f.resetType === 'short' ? 'var(--info)' : 'var(--arcane)';

        return (
          <div key={`${f.type}:${f.key}`} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '5px 0',
            borderBottom: '1px solid var(--bg-elevated)',
          }}>
            {/* Nome */}
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-1)', flex: 1 }}>
              {f.name}
            </span>

            {resource ? (
              /* ── Risorsa trovata in DB: mostra counter + pulsanti ── */
              <>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  {Array.from({ length: resource.maximum }).map((_, i) => (
                    <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', border: `1.5px solid ${accentColor}`, background: i < resource.current ? accentColor : 'transparent', opacity: i < resource.current ? 1 : 0.3, transition: 'background .2s' }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: resource.current === 0 ? 'var(--fg-3)' : 'var(--fg-2)', minWidth: 28, textAlign: 'center' }}>
                  {resource.current}/{resource.maximum}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', color: accentColor, minWidth: 12 }}>
                  {f.resetType === 'short' ? '☽' : '☾'}
                </span>
                <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  <button onClick={() => startTransition(() => useClassResource(characterId, f.resourceKey!, -1))}
                    disabled={resource.current <= 0 || isPending}
                    style={{ width: 22, height: 22, borderRadius: 'var(--r-sm)', border: '1px solid rgba(139,26,26,.4)', color: 'var(--danger)', background: 'rgba(139,26,26,.07)', cursor: resource.current <= 0 ? 'not-allowed' : 'pointer', opacity: resource.current <= 0 ? 0.25 : 1, fontSize: 10, fontFamily: 'var(--font-sans)' }}>−</button>
                  <button onClick={() => startTransition(() => useClassResource(characterId, f.resourceKey!, +1))}
                    disabled={resource.current >= resource.maximum || isPending}
                    style={{ width: 22, height: 22, borderRadius: 'var(--r-sm)', border: '1px solid rgba(74,124,78,.4)', color: 'var(--hp-healthy)', background: 'rgba(74,124,78,.07)', cursor: resource.current >= resource.maximum ? 'not-allowed' : 'pointer', opacity: resource.current >= resource.maximum ? 0.25 : 1, fontSize: 10, fontFamily: 'var(--font-sans)' }}>+</button>
                </div>
              </>
            ) : (
              /* ── Risorsa non inizializzata: mostra badge informativo ── */
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--fg-3)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: '1px 8px', flexShrink: 0 }}>
                {f.resetType === 'short' ? '☽ Riposo Breve' : '☾ Riposo Lungo'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
