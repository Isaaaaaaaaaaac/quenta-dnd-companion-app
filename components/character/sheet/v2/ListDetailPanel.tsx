'use client';

import type { ReactNode } from 'react';
import { card } from './styles';

export interface ListDetailItem {
  id: string;
}

interface Props<T extends ListDetailItem> {
  items: T[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  renderListItem: (item: T, isSelected: boolean) => ReactNode;
  renderDetail: (item: T) => ReactNode;
  emptyDetailText: string;
}

export default function ListDetailPanel<T extends ListDetailItem>({
  items, selectedId, onSelect, renderListItem, renderDetail, emptyDetailText,
}: Props<T>) {
  const selected = items.find(i => i.id === selectedId) ?? null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-2)', alignItems: 'start' }}>
      <div style={{ ...card, maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', overflowX: 'hidden' }}>
        {items.map(item => (
          <div key={item.id} onClick={() => onSelect(item.id)} style={{ cursor: 'pointer' }}>
            {renderListItem(item, item.id === selectedId)}
          </div>
        ))}
      </div>
      <div style={{
        ...card, position: 'sticky', top: 'var(--s-8)',
        maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', overflowX: 'hidden',
      }}>
        {selected ? renderDetail(selected) : (
          <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px',
            color: 'var(--fg-3)', textAlign: 'center', padding: 'var(--s-5) var(--s-3)', margin: 0,
          }}>
            {emptyDetailText}
          </p>
        )}
      </div>
    </div>
  );
}
