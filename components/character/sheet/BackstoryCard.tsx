'use client';

import { useState } from 'react';
import BackstoryModal from './BackstoryModal';

const PREVIEW_LENGTH = 220;

interface Props {
  characterId: string;
  charName: string;
  initialBackstory: string;
  personality?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  isOwner: boolean;
  vertical?: boolean;  // layout colonna (mobile)
}

export default function BackstoryCard({
  characterId, charName, initialBackstory,
  personality, ideals, bonds, flaws,
  isOwner, vertical = false,
}: Props) {
  const [backstory, setBackstory] = useState(initialBackstory);
  const [modalOpen, setModalOpen] = useState(false);

  const hasNarrative = !!(personality || ideals || bonds || flaws);
  const hasBackstory = backstory.trim().length > 0;
  const hasAnything = hasNarrative || hasBackstory || isOwner;

  // Se non c'è nulla da mostrare e non è il proprietario (DM su PG vuoto) → nascondi
  if (!hasAnything) return null;

  const preview = backstory.length > PREVIEW_LENGTH
    ? backstory.slice(0, PREVIEW_LENGTH).trimEnd() + '…'
    : backstory;

  const narrative = [
    { label: 'Tratto',  icon: '⬡', val: personality },
    { label: 'Ideale',  icon: '✦', val: ideals },
    { label: 'Legame',  icon: '⛓', val: bonds },
    { label: 'Difetto', icon: '⚠', val: flaws },
  ].filter(x => x.val);

  return (
    <>
      <div style={{
        background: 'var(--bg-deep)',
        border: '1px solid var(--border-leather-dim)',
        borderRadius: 'var(--r2)',
        padding: 'var(--s-2)',
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        gap: vertical ? 'var(--s-2)' : 'var(--s-3)',
      }}>

        {/* ── Sezione sinistra: Narrativa (1fr) ─────────────────── */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          {/* Header piccolo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--s-1)',
            marginBottom: hasNarrative ? 'var(--s-1)' : 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600,
              letterSpacing: '.1em', color: 'rgba(184,134,11,.5)', textTransform: 'uppercase',
            }}>
              Narrativa
            </span>
            <span style={{ flex: 1, height: '.5px', background: 'rgba(184,134,11,.15)' }} />
          </div>

          {hasNarrative ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: narrative.length > 1 ? '1fr 1fr' : '1fr',
              gap: 'var(--s-1)',
            }}>
              {narrative.map(({ label, icon, val }) => (
                <div key={label} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-leather)',
                  borderRadius: 'var(--r)',
                  padding: '6px var(--s-1)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: '7px', fontWeight: 600,
                    letterSpacing: '.08em', color: 'rgba(184,134,11,.4)',
                    textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: 3,
                    marginBottom: 3,
                  }}>
                    <span style={{ opacity: .7, fontSize: 8 }}>{icon}</span> {label}
                  </span>
                  <p style={{
                    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                    fontSize: '11px', color: 'var(--fg-2)',
                    lineHeight: 1.45, margin: 0,
                  }}>
                    {val}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: '11px', color: 'var(--fg-3)', margin: 0,
            }}>
              Nessun tratto narrativo definito.
            </p>
          )}
        </div>

        {/* ── Separatore (solo layout orizzontale) ──────────────── */}
        {!vertical && <div style={{
          width: 1, background: 'var(--bg-elevated)',
          flexShrink: 0, alignSelf: 'stretch',
        }} />}

        {/* ── Sezione destra/basso: Backstory preview ───────────── */}
        <div style={{
          flex: vertical ? 'none' : '2 1 0', minWidth: 0,
          display: 'flex', flexDirection: 'column', gap: 'var(--s-1)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--s-1)',
          }}>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600,
              letterSpacing: '.1em', color: 'rgba(184,134,11,.5)', textTransform: 'uppercase',
            }}>
              Storia del Personaggio
            </span>
            <span style={{ flex: 1, height: '.5px', background: 'rgba(184,134,11,.15)' }} />
          </div>

          {hasBackstory ? (
            <>
              {/* Preview testo */}
              <p style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: '12px', color: 'var(--fg-2)',
                lineHeight: 1.65, margin: 0, flex: 1,
              }}>
                {preview}
              </p>

              {/* Bottone leggi tutto */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setModalOpen(true)}
                  style={{
                    height: 28, padding: '0 var(--s-2)',
                    fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600,
                    letterSpacing: '.06em',
                    color: 'var(--gold)', background: 'rgba(184,134,11,.07)',
                    border: '1px solid rgba(184,134,11,.3)',
                    borderRadius: 'var(--r)', cursor: 'pointer',
                    transition: 'all .18s',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(184,134,11,.14)';
                    e.currentTarget.style.borderColor = 'var(--gold-dim)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(184,134,11,.07)';
                    e.currentTarget.style.borderColor = 'rgba(184,134,11,.3)';
                  }}
                >
                  <span style={{ fontSize: 11 }}>📖</span>
                  {isOwner ? 'Leggi e modifica' : 'Leggi il backstory'}
                  {backstory.length > PREVIEW_LENGTH && (
                    <span style={{
                      fontSize: '8px', opacity: .6, fontWeight: 400,
                    }}>
                      ({Math.ceil(backstory.split(/\s+/).filter(Boolean).length)} parole)
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Empty state — visibile sempre, CTA solo per il proprietario */
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'flex-start', justifyContent: 'center',
              gap: 'var(--s-1)', padding: 'var(--s-1) 0',
            }}>
              <p style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: '12px', color: 'var(--fg-3)', margin: 0,
              }}>
                Nessuna storia ancora scritta.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  height: 28, padding: '0 var(--s-2)',
                  fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600,
                  letterSpacing: '.06em',
                  color: 'var(--arcane)', background: 'rgba(91,33,182,.07)',
                  border: '1px solid rgba(91,33,182,.3)',
                  borderRadius: 'var(--r)', cursor: 'pointer',
                  transition: 'all .18s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,33,182,.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,33,182,.07)'; }}
              >
                ✦ {isOwner ? 'Aggiungi la tua storia' : 'Scrivi il backstory'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modale fullscreen ──────────────────────────────────────── */}
      {modalOpen && (
        <BackstoryModal
          characterId={characterId}
          charName={charName}
          initialBackstory={backstory}
          isOwner={isOwner}
          onClose={() => setModalOpen(false)}
          onSave={text => setBackstory(text)}
        />
      )}
    </>
  );
}
