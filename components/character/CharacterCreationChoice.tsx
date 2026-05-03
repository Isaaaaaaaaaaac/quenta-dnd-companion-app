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

  const Option = ({ icon, title, desc, tags, onClick, highlight }: {
    icon: string; title: string; desc: string; tags: string[];
    onClick: () => void; highlight?: boolean;
  }) => (
    <button onClick={onClick} className="w-full text-left p-6 border transition-colors"
      style={{ borderColor: highlight ? '#c8922a' : '#5a4020', backgroundColor: '#221c14', cursor: 'pointer' }}>
      <div className="flex items-start gap-4">
        <div style={{ fontSize: '2rem', flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', color: highlight ? '#c8922a' : '#c8922a', fontSize: '1rem', marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', fontStyle: 'italic' }}>
            {desc}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map(t => (
              <span key={t} style={{ border: `1px solid ${highlight ? '#8a6010' : '#5a4020'}`, color: highlight ? '#8a6010' : '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', padding: '2px 6px', letterSpacing: '0.04em' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-4">
      <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '1rem', fontStyle: 'italic', marginBottom: 24 }}>
        Come vuoi procedere?
      </p>

      <Option
        icon="✦"
        title="Genera con AI — Descrivi e lascia fare a Claude"
        desc="Descrivi il personaggio in linguaggio naturale e Claude genera la scheda completa: stat, CA, PF, competenze, background narrativo e note DM. Perfetto per PNG rapidi o per ispirarsi."
        tags={['Claude AI', 'PNG rapidi', 'Narrativo', 'Istantaneo']}
        highlight
        onClick={() => setMode('ai')}
      />

      <Option
        icon="🎲"
        title="Crea da zero — Wizard guidato"
        desc="Step by step: scegli razza, classe, background. Tira le caratteristiche con 4d6, tira i PF per ogni livello, scegli competenze e incantesimi. Ideale per personaggi nuovi."
        tags={['Tiro dadi interattivo', 'Bonus razziali', 'Regole SRD', 'Guidato']}
        onClick={() => setMode('wizard')}
      />

      <Option
        icon="📋"
        title="Carica scheda esistente — Inserimento diretto"
        desc="Hai già una scheda compilata su carta o su un altro strumento? Inserisci direttamente tutti i valori finali: nessun tiro di dado, nessuno step obbligatorio."
        tags={['Inserimento diretto', 'Tutti i campi', 'Nessuno step', 'Rapido']}
        onClick={() => setMode('manual')}
      />
    </div>
  );
}
