'use client';

import { getSubclassEntry } from '@/lib/srd/subclasses';
import { CLASSES } from '@/lib/srd/classes';
import type { WizardData } from '../CharacterWizard';
import { WizardButton } from './StepIdentity';

interface Props {
  data: WizardData;
  update: (p: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepSubclass({ data, update, onNext, onBack }: Props) {
  const entry = getSubclassEntry(data.classKey);
  const cls = CLASSES.find(c => c.key === data.classKey);

  if (!entry) return null;

  const canProceed = data.subclass.trim().length > 0;

  return (
    <div>
      <h2 className="mb-1">Archetipo di Classe</h2>
      <p className="text-sm mb-6" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif' }}>
        Al livello {entry.unlockLevel}, {cls?.name} sceglie il proprio archetipo.
        Questa scelta è <strong style={{ color: '#c8922a' }}>definitiva</strong> e plasma le capacità future.
      </p>

      <div className="space-y-3">
        {entry.subclasses.map(sub => {
          const isSelected = data.subclass === sub.key;
          return (
            <button key={sub.key}
              onClick={() => update({ subclass: sub.key })}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '16px', cursor: 'pointer',
                border: `1px solid ${isSelected ? '#c8922a' : '#5a4020'}`,
                backgroundColor: isSelected ? '#2a2010' : '#1e1810',
              }}>
              <div style={{
                fontFamily: 'Cinzel, serif', color: isSelected ? '#c8922a' : '#e8d5a3',
                fontSize: '0.95rem', marginBottom: '6px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ color: isSelected ? '#c8922a' : '#5a4020' }}>
                  {isSelected ? '◆' : '◇'}
                </span>
                {sub.name}
              </div>
              <div style={{ color: '#a08060', fontFamily: 'IM Fell English, serif', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '20px' }}>
                {sub.description}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <WizardButton onClick={onBack} variant="secondary">← Indietro</WizardButton>
        <WizardButton onClick={onNext} disabled={!canProceed}>
          Avanti → Caratteristiche
        </WizardButton>
      </div>
    </div>
  );
}
