'use client';

import { SKILLS } from '@/lib/srd/skills';
import { CLASS_SKILL_OPTIONS } from '@/lib/srd/skillsByClass';
import { CLASS_SKILL_CHOICES } from '@/lib/srd/constants';
import { skillBonus } from '@/lib/rules/calculations';
import { CLASSES } from '@/lib/srd/classes';
import type { WizardData } from '../CharacterWizard';
import { WizardButton } from './StepIdentity';

interface Props { data: WizardData; update: (p: Partial<WizardData>) => void; onNext: () => void; onBack: () => void; }

export default function StepSkills({ data, update, onNext, onBack }: Props) {
  const cls = CLASSES.find(c => c.key === data.classKey);
  const maxChoices = CLASS_SKILL_CHOICES[data.classKey] ?? 2;
  const available = CLASS_SKILL_OPTIONS[data.classKey] ?? [];
  const selected = data.skillProficiencies;

  function toggle(key: string) {
    if (selected.includes(key)) {
      update({ skillProficiencies: selected.filter(k => k !== key) });
    } else if (selected.length < maxChoices) {
      update({ skillProficiencies: [...selected, key] });
    }
  }

  const canProceed = selected.length === maxChoices;

  return (
    <div>
      <h2 className="mb-2">Competenze nelle Abilità</h2>
      <p className="text-sm mb-6" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif' }}>
        Scegli <strong style={{ color: '#c8922a' }}>{maxChoices}</strong> abilità
        tra quelle disponibili per {cls?.name}. ({selected.length}/{maxChoices} selezionate)
      </p>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {SKILLS.map(skill => {
          const isAvailable = available.includes(skill.key);
          const isSelected = selected.includes(skill.key);
          const isDisabled = !isAvailable || (!isSelected && selected.length >= maxChoices);
          const bonus = skillBonus(data.stats[skill.ability], data.level, isSelected, false);

          return (
            <button key={skill.key} onClick={() => !isDisabled && toggle(skill.key)}
              disabled={isDisabled && !isSelected}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '8px 12px', textAlign: 'left',
                border: `1px solid ${isSelected ? '#c8922a' : isAvailable ? '#5a4020' : '#2a2018'}`,
                backgroundColor: isSelected ? '#2a2010' : isAvailable ? '#2a2018' : 'transparent',
                color: isAvailable ? '#e8d5a3' : '#3a3020',
                cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer',
                fontFamily: 'Crimson Text, serif', fontSize: '1rem',
                opacity: !isAvailable ? 0.4 : 1,
                marginBottom: '2px',
              }}>
              <span style={{
                minWidth: '20px', fontFamily: 'Cinzel, serif', fontSize: '0.85rem',
                color: isSelected ? '#c8922a' : '#5a4020',
              }}>
                {isSelected ? '✓' : '○'}
              </span>
              <span style={{ flex: 1 }}>{skill.name}</span>
              <span style={{ fontSize: '0.8rem', color: '#a08060' }}>
                {skill.ability.toUpperCase()}
              </span>
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: '0.9rem', minWidth: '32px', textAlign: 'right',
                color: bonus >= 0 ? '#c8922a' : '#8b2020',
              }}>
                {bonus >= 0 ? `+${bonus}` : bonus}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <WizardButton onClick={onBack} variant="secondary">← Indietro</WizardButton>
        <WizardButton onClick={onNext} disabled={!canProceed}>
          Avanti → Incantesimi
        </WizardButton>
      </div>
    </div>
  );
}
