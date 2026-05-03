'use client';

import { useState, useEffect, useRef } from 'react';
import { roll4d6DropLowest, type DiceRoll } from '@/lib/rolls';
import { abilityModifier } from '@/lib/rules/calculations';
import { ABILITY_SHORT } from '@/lib/srd/skills';
import { CLASSES } from '@/lib/srd/classes';
import type { WizardData } from '../CharacterWizard';
import { WizardButton } from './StepIdentity';

type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
const STATS: StatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const MAX_ROLLS = 3; // set totali massimi
const ROLL_DURATION = 900; // ms di animazione per dado

interface DieState {
  value: number;
  spinning: boolean;
  dropped: boolean;
}

interface PoolEntry {
  roll: DiceRoll;
  assignedTo: StatKey | null;
  id: number;
}

interface Props {
  data: WizardData;
  update: (p: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepStats({ data, update, onNext, onBack }: Props) {
  const [pool, setPool] = useState<PoolEntry[]>([]);
  const [rolledCount, setRolledCount] = useState(0);   // quanti punteggi nel pool
  const [setCount, setSetCount] = useState(0);          // quante volte ha premuto "Nuovo set"
  const [spinning, setSpinning] = useState<number | null>(null); // id entry in animazione
  const [diceDisplay, setDiceDisplay] = useState<DieState[]>([]);
  const [selected, setSelected] = useState<number | null>(null); // pool index selezionato
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextId = useRef(0);

  const cls = CLASSES.find(c => c.key === data.classKey);
  const canRollMore = rolledCount < 6;
  const canNewSet = setCount < MAX_ROLLS && rolledCount > 0;
  const isLastSet = setCount === MAX_ROLLS - 1 && rolledCount > 0;

  function rollOne() {
    if (!canRollMore || spinning !== null) return;
    const id = nextId.current++;
    const result = roll4d6DropLowest();

    // Avvia animazione
    setSpinning(id);
    setDiceDisplay(result.dice.map((_, i) => ({ value: 1, spinning: true, dropped: i === result.dropped })));

    let ticks = 0;
    const totalTicks = Math.floor(ROLL_DURATION / 60);
    intervalRef.current = setInterval(() => {
      ticks++;
      setDiceDisplay(result.dice.map((v, i) => ({
        value: ticks >= totalTicks ? v : Math.floor(Math.random() * 6) + 1,
        spinning: ticks < totalTicks,
        dropped: i === result.dropped,
      })));
      if (ticks >= totalTicks) {
        clearInterval(intervalRef.current!);
        setSpinning(null);
        setPool(prev => [...prev, { roll: result, assignedTo: null, id }]);
        setRolledCount(c => c + 1);
      }
    }, 60);
  }

  function startNewSet() {
    if (!canNewSet) return;
    // Rimuovi tutte le entry del set corrente e ricomincia
    setPool([]);
    setRolledCount(0);
    setSelected(null);
    setSetCount(c => c + 1);
    // Reset stats
    update({ stats: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 } });
  }

  function selectPoolEntry(index: number) {
    if (selected === index) { setSelected(null); return; }
    // Permetti ri-selezione anche se già assegnato — per correggere l'assegnazione
    if (pool[index].assignedTo !== null) {
      // Libera temporaneamente la stat a cui era assegnato
      const prevStat = pool[index].assignedTo!;
      const newPool = pool.map((e, i) => i === index ? { ...e, assignedTo: null } : e);
      setPool(newPool);
      const newStats = { ...data.stats };
      // Resetta la stat a un valore neutro finché non viene riassegnata
      newStats[prevStat] = 8;
      update({ stats: newStats });
    }
    setSelected(index);
  }

  function assignToStat(stat: StatKey) {
    if (selected === null) return;
    const selectedValue = pool[selected].roll.total;
    const newPool = pool.map((entry, i) => {
      if (i === selected) return { ...entry, assignedTo: stat };
      if (entry.assignedTo === stat) return { ...entry, assignedTo: null }; // libera la stat precedente
      return entry;
    });
    setPool(newPool);
    setSelected(null);

    // Ricostruisci stats da pool per coerenza
    const newStats = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 } as Record<StatKey, number>;
    newPool.forEach(entry => {
      if (entry.assignedTo) newStats[entry.assignedTo] = entry.roll.total;
    });
    update({ stats: newStats });
  }

