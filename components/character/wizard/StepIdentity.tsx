'use client';

import { CLASSES } from '@/lib/srd/classes';
import { BACKGROUNDS, getBackground, rollTrait } from '@/lib/srd/backgrounds';
import type { WizardData } from '../CharacterWizard';

const input: React.CSSProperties = {
  backgroundColor: 'transparent', border: 'none',
  borderBottom: '1px solid #5a4020', color: '#e8d5a3',
  outline: 'none', fontFamily: 'Crimson Text, serif',
  fontSize: '1rem', width: '100%', padding: '4px 0',
};
const label: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', color: '#a08060',
  fontFamily: 'Cinzel, serif', letterSpacing: '0.05em', marginBottom: '4px',
};
const select: React.CSSProperties = { ...input, backgroundColor: '#2a2018', cursor: 'pointer', padding: '4px 2px' };
const textarea: React.CSSProperties = {
  ...input, borderBottom: 'none', border: '1px solid #5a4020',
  padding: '8px', resize: 'vertical' as const,
};

interface Props { data: WizardData; update: (p: Partial<WizardData>) => void; onNext: () => void; }

export default function StepIdentity({ data, update, onNext }: Props) {
  const canProceed = data.name.trim().length > 0;
  const bg = getBackground(data.backgroundKey);

  function rollField(field: 'personality' | 'ideals' | 'bonds' | 'flaws') {
    if (!bg) return;
    update({ [field]: rollTrait(bg.traits[field]) });
  }

  return (
    <div>
      <h2 className="mb-6">Identità</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <div className="md:col-span-2">
          <label style={label}>Nome *</label>
          <input value={data.name} onChange={e => update({ name: e.target.value })}
            style={input} placeholder="Nome del personaggio" autoFocus />
        </div>

        <div>
          <label style={label}>Tipo</label>
          <select value={data.type} onChange={e => update({ type: e.target.value as WizardData['type'] })} style={select}>
            <option value="pc">Personaggio Giocante</option>
            <option value="npc_major">PNG Principale</option>
            <option value="npc_minor">PNG Secondario</option>
          </select>
        </div>

        <div>
          <label style={label}>Classe</label>
          <select value={data.classKey} onChange={e => update({ classKey: e.target.value, subclass: '' })} style={select}>
            {CLASSES.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label style={label}>Livello di partenza</label>
          <input type="number" min={1} max={20} value={data.level}
            onChange={e => update({ level: Math.max(1, Math.min(20, Number(e.target.value))), subclass: '' })}
            style={input} />
        </div>

        <div>
          <label style={label}>Allineamento</label>
          <select value={data.alignment} onChange={e => update({ alignment: e.target.value })} style={select}>
            <option value="">— Scegli —</option>
            <option>Legale Buono</option><option>Neutrale Buono</option><option>Caotico Buono</option>
            <option>Legale Neutrale</option><option>Neutrale</option><option>Caotico Neutrale</option>
            <option>Legale Malvagio</option><option>Neutrale Malvagio</option><option>Caotico Malvagio</option>
          </select>
        </div>

        {/* Background */}
        <div>
          <label style={label}>Background</label>
          <select value={data.backgroundKey}
            onChange={e => update({ backgroundKey: e.target.value, background: e.target.value, personality: '', ideals: '', bonds: '', flaws: '' })}
            style={select}>
            <option value="">— Scegli un background —</option>
            {BACKGROUNDS.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
          </select>
          {bg && (
            <div className="mt-1 text-xs" style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontStyle: 'italic' }}>
              {bg.description}
            </div>
          )}
        </div>

        {/* Tratti background con tiro dado */}
        {bg && (
          <div className="md:col-span-2 space-y-3">
            <div className="divider" />
            <p style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.75rem', letterSpacing: '0.06em' }}>
              TRATTI — clicca 🎲 per tirare un tratto casuale, o scrivi liberamente
            </p>

            {(['personality', 'ideals', 'bonds', 'flaws'] as const).map(field => {
              const labels = { personality: 'Tratto', ideals: 'Ideale', bonds: 'Legame', flaws: 'Difetto' };
              return (
                <div key={field}>
                  <div className="flex items-center justify-between mb-1">
                    <label style={{ ...label, marginBottom: 0 }}>{labels[field]}</label>
                    <button onClick={() => rollField(field)}
                      title={`Tira un ${labels[field]} casuale`}
                      style={{ border: '1px solid #5a4020', color: '#c8922a', backgroundColor: 'transparent', cursor: 'pointer', padding: '2px 8px', fontSize: '0.75rem', fontFamily: 'Cinzel, serif' }}>
                      🎲
                    </button>
                  </div>
                  <textarea value={(data as unknown as Record<string, string>)[field]}
                    onChange={e => update({ [field]: e.target.value } as Partial<WizardData>)}
                    rows={2} style={textarea}
                    placeholder={`Tira 🎲 o scrivi un ${labels[field].toLowerCase()}…`} />
                </div>
              );
            })}
          </div>
        )}

        <div className="md:col-span-2">
          <label style={label}>Note DM (private)</label>
          <textarea value={data.dmNotes} onChange={e => update({ dmNotes: e.target.value })}
            rows={2} style={textarea} placeholder="Visibili solo al DM…" />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <WizardButton onClick={onNext} disabled={!canProceed}>
          Avanti → Razza
        </WizardButton>
      </div>
    </div>
  );
}

export function WizardButton({ onClick, disabled, children, variant = 'primary' }:
  { onClick: () => void; disabled?: boolean; children: React.ReactNode; variant?: 'primary' | 'secondary' }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      border: `1px solid ${variant === 'primary' ? '#c8922a' : '#5a4020'}`,
      color: variant === 'primary' ? '#c8922a' : '#a08060',
      backgroundColor: 'transparent', fontFamily: 'Cinzel, serif',
      fontSize: '0.85rem', padding: '8px 20px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1, letterSpacing: '0.05em',
    }}>
      {children}
    </button>
  );
}
