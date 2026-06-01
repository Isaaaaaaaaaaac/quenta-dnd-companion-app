'use client';

import { useState, useRef } from 'react';
import { RACES } from '@/lib/srd/races';
import { CLASSES } from '@/lib/srd/classes';
import type { WizardData } from '../CharacterWizard';
import { WizardButton } from './StepIdentity';

type Mode = 'choose' | 'generate' | 'upload' | 'url';
type ImgState = 'idle' | 'loading' | 'ok' | 'error';

interface Props {
  data: WizardData;
  update: (p: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepSpells({ data, update, onNext, onBack }: Props) {
  const [mode, setMode] = useState<Mode>('choose');
  const [imgState, setImgState] = useState<ImgState>(data.portraitUrl ? 'ok' : 'idle');
  const [description, setDescription] = useState(data.portraitDescription || '');
  const [currentUrl, setCurrentUrl] = useState(data.portraitUrl || '');
  const [manualUrl, setManualUrl] = useState('');
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 99999));
  const fileRef = useRef<HTMLInputElement>(null);
  // Ref per accedere al currentUrl corrente dentro onLoad (evita closure stale)
  const currentUrlRef = useRef(data.portraitUrl || '');

  const race = RACES.find(r => r.key === data.race);
  const cls = CLASSES.find(c => c.key === data.classKey);

