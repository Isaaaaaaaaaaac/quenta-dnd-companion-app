'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { updatePortrait } from '@/lib/db/actions';

interface Props {
  characterId: string;
  characterName: string;
  classLabel: string;
  currentUrl?: string;
  onClose: () => void;
}

export default function PortraitModal({ characterId, characterName, classLabel, currentUrl, onClose }: Props) {
  const [tab, setTab] = useState<'upload' | 'ai'>('upload');
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState<{ remaining: number; pct: number } | null>(null);
  const [aiPrompt, setAiPrompt] = useState(
    `Portrait of ${characterName}, ${classLabel}. Fantasy character, dramatic lighting, detailed painterly digital art style, dark fantasy aesthetic, close-up portrait, high quality.`
  );
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Upload file ─────────────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File troppo grande. Massimo 5 MB.'); return; }

    setError(null);
    setPending(true);
    try {
      const blob = await upload(`portraits/${characterId}-${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/portrait/upload',
      });
      setPendingUrl(blob.url);
      setPreview(blob.url);
    } catch (err) {
      setError('Upload fallito: ' + String(err));
    } finally {
      setPending(false);
    }
  }

  // ── Carica stats budget quando si apre il tab AI ────────────────────────────
  async function loadBudget() {
    if (budget !== null) return;
    try {
      const res = await fetch('/api/portrait/usage');
      if (res.ok) {
        const data = await res.json() as { remaining: number; pct: number };
        setBudget(data);
      }
    } catch { /* ignora */ }
  }

  // ── Genera con AI ────────────────────────────────────────────────────────────
  async function handleGenerate() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch('/api/portrait/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, characterId }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'Errore sconosciuto');
      setPendingUrl(data.url!);
      setPreview(data.url!);
    } catch (err) {
      setError(String(err));
    } finally {
      setPending(false);
    }
  }

  // ── Salva ────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!pendingUrl) return;
    setPending(true);
    await updatePortrait(characterId, pendingUrl);
    setPending(false);
    onClose();
  }

  // ── Styles ────────────────────────────────────────────────────────────────────
  const tabStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '.07em',
    padding: '0 16px', height: 32, borderRadius: 'var(--r)', cursor: 'pointer',
    border: active ? '1px solid var(--border-leather)' : '1px solid transparent',
    background: active ? 'var(--bg-card)' : 'none',
    color: active ? 'var(--fg-1)' : 'var(--fg-2)',
    transition: 'all .2s',
  });

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(12,10,9,.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r2)', width: '100%', maxWidth: 520, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-leather)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>
            Aggiorna Ritratto
          </span>
          <button onClick={onClose} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid transparent', borderRadius: 'var(--r)', color: 'var(--fg-2)', fontSize: 16, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '20px' }}>

          {/* Preview */}
          <div style={{ width: 120, height: 120, borderRadius: 'var(--r)', border: '1px solid var(--border-leather)', background: 'var(--bg-card)', margin: '0 auto 20px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {preview
              ? <img src={preview} alt="Anteprima" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'var(--fg-3)', fontSize: 40 }}>⚔</span>
            }
            {pending && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,10,9,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: 12, fontFamily: 'var(--font-sans)' }}>
                Caricamento…
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            <button style={tabStyle(tab === 'upload')} onClick={() => setTab('upload')}>📁 Carica Immagine</button>
            <button style={tabStyle(tab === 'ai')} onClick={() => { setTab('ai'); loadBudget(); }}>✨ Genera con AI</button>
          </div>

          {/* Banner budget (solo tab AI) */}
          {tab === 'ai' && budget !== null && (
            <div style={{
              marginBottom: 12, padding: '8px 12px', borderRadius: 'var(--r)',
              background: budget.pct >= 80 ? 'rgba(139,26,26,.1)' : 'rgba(74,124,78,.08)',
              border: `1px solid ${budget.pct >= 80 ? 'rgba(139,26,26,.35)' : 'rgba(74,124,78,.3)'}`,
              fontFamily: 'var(--font-sans)', fontSize: '11px', lineHeight: 1.5,
              color: budget.pct >= 80 ? 'var(--danger)' : 'var(--fg-2)',
            }}>
              {budget.pct >= 100
                ? '⛔ Crediti esauriti. Ricarica il saldo su AI Studio.'
                : budget.pct >= 80
                ? `⚠ Crediti quasi esauriti — rimangono ~€${budget.remaining.toFixed(2)} (~${Math.floor(budget.remaining / 0.04)} immagini)`
                : `✓ Crediti disponibili: ~€${budget.remaining.toFixed(2)} (~${Math.floor(budget.remaining / 0.04)} immagini)`
              }
            </div>
          )}

          {/* Upload tab */}
          {tab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--fg-2)', lineHeight: 1.6 }}>
                Carica un'immagine dal tuo dispositivo (JPG, PNG, WebP — max 5 MB).
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={pending}
                style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.07em', height: 40, borderRadius: 'var(--r)', border: '1px solid var(--border-leather)', background: 'var(--bg-card)', color: 'var(--fg-1)', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.4 : 1 }}
              >
                Seleziona file…
              </button>
            </div>
          )}

          {/* AI tab */}
          {tab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--fg-2)', lineHeight: 1.6 }}>
                Descrivi il personaggio e Gemini genererà un ritratto. Il prompt è pre-compilato ma puoi modificarlo.
              </p>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                rows={4}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', color: 'var(--fg-1)', fontFamily: 'var(--font-sans)', fontSize: '12px', padding: '10px 12px', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
              />
              <button
                onClick={handleGenerate}
                disabled={pending || !aiPrompt.trim()}
                style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.07em', fontWeight: 600, height: 40, borderRadius: 'var(--r)', border: '1px solid rgba(91,33,182,.4)', background: 'rgba(91,33,182,.08)', color: 'var(--arcane)', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.4 : 1 }}
              >
                {pending ? '✨ Generazione in corso…' : '✨ Genera Ritratto'}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(139,26,26,.1)', border: '1px solid rgba(139,26,26,.3)', borderRadius: 'var(--r)', fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--danger)', lineHeight: 1.5 }}>
              ⚠ {error}
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={onClose} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.06em', color: 'var(--fg-2)', background: 'none', border: '1px solid var(--border-leather)', padding: '0 16px', height: 36, borderRadius: 'var(--r)', cursor: 'pointer' }}>
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={!pendingUrl || pending}
              style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.06em', fontWeight: 600, color: 'var(--bg-deep)', background: pendingUrl ? 'var(--gold)' : 'var(--fg-3)', border: 'none', padding: '0 20px', height: 36, borderRadius: 'var(--r)', cursor: pendingUrl ? 'pointer' : 'not-allowed', opacity: pending ? 0.5 : 1, transition: 'all .2s' }}
            >
              {pending ? 'Salvataggio…' : 'Salva Ritratto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
