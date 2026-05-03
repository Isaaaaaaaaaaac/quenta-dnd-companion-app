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
      <p className="text-sm mb-2" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif' }}>
        Dado vita: <strong style={{ color: '#c8922a', fontFamily: 'Cinzel, serif' }}>d{die}</strong>
        &nbsp;·&nbsp; Modificatore COS:{' '}
        <strong style={{ color: conMod >= 0 ? '#c8922a' : '#8b2020' }}>
          {conMod >= 0 ? `+${conMod}` : conMod}
        </strong>
      </p>
      <p className="text-xs mb-6" style={{ color: '#8b2020', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
        ⚠ Una volta tirati, i PF per ogni livello non possono essere ripetuti.
      </p>

      <div className="space-y-2 mb-6 max-h-72 overflow-y-auto pr-1">
        {levels.map((entry, i) => {
          const isLv1 = i === 0;
          const lvlHP = (entry.value ?? 0) + conMod;
          return (
            <div key={i} className="flex items-center gap-3 py-1"
              style={{ borderBottom: '1px solid #2a2018' }}>
              <span style={{ fontFamily: 'Cinzel, serif', color: '#a08060', fontSize: '0.75rem', minWidth: '48px' }}>
                Lv {i + 1}
              </span>

              {/* Valore dado */}
              <div style={{
                minWidth: '44px', textAlign: 'center',
                border: `1px solid ${entry.locked ? '#5a4020' : '#3a3020'}`,
                backgroundColor: '#2a2018', padding: '4px 8px',
                fontFamily: 'Cinzel, serif', fontSize: '1.1rem',
                color: entry.locked ? '#e8d5a3' : '#3a3020',
              }}>
                {entry.value ?? '—'}
              </div>

              {/* Totale con CON mod */}
              {entry.value !== null && (
                <span style={{ color: '#a08060', fontSize: '0.8rem', fontFamily: 'Crimson Text, serif' }}>
                  {conMod >= 0 ? `+${conMod}` : conMod} ={' '}
                  <strong style={{ color: '#e8d5a3' }}>{lvlHP}</strong>
                </span>
              )}

              {/* Azioni */}
              <div className="flex gap-1 ml-auto">
                {isLv1 ? (
                  <span style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                    MASSIMO
                  </span>
                ) : entry.locked ? (
                  <span style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                    CONFERMATO
                  </span>
                ) : (
                  <>
                    <button onClick={() => commit(i, rollHitDie(die))}
                      style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: 'transparent', cursor: 'pointer', padding: '3px 10px', fontSize: '0.75rem', fontFamily: 'Cinzel, serif' }}>
                      🎲 Tira d{die}
                    </button>
                    <button onClick={() => commit(i, averageHitDie(die))}
                      style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', cursor: 'pointer', padding: '3px 10px', fontSize: '0.75rem' }}
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
      <div className="p-4 border text-center mb-6" style={{ borderColor: allLocked ? '#c8922a' : '#5a4020', backgroundColor: '#2a2010' }}>
        <div style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.12em' }}>
          PUNTI FERITA TOTALI
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '3rem', color: allLocked ? '#c8922a' : '#5a4020', lineHeight: 1 }}>
          {allLocked ? total : '?'}
        </div>
        {!allLocked && (
          <div style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', marginTop: '4px' }}>
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
