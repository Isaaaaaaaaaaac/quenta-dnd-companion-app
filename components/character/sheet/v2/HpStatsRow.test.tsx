import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/db/actions', () => ({
  applyDamage: vi.fn().mockResolvedValue(undefined),
  applyHealing: vi.fn().mockResolvedValue(undefined),
  setTempHp: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/components/character/sheet/DeathSavesTracker', () => ({
  default: () => <div>death-saves</div>,
}));

import HpStatsRow from './HpStatsRow';
import { ToastProvider } from './Toast';
import { applyDamage, applyHealing } from '@/lib/db/actions';
import type { Character, CharacterSheet } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

const character = { id: 'char-1', name: 'Thorin', hpCurrent: 42, hpMax: 56, hpTemp: 0 } as Character;
const sheet = { initiativeBonus: 0 } as CharacterSheet;

function makeModel(overrides: Partial<SheetViewModel> = {}): SheetViewModel {
  return {
    hpPct: 75, hpColor: 'var(--success)', canCast: true, spellDC: 16, spellAtk: 6,
    prof: 3, stats: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
    ...overrides,
  } as SheetViewModel;
}

function renderRow(model = makeModel()) {
  return render(
    <ToastProvider>
      <HpStatsRow character={character} sheet={sheet} model={model} />
    </ToastProvider>
  );
}

describe('HpStatsRow', () => {
  it('renders current HP and max HP', () => {
    renderRow();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('/ 56')).toBeInTheDocument();
  });

  it('shows 5 combat stat cards when the character can cast', () => {
    renderRow();
    expect(screen.getByText('C.A.')).toBeInTheDocument();
    expect(screen.getByText('Iniziativa')).toBeInTheDocument();
    expect(screen.getByText('Velocità')).toBeInTheDocument();
    expect(screen.getByText('CD Incantesimi')).toBeInTheDocument();
    expect(screen.getByText('Attacco Incantesimi')).toBeInTheDocument();
  });

  it('computes Iniziativa from the dex modifier, not the proficiency bonus', () => {
    renderRow();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('hides the two spellcasting cards when the character cannot cast', () => {
    renderRow(makeModel({ canCast: false, spellDC: null, spellAtk: null }));
    expect(screen.getByText('C.A.')).toBeInTheDocument();
    expect(screen.queryByText('CD Incantesimi')).toBeNull();
    expect(screen.queryByText('Attacco Incantesimi')).toBeNull();
  });

  it('shows death saves only when hpCurrent is 0', () => {
    renderRow();
    expect(screen.queryByText('death-saves')).toBeNull();
  });

  it('applies damage from the input via the Danno button', () => {
    renderRow();
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '5' } });
    fireEvent.click(screen.getByTitle('Danno'));
    expect(applyDamage).toHaveBeenCalledWith('char-1', 5);
  });

  it('applies healing from the input via the Cura button', () => {
    renderRow();
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '8' } });
    fireEvent.click(screen.getByTitle('Cura'));
    expect(applyHealing).toHaveBeenCalledWith('char-1', 8);
  });
});
