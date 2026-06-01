'use client';

import { useState } from 'react';

type TabId = 'combat' | 'equipment' | 'spells' | 'bio';

const TABS: { id: TabId; label: string }[] = [
  { id: 'combat',    label: 'Combattimento' },
  { id: 'equipment', label: 'Equipaggiamento' },
  { id: 'spells',    label: 'Incantesimi' },
  { id: 'bio',       label: 'Bio' },
];

interface Props {
  characterId: string;
  combat: React.ReactNode;
  equipment: React.ReactNode;
  spells: React.ReactNode;
  bio: React.ReactNode;
}

export default function SheetTabBar({ characterId, combat, equipment, spells, bio }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    if (typeof window === 'undefined') return 'combat';
    const saved = localStorage.getItem(`quenta:sheet-tab:${characterId}`) as TabId | null;
    return saved && TABS.some(t => t.id === saved) ? saved : 'combat';
  });

  function handleTab(id: TabId) {
    setActiveTab(id);
    localStorage.setItem(`quenta:sheet-tab:${characterId}`, id);
  }

  const panels: Record<TabId, React.ReactNode> = { combat, equipment, spells, bio };

  return (
    <div style={{
      background: 'var(--bg-deep)',
      border: '1px solid var(--border-leather-dim)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
    }}>
      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-leather-dim)',
        background: 'var(--bg-inner)',
        padding: '0 var(--s-2)',
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          const accent = tab.id === 'spells' ? 'var(--arcane)' : 'var(--gold)';
          return (
            <button
              key={tab.id}
              onClick={() => handleTab(tab.id)}
              style={{
                padding: 'var(--s-1) var(--s-2)',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${active ? accent : 'transparent'}`,
                color: active ? accent : 'var(--fg-3)',
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: active ? 600 : 400,
                letterSpacing: '.04em',
                cursor: 'pointer',
                transition: 'all .12s',
                flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Panels ── */}
      {(Object.entries(panels) as [TabId, React.ReactNode][]).map(([id, panel]) => (
        <div key={id} style={{ display: activeTab === id ? 'block' : 'none' }}>
          {panel}
        </div>
      ))}
    </div>
  );
}
