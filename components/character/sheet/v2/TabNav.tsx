'use client';

export type SheetTabId = 'stats' | 'combat' | 'spells' | 'inventory' | 'narrative';

const TABS: { id: SheetTabId; label: string }[] = [
  { id: 'stats', label: 'Caratteristiche' },
  { id: 'combat', label: 'Combattimento' },
  { id: 'spells', label: 'Incantesimi' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'narrative', label: 'Narrativa' },
];

interface Props {
  characterId: string;
  activeTab: SheetTabId;
  onChange: (tab: SheetTabId) => void;
}

export default function TabNav({ activeTab, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-leather-dim)' }}>
      {TABS.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <div
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '7px 14px', fontSize: '11px', letterSpacing: '.04em', cursor: 'pointer',
              color: isActive ? 'var(--gold)' : 'var(--fg-2)',
              borderBottom: `2px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            {tab.label}
          </div>
        );
      })}
    </div>
  );
}
