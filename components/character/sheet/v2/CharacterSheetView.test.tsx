import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/db/actions', () => ({
  shortRest: vi.fn().mockResolvedValue(undefined),
  longRest: vi.fn().mockResolvedValue(undefined),
  applyDamage: vi.fn().mockResolvedValue(undefined),
  applyHealing: vi.fn().mockResolvedValue(undefined),
  setTempHp: vi.fn().mockResolvedValue(undefined),
  useClassResource: vi.fn().mockResolvedValue(undefined),
  useSpellSlot: vi.fn().mockResolvedValue(undefined),
  restoreSpellSlot: vi.fn().mockResolvedValue(undefined),
  equipInventoryItem: vi.fn().mockResolvedValue({}),
  saveInventory: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/components/character/portrait/PortraitButton', () => ({ default: () => <div>portrait</div> }));
vi.mock('@/components/dashboard/XpControls', () => ({ default: () => <div>xp-controls</div> }));
vi.mock('@/components/character/sheet/LevelUpButton', () => ({ default: () => <div>level-up</div> }));
vi.mock('@/components/character/sheet/AsiRetroactiveButton', () => ({ default: () => <div>asi-retroactive</div> }));
vi.mock('@/components/character/sheet/ActiveCharacterButton', () => ({ default: () => <div>active-character</div> }));
vi.mock('@/components/character/sheet/AssignPlayerButton', () => ({ default: () => <div>assign-player</div> }));
vi.mock('@/components/character/features/FeatureButton', () => ({ default: ({ label }: { label: string }) => <div>{label}</div> }));
vi.mock('@/components/character/sheet/DeathSavesTracker', () => ({ default: () => <div>death-saves</div> }));
vi.mock('@/components/character/sheet/BackstoryCard', () => ({ default: () => <div>backstory-card</div> }));
vi.mock('@/components/character/sheet/AddSpellButton', () => ({ default: () => <div>add-spell-button</div> }));
vi.mock('@/components/character/sheet/AddEquipmentButton', () => ({ default: () => <div>add-equipment-button</div> }));

import CharacterSheetView from './CharacterSheetView';
import type { Character, CharacterSheet } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

const character = { id: 'char-1', name: 'Thorin', xp: 14000, hpCurrent: 42, hpMax: 56, hpTemp: 0 } as Character;
const sheet = { stats: { str: 14, dex: 12, con: 15, int: 10, wis: 17, cha: 8 }, money: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 } } as CharacterSheet;
const model = {
  level: 6, prof: 3, passPerc: 15, classLabel: 'Chierico 6', nextXp: 23000, xpPct: 60,
  canLevelUp: false, classesWithSubclass: [], stats: sheet.stats, savingThrows: {}, skillMap: {},
  hpPct: 75, hpColor: 'var(--success)', canCast: false, spellDC: null, spellAtk: null,
  carriedKg: 0, carryMax: 105, pinnedAll: [], activeSpellSlots: [], knownSpells: [],
} as unknown as SheetViewModel;

function renderView(viewerRole: 'dm' | 'player' = 'player') {
  return render(
    <CharacterSheetView
      character={character} sheet={sheet} model={model} conditions={[]} resources={[]}
      campaign={null} isActiveCharacter={true} currentActiveName={null}
      viewerRole={viewerRole} currentUserId="user-1" isOwner={true}
    />
  );
}

describe('CharacterSheetView', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to the Caratteristiche tab', () => {
    renderView();
    expect(screen.getByText('Tiri Salvezza')).toBeInTheDocument();
  });

  it('switches tabs and persists the choice in localStorage under the v2 key', () => {
    renderView();
    fireEvent.click(screen.getByText('Inventario'));
    expect(screen.getByText('Denaro')).toBeInTheDocument();
    expect(window.localStorage.getItem('quenta:sheet-v2-tab:char-1')).toBe('inventory');
  });

  it('restores a previously stored tab after mount', () => {
    window.localStorage.setItem('quenta:sheet-v2-tab:char-1', 'inventory');
    renderView();
    expect(screen.getByText('Denaro')).toBeInTheDocument();
  });

  it('does not render DM-only actions for a player viewer', () => {
    renderView('player');
    expect(screen.queryByText('assign-player')).toBeNull();
  });

  it('renders DM-only actions for a dm viewer', () => {
    renderView('dm');
    expect(screen.getByText('assign-player')).toBeInTheDocument();
  });
});
