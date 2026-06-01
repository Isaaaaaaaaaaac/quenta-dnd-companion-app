'use client';

import { useState } from 'react';
import { spendHitDice, completePendingRest } from '@/lib/db/actions';
import { CLASSES } from '@/lib/srd/classes';
import type { CharacterClass } from '@/lib/db/schema';

interface Props {
  characterId: string;
  classes: CharacterClass[];
  conModifier: number;
  hitDiceUsed: number;
  hpCurrent: number;
  hpMax: number;
  onClose: () => void;
}

export default function ShortRestModal({ characterId, classes, conModifier, hitDiceUsed, hpCurrent, hpMax, onClose }: Props) {
  const totalHD = classes.reduce((s, c) => s + c.level, 0);
  const available = Math.max(0, totalHD - hitDiceUsed);

  const [diceToSpend, setDiceToSpend] = useState(0);
  const [rolledHp, setRolledHp] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  // Computa il dado medio pesato per multiclasse
  const hitDieTypes = classes.map(c => {
    const cls = CLASSES.find(cl => cl.key === c.classKey);
    return { die: cls?.hitDie ?? 8, count: c.level };
  });

  function rollDice() {
    let total = 0;
    for (let i = 0; i < diceToSpend; i++) {
      // Seleziona il dado pesato in base ai livelli delle classi
      let remaining = Math.floor(Math.random() * totalHD);
      let die = 8;
      for (const { die: d, count } of hitDieTypes) {
        if (remaining < count) { die = d; break; }
        remaining -= count;
      }
      const roll = Math.floor(Math.random() * die) + 1;
      total += Math.max(1, roll + conModifier);
    }
    setRolledHp(total);
  }

  async function handleConfirm() {
    setPending(true);
    const gain = rolledHp ?? 0;
    await spendHitDice(characterId, diceToSpend, gain);
    setPending(false);
    onClose();
  }

  async function handleSkip() {
    setPending(true);
    await completePendingRest(characterId);
    setPending(false);
    onClose();
  }

  const hpAfter = rolledHp !== null ? Math.min(hpMax, hpCurrent + rolledHp) : null;

  const inp: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border-leather)',
    borderRadius: 'var(--r)', color: 'var(--fg-1)',
    fontFamily: 'var(--font-sans)', fontSize: '14px', outline: 'none',
    textAlign: 'center', height: 40, width: 80,
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(12,10,9,.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r2)', padding: 'var(--sp-3)', width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div style={{ marginBottom: 'var(--sp-2)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--info)', textTransform: 'uppercase', marginBottom: 4 }}>
            ☽ Riposo Breve
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--fg-2)', lineHeight: 1.6 }}>
            Puoi spendere Dadi Vita per recuperare PF. Ogni dado ti fa recuperare 1d{hitDieTypes[0]?.die ?? 8} + {conModifier >= 0 ? '+' : ''}{conModifier} PF.
          </p>
        </div>

        {/* HD disponibili */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', padding: 'var(--sp-1) var(--sp-2)', marginBottom: 'var(--sp-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)' }}>Dadi Vita disponibili</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: available > 0 ? 'var(--gold)' : 'var(--fg-3)' }}>
            {available} / {totalHD}
          </span>
        </div>

        {/* Classi con HD */}
        <div style={{ marginBottom: 'var(--sp-2)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {hitDieTypes.map(({ die, count }, i) => {
            const cls = CLASSES.find(cl => cl.hitDie === die && classes[i]?.classKey === cl.key);
            return (
              <span key={i} style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--fg-2)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r)', padding: '2px 8px' }}>
                {count}×d{die} {cls ? `(${cls.name})` : ''}
              </span>
            );
          })}
        </div>

        {available > 0 ? (
          <>
            {/* Quanti dadi spendere */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', flex: 1 }}>Dadi da spendere:</span>
              <input
                type="number" min={0} max={available}
                value={diceToSpend}
                onChange={e => { setDiceToSpend(Math.min(available, Math.max(0, parseInt(e.target.value) || 0))); setRolledHp(null); }}
                style={inp}
              />
            </div>

            {diceToSpend > 0 && (
              <div style={{ display: 'flex', gap: 'var(--sp-1)', marginBottom: 'var(--sp-2)' }}>
                <button onClick={rollDice}
                  style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.07em', height: 36, borderRadius: 'var(--r)', border: '1px solid var(--info)', color: 'var(--info)', background: 'rgba(14,116,144,.07)', cursor: 'pointer' }}>
                  🎲 Tira i Dadi
                </button>
              </div>
            )}

            {rolledHp !== null && (
              <div style={{ background: 'rgba(74,124,78,.1)', border: '1px solid rgba(74,124,78,.3)', borderRadius: 'var(--r)', padding: 'var(--sp-1) var(--sp-2)', marginBottom: 'var(--sp-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)' }}>PF recuperati</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: 'var(--hp-healthy)' }}>+{rolledHp}</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)' }}>{hpCurrent} → {hpAfter}</span>
              </div>
            )}
          </>
        ) : (
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)', marginBottom: 'var(--sp-2)' }}>
            Hai esaurito tutti i tuoi Dadi Vita. Recupererai metà dei tuoi dadi con il prossimo Riposo Lungo.
          </p>
        )}

        {/* Azioni */}
        <div style={{ display: 'flex', gap: 'var(--sp-1)', justifyContent: 'flex-end' }}>
          <button onClick={handleSkip} disabled={pending}
            style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em', color: 'var(--fg-2)', background: 'none', border: '1px solid var(--border-leather)', padding: '0 var(--sp-2)', height: 32, borderRadius: 'var(--r)', cursor: 'pointer', opacity: pending ? 0.4 : 1 }}>
            Salta
          </button>
          {rolledHp !== null && (
            <button onClick={handleConfirm} disabled={pending}
              style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.06em', color: 'var(--bg-deep)', background: 'var(--hp-healthy)', border: 'none', padding: '0 var(--sp-2)', height: 32, borderRadius: 'var(--r)', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.5 : 1 }}>
              {pending ? '…' : 'Conferma'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
