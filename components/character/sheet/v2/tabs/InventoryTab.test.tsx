import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/db/actions', () => ({
  equipInventoryItem: vi.fn().mockResolvedValue({}),
  saveInventory: vi.fn().mockResolvedValue(undefined),
}));

import InventoryTab from './InventoryTab';
import { ToastProvider } from '../Toast';
import { equipInventoryItem, saveInventory } from '@/lib/db/actions';
import type { InventoryItem } from '@/lib/db/schema';

const inventory: InventoryItem[] = [
  { id: 'i1', name: 'Martello da Guerra', quantity: 1, weight: 1, equipped: true, category: 'Arma' },
  { id: 'i2', name: 'Torce', quantity: 5, weight: 0.5, equipped: false, category: 'Comune' },
];
const money = { pp: 0, gp: 45, ep: 0, sp: 12, cp: 30 };

function renderTab() {
  return render(
    <ToastProvider>
      <InventoryTab characterId="char-1" inventory={inventory} money={money} carriedKg={3.5} carryMax={105} />
    </ToastProvider>
  );
}

describe('InventoryTab', () => {
  it('renders the coin strip with all 5 denominations', () => {
    renderTab();
    expect(screen.getByText('MO')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('shows weight against carry max', () => {
    renderTab();
    expect(screen.getByText('3.5 / 105 kg')).toBeInTheDocument();
  });

  it('filters to equipped items only', () => {
    renderTab();
    fireEvent.click(screen.getByText(/Equipaggiato/));
    expect(screen.getByText('Martello da Guerra')).toBeInTheDocument();
    expect(screen.queryByText('Torce')).toBeNull();
  });

  it('increments a coin amount via the + button using the input value', () => {
    renderTab();
    const input = screen.getByTestId('coin-input-gp') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.click(screen.getByTestId('coin-plus-gp'));
    expect(saveInventory).toHaveBeenCalledWith('char-1', inventory, { ...money, gp: 55 });
  });

  it('selects an item and shows its detail with an equip toggle calling equipInventoryItem', () => {
    renderTab();
    fireEvent.click(screen.getByText(/Torce/));
    fireEvent.click(screen.getByTestId('item-menu-i2'));
    fireEvent.click(screen.getByText('Indossa'));
    expect(equipInventoryItem).toHaveBeenCalledWith('char-1', 'i2', 'equip');
  });
});
