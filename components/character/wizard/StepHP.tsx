'use client';

import { useState, useEffect } from 'react';
import { CLASSES } from '@/lib/srd/classes';
import { rollHitDie, averageHitDie } from '@/lib/rolls';
import { abilityModifier } from '@/lib/rules/calculations';
import type { WizardData } from '../CharacterWizard';
import { WizardButton } from './StepIdentity';

interface LevelEntry {
  value: number | null; // null = non ancora deciso
  locked: boolean;      // true = non si può cambiare
}

interface Props {
  data: WizardData;
  update: (p: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepHP({ data, update, onNext, onBack }: Props) {
  const cls = CLASSES.find(c => c.key === data.classKey);
  const die = cls?.hitDie ?? 8;
  const conMod = abilityModifier(data.stats.con);

  // Lv 1 è sempre max e sempre locked
  const [levels, setLevels] = useState<LevelEntry[]>(() =>
    Array.from({ length: data.level }, (_, i) =>
      i === 0 ? { value: die, locked: true } : { value: null, locked: false }
    )
  );

  // Inizializza hpMax al mount — level 1 è pre-locked quindi commit non scatta mai
  useEffect(() => {
    const initial = levels.reduce((s, l) => s + (l.value ?? 0) + conMod, 0);
    update({ hpMax: Math.max(1, initial), hpRolls: levels.map(l => l.value ?? 0) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commit(index: number, value: number) {
    if (levels[index].locked) return;
    const updated = levels.map((l, i) =>
      i === index ? { value, locked: true } : l
    );
    setLevels(updated);
    const total = updated.reduce((s, l) => s + (l.value ?? 0) + conMod, 0);
    update({ hpMax: Math.max(1, total), hpRolls: updated.map(l => l.value ?? 0) });
  }

  const allLocked = levels.every(l => l.locked);
  const total = Math.max(1, levels.reduce((s, l) => s + (l.value ?? 0) + conMod, 0));

  return (
    <div>
      <h2 className="mb-1">Punti Ferita</h2>
      <p className="text-sm mb-2" style={{ color: 'var(--fg-2)', fontFamily: 'var(--font-body)' }}>
        Dado vita: <strong style={{ color: 'var(--gold)', fontFamily: 'var(--font-label)' }}>d{die}</strong>
        &nbsp;·&nbsp; Modificatore COS:{' '}
        <strong style={{ color: conMod >= 0 ? 'var(--gold)' : 'var(--danger)' }}>
          {conMod >= 0 ? `+${conMod}` : conMod}
        </strong>
      </p>
      <p className="text-xs mb-6" style={{ color: 'var(--danger)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
        ⚠ Una volta tirati, i PF per ogni livello non possono essere ripetuti.
      </p>

      <div className="space-y-2 mb-6 max-h-72 overflow-y-auto pr-1">
        {levels.map((entry, i) => {
          const isLv1 = i === 0;
          const lvlHP = (entry.value ?? 0) + conMod;
          return (
            <div key={i} className="flex items-center gap-3 py-1"
              style={{ borderBottom: '1px solid var(--bg-card)' }}>
              <span style={{ fontFamily: 'var(--font-label)', color: 'var(--fg-2)', fontSize: '0.75rem', minWidth: '48px' }}>
                Lv {i + 1}
              </span>

              {/* Valore dado */}
              <div style={{
                minWidth: '44px', textAlign: 'center',
                border: `1px solid ${entry.locked ? 'var(--border-leather-dim)' : 'var(--border-leather)'}`,
                backgroundColor: 'var(--bg-card)', padding: '4px 8px',
                fontFamily: 'var(--font-label)', fontSize: '1.1rem',
                color: entry.locked ? 'var(--fg-1)' : 'var(--border-leather)',
              }}>
                {entry.value ?? '—'}
              </div>

              {/* Totale con CON mod */}
              {entry.value !== null && (
                <span style={{ color: 'var(--fg-2)', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>
                  {conMod >= 0 ? `+${conMod}` : conMod} ={' '}
                  <strong style={{ color: 'var(--fg-1)' }}>{lvlHP}</strong>
                </span>
              )}

              {/* Azioni */}
              <div className="flex gap-1 ml-auto">
                {isLv1 ? (
                  <span style={{ color: 'var(--border-leather-dim)', fontFamily: 'var(--font-label)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                    MASSIMO
                  </span>
                ) : entry.locked ? (
                  <span style={{ color: 'var(--border-leather-dim)', fontFamily: 'var(--font-label)', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                    CONFERMATO
                  </span>
                ) : (
                  <>
                    <button onClick={() => commit(i, rollHitDie(die))}
                      style={{ border: '1px solid var(--gold)', color: 'var(--gold)', backgroundColor: 'transparent', cursor: 'pointer', padding: '3px 10px', fontSize: '0.75rem', fontFamily: 'var(--font-label)' }}>
                      🎲 Tira d{die}
                    </button>
                    <button onClick={() => commit(i, averageHitDie(die))}
                      style={{ border: '1px solid var(--border-leather-dim)', color: 'var(--fg-2)', backgroundColor: 'transparent', cursor: 'pointer', padding: '3px 10px', fontSize: '0.75rem' }}
                      title={`Usa la media: ${averageHitDie(die)}`}>
                      ⌀ {averageHitDie(die)}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totale */}
      <div className="p-4 border text-center mb-6" style={{ borderColor: allLocked ? 'var(--gold)' : 'var(--border-leather-dim)', backgroundColor: 'rgba(184,134,11,0.08)' }}>
        <div style={{ color: 'var(--fg-2)', fontFamily: 'var(--font-label)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>
          PUNTI FERITA TOTALI
        </div>
        <div style={{ fontFamily: 'var(--font-label)', fontSize: '3rem', color: allLocked ? 'var(--gold)' : 'var(--border-leather-dim)', lineHeight: 1 }}>
          {allLocked ? total : '?'}
        </div>
        {!allLocked && (
          <div style={{ color: 'var(--border-leather-dim)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', marginTop: '4px' }}>
            Completa tutti i livelli per vedere il totale
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <WizardButton onClick={onBack} variant="secondary">← Indietro</WizardButton>
        <WizardButton onClick={() => onNext()} disabled={!allLocked}>
          Avanti → Competenze
        </WizardButton>
      </div>
    </div>
  );
}