  function buildPollinationsUrl(s: number) {
    const prompt = [
      'fantasy portrait painting',
      race?.name ? `${race.name.toLowerCase()} character` : '',
      cls?.name ? cls.name.toLowerCase() : '',
      description.trim(),
      'dark fantasy, dramatic lighting, detailed, oil painting, medieval, no text, no watermark',
    ].filter(Boolean).join(', ');
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${s}&nologo=true`;
  }

  function generate() {
    const newSeed = Math.floor(Math.random() * 99999);
    setSeed(newSeed);
    const url = buildPollinationsUrl(newSeed);
    currentUrlRef.current = url;
    setCurrentUrl(url);
    setImgState('loading');
    update({ portraitUrl: '', portraitDescription: description });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { alert('Max 6MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      currentUrlRef.current = url;
      setCurrentUrl(url);
      setImgState('ok');
      update({ portraitUrl: url });
    };
    reader.readAsDataURL(file);
  }

  function applyManualUrl() {
    if (!manualUrl.trim()) return;
    setCurrentUrl(manualUrl.trim());
    currentUrlRef.current = manualUrl.trim();
    setImgState('loading');
    update({ portraitUrl: '' });
  }

  function clear() {
    currentUrlRef.current = '';
    setCurrentUrl('');
    setImgState('idle');
    setMode('choose');
    update({ portraitUrl: '', portraitDescription: '' });
    if (fileRef.current) fileRef.current.value = '';
  }

  // ── styles ─────────────────────────────────────────────────────────────────
  const optBtn = (active: boolean): React.CSSProperties => ({
    display: 'block', width: '100%', textAlign: 'left',
    padding: '12px 16px', cursor: 'pointer', fontSize: '0.85rem',
    fontFamily: 'var(--font-label)', letterSpacing: '0.04em',
    border: `1px solid ${active ? 'var(--gold)' : 'var(--border-leather-dim)'}`,
    backgroundColor: active ? 'rgba(184,134,11,0.08)' : 'transparent',
    color: active ? 'var(--gold)' : 'var(--fg-2)',
  });

  return (
    <div>
      <h2 className="mb-1">Ritratto del Personaggio</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
        Opzionale — aggiungibile o modificabile in qualsiasi momento dalla scheda personaggio.
      </p>

      {/* ── Preview immagine ── */}
      {currentUrl && (
        <div className="flex gap-4 items-start mb-5">
          <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
            {/* Spinner */}
            {imgState === 'loading' && (
              <div style={{
                position: 'absolute', inset: 0, backgroundColor: 'var(--bg-deep)',
                border: '2px solid var(--border-leather-dim)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <div style={{ color: 'var(--gold)', fontSize: '1.5rem' }}>⏳</div>
                <div style={{ color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: '0.75rem', textAlign: 'center' }}>
                  Generazione…<br />fino a 30s
                </div>
              </div>
            )}
            <img
              src={currentUrl}
              alt="Ritratto"
              style={{
                width: 140, height: 140, objectFit: 'cover',
                border: `2px solid ${imgState === 'error' ? 'var(--danger)' : 'var(--gold)'}`,
                display: imgState === 'loading' ? 'none' : 'block',
              }}
              onLoad={() => {
                setImgState('ok');
                // Usa ref per evitare closure stale su currentUrl
                update({ portraitUrl: currentUrlRef.current, portraitDescription: description });
              }}
              onError={() => setImgState('error')}
            />
            {imgState !== 'loading' && (
              <button onClick={clear} style={{
                position: 'absolute', top: 4, right: 4,
                backgroundColor: 'var(--bg-deep)', border: '1px solid var(--danger)',
                color: 'var(--danger)', cursor: 'pointer', padding: '1px 5px', fontSize: '0.7rem',
              }}>✕</button>
            )}
          </div>

          <div>
            {imgState === 'ok' && (
              <p style={{ color: 'var(--info)', fontFamily: 'var(--font-body)' }}>✓ Immagine caricata.</p>
            )}
            {imgState === 'error' && (
              <div>
                <p style={{ color: 'var(--danger)', fontFamily: 'var(--font-body)', marginBottom: 8 }}>
                  ✕ Caricamento fallito.<br />
                  <span style={{ fontSize: '0.85rem', color: 'var(--fg-2)' }}>
                    Pollinations.ai può essere temporaneamente non disponibile.
                  </span>
                </p>
                {mode === 'generate' && (
                  <button onClick={generate} style={{ border: '1px solid var(--gold)', color: 'var(--gold)', backgroundColor: 'transparent', fontFamily: 'var(--font-label)', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    ↺ Riprova
                  </button>
                )}
              </div>
            )}
            {imgState === 'loading' && (
              <p style={{ color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                L'immagine viene elaborata da Pollinations.ai.<br />
                Attendi o scegli un'altra opzione.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Scelta modalità ── */}
      {(!currentUrl || imgState === 'error') && (
        <div className="space-y-px mb-5">

          {/* Genera AI */}
          <div>
            <button style={optBtn(mode === 'generate')} onClick={() => setMode('generate')}>
              ✦ Genera con AI — descrivi il personaggio
            </button>
            {mode === 'generate' && (
              <div className="p-4" style={{ border: '1px solid var(--border-leather-dim)', borderTop: 'none', backgroundColor: 'var(--bg-deep)' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--fg-2)', fontFamily: 'var(--font-label)', letterSpacing: '0.05em', marginBottom: 6 }}>
                  DESCRIZIONE ASPETTO FISICO
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder={`Descrivi il personaggio: capelli, occhi, cicatrici, abbigliamento, espressione…\nEs. capelli bianchi, sguardo freddo, corazza scura rovinata, cicatrice sul mento`}
                  style={{
                    width: '100%', backgroundColor: 'transparent',
                    border: '1px solid var(--border-leather-dim)', color: 'var(--fg-1)',
                    fontFamily: 'var(--font-body)', fontSize: '0.95rem',
                    padding: '8px', outline: 'none', resize: 'vertical',
                    marginBottom: 10,
                  }}
                />
                <div className="mb-3 p-2 text-xs" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--border-leather-dim)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
                  Prompt: {buildPollinationsUrl(seed).split('prompt/')[1]?.split('?')[0]?.slice(0, 120).replace(/%20/g, ' ').replace(/%2C/g, ',') ?? '…'}
                </div>
                <button onClick={generate}
                  style={{ border: '1px solid var(--gold)', color: 'var(--gold)', backgroundColor: 'transparent', fontFamily: 'var(--font-label)', padding: '8px 20px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  ✦ Genera ritratto
                </button>
              </div>
            )}
          </div>

          {/* Carica file */}
          <div>
            <button style={optBtn(mode === 'upload')} onClick={() => setMode('upload')}>
              ⬆ Carica un'immagine dal dispositivo
            </button>
            {mode === 'upload' && (
              <div className="p-4" style={{ border: '1px solid var(--border-leather-dim)', borderTop: 'none', backgroundColor: 'var(--bg-deep)' }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} id="portrait-file" />
                <label htmlFor="portrait-file" style={{ display: 'inline-block', border: '1px solid var(--gold)', color: 'var(--gold)', fontFamily: 'var(--font-label)', padding: '8px 20px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Scegli file…
                </label>
                <div className="mt-2" style={{ color: 'var(--border-leather-dim)', fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}>
                  JPG, PNG, WebP, GIF · Max 6MB
                </div>
              </div>
            )}
          </div>

          {/* URL diretto */}
          <div>
            <button style={optBtn(mode === 'url')} onClick={() => setMode('url')}>
              🔗 Incolla URL di un'immagine
            </button>
            {mode === 'url' && (
              <div className="p-4 flex gap-2" style={{ border: '1px solid var(--border-leather-dim)', borderTop: 'none', backgroundColor: 'var(--bg-deep)' }}>
                <input
                  value={manualUrl}
                  onChange={e => setManualUrl(e.target.value)}
                  placeholder="https://example.com/portrait.jpg"
                  onKeyDown={e => e.key === 'Enter' && applyManualUrl()}
                  style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid var(--border-leather-dim)', color: 'var(--fg-1)', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '0.95rem', padding: '4px 0' }}
                />
                <button onClick={applyManualUrl}
                  style={{ border: '1px solid var(--gold)', color: 'var(--gold)', backgroundColor: 'transparent', fontFamily: 'var(--font-label)', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Carica
                </button>
              </div>
            )}
          </div>

          {/* Salta */}
          <button style={{ ...optBtn(false), color: 'var(--border-leather-dim)', borderColor: 'var(--border-leather)' }} onClick={onNext}>
            → Salta — aggiungi immagine dalla scheda personaggio
          </button>
        </div>
      )}

      {/* Incantesimi placeholder */}
      <div className="p-4 border" style={{ borderColor: 'var(--border-leather)', backgroundColor: 'var(--bg-deep)' }}>
        <div style={{ color: 'var(--border-leather-dim)', fontFamily: 'var(--font-label)', fontSize: '0.7rem', letterSpacing: '0.06em', marginBottom: 6 }}>
          INCANTESIMI & EQUIPAGGIAMENTO
        </div>
        <p style={{ color: 'var(--fg-2)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontStyle: 'italic' }}>
          Incantesimi, armi, armature e oggetti si configurano dalla scheda del personaggio
          dopo la creazione, in un wizard dedicato riaperto in qualsiasi momento.
        </p>
      </div>

      <div className="flex justify-between mt-8">
        <WizardButton onClick={onBack} variant="secondary">← Indietro</WizardButton>
        <WizardButton onClick={onNext}>Avanti → Riepilogo</WizardButton>
      </div>
    </div>
  );
}
