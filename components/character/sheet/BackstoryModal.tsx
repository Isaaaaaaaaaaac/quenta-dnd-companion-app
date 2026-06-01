'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { updateCharacterSheet } from '@/lib/db/actions';

interface Props {
  characterId: string;
  charName: string;
  initialBackstory: string;
  isOwner: boolean;
  onClose: () => void;
  onSave?: (text: string) => void;
}

export default function BackstoryModal({
  characterId, charName, initialBackstory, isOwner, onClose, onSave,
}: Props) {
  const [text, setText] = useState(initialBackstory);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus e auto-resize
  useEffect(() => {
    if (isOwner && textareaRef.current) {
      textareaRef.current.focus();
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [isOwner]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [text]);

  // Chiudi con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const save = useCallback(async (value: string) => {
    setStatus('saving');
    try {
      await updateCharacterSheet(characterId, { backstory: value || undefined });
      onSave?.(value);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('idle');
    }
  }, [characterId, onSave]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setStatus('idle');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(value), 1500);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(4,3,2,.88)', backdropFilter: 'blur(6px)',
        zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 820,
        maxHeight: '90vh',
        background: 'var(--bg-deep)',
        border: '1px solid var(--border-leather-dim)',
        borderRadius: 'var(--r2)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--sp-2)',
          padding: 'var(--sp-2) var(--sp-3)',
          borderBottom: '1px solid var(--border-leather-dim)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 16 }}>📖</span>
          <span style={{
            fontFamily: 'var(--font-serif)', fontSize: '15px', fontWeight: 700,
            color: 'var(--fg-1)', flex: 1,
          }}>
            Storia di {charName}
          </span>

          {/* Status indicator */}
          {isOwner && (
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.04em',
              color: status === 'saving'
                ? 'var(--arcane)'
                : status === 'saved'
                ? 'var(--hp-healthy)'
                : 'transparent',
              transition: 'color .3s',
              minWidth: 60,
            }}>
              {status === 'saving' ? '◌ salvo…' : '✓ salvato'}
            </span>
          )}

          {!isOwner && (
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600,
              letterSpacing: '.07em', textTransform: 'uppercase',
              color: 'var(--fg-3)', border: '1px solid var(--border-leather)',
              borderRadius: 'var(--r)', padding: '2px 8px',
            }}>
              Sola lettura
            </span>
          )}

          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: '1px solid transparent', borderRadius: 'var(--r)',
              color: 'var(--fg-2)', fontSize: 16, cursor: 'pointer',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-leather)'; e.currentTarget.style.color = 'var(--fg-1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--fg-2)'; }}
          >
            ✕
          </button>
        </div>

        {/* ── Corpo ──────────────────────────────────────────────── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: 'var(--sp-3)',
        }}>
          {isOwner ? (
            <>
              {text.trim().length === 0 && (
                <p style={{
                  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                  fontSize: '12px', color: 'var(--fg-3)',
                  marginBottom: 'var(--sp-2)',
                }}>
                  Scrivi la storia del tuo personaggio. Questo campo salva automaticamente.
                </p>
              )}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleChange}
                placeholder="Era una notte tempestosa quando…"
                style={{
                  width: '100%',
                  minHeight: 280,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '14px',
                  color: 'var(--fg-1)',
                  lineHeight: 1.8,
                  boxSizing: 'border-box',
                  padding: 0,
                }}
              />
            </>
          ) : text.trim().length > 0 ? (
            <p style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: '14px', color: 'var(--fg-2)',
              lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0,
            }}>
              {text}
            </p>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: 'var(--sp-4) 0', gap: 'var(--sp-1)',
            }}>
              <span style={{ fontSize: 28, opacity: .2 }}>📖</span>
              <p style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: '13px', color: 'var(--fg-3)', margin: 0,
              }}>
                Nessuna storia ancora scritta.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div style={{
          padding: 'var(--sp-2) var(--sp-3)',
          borderTop: '1px solid var(--border-leather)',
          display: 'flex', justifyContent: 'flex-end',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              height: 36, padding: '0 var(--sp-3)',
              fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600,
              letterSpacing: '.07em', textTransform: 'uppercase',
              color: 'var(--fg-2)', background: 'none',
              border: '1px solid var(--border-leather)', borderRadius: 'var(--r)',
              cursor: 'pointer',
            }}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