  // Calcola stats effettive da assegnazioni correnti
  const assignedStats: Partial<Record<StatKey, number>> = {};
  pool.forEach(entry => {
    if (entry.assignedTo) assignedStats[entry.assignedTo] = entry.roll.total;
  });

  const allAssigned = pool.length === 6 && pool.every(e => e.assignedTo !== null);
  const canProceed = allAssigned;
  const isSpinning = spinning !== null;

  const remainingRolls = 6 - rolledCount;
  const setsLeft = MAX_ROLLS - setCount - 1;

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div>
      <h2 className="mb-1">Caratteristiche</h2>
      {cls && (
        <p className="text-sm mb-5" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
          Suggerimento per {cls.name}: priorità su {getPriority(data.classKey)}.
        </p>
      )}

      {/* Controlli tiro */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <button onClick={rollOne}
          disabled={!canRollMore || isSpinning}
          style={{
            border: `1px solid ${canRollMore && !isSpinning ? '#c8922a' : '#5a4020'}`,
            color: canRollMore && !isSpinning ? '#c8922a' : '#5a4020',
            backgroundColor: 'transparent', fontFamily: 'Cinzel, serif',
            padding: '10px 22px', cursor: canRollMore && !isSpinning ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem', letterSpacing: '0.04em',
          }}>
          🎲 Tira ({remainingRolls} rimast{remainingRolls === 1 ? 'o' : 'i'})
        </button>

        {canNewSet && (
          <button onClick={startNewSet}
            style={{
              border: `1px solid ${isLastSet ? '#8b2020' : '#5a4020'}`,
              color: isLastSet ? '#8b2020' : '#a08060',
              backgroundColor: 'transparent', fontFamily: 'Cinzel, serif',
              padding: '10px 22px', cursor: 'pointer', fontSize: '0.85rem',
            }}>
            ↺ Nuovo set {isLastSet ? '(ultimo!)' : `(${setsLeft} rimast${setsLeft === 1 ? 'o' : 'i'})`}
          </button>
        )}

        {setCount === MAX_ROLLS && rolledCount < 6 && (
          <span style={{ color: '#8b2020', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
            Ultimo set — completa i tiri rimanenti.
          </span>
        )}
      </div>

      {/* Animazione dado corrente */}
      {isSpinning && diceDisplay.length === 4 && (
        <div className="flex gap-2 mb-5 items-center">
          {diceDisplay.map((die, i) => (
            <div key={i} style={{
              width: '52px', height: '52px', border: `2px solid ${die.dropped ? '#5a2020' : '#c8922a'}`,
              backgroundColor: die.dropped ? '#1a0a0a' : '#2a2010',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Cinzel, serif', fontSize: '1.4rem',
              color: die.dropped ? '#5a2020' : '#e8d5a3',
              transition: die.spinning ? 'none' : 'all 0.2s',
              opacity: die.dropped ? 0.5 : 1,
            }}>
              {die.value}
            </div>
          ))}
          <span style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', marginLeft: '8px' }}>
            in corso…
          </span>
        </div>
      )}

      {/* Pool dei punteggi ottenuti */}
      {pool.length > 0 && (
        <div className="mb-5">
          <p className="text-xs mb-2" style={{ color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
            POOL — clicca un punteggio, poi clicca la caratteristica · clicca di nuovo per riassegnare
          </p>
          <div className="flex flex-wrap gap-2">
            {pool.map((entry, i) => {
              const isAssigned = entry.assignedTo !== null;
              const isSel = selected === i;
              return (
                <button key={entry.id}
                  onClick={() => selectPoolEntry(i)}
                  title={entry.roll.dice.map((d, di) => di === entry.roll.dropped ? `[${d}]` : `${d}`).join(' + ') + ` = ${entry.roll.total}${isAssigned ? ` → ${entry.assignedTo?.toUpperCase()}` : ''}`}
                  style={{
                    border: `2px solid ${isSel ? '#c8922a' : isAssigned ? '#8a6010' : '#5a4020'}`,
                    backgroundColor: isSel ? '#3a2800' : isAssigned ? '#2a1e08' : '#2a2018',
                    color: isAssigned ? '#c8922a' : '#e8d5a3',
                    fontFamily: 'Cinzel, serif', padding: '6px 12px',
                    cursor: 'pointer',
                    minWidth: '52px', textAlign: 'center',
                  }}>
                  <div style={{ fontSize: '1.3rem', lineHeight: 1.1 }}>{entry.roll.total}</div>
                  <div style={{ fontSize: '0.5rem', color: '#a08060', marginTop: '2px', display: 'flex', gap: '2px', justifyContent: 'center' }}>
                    {entry.roll.dice.map((d, di) => (
                      <span key={di} style={{ color: di === entry.roll.dropped ? '#5a2020' : '#a08060', textDecoration: di === entry.roll.dropped ? 'line-through' : 'none' }}>
                        {d}
                      </span>
                    ))}
                  </div>
                  {isAssigned && (
                    <div style={{ fontSize: '0.5rem', color: '#c8922a', textTransform: 'uppercase' }}>
                      → {ABILITY_SHORT[entry.assignedTo!]}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Griglia caratteristiche */}
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6 mb-5">
        {STATS.map(stat => {
          const val = assignedStats[stat];
          const displayVal = val ?? data.stats[stat];
          const mod = abilityModifier(displayVal);
          const isTarget = selected !== null;
          const hasValue = val !== undefined;

          return (
            <div key={stat}
              onClick={() => isTarget && assignToStat(stat)}
              style={{
                border: `1px solid ${isTarget ? '#c8922a' : hasValue ? '#8a6010' : '#5a4020'}`,
                backgroundColor: isTarget ? '#2a2010' : hasValue ? '#2a2018' : '#1e1810',
                padding: '12px 6px', textAlign: 'center',
                cursor: isTarget ? 'pointer' : 'default',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}>
              <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {ABILITY_SHORT[stat]}
              </div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.6rem', color: hasValue ? '#e8d5a3' : '#3a3020', lineHeight: 1.1 }}>
                {hasValue ? val : '—'}
              </div>
              <div style={{ fontSize: '0.85rem', color: hasValue ? (mod >= 0 ? '#c8922a' : '#8b2020') : '#3a3020', fontFamily: 'Crimson Text, serif' }}>
                {hasValue ? (mod >= 0 ? `+${mod}` : `${mod}`) : '·'}
              </div>
            </div>
          );
        })}
      </div>

      {selected !== null && (
        <p className="text-sm mb-3" style={{ color: '#c8922a', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
          Punteggio {pool[selected]?.roll.total} selezionato — clicca una caratteristica per assegnarlo.
        </p>
      )}

      <div className="flex justify-between mt-6">
        <WizardButton onClick={onBack} variant="secondary">← Indietro</WizardButton>
        <WizardButton onClick={onNext} disabled={!canProceed}>
          Avanti → Punti Ferita
        </WizardButton>
      </div>
    </div>
  );
}

function getPriority(classKey: string): string {
  const map: Record<string, string> = {
    barbarian: 'FOR e COS', bard: 'CAR e DES', cleric: 'SAG e COS',
    druid: 'SAG e COS', fighter: 'FOR o DES, poi COS',
    monk: 'DES e SAG', paladin: 'FOR e CAR', ranger: 'DES e SAG',
    rogue: 'DES', sorcerer: 'CAR e COS', warlock: 'CAR e COS', wizard: 'INT e COS',
  };
  return map[classKey] ?? 'caratteristiche principali di classe';
}
