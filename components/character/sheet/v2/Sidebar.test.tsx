import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/db/actions', () => ({
  shortRest: vi.fn().mockResolvedValue(undefined),
  longRest: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/components/character/portrait/PortraitButton', () => ({ default: () => <div>portrait</div> }));
vi.mock('@/components/dashboard/XpControls', () => ({ default: () => <div>xp-controls</div> }));
vi.mock('@/components/character/sheet/LevelUpButton', () => ({ default: () => <div>level-up</div> }));
vi.mock('@/components/character/sheet/AsiRetroactiveButton', () => ({ default: () => <div>asi-retroactive</div> }));
vi.mock('@/components/character/sheet/ActiveCharacterButton', () => ({ default: () => <div>active-character</div> }));
vi.mock('@/components/character/features/FeatureButton', () => ({ default: ({ label }: { label: string }) => <div>{label}</div> }));

import Sidebar from './Sidebar';
import { ToastProvider } from './Toast';
import { shortRest, longRest } from '@/lib/db/actions';
import type { Character, CharacterSheet } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

const character = { id: 'char-1', name: 'Thorin', xp: 14000 } as Character;
const sheet = { race: 'Nano', background: 'Acolito', alignment: 'LEGALE BUONO' } as CharacterSheet;
const model = {
  level: 6, prof: 3, passPerc: 15, classLabel: 'Chierico 6', nextXp: 23000, xpPct: 60,
  canLevelUp: false, classesWithSubclass: [],
  stats: { str: 14, dex: 12, con: 15, int: 10, wis: 17, cha: 8 },
} as unknown as SheetViewModel;

function renderSidebar() {
  return render(
    <ToastProvider>
      <Sidebar
        character={character}
        sheet={sheet}
        model={model}
        resources={[]}
        campaign={null}
        isActiveCharacter={true}
        currentActiveName={null}
      />
    </ToastProvider>
  );
}

describe('Sidebar', () => {
  it('renders identity info and the three feature links', () => {
    renderSidebar();
    expect(screen.getByText('THORIN')).toBeInTheDocument();
    expect(screen.getByText('Chierico 6')).toBeInTheDocument();
    expect(screen.getByText('Caratteristiche di Classe')).toBeInTheDocument();
    expect(screen.getByText('Tratti Razziali')).toBeInTheDocument();
    expect(screen.getByText('Talenti')).toBeInTheDocument();
  });

  it('calls shortRest when "Riposo Breve" is clicked', async () => {
    renderSidebar();
    fireEvent.click(screen.getByText('Riposo Breve'));
    expect(shortRest).toHaveBeenCalledWith('char-1');
  });

  it('calls longRest when "Riposo Lungo" is clicked', async () => {
    renderSidebar();
    fireEvent.click(screen.getByText('Riposo Lungo'));
    expect(longRest).toHaveBeenCalledWith('char-1');
  });

  it('renders the dmActions slot when provided', () => {
    render(
      <ToastProvider>
        <Sidebar
          character={character} sheet={sheet} model={model} resources={[]}
          campaign={null} isActiveCharacter={true} currentActiveName={null}
          dmActions={<div>dm-only-section</div>}
        />
      </ToastProvider>
    );
    expect(screen.getByText('dm-only-section')).toBeInTheDocument();
  });
});
