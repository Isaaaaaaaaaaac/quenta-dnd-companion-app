'use client';

import { CLASSES } from '@/lib/srd/classes';
import { SKILLS, ABILITY_SHORT } from '@/lib/srd/skills';
import { abilityModifier } from '@/lib/rules/calculations';
import type { WizardData } from '../CharacterWizard';
import { WizardButton } from './StepIdentity';

type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
const STATS: StatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface Props { data: WizardData; onBack: () => void; onSave: () => void; saving: boolean; }

export default function StepReview({ data, onBack, onSave, saving }: Props) {
  const cls = CLASSES.find(c => c.key === data.classKey);

  const section = (title: string, children: React.ReactNode) => (
    <div className="mb-4">
      <div className="divider mb-3" />
      <h3 className="mb-2">{title}</h3>
      {children}
    </div>
  );

  const row = (label: string, value: string | number | undefined) => value ? (
    <div className="flex justify-between text-sm py-1" style={{ borderBottom: '1px solid var(--bg-card)' }}>
      <span style={{ color: 'var(--fg-2)', fontFamily: 'var(--font-label)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ color: 'var(--fg-1)', fontFamily: 'var(--font-body)' }}>{value}</span>
    </div>
  ) : null;

  return (
    <div>
      <h2 className="mb-6">Riepilogo</h2>

      {section('Identità', <>
        {row('Nome', data.name)}
        {row('Tipo', data.type === 'pc' ? 'Personaggio Giocante' : data.type === 'npc_major' ? 'PNG Principale' : 'PNG Secondario')}
        {row('Razza', data.race)}
        {row('Classe', cls?.name)}
        {row('Livello', data.level)}
        {row('Background', data.background)}
        {row('Allineamento', data.alignment)}
      </>)}

      {section('Caratteristiche', (
        <div className="grid grid-cols-6 gap-2">
          {STATS.map(stat => {
            const val = data.stats[stat];
            const mod = abilityModifier(val);
            return (
              <div key={stat} className="text-center p-2" style={{ border: '1px solid var(--border-leather-dim)' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--fg-2)', fontFamily: 'var(--font-label)' }}>{ABILITY_SHORT[stat]}</div>
                <div style={{ fontFamily: 'var(--font-label)', fontSize: '1.3rem', color: 'var(--fg-1)' }}>{val}</div>
                <div style={{ fontSize: '0.8rem', color: mod >= 0 ? 'var(--gold)' : 'var(--danger)' }}>
                  {mod >= 0 ? `+${mod}` : mod}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {section('Punti Ferita', (
        <div className="text-center py-2">
          <span style={{ fontFamily: 'var(--font-label)', fontSize: '2.5rem', color: 'var(--gold)' }}>{data.hpMax}</span>
          <span style={{ color: 'var(--fg-2)', fontFamily: 'var(--font-body)', marginLeft: '8px' }}>PF massimi</span>
        </div>
      ))}

      {data.skillProficiencies.length > 0 && section('Competenze', (
        <div className="flex flex-wrap gap-2">
          {data.skillProficiencies.map(key => {
            const skill = SKILLS.find(s => s.key === key);
            return skill ? (
              <span key={key} style={{ border: '1px solid var(--border-leather-dim)', color: 'var(--fg-1)', padding: '2px 8px', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
                {skill.name}
              </span>
            ) : null;
          })}
        </div>
      ))}

      <div className="flex justify-between mt-8">
        <WizardButton onClick={onBack} variant="secondary">← Modifica</WizardButton>
        <button onClick={onSave} disabled={saving} style={{
          border: '1px solid var(--gold)', color: 'var(--bg-deep)',
          backgroundColor: saving ? 'var(--border-leather-dim)' : 'var(--gold)',
          fontFamily: 'var(--font-label)', fontSize: '0.9rem',
          padding: '10px 28px', cursor: saving ? 'not-allowed' : 'pointer',
          letterSpacing: '0.05em',
        }}>
          {saving ? 'Salvando…' : '⚔ Crea Personaggio'}
        </button>
      </div>
    </div>
  );
}
