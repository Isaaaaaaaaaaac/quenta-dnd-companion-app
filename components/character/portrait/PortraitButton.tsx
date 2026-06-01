'use client';

import { useState } from 'react';
import PortraitModal from './PortraitModal';

interface Props {
  characterId: string;
  characterName: string;
  classLabel: string;
  portraitUrl?: string;
}

export default function PortraitButton({ characterId, characterName, classLabel, portraitUrl }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        title="Clicca per cambiare il ritratto"
        style={{
          width: 64, height: 64, borderRadius: 'var(--r-sm)',
          border: '1px solid var(--border-leather-dim)', backgroundColor: 'var(--bg-card)',
          flexShrink: 0, overflow: 'hidden', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fg-3)', fontSize: 24,
          cursor: 'pointer', transition: 'border-color .2s',
        }}
      >
        {portraitUrl
          ? <img src={portraitUrl} alt={characterName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : '⚔'
        }
        {/* Overlay "modifica" al hover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(12,10,9,.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity .2s',
          fontSize: 18,
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
        >
          ✎
        </div>
      </div>

      {open && (
        <PortraitModal
          characterId={characterId}
          characterName={characterName}
          classLabel={classLabel}
          currentUrl={portraitUrl}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
