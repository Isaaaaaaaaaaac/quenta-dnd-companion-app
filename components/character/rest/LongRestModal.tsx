'use client';

import { useState } from 'react';
import { completePendingRest, saveKnownSpells } from '@/lib/db/actions';
import SpellSearchModal from '@/components/character/spell/SpellSearchModal';
import type { KnownSpell, CharacterClass, CharacterStats } from '@/lib/db/schema';

interface Props {
  characterId: string;
  isPreparedCaster: boolean;
  currentSpells: KnownSpell[];
  casterClassKeys: string[];
  characterClasses: CharacterClass[];
  characterStats: CharacterStats;
  onClose: () => void;
}

export default function LongRestModal({ characterId, isPreparedCaster, currentSpells, casterClassKeys, characterClasses, characterStats, onClose }: Props) {
  const [step, setStep] = useState<'choice' | 'spell-prep'>('choice');
  const [pending, setPending] = useState(false);

  async function handleKeep() {
    setPending(true);
    await completePendingRest(characterId);
    setPending(false);
    onClose();
  }

  // SpellSearchModal salva e chiama onClose → noi completiamo il riposo dopo
  async function handleSpellSaved() {
    await completePendingRest(characterId);
    onClose();
  }

  if (step === 'spell-prep') {
    return (
      <SpellSearchModal
        characterId={characterId}
        currentSpells={currentSpells}
        casterClassKeys={casterClassKeys}
        characterClasses={characterClasses}
        characterStats={characterStats}
        onClose={handleSpellSaved}
      />
    );
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(12,10,9,.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r-lg)', padding: 'var(--s-3)', width: '100%', maxWidth: 440 }}>

        {/* Header */}
        <div style={{ marginBottom: 'var(--s-3)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--arcane)', textTransform: 'uppercase', marginBottom: 6 }}>
            ☾ Riposo Lungo
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--fg-1)', lineHeight: 1.6, marginBottom: 4 }}>
            Riposo completato. PF ripristinati al massimo, slot incantesimo recuperati.
          </p>
          {isPreparedCaster && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--fg-2)', lineHeight: 1.6 }}>
              Come incantatore che prepara gli incantesimi, puoi scegliere quali lanciare per il nuovo giorno.
            </p>
          )}
        </div>

        {/* Scelte */}
        {isPreparedCaster ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)', marginBottom: 'var(--s-2)' }}>
            <button
              onClick={handleKeep} disabled={pending}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '.04em',
                padding: 'var(--s-2)', borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-leather)', background: 'var(--bg-card)',
                color: 'var(--fg-1)', cursor: pending ? 'not-allowed' : 'pointer',
                textAlign: 'left', lineHeight: 1.5, transition: 'all .2s',
                opacity: pending ? 0.4 : 1,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Mantieni gli incantesimi di ieri</div>
              <div style={{ fontSize: '10px', color: 'var(--fg-2)' }}>Continua con gli stessi incantesimi preparati</div>
            </button>
            <button
              onClick={() => setStep('spell-prep')} disabled={pending}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '.04em',
                padding: 'var(--s-2)', borderRadius: 'var(--r-sm)',
                border: '1px solid rgba(91,33,182,.4)', background: 'rgba(91,33,182,.06)',
                color: 'var(--arcane)', cursor: 'pointer',
                textAlign: 'left', lineHeight: 1.5, transition: 'all .2s',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Prepara nuovi incantesimi</div>
              <div style={{ fontSize: '10px', color: 'var(--fg-2)' }}>Scegli quali incantesimi preparare per oggi</div>
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: 'var(--s-2)' }}>
            <button
              onClick={handleKeep} disabled={pending}
              style={{
                width: '100%', fontFamily: 'var(--font-sans)', fontSize: '11px', letterSpacing: '.04em',
                height: 40, borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-leather)', background: 'var(--bg-card)',
                color: 'var(--fg-1)', cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.4 : 1, transition: 'all .2s',
              }}
            >
              {pending ? '…' : 'Ottimo, riposato!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
