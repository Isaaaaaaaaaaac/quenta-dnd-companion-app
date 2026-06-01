'use client';

import { useState, useTransition } from 'react';
import { getClassFeatures } from '@/lib/srd/classFeatures';
import { useClassResource, togglePinFeature } from '@/lib/db/actions';
import type { CharacterClass, CharacterResource, PinnedFeature } from '@/lib/db/schema';
import { CLASSES } from '@/lib/srd/classes';

interface Props {
  characterClasses: CharacterClass[];
  resources: CharacterResource[];
  characterId: string;
  pinnedFeatures: PinnedFeature[];
  onClose: () => void;
}

export default function ClassFeaturesModal({ characterClasses, resources, characterId, pinnedFeatures, onClose }: Props) {
  const [activeClass, setActiveClass] = useState(characterClasses[0]?.classKey ?? '');
  const [isPending, startTransition] = useTransition();
  const [localPinned, setLocalPinned] = useState<Set<string>>(
    new Set(pinnedFeatures.map(f => `${f.type}:${f.key}`))
  );

  function handlePin(feat: ReturnType<typeof getClassFeatures>[number], resource?: CharacterResource) {
    const id = `class:${feat.key}`;
    const pinned = localPinned.has(id);
    setLocalPinned(prev => {
      const next = new Set(prev);
      pinned ? next.delete(id) : next.add(id);
      return next;
    });
    const pf: PinnedFeature = {
      key: feat.key, type: 'class', name: feat.name,
      description: feat.description,
      resourceKey: feat.resourceKey,
      resetType: feat.resetType,
    };
    startTransition(() => togglePinFeature(characterId, pf, !pinned));
  }

  const activeCharClass = characterClasses.find(c => c.classKey === activeClass);
  const classLevel = activeCharClass?.level ?? 0;
  const features = getClassFeatures(activeClass);

  const resourceMap = new Map(resources.map(r => [r.resourceKey, r]));

  function handleUseResource(characterId: string, key: string, delta: number) {
    startTransition(async () => {
      await useClassResource(characterId, key, delta);
    });
  }

  const CARD: React.CSSProperties = {
    background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)',
    borderRadius: 'var(--r2)', padding: 'var(--s-2)',
    opacity: isPending ? 0.7 : 1, transition: 'opacity .2s',
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'rgba(12,10,9,.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...CARD, width: '100%', maxWidth: 960, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '0 0 var(--s-2)', borderBottom: '1px solid var(--border-leather)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-1)' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>
              Caratteristiche di Classe
            </span>
            <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 'var(--r)', color: 'var(--fg-2)', fontSize: 16, cursor: 'pointer' }}>✕</button>
          </div>

          {/* Tab classi (multiclasse) */}
          <div style={{ display: 'flex', gap: 4 }}>
            {characterClasses.map(c => {
              const cls = CLASSES.find(cl => cl.key === c.classKey);
              return (
                <button key={c.classKey} onClick={() => setActiveClass(c.classKey)}
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em',
                    padding: '0 12px', height: 28, borderRadius: 'var(--r)',
                    border: activeClass === c.classKey ? '1px solid var(--gold)' : '1px solid var(--border-leather)',
                    background: activeClass === c.classKey ? 'rgba(184,134,11,.08)' : 'none',
                    color: activeClass === c.classKey ? 'var(--gold)' : 'var(--fg-2)',
                    cursor: 'pointer', transition: 'all .2s',
                  }}>
                  {cls?.name ?? c.classKey} Lv {c.level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--s-2)' }}>
          {features.length === 0 && (
            <p style={{ padding: '24px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px', color: 'var(--fg-3)', textAlign: 'center' }}>
              Nessuna caratteristica trovata per questa classe.
            </p>
          )}

          <div className="modal-grid-2col">
          {features.map(feat => {
            const unlocked = feat.unlockLevel <= classLevel;
            const resource = feat.resourceKey ? resourceMap.get(feat.resourceKey) : undefined;

            return (
              <div key={`${feat.key}-${feat.unlockLevel}`} style={{
                background: unlocked ? 'var(--bg-card)' : 'var(--bg-deep)',
                border: `1px solid ${unlocked ? 'var(--border-leather)' : 'rgba(74,69,56,.3)'}`,
                borderRadius: 'var(--r)',
                padding: 'var(--s-2)',
                marginBottom: 'var(--s-1)',
                opacity: unlocked ? 1 : 0.4,
                transition: 'opacity .2s',
              }}>
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!unlocked && <span style={{ fontSize: 12 }}>🔒</span>}
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 600, color: unlocked ? 'var(--fg-1)' : 'var(--fg-3)' }}>
                      {feat.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {unlocked && (
                      <button
                        onClick={() => handlePin(feat, resource)}
                        title={localPinned.has(`class:${feat.key}`) ? 'Rimuovi dalla scheda' : 'Pinnа sulla scheda'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: localPinned.has(`class:${feat.key}`) ? 1 : 0.3, transition: 'opacity .2s', padding: 2 }}
                      >
                        📌
                      </button>
                    )}
                    {feat.improvesAt && feat.improvesAt.some(l => l <= classLevel) && (
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', color: 'var(--info)', border: '1px solid rgba(14,116,144,.35)', borderRadius: 2, padding: '1px 5px' }}>Potenziato</span>
                    )}
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--fg-3)', border: '1px solid var(--border-leather)', borderRadius: 2, padding: '1px 6px' }}>
                      Lv {feat.unlockLevel}
                    </span>
                  </div>
                </div>

                {/* Descrizione */}
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', lineHeight: 1.6, marginBottom: resource ? 10 : 0 }}>
                  {feat.description}
                </p>

                {/* Counter risorsa (se presente e sbloccato) */}
                {resource && unlocked && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, borderTop: '1px solid var(--border-leather)' }}>
                    {/* Cerchi visuali */}
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: resource.maximum }).map((_, i) => (
                        <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${feat.resetType === 'short' ? 'var(--info)' : 'var(--arcane)'}`, background: i < resource.current ? (feat.resetType === 'short' ? 'var(--info)' : 'var(--arcane)') : 'transparent', transition: 'background .2s' }} />
                      ))}
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-2)' }}>
                      {resource.current}/{resource.maximum} · {feat.resetType === 'short' ? '☽ Riposo Breve' : '☾ Riposo Lungo'}
                    </span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => handleUseResource(resource.characterId, feat.resourceKey!, -1)}
                        disabled={resource.current <= 0 || isPending}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em', padding: '0 10px', height: 24, borderRadius: 'var(--r)', border: '1px solid rgba(139,26,26,.4)', color: 'var(--danger)', background: 'rgba(139,26,26,.07)', cursor: resource.current <= 0 ? 'not-allowed' : 'pointer', opacity: resource.current <= 0 ? 0.35 : 1 }}>
                        Usa
                      </button>
                      <button
                        onClick={() => handleUseResource(resource.characterId, feat.resourceKey!, +1)}
                        disabled={resource.current >= resource.maximum || isPending}
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em', padding: '0 10px', height: 24, borderRadius: 'var(--r)', border: '1px solid rgba(74,124,78,.4)', color: 'var(--hp-healthy)', background: 'rgba(74,124,78,.07)', cursor: resource.current >= resource.maximum ? 'not-allowed' : 'pointer', opacity: resource.current >= resource.maximum ? 0.35 : 1 }}>
                        +1
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
