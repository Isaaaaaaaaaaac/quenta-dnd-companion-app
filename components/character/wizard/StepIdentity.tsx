'use client';

import { CLASSES } from '@/lib/srd/classes';
import { BACKGROUNDS, getBackground, rollTrait } from '@/lib/srd/backgrounds';
import type { WizardData } from '../CharacterWizard';

// ── Shared DS style constants ───────────────────────────────────────────────
export const wizInp: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)',
  color: 'var(--fg-1)', outline: 'none',
  fontFamily: 'var(--font-body)', fontSize: '0.95rem',
  width: '100%', padding: '8px 12px', borderRadius: 'var(--r-sm)',
};
export const wizLbl: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-label)', fontSize: '8px',
  letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6,
};
export const wizSel: React.CSSProperties = {
  ...wizInp, cursor: 'pointer',
};
export const wizTa: React.CSSProperties = {
  ...wizInp, resize: 'vertical' as const,
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
      <div className="eyebrow" style={{ marginBottom: 10 }}>Passaggio 1</div>
      <h2 style={{ marginBottom: 28 }}>Identità</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={wizLbl}>Nome *</label>
          <input value={data.name} onChange={e => update({ name: e.target.value })}
            className="field-input" placeholder="Nome del personaggio" autoFocus />
        </div>

        <div>
          <label style={wizLbl}>Tipo</label>
          <select value={data.type} onChange={e => update({ type: e.target.value as WizardData['type'] })} className="field-input" style={{ cursor: 'pointer' }}>
            <option value="pc">Personaggio Giocante</option>
            <option value="npc_major">PNG Principale</option>
            <option value="npc_minor">PNG Secondario</option>
          </select>
        </div>

        <div>
          <label style={wizLbl}>Classe</label>
          <select value={data.classKey} onChange={e => update({ classKey: e.target.value, subclass: '' })} className="field-input" style={{ cursor: 'pointer' }}>
            {CLASSES.map(c => <option key={c.key} value={c.key}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label style={wizLbl}>Livello di partenza</label>
          <input type="number" min={1} max={20} value={data.level}
            onChange={e => update({ level: Math.max(1, Math.min(20, Number(e.target.value))), subclass: '' })}
            className="field-input" />
        </div>

        <div>
          <label style={wizLbl}>Allineamento</label>
          <select value={data.alignment} onChange={e => update({ alignment: e.target.value })} className="field-input" style={{ cursor: 'pointer' }}>
            <option value="">— Scegli —</option>
            <option>Legale Buono</option><option>Neutrale Buono</option><option>Caotico Buono</option>
            <option>Legale Neutrale</option><option>Neutrale</option><option>Caotico Neutrale</option>
            <option>Legale Malvagio</option><option>Neutrale Malvagio</option><option>Caotico Malvagio</option>
          </select>
        </div>

        <div>
          <label style={wizLbl}>Background</label>
          <select value={data.backgroundKey}
            onChange={e => update({ backgroundKey: e.target.value, background: e.target.value, personality: '', ideals: '', bonds: '', flaws: '' })}
            className="field-input" style={{ cursor: 'pointer' }}>
            <option value="">— Scegli un background —</option>
            {BACKGROUNDS.map(b => <option key={b.key} value={b.key}>{b.name}</option>)}
          </select>
          {bg && (
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem', fontStyle: 'italic', marginTop: 6 }}>
              {bg.description}
            </div>
          )}
        </div>

        {bg && (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ borderTop: '1px solid var(--border-leather)', paddingTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Tratti background — clicca 🎲 per un tratto casuale</div>
              {(['personality', 'ideals', 'bonds', 'flaws'] as const).map(field => {
                const labels = { personality: 'Tratto', ideals: 'Ideale', bonds: 'Legame', flaws: 'Difetto' };
                return (
                  <div key={field} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={wizLbl}>{labels[field]}</label>
                      <button onClick={() => rollField(field)} className="btn btn-ghost" style={{ padding: '3px 10px' }}>🎲</button>
                    </div>
                    <textarea value={(data as unknown as Record<string, string>)[field]}
                      onChange={e => update({ [field]: e.target.value } as Partial<WizardData>)}
                      rows={2} className="field-input" style={{ resize: 'vertical' }}
                      placeholder={`Tira 🎲 o scrivi un ${labels[field].toLowerCase()}…`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 2, height: 14, backgroundColor: 'var(--danger)', opacity: 0.7 }} />
            <label style={{ ...wizLbl, color: 'var(--fg-1)', marginBottom: 0 }}>Note DM (private)</label>
          </div>
          <textarea value={data.dmNotes} onChange={e => update({ dmNotes: e.target.value })}
            rows={2} className="field-input" style={{ resize: 'vertical', borderColor: 'var(--danger-border)' }}
            placeholder="Visibili solo al DM…" />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
        <WizardButton onClick={onNext} disabled={!canProceed}>Avanti → Razza</WizardButton>
      </div>
    </div>
  );
}

export function WizardButton({ onClick, disabled, children, variant = 'primary' }:
  { onClick: () => void; disabled?: boolean; children: React.ReactNode; variant?: 'primary' | 'secondary' }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={variant === 'primary' ? 'btn btn-secondary' : 'btn btn-ghost'}
      style={{
        padding: '9px 24px',
        ...(variant === 'primary' ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}),
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
      {children}
    </button>
  );
}
