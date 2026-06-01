'use client';

import { useState } from 'react';
import CharacterWizard from './CharacterWizard';
import ManualCharacterForm from './ManualCharacterForm';
import AiCharacterBuilder from './AiCharacterBuilder';

type Mode = 'choice' | 'wizard' | 'manual' | 'ai';
interface Props { campaignId: string; }

export default function CharacterCreationChoice({ campaignId }: Props) {
  const [mode, setMode] = useState<Mode>('choice');

  if (mode === 'wizard') return <CharacterWizard campaignId={campaignId} />;
  if (mode === 'manual') return <ManualCharacterForm campaignId={campaignId} />;
  if (mode === 'ai')     return <AiCharacterBuilder campaignId={campaignId} onBack={() => setMode('choice')} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1rem', fontStyle: 'italic', marginBottom: 8 }}>
        Come vuoi procedere?
      </p>

      <CreationOption
        icon="✦"
        title="Genera con AI"
        subtitle="Descrivi e lascia fare a Claude"
        desc="Descrivi il personaggio in linguaggio naturale e Claude genera la scheda completa: stat, CA, PF, competenze, background narrativo e note DM. Perfetto per PNG rapidi o per ispirarsi."
        tags={['Claude AI', 'PNG rapidi', 'Narrativo', 'Istantaneo']}
        highlight
        onClick={() => setMode('ai')}
      />

      <CreationOption
        icon="🎲"
        title="Crea da zero"
        subtitle="Wizard guidato passo per passo"
        desc="Scegli razza, classe, background. Tira le caratteristiche con 4d6, tira i PF per ogni livello, scegli competenze e incantesimi. Ideale per personaggi nuovi."
        tags={['Tiro dadi', 'Bonus razziali', 'Regole SRD', 'Guidato']}
        onClick={() => setMode('wizard')}
      />

      <CreationOption
        icon="📋"
        title="Carica scheda esistente"
        subtitle="Inserimento diretto"
        desc="Hai già una scheda compilata su carta o su un altro strumento? Inserisci direttamente tutti i valori finali: nessun tiro di dado, nessuno step obbligatorio."
        tags={['Inserimento diretto', 'Tutti i campi', 'Rapido']}
        onClick={() => setMode('manual')}
      />
    </div>
  );
}

function CreationOption({ icon, title, subtitle, desc, tags, onClick, highlight }: {
  icon: string; title: string; subtitle: string; desc: string;
  tags: string[]; onClick: () => void; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        backgroundColor: highlight ? 'rgba(184,134,11,0.05)' : 'var(--bg-deep)',
        border: `1px solid ${highlight ? 'var(--gold)' : 'var(--border-leather)'}`,
        padding: 28,
        transition: 'border-color 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {highlight && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
          opacity: 0.5,
        }} />
      )}
      <div style={{ display: 'flex', gap: 20 }}>
        <span style={{ fontSize: '1.6rem', flexShrink: 0, marginTop: 2 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700,
            color: highlight ? 'var(--gold)' : 'var(--fg-1)',
            letterSpacing: '0.02em', marginBottom: 4,
          }}>
            {title}
          </div>
          <div style={{
            fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.35em',
            textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 12,
          }}>
            {subtitle}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 16 }}>
            {desc}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {tags.map(t => (
              <span key={t} className={`badge ${highlight ? 'badge-gold' : 'badge-default'}`}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
