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

  const card = (children: React.ReactNode) => (
    <div style={{ maxWidth: 520, margin: '0 auto', border: '1px solid #5a4020', backgroundColor: '#221c14', padding: 40 }}>
      {children}
    </div>
  );

  if (step === 'choice') return card(
    <>
      <div style={{ fontFamily: 'Cinzel Decorative, serif', color: '#c8922a', fontSize: '1.6rem', marginBottom: 8, textAlign: 'center' }}>Aethon</div>
      <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '1rem', fontStyle: 'italic', textAlign: 'center', marginBottom: 36 }}>
        Benvenuto, {userName}. Come vuoi usare Aethon?
      </p>
      <div className="space-y-3">
        <button onClick={() => setStep('dm')} style={{ width: '100%', border: '1px solid #c8922a', backgroundColor: '#2a2010', color: '#c8922a', fontFamily: 'Cinzel, serif', fontSize: '0.9rem', padding: '18px 24px', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>🎲</div>
          <div>Sono un Dungeon Master</div>
          <div style={{ fontSize: '0.75rem', color: '#6a5040', fontFamily: 'Crimson Text, serif', fontStyle: 'italic', marginTop: 4 }}>Gestisco campagne e personaggi. Richiedo accesso al DM Admin.</div>
        </button>
        <button onClick={() => setStep('player')} style={{ width: '100%', border: '1px solid #5a4020', backgroundColor: '#1e1810', color: '#e8d5a3', fontFamily: 'Cinzel, serif', fontSize: '0.9rem', padding: '18px 24px', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>⚔</div>
          <div>Sono un Giocatore</div>
          <div style={{ fontSize: '0.75rem', color: '#6a5040', fontFamily: 'Crimson Text, serif', fontStyle: 'italic', marginTop: 4 }}>Ho un invito da un DM per unirmi a una campagna.</div>
        </button>
      </div>
    </>
  );

  if (step === 'dm') return card(
    <>
      <button onClick={() => setStep('choice')} style={{ border: 'none', background: 'none', color: '#6a5040', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', marginBottom: 20, padding: 0 }}>← Indietro</button>
      <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1.1rem', marginBottom: 8 }}>Richiesta accesso DM</div>
      <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: 24 }}>
        La tua richiesta sarà revisionata dal Super Admin. Riceverai accesso al prossimo login.
      </p>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: '#6a5040', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>MESSAGGIO (opzionale)</label>
        <textarea value={dmNote} onChange={e => setDmNote(e.target.value)} rows={3}
          placeholder="Presentati brevemente al Super Admin…"
          style={{ width: '100%', backgroundColor: '#1a1410', border: '1px solid #5a4020', color: '#e8d5a3', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', padding: '8px 12px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
      </div>
      <button onClick={handleDmSubmit} disabled={loading}
        style={{ width: '100%', border: '1px solid #c8922a', backgroundColor: loading ? '#5a4020' : '#c8922a', color: '#1a1410', fontFamily: 'Cinzel, serif', fontSize: '0.85rem', padding: '12px', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Invio richiesta…' : '✦ Invia richiesta'}
      </button>
    </>
  );

  if (step === 'player') return card(
    <>
      <button onClick={() => setStep('choice')} style={{ border: 'none', background: 'none', color: '#6a5040', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', marginBottom: 20, padding: 0 }}>← Indietro</button>
      <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1.1rem', marginBottom: 8 }}>Unisciti a una campagna</div>
      <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: 24 }}>
        Inserisci il codice invito o incolla il link ricevuto dal tuo DM.
      </p>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: '#6a5040', display: 'block', marginBottom: 6, letterSpacing: '0.06em' }}>CODICE INVITO</label>
        <input value={inviteCode} onChange={e => setInviteCode(e.target.value)}
          placeholder="Es: XK92PL oppure https://…/join/XK92PL"
          style={{ width: '100%', backgroundColor: '#1a1410', border: '1px solid #5a4020', color: '#e8d5a3', fontFamily: 'Cinzel, serif', fontSize: '1rem', padding: '10px 12px', outline: 'none', boxSizing: 'border-box', textTransform: 'uppercase' }} />
        {error && <div style={{ color: '#8b2020', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', marginTop: 6 }}>{error}</div>}
      </div>
      <button onClick={handlePlayerJoin} disabled={loading || !inviteCode.trim()}
        style={{ width: '100%', border: '1px solid #c8922a', backgroundColor: loading || !inviteCode.trim() ? '#5a4020' : '#c8922a', color: '#1a1410', fontFamily: 'Cinzel, serif', fontSize: '0.85rem', padding: '12px', cursor: loading || !inviteCode.trim() ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Verifica…' : '⚔ Entra nella campagna'}
      </button>
    </>
  );

  return null;
}
