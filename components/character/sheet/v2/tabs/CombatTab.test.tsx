import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/db/actions', () => ({
  useClassResource: vi.fn().mockResolvedValue(undefined),
}));

import CombatTab from './CombatTab';
import { ToastProvider } from '../Toast';
import { useClassResource } from '@/lib/db/actions';
import type { CharacterWeapon, PinnedFeature, CharacterResource, CharacterStats } from '@/lib/db/schema';

const stats: CharacterStats = { str: 14, dex: 12, con: 15, int: 10, wis: 17, cha: 8 };
const weapons: CharacterWeapon[] = [{
  id: 'w1', name: 'Martello da Guerra', damageDice: '1d8', damageType: 'contundente',
  properties: [], attackStat: 'str', magic: false, weight: 1,
}];
const pinnedAll: PinnedFeature[] = [
  { key: 'channel_divinity', type: 'class', name: 'Canalizzare Divinità', resourceKey: 'channel_divinity', resetType: 'short' },
  { key: 'turn_undead', type: 'class', name: 'Distruggere Non-Morti' },
];
const resources: CharacterResource[] = [
  { characterId: 'char-1', resourceKey: 'channel_divinity', current: 1, maximum: 1, resetType: 'short' },
];

function renderTab() {
  return render(
    <ToastProvider>
      <CombatTab
        characterId="char-1" weapons={weapons} stats={stats} prof={3}
        pinnedAll={pinnedAll} resources={resources} spellDC={16} canCast={true}
      />
    </ToastProvider>
  );
}

describe('CombatTab', () => {
  it('defaults to the Attacchi sub-tab with no selection and an empty detail state', () => {
    renderTab();
    expect(screen.getByText('Martello da Guerra')).toBeInTheDocument();
    expect(screen.getByText(/Seleziona un attacco/)).toBeInTheDocument();
  });

  it('selects an attack and shows its detail', () => {
    renderTab();
    fireEvent.click(screen.getByText('Martello da Guerra'));
    expect(screen.getByText('+2 contundente')).toBeInTheDocument();
  });

  it('switches to the Capacità sub-tab and shows all pinned features', () => {
    renderTab();
    fireEvent.click(screen.getByText(/Capacità/));
    expect(screen.getByText('Canalizzare Divinità')).toBeInTheDocument();
    expect(screen.getByText('Distruggere Non-Morti')).toBeInTheDocument();
  });

  it('shows a "Usa" button for a feature with a resource, and calls useClassResource on click', () => {
    renderTab();
    fireEvent.click(screen.getByText(/Capacità/));
    fireEvent.click(screen.getByText('Canalizzare Divinità'));
    fireEvent.click(screen.getByText('Usa'));
    expect(useClassResource).toHaveBeenCalledWith('char-1', 'channel_divinity', -1);
  });

  it('shows "Illimitato" and no "Usa" button for a feature without a resource', () => {
    renderTab();
    fireEvent.click(screen.getByText(/Capacità/));
    fireEvent.click(screen.getByText('Distruggere Non-Morti'));
    expect(screen.getByText('Illimitato')).toBeInTheDocument();
    expect(screen.queryByText('Usa')).toBeNull();
  });
});
