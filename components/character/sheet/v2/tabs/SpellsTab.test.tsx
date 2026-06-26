import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/db/actions', () => ({
  useSpellSlot: vi.fn().mockResolvedValue(undefined),
  restoreSpellSlot: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/components/character/sheet/AddSpellButton', () => ({ default: () => <div>add-spell-button</div> }));

import SpellsTab from './SpellsTab';
import { ToastProvider } from '../Toast';
import { useSpellSlot } from '@/lib/db/actions';
import type { CharacterSpellSlot, KnownSpell, CharacterStats } from '@/lib/db/schema';

const characterStats: CharacterStats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

const activeSpellSlots: CharacterSpellSlot[] = [
  { characterId: 'char-1', slotLevel: 1, total: 4, used: 1 },
];
const knownSpells: KnownSpell[] = [
  { id: 'guida', name: 'Guida', level: 0, prepared: true },
  { id: 'parola-di-comando', name: 'Parola di Comando', level: 1, prepared: false },
];

function renderTab(spells = knownSpells) {
  return render(
    <ToastProvider>
      <SpellsTab
        characterId="char-1" activeSpellSlots={activeSpellSlots} knownSpells={spells} canCast={true}
        casterClassKeys={['cleric']} characterClasses={[{ classKey: 'cleric', level: 6 }]} characterStats={characterStats}
      />
    </ToastProvider>
  );
}

describe('SpellsTab', () => {
  it('shows an empty state with no spells when the character cannot cast', () => {
    render(
      <ToastProvider>
        <SpellsTab
          characterId="char-1" activeSpellSlots={[]} knownSpells={[]} canCast={false}
          casterClassKeys={[]} characterClasses={[]} characterStats={characterStats}
        />
      </ToastProvider>
    );
    expect(screen.getByText('Nessun incantesimo disponibile')).toBeInTheDocument();
  });

  it('lists known spells by default (Tutti)', () => {
    renderTab();
    expect(screen.getByText('Guida')).toBeInTheDocument();
    expect(screen.getByText('Parola di Comando')).toBeInTheDocument();
  });

  it('filters to only prepared spells', () => {
    renderTab();
    fireEvent.click(screen.getByText(/Preparati/));
    expect(screen.getByText('Guida')).toBeInTheDocument();
    expect(screen.queryByText('Parola di Comando')).toBeNull();
  });

  it('consumes a slot when a level with remaining slots is clicked', () => {
    renderTab();
    fireEvent.click(screen.getByTestId('slot-badge-1'));
    expect(useSpellSlot).toHaveBeenCalledWith('char-1', 1);
  });

  it('shows spell details when a row is selected', () => {
    renderTab();
    fireEvent.click(screen.getByText('Guida'));
    expect(screen.getByText('Divinazione')).toBeInTheDocument();
  });
});
