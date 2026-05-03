'use client';

import { useState } from 'react';
import { assignUserToCharacter, removeUserFromCharacter } from '@/lib/db/actions';

interface Props {
  characterId: string;
  currentUserId: string | null;
}

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

  return (
    <div>
      {currentUserId ? (
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: '#4a7c4e' }}>
            ✦ Giocatore assegnato
          </span>
          <button onClick={handleRemove} disabled={loading}
            style={{ border: '1px solid #5a4020', color: '#8b2020', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', padding: '2px 8px', cursor: 'pointer' }}>
            Rimuovi
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)}
          style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '4px 12px', cursor: 'pointer' }}>
          + Assegna giocatore
        </button>
      )}

      {open && (
        <div className="mt-2 p-3 border" style={{ borderColor: '#5a4020', backgroundColor: '#1a1410' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: '#6a5040', marginBottom: 6 }}>
            CLERK USER ID del giocatore
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="email@gmail.com"
              style={{ flex: 1, backgroundColor: '#221c14', border: '1px solid #5a4020', color: '#e8d5a3', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', padding: '4px 8px', outline: 'none' }}
            />
            <button onClick={handleAssign} disabled={loading || !input.trim()}
              style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '4px 12px', cursor: 'pointer' }}>
              {loading ? '…' : 'Salva'}
            </button>
            <button onClick={() => setOpen(false)}
              style={{ border: '1px solid #5a4020', color: '#6a5040', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '4px 8px', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
          <p style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.75rem', marginTop: 6, fontStyle: 'italic' }}>
            Inserisci l'email Google del giocatore
          </p>
        </div>
      )}
    </div>
  );
}
