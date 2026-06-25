'use client';

import type { ReactNode } from 'react';
import { startTransition } from 'react';
import { card, sectionLabel } from './styles';
import { useToast } from './useToast';
import { shortRest, longRest } from '@/lib/db/actions';
import PortraitButton from '@/components/character/portrait/PortraitButton';
import XpControls from '@/components/dashboard/XpControls';
import LevelUpButton from '@/components/character/sheet/LevelUpButton';
import AsiRetroactiveButton from '@/components/character/sheet/AsiRetroactiveButton';
import ActiveCharacterButton from '@/components/character/sheet/ActiveCharacterButton';
import FeatureButton from '@/components/character/features/FeatureButton';
import type { Character, CharacterSheet, CharacterResource } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

export interface SidebarProps {
  character: Character;
  sheet: CharacterSheet;
  model: SheetViewModel;
  resources: CharacterResource[];
  campaign: { id: string; name: string } | null;
  isActiveCharacter: boolean;
  currentActiveName: string | null;
  dmActions?: ReactNode;
}

const restButton: React.CSSProperties = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
  height: 28, border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)',
  fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.04em',
  color: 'var(--fg-2)', cursor: 'pointer', background: 'none',
};

export default function Sidebar({
  character, sheet, model, resources, campaign, isActiveCharacter, currentActiveName, dmActions,
}: SidebarProps) {
  const { show } = useToast();

  function handleShortRest() {
    startTransition(async () => {
      await shortRest(character.id);
      show('Riposo breve completato');
    });
  }

  function handleLongRest() {
    startTransition(async () => {
      await longRest(character.id);
      show('Riposo lungo completato');
    });
  }

  return (
    <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <div style={card}>
        <div style={{ display: 'flex', gap: 'var(--s-1)', marginBottom: 'var(--s-2)' }}>
          <PortraitButton
            characterId={character.id}
            characterName={character.name}
            classLabel={model.classLabel}
            portraitUrl={sheet.portraitUrl}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 700,
              color: 'var(--gold)', letterSpacing: '.04em', lineHeight: 1.15,
            }}>
              {character.name.toUpperCase()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--fg-2)', marginTop: 2 }}>{model.classLabel}</div>
            {sheet.alignment && (
              <span style={{
                display: 'inline-block', marginTop: 4, fontFamily: 'var(--font-sans)',
                fontSize: '7.5px', letterSpacing: '.09em', color: 'var(--fg-2)',
                border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: '1px 7px',
              }}>
                {sheet.alignment}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--fg-2)', marginBottom: 4 }}>
          <span style={{ letterSpacing: '.06em' }}>Livello {model.level}</span>
          <span>{character.xp.toLocaleString('it-IT')}{model.nextXp ? ` / ${model.nextXp.toLocaleString('it-IT')}` : ''} XP</span>
        </div>
        <div style={{ height: 3, background: 'var(--bg-inner)', borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--border-leather-dim)' }}>
          <div style={{ height: '100%', width: `${model.xpPct}%`, background: 'var(--gold)', borderRadius: 'var(--r-sm)' }} />
        </div>
        <XpControls characterId={character.id} />
        <LevelUpButton character={character} canLevelUp={model.canLevelUp} />

        <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />

        <div style={{ ...sectionLabel, display: 'flex', alignItems: 'center', gap: 'var(--s-1)', marginBottom: 'var(--s-1)' }}>
          Identità
          <span style={{ flex: 1, height: '.5px', background: 'var(--border-leather-dim)' }} />
        </div>
        {[
          { label: 'Razza', value: sheet.race },
          { label: 'Background', value: sheet.background },
          { label: 'Bonus Comp.', value: `+${model.prof}` },
          { label: 'Perc. Passiva', value: String(model.passPerc) },
        ].filter(row => row.value).map(row => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '3px 0', borderBottom: '.5px solid var(--bg-elevated)',
          }}>
            <span style={{ color: 'var(--fg-2)', fontSize: '10px' }}>{row.label}</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', fontWeight: 600, color: 'var(--gold)' }}>{row.value}</span>
          </div>
        ))}

        {model.classesWithSubclass.length > 0 && (
          <>
            <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />
            {model.classesWithSubclass.map(c => (
              <div key={c.classKey} style={{ fontSize: '10px', color: 'var(--fg-2)', padding: '2px 0' }}>{c.subclass}</div>
            ))}
          </>
        )}

        <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FeatureButton
            mode="class"
            label="Caratteristiche di Classe"
            count={null}
            characterId={character.id}
            characterClasses={sheet.classes}
            resources={resources}
            pinnedFeatures={sheet.pinnedFeatures}
          />
          <FeatureButton
            mode="racial"
            label="Tratti Razziali"
            count={null}
            characterId={character.id}
            raceKey={sheet.race}
            raceName={sheet.race}
            subraceKey={sheet.subrace}
            racialChoices={sheet.racialChoices}
            pinnedFeatures={sheet.pinnedFeatures}
          />
          <FeatureButton
            mode="feats"
            label="Talenti"
            count={sheet.feats?.length ?? 0}
            characterId={character.id}
            currentFeats={sheet.feats}
            asiHistory={sheet.asiHistory}
            stats={model.stats}
          />
        </div>

        <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />

        <AsiRetroactiveButton character={character} />
        {campaign && (
          <ActiveCharacterButton
            characterId={character.id}
            isActive={isActiveCharacter}
            currentActiveName={currentActiveName}
          />
        )}

        <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />

        <div style={{ display: 'flex', gap: 4 }}>
          <button style={restButton} onClick={handleShortRest}>Riposo Breve</button>
          <button style={restButton} onClick={handleLongRest}>Riposo Lungo</button>
        </div>
      </div>

      {dmActions}
    </div>
  );
}
