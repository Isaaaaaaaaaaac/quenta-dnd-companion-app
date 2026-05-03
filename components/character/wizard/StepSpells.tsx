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
    fontFamily: 'Cinzel, serif', letterSpacing: '0.04em',
    border: `1px solid ${active ? '#c8922a' : '#5a4020'}`,
    backgroundColor: active ? '#2a2010' : 'transparent',
    color: active ? '#c8922a' : '#a08060',
  });

  return (
    <div>
      <h2 className="mb-1">Ritratto del Personaggio</h2>
      <p className="text-sm mb-5" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
        Opzionale — aggiungibile o modificabile in qualsiasi momento dalla scheda personaggio.
      </p>

      {/* ── Preview immagine ── */}
      {currentUrl && (
        <div className="flex gap-4 items-start mb-5">
          <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
            {/* Spinner */}
            {imgState === 'loading' && (
              <div style={{
                position: 'absolute', inset: 0, backgroundColor: '#1a1410',
                border: '2px solid #5a4020', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <div style={{ color: '#c8922a', fontSize: '1.5rem' }}>⏳</div>
                <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.75rem', textAlign: 'center' }}>
                  Generazione…<br />fino a 30s
                </div>
              </div>
            )}
            <img
              src={currentUrl}
              alt="Ritratto"
              style={{
                width: 140, height: 140, objectFit: 'cover',
                border: `2px solid ${imgState === 'error' ? '#8b2020' : '#c8922a'}`,
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
                backgroundColor: '#1a0808', border: '1px solid #8b2020',
                color: '#8b2020', cursor: 'pointer', padding: '1px 5px', fontSize: '0.7rem',
              }}>✕</button>
            )}
          </div>

          <div>
            {imgState === 'ok' && (
              <p style={{ color: '#4a7c4e', fontFamily: 'Crimson Text, serif' }}>✓ Immagine caricata.</p>
            )}
            {imgState === 'error' && (
              <div>
                <p style={{ color: '#8b2020', fontFamily: 'Crimson Text, serif', marginBottom: 8 }}>
                  ✕ Caricamento fallito.<br />
                  <span style={{ fontSize: '0.85rem', color: '#a08060' }}>
                    Pollinations.ai può essere temporaneamente non disponibile.
                  </span>
                </p>
                {mode === 'generate' && (
                  <button onClick={generate} style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
                    ↺ Riprova
                  </button>
                )}
              </div>
            )}
            {imgState === 'loading' && (
              <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic' }}>
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
              <div className="p-4" style={{ border: '1px solid #5a4020', borderTop: 'none', backgroundColor: '#1a1810' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: 6 }}>
                  DESCRIZIONE ASPETTO FISICO
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder={`Descrivi il personaggio: capelli, occhi, cicatrici, abbigliamento, espressione…\nEs. capelli bianchi, sguardo freddo, corazza scura rovinata, cicatrice sul mento`}
                  style={{
                    width: '100%', backgroundColor: 'transparent',
                    border: '1px solid #5a4020', color: '#e8d5a3',
                    fontFamily: 'Crimson Text, serif', fontSize: '0.95rem',
                    padding: '8px', outline: 'none', resize: 'vertical',
                    marginBottom: 10,
                  }}
                />
                <div className="mb-3 p-2 text-xs" style={{ backgroundColor: '#2a2018', color: '#5a4020', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
                  Prompt: {buildPollinationsUrl(seed).split('prompt/')[1]?.split('?')[0]?.slice(0, 120).replace(/%20/g, ' ').replace(/%2C/g, ',') ?? '…'}
                </div>
                <button onClick={generate}
                  style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '8px 20px', cursor: 'pointer', fontSize: '0.85rem' }}>
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
              <div className="p-4" style={{ border: '1px solid #5a4020', borderTop: 'none', backgroundColor: '#1a1810' }}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} id="portrait-file" />
                <label htmlFor="portrait-file" style={{ display: 'inline-block', border: '1px solid #c8922a', color: '#c8922a', fontFamily: 'Cinzel, serif', padding: '8px 20px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Scegli file…
                </label>
                <div className="mt-2" style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem' }}>
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
              <div className="p-4 flex gap-2" style={{ border: '1px solid #5a4020', borderTop: 'none', backgroundColor: '#1a1810' }}>
                <input
                  value={manualUrl}
                  onChange={e => setManualUrl(e.target.value)}
                  placeholder="https://example.com/portrait.jpg"
                  onKeyDown={e => e.key === 'Enter' && applyManualUrl()}
                  style={{ flex: 1, backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', padding: '4px 0' }}
                />
                <button onClick={applyManualUrl}
                  style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', padding: '6px 14px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Carica
                </button>
              </div>
            )}
          </div>

          {/* Salta */}
          <button style={{ ...optBtn(false), color: '#5a4020', borderColor: '#3a3020' }} onClick={onNext}>
            → Salta — aggiungi immagine dalla scheda personaggio
          </button>
        </div>
      )}

      {/* Incantesimi placeholder */}
      <div className="p-4 border" style={{ borderColor: '#3a3020', backgroundColor: '#1a1810' }}>
        <div style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.06em', marginBottom: 6 }}>
          INCANTESIMI & EQUIPAGGIAMENTO
        </div>
        <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', fontStyle: 'italic' }}>
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
