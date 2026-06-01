'use client';

import { useState } from 'react';
import ClassFeaturesModal from './ClassFeaturesModal';
import RacialTraitsModal from './RacialTraitsModal';
import TalentiModal from './TalentiModal';
import type { CharacterClass, CharacterFeat, CharacterResource, CharacterStats, AsiHistoryEntry } from '@/lib/db/schema';

type Mode = 'class' | 'racial' | 'feats';

interface Props {
  mode: Mode;
  label: string;
  count: number | null;
  // class features
  characterClasses?: CharacterClass[];
  resources?: CharacterResource[];
  // racial traits
  characterId?: string;
  raceKey?: string;
  raceName?: string;
  subraceKey?: string;
  racialChoices?: { traitKey: string; value: string | string[] }[];
  // feats
  currentFeats?: CharacterFeat[];
  asiHistory?: AsiHistoryEntry[];
  stats?: CharacterStats;
  // shared
  pinnedFeatures?: import('@/lib/db/schema').PinnedFeature[];
}

export default function FeatureButton({
  mode, label, count,
  characterClasses, resources,
  characterId, raceKey, raceName, subraceKey, racialChoices,
  currentFeats, asiHistory, stats,
  pinnedFeatures = [],
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 var(--s-1)', height: 32,
          border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)',
          cursor: 'pointer', transition: 'all .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-border)'; e.currentTarget.style.background = 'var(--gold-soft)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-leather)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.06em', color: 'var(--fg-2)' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
          {count !== null && (
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'var(--gold)' }}>{count}</span>
          )}
          <span style={{ color: 'var(--fg-3)', fontSize: '12px' }}>›</span>
        </span>
      </div>

      {open && mode === 'class' && characterClasses && resources && characterId && (
        <ClassFeaturesModal
          characterClasses={characterClasses}
          resources={resources}
          characterId={characterId}
          pinnedFeatures={pinnedFeatures}
          onClose={() => setOpen(false)}
        />
      )}

      {open && mode === 'racial' && characterId && raceKey && (
        <RacialTraitsModal
          characterId={characterId}
          raceKey={raceKey}
          raceName={raceName ?? raceKey}
          subraceKey={subraceKey}
          racialChoices={racialChoices ?? []}
          pinnedFeatures={pinnedFeatures}
          onClose={() => setOpen(false)}
        />
      )}

      {open && mode === 'feats' && characterId && stats && (
        <TalentiModal
          characterId={characterId}
          currentFeats={currentFeats ?? []}
          asiHistory={asiHistory ?? []}
          stats={stats}
          classes={characterClasses ?? []}
          pinnedFeatures={pinnedFeatures}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
