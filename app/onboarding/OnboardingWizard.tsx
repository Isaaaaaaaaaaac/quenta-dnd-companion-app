'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitDmRequest } from '@/lib/db/userActions';

type Step = 'choice' | 'dm' | 'player';
interface Props { userId: string; userName: string; }

export default function OnboardingWizard({ userId, userName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('choice');
  const [dmNote, setDmNote] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDmSubmit() {
    setLoading(true);
    setError('');
    await submitDmRequest(userId, dmNote);
    router.push('/onboarding/pending');
  }

  async function handlePlayerJoin() {
    setLoading(true);
    setError('');
    const code = inviteCode.trim().toUpperCase().replace(/.*\/join\//i, '');
    if (!code) { setError('Inserisci un codice valido.'); setLoading(false); return; }
    router.push(`/join/${code}`);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="card" style={{ padding: 48, maxWidth: 540, width: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'var(--gold-border)',
          opacity: 0.5,
        }} />

        {step === 'choice' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '0.05em', marginBottom: 8 }}>
                Quenta
              </div>
              <div style={{ fontFamily: 'var(--font-label)', fontSize: '7px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.8, marginBottom: 24 }}>
                D&amp;D Companion
              </div>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.7 }}>
                Benvenuto, {userName}.<br />Come vuoi usare Quenta?
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ChoiceButton
                icon="🎲"
                title="Sono un Dungeon Master"
                desc="Gestisco campagne e personaggi. Richiedo accesso al DM Admin."
                highlight
                onClick={() => setStep('dm')}
              />
              <ChoiceButton
                icon="⚔"
                title="Sono un Giocatore"
                desc="Ho un invito da un DM per unirmi a una campagna."
                onClick={() => setStep('player')}
              />
            </div>
          </>
        )}

        {step === 'dm' && (
          <>
            <button onClick={() => setStep('choice')} className="btn btn-ghost" style={{ padding: '4px 0', marginBottom: 28, fontSize: '8px' }}>
              ← Indietro
            </button>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Accesso DM</div>
            <h2 style={{ marginBottom: 16 }}>Richiesta accesso</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 28 }}>
              La tua richiesta sarà revisionata dal Super Admin. Riceverai accesso al prossimo login.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label className="field-label">Messaggio (opzionale)</label>
              <textarea
                className="field-input"
                value={dmNote} onChange={e => setDmNote(e.target.value)}
                rows={3} placeholder="Presentati brevemente al Super Admin…"
                style={{ resize: 'none' }}
              />
            </div>

            <button onClick={handleDmSubmit} disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
              {loading ? 'Invio richiesta…' : '✦  Invia richiesta'}
            </button>
          </>
        )}

        {step === 'player' && (
          <>
            <button onClick={() => setStep('choice')} className="btn btn-ghost" style={{ padding: '4px 0', marginBottom: 28, fontSize: '8px' }}>
              ← Indietro
            </button>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Giocatore</div>
            <h2 style={{ marginBottom: 16 }}>Unisciti a una campagna</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 28 }}>
              Inserisci il codice invito o incolla il link ricevuto dal tuo DM.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label className="field-label">Codice invito</label>
              <input
                className="field-input"
                value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                placeholder="Es: XK92PL oppure https://…/join/XK92PL"
                style={{ textTransform: 'uppercase' }}
              />
              {error && <div className="field-error">{error}</div>}
            </div>

            <button
              onClick={handlePlayerJoin}
              disabled={loading || !inviteCode.trim()}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              {loading ? 'Verifica…' : '⚔  Entra nella campagna'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ChoiceButton({ icon, title, desc, onClick, highlight }: {
  icon: string; title: string; desc: string; onClick: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        backgroundColor: highlight ? 'var(--gold-soft)' : 'var(--bg-card)',
        border: `1px solid ${highlight ? 'var(--gold)' : 'var(--border-leather)'}`,
        padding: 24, transition: 'border-color 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: 2 }}>{icon}</span>
        <div>
          <div style={{
            fontFamily: 'var(--font-label)', fontSize: '9px', letterSpacing: '0.35em',
            textTransform: 'uppercase', color: highlight ? 'var(--gold)' : 'var(--fg-1)',
            marginBottom: 8,
          }}>
            {title}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.65 }}>
            {desc}
          </div>
        </div>
      </div>
    </button>
  );
}
