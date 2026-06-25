import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ListDetailPanel from './ListDetailPanel';

interface Item { id: string; name: string; }

const items: Item[] = [{ id: '1', name: 'Spada' }, { id: '2', name: 'Scudo' }];

describe('ListDetailPanel', () => {
  it('shows the empty detail text when nothing is selected', () => {
    render(
      <ListDetailPanel
        items={items}
        selectedId={null}
        onSelect={() => {}}
        renderListItem={(item) => <span>{item.name}</span>}
        renderDetail={(item) => <span>{item.name} detail</span>}
        emptyDetailText="Seleziona un oggetto"
      />
    );
    expect(screen.getByText('Seleziona un oggetto')).toBeInTheDocument();
  });

  it('calls onSelect with the clicked item id', () => {
    const onSelect = vi.fn();
    render(
      <ListDetailPanel
        items={items}
        selectedId={null}
        onSelect={onSelect}
        renderListItem={(item) => <span>{item.name}</span>}
        renderDetail={(item) => <span>{item.name} detail</span>}
        emptyDetailText="Seleziona un oggetto"
      />
    );
    fireEvent.click(screen.getByText('Scudo'));
    expect(onSelect).toHaveBeenCalledWith('2');
  });

  it('renders the detail for the selected item', () => {
    render(
      <ListDetailPanel
        items={items}
        selectedId="1"
        onSelect={() => {}}
        renderListItem={(item) => <span>{item.name}</span>}
        renderDetail={(item) => <span>{item.name} detail</span>}
        emptyDetailText="Seleziona un oggetto"
      />
    );
    expect(screen.getByText('Spada detail')).toBeInTheDocument();
    expect(screen.queryByText('Seleziona un oggetto')).toBeNull();
  });

  it('falls back to the empty state if selectedId does not match any item', () => {
    render(
      <ListDetailPanel
        items={items}
        selectedId="missing"
        onSelect={() => {}}
        renderListItem={(item) => <span>{item.name}</span>}
        renderDetail={(item) => <span>{item.name} detail</span>}
        emptyDetailText="Seleziona un oggetto"
      />
    );
    expect(screen.getByText('Seleziona un oggetto')).toBeInTheDocument();
  });
});
