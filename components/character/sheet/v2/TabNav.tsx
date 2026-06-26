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
    <div style={{ display: 'flex', gap: 'var(--s-1)', borderBottom: '1px solid var(--border-leather-dim)' }}>
      {TABS.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              padding: 'var(--s-1) var(--s-2)',
              background: 'none',
              border: 'none',
              fontSize: '11px',
              letterSpacing: '.04em',
              cursor: 'pointer',
              color: isActive ? 'var(--gold)' : 'var(--fg-2)',
              borderBottom: `2px solid ${isActive ? 'var(--gold)' : 'transparent'}`,
              marginBottom: -1,
              transition: 'all .12s',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
