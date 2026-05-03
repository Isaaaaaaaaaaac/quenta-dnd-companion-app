'use client';

import { useState } from 'react';
import { RACES, type StatKey } from '@/lib/srd/races';
import { ABILITY_SHORT, ABILITY_NAMES } from '@/lib/srd/skills';
import type { WizardData } from '../CharacterWizard';
import { WizardButton } from './StepIdentity';

const STATS: StatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface Props {
  data: WizardData;
  update: (p: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepRace({ data, update, onNext, onBack }: Props) {
  const [subraceKey, setSubraceKey] = useState('');
  const [choiceKeys, setChoiceKeys] = useState<StatKey[]>([]);

  const race = RACES.find(r => r.key === data.race);
  const hasSubraces = (race?.subRaces?.length ?? 0) > 0;
  const subrace = race?.subRaces?.find(s => s.key === subraceKey);

  const bonus = race?.baseBonus;
  const isChoice = bonus?.type === 'choice';
  const isHalfElf = data.race === 'half_elf';
  const choiceCount = isChoice ? (bonus as { count: number }).count : isHalfElf ? 2 : 0;
  const needsChoice = isChoice || isHalfElf;

  function toggleChoice(key: StatKey) {
    if (choiceKeys.includes(key)) {
      setChoiceKeys(choiceKeys.filter(k => k !== key));
    } else if (choiceKeys.length < choiceCount) {
      setChoiceKeys([...choiceKeys, key]);
    }
  }

  const canProceed =
    (!hasSubraces || subraceKey !== '') &&
    (!needsChoice || choiceKeys.length === choiceCount);

  function handleNext() {
    update({ subrace: subraceKey, race: data.race });
    // Store choices in a temp field — applied to stats after rolling
    (update as (p: Record<string, unknown>) => void)({ _raceChoiceKeys: choiceKeys, _subraceKey: subraceKey });
    onNext();
  }

  const getBonusDisplay = () => {
    if (!race) return null;
    const parts: string[] = [];

    if (bonus?.type === 'fixed') {
      Object.entries(bonus.bonuses).forEach(([k, v]) => {
        if (v) parts.push(`+${v} ${ABILITY_SHORT[k as StatKey]}`);
      });
    } else if (bonus?.type === 'choice') {
      parts.push(`+${bonus.amount} a ${bonus.count} caratteristiche a scelta`);
    }

    if (isHalfElf) parts.push('+1 a 2 caratteristiche a scelta (escluso CAR)');

    if (subrace) {
      Object.entries(subrace.bonus.bonuses).forEach(([k, v]) => {
        if (v) parts.push(`+${v} ${ABILITY_SHORT[k as StatKey]} (${subrace.name})`);
      });
    }

    return parts;
  };

  return (
    <div>
      <h2 className="mb-1">Razza</h2>
      <p className="text-sm mb-6" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
        La razza definisce i bonus alle caratteristiche e i tratti innati del personaggio.
      </p>

      {/* Dropdown razza */}
      <div className="mb-5">
        <label style={{ display: 'block', fontSize: '0.75rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Razza *
        </label>
        <select value={data.race}
          onChange={e => { update({ race: e.target.value, subrace: '' }); setSubraceKey(''); setChoiceKeys([]); }}
          style={{ backgroundColor: '#2a2018', border: 'none', borderBottom: '1px solid #5a4020', color: '#e8d5a3', outline: 'none', fontFamily: 'Crimson Text, serif', fontSize: '1rem', width: '100%', padding: '4px 2px', cursor: 'pointer' }}>
          <option value="">— Scegli una razza —</option>
          {RACES.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
        </select>
      </div>

      {race && (
        <>
          {/* Descrizione + velocità */}
          <div className="mb-4 p-3" style={{ backgroundColor: '#2a2018', border: '1px solid #5a4020' }}>
            <p style={{ color: '#e8d5a3', fontFamily: 'IM Fell English, serif', fontStyle: 'italic', marginBottom: '8px' }}>
              {race.description}
            </p>
            <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
              Velocità: {race.speed}m &nbsp;·&nbsp; Tratti: {race.traits.join(', ')}
            </div>
          </div>

          {/* Sottorazza */}
          {hasSubraces && (
            <div className="mb-5">
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Sottorazza *
              </label>
              <div className="space-y-2">
                {race.subRaces!.map(sub => (
                  <button key={sub.key} onClick={() => setSubraceKey(sub.key)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '12px',
                      border: `1px solid ${subraceKey === sub.key ? '#c8922a' : '#5a4020'}`,
                      backgroundColor: subraceKey === sub.key ? '#2a2010' : '#1e1810',
                      cursor: 'pointer',
                    }}>
                    <div style={{ fontFamily: 'Cinzel, serif', color: subraceKey === sub.key ? '#c8922a' : '#e8d5a3', marginBottom: '4px' }}>
                      {subraceKey === sub.key ? '◆ ' : '◇ '}{sub.name}
                    </div>
                    <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
                      {Object.entries(sub.bonus.bonuses).map(([k, v]) => `+${v} ${ABILITY_SHORT[k as StatKey]}`).join(', ')}
                      {sub.traits && ` · ${sub.traits.join(', ')}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scelta caratteristiche */}
          {needsChoice && (
            <div className="mb-5">
              <p style={{ fontSize: '0.75rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: '8px' }}>
                SCEGLI {choiceCount} CARATTERISTICHE (+1 ciascuna)
                {isHalfElf && ' — escluso Carisma (già +2)'}
                &nbsp;·&nbsp; {choiceKeys.length}/{choiceCount} selezionate
              </p>
              <div className="grid grid-cols-3 gap-2">
                {STATS.map(stat => {
                  const isExcluded = isHalfElf && stat === 'cha';
                  const isSelected = choiceKeys.includes(stat);
                  const isDisabled = isExcluded || (!isSelected && choiceKeys.length >= choiceCount);
                  return (
                    <button key={stat} onClick={() => !isDisabled && toggleChoice(stat)} disabled={isDisabled}
                      style={{
                        padding: '8px', border: `1px solid ${isSelected ? '#c8922a' : '#5a4020'}`,
                        backgroundColor: isSelected ? '#2a2010' : isDisabled ? '#1a1410' : '#2a2018',
                        color: isDisabled ? '#3a3020' : '#e8d5a3', cursor: isDisabled ? 'not-allowed' : 'pointer',
                        fontFamily: 'Cinzel, serif', fontSize: '0.8rem', textAlign: 'center',
                      }}>
                      <div style={{ fontSize: '0.6rem', color: '#a08060' }}>{ABILITY_SHORT[stat]}</div>
                      <div>{ABILITY_NAMES[stat]}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Riepilogo bonus */}
          {getBonusDisplay()!.length > 0 && (
            <div className="p-3" style={{ backgroundColor: '#2a2010', border: '1px solid #5a4020' }}>
              <div style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.08em', marginBottom: '6px' }}>
                BONUS RAZZIALI
              </div>
              <div className="flex flex-wrap gap-2">
                {getBonusDisplay()!.map((b, i) => (
                  <span key={i} style={{ border: '1px solid #c8922a', color: '#c8922a', padding: '2px 8px', fontFamily: 'Cinzel, serif', fontSize: '0.8rem' }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-between mt-8">
        <WizardButton onClick={onBack} variant="secondary">← Indietro</WizardButton>
        <WizardButton onClick={handleNext} disabled={!data.race || !canProceed}>
          Avanti →
        </WizardButton>
      </div>
    </div>
  );
}
