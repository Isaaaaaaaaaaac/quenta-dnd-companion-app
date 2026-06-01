'use client';

import { useState } from 'react';
import { assignUserToCharacter, removeUserFromCharacter } from '@/lib/db/actions';

interface Props { characterId: string; currentUserId: string | null; }

export default function AssignPlayerButton({ characterId, currentUserId }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAssign() {
    if (!input.trim()) return;
    setLoading(true);
    await assignUserToCharacter(characterId, input.trim());
    setLoading(false);
    setOpen(false);
    setInput('');
  }

  async function handleRemove() {
    setLoading(true);
    await removeUserFromCharacter(characterId);
    setLoading(false);
  }

  const btnSm: React.CSSProperties = {
    fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em',
    color: 'var(--fg-2)', background: 'none',
    border: '1px solid var(--border-leather)', padding: '0 var(--s-1)',
    height: 24, borderRadius: 'var(--r-sm)', cursor: 'pointer', transition: 'all .2s',
  };

  return (
    <div>
      {/* Inline player row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--r-sm)',
            background: 'var(--bg-card)', border: '1px solid var(--border-leather)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600,
            color: currentUserId ? 'var(--gold)' : 'var(--fg-3)',
          }}>
            {currentUserId ? currentUserId.slice(0, 1).toUpperCase() : '?'}
          </div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '.06em', color: currentUserId ? 'var(--fg-1)' : 'var(--fg-3)' }}>
            {currentUserId ? 'Giocatore assegnato' : 'Nessun giocatore'}
          </span>
        </div>
        <button
          onClick={() => currentUserId ? handleRemove() : setOpen(o => !o)}
          disabled={loading}
          style={{ ...btnSm, opacity: loading ? 0.4 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '…' : currentUserId ? 'Rimuovi' : 'Assegna'}
        </button>
      </div>

      {/* Inline email form */}
      {open && !currentUserId && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            placeholder="email@gmail.com"
            style={{
              height: 32, padding: '0 var(--s-1)', borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border-leather)', background: 'var(--bg-card)',
              color: 'var(--fg-1)', fontFamily: 'var(--font-sans)', fontSize: '11px',
              outline: 'none', width: '100%',
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAssign} disabled={loading || !input.trim()}
              style={{ ...btnSm, flex: 1, height: 28, color: 'var(--gold)', borderColor: 'rgba(184,134,11,.35)', opacity: (loading || !input.trim()) ? 0.4 : 1 }}>
              {loading ? '…' : 'Salva'}
            </button>
            <button onClick={() => setOpen(false)} style={{ ...btnSm, height: 28 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
