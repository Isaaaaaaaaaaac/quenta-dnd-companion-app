import BackstoryCard from '@/components/character/sheet/BackstoryCard';
import type { CharacterSheet } from '@/lib/db/schema';

export interface NarrativeTabProps {
  characterId: string;
  charName: string;
  sheet: CharacterSheet;
  isOwner: boolean;
}

export default function NarrativeTab({ characterId, charName, sheet, isOwner }: NarrativeTabProps) {
  return (
    <BackstoryCard
      characterId={characterId}
      charName={charName}
      initialBackstory={sheet.backstory ?? ''}
      personality={sheet.personality}
      ideals={sheet.ideals}
      bonds={sheet.bonds}
      flaws={sheet.flaws}
      isOwner={isOwner}
      vertical={false}
    />
  );
}
