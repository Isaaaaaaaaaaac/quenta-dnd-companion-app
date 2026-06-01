# Character Sheet Tab Navigation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a 4-tab navigation (Combattimento · Equipaggiamento · Incantesimi · Bio) in the desktop and mobile character sheet, with HP always visible above the tabs.

**Architecture:** Create `SheetTabBar` (client, manages localStorage tab state, shows/hides panels via CSS) and `HpStrip` (server, extracts HP+conditions). Restructure the desktop page to pass 4 pre-rendered panels to `SheetTabBar`. Refactor `MobileSheet` from 5 tabs to 4, moving HP controls into the sticky header.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, inline styles with DS tokens (`var(--gold)`, `var(--arcane)`, `var(--r-sm)` etc.), existing components: `HpControls`, `ConditionBadge`, `AddConditionButton`, `DeathSavesTracker`, `InventoryCard`, `SpellSectionTabs`, `BackstoryCard`, `PinnedActiveResources`.

---

## File Map

| File | Action |
|------|--------|
| `components/character/sheet/SheetTabBar.tsx` | **CREATE** — client component, 4-tab bar + CSS panel show/hide |
| `components/character/sheet/HpStrip.tsx` | **CREATE** — server component, HP display + controls + conditions |
| `app/characters/[id]/page.tsx` | **MODIFY** — restructure right panel to use SheetTabBar + HpStrip |
| `components/character/mobile/MobileSheet.tsx` | **MODIFY** — 5 tabs → 4 tabs, upgrade header with full HP controls |
| `app/my-character/page.tsx` | **NO CHANGE** — separate read-only page, different UX, out of scope |

---

## Task 1: Create `SheetTabBar` component

**Files:**
- Create: `components/character/sheet/SheetTabBar.tsx`

Context: This is a pure `'use client'` component. It receives 4 pre-rendered React nodes as props and shows/hides them with `display: none`. Tab state is persisted to `localStorage` so the user's last tab survives page refreshes. The key `quenta:sheet-tab` is a string of type `TabId`.

- [ ] **Step 1: Create the file with complete implementation**

```tsx
// components/character/sheet/SheetTabBar.tsx
'use client';

import { useState, useEffect } from 'react';

type TabId = 'combat' | 'equipment' | 'spells' | 'bio';

const TABS: { id: TabId; label: string }[] = [
  { id: 'combat',    label: 'Combattimento' },
  { id: 'equipment', label: 'Equipaggiamento' },
  { id: 'spells',    label: 'Incantesimi' },
  { id: 'bio',       label: 'Bio' },
];

interface Props {
  combat: React.ReactNode;
  equipment: React.ReactNode;
  spells: React.ReactNode;
  bio: React.ReactNode;
}

export default function SheetTabBar({ combat, equipment, spells, bio }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('combat');

  useEffect(() => {
    const saved = localStorage.getItem('quenta:sheet-tab') as TabId | null;
    if (saved && TABS.some(t => t.id === saved)) setActiveTab(saved);
  }, []);

  function handleTab(id: TabId) {
    setActiveTab(id);
    localStorage.setItem('quenta:sheet-tab', id);
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep SheetTabBar
```

Expected: no output (no errors). If errors appear, fix them before continuing.

- [ ] **Step 3: Commit**

```bash
git add components/character/sheet/SheetTabBar.tsx
git commit -m "feat: aggiungi SheetTabBar con localStorage persistence"
```

---

## Task 2: Create `HpStrip` component

**Files:**
- Create: `components/character/sheet/HpStrip.tsx`

Context: This is a Server Component (no `'use client'`) that extracts the HP display + bar + controls + death saves + conditions row currently inline inside `app/characters/[id]/page.tsx` (lines ~537–573). It delegates interactive buttons to `HpControls` (already client), `ConditionBadge`, `AddConditionButton`, and `DeathSavesTracker`. It imports `CONDITIONS` from `@/lib/srd/conditions` to resolve `conditionKey` → name/icon without needing a prop.

- [ ] **Step 1: Create the file with complete implementation**

```tsx
// components/character/sheet/HpStrip.tsx
import HpControls from '@/components/dashboard/HpControls';
import ConditionBadge from '@/components/dashboard/ConditionBadge';
import AddConditionButton from '@/components/dashboard/AddConditionButton';
import DeathSavesTracker from '@/components/character/sheet/DeathSavesTracker';
import { CONDITIONS } from '@/lib/srd/conditions';
import type { CharacterSheet } from '@/lib/db/schema';

interface Props {
  characterId: string;
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
  hpPct: number;
  hpColor: string;
  hitDie: number;
  level: number;
  conditions: Array<{ id: string; conditionKey: string; characterId: string }>;
  sheet: CharacterSheet;
}

export default function HpStrip({
  characterId, hpCurrent, hpMax, hpTemp, hpPct, hpColor,
  hitDie, level, conditions, sheet,
}: Props) {
  return (
    <div style={{
      background: 'var(--bg-deep)',
      border: '1px solid var(--border-leather-dim)',
      borderRadius: 'var(--r-lg)',
      padding: 'var(--s-2)',
      display: 'flex',
      gap: 'var(--s-3)',
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      {/* HP number + bar */}
      <div style={{ minWidth: 140 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-1)', marginBottom: 4 }}>
          <span style={{
            fontFamily: 'var(--font-serif)', fontSize: '40px', fontWeight: 700,
            lineHeight: 1, color: hpColor, transition: 'color .4s',
          }}>
            {hpCurrent}
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--fg-2)' }}>
            / {hpMax} max{hpTemp > 0 ? ` (+${hpTemp} temp)` : ''}
          </span>
        </div>
        <div style={{ height: 4, backgroundColor: 'var(--bg-card)', borderRadius: 'var(--r-sm)', overflow: 'hidden', marginBottom: 4 }}>
          <div style={{
            height: '100%', width: `${hpPct}%`, backgroundColor: hpColor,
            borderRadius: 'var(--r-sm)', transition: 'width .5s ease, background .6s',
          }} />
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-3)' }}>
          Dado Vita{' '}
          <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '11px', color: 'var(--fg-2)' }}>
            d{hitDie} × {level}
          </strong>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border-leather-dim)', flexShrink: 0 }} />

      {/* Interactive controls */}
      <div>
        <HpControls characterId={characterId} hpCurrent={hpCurrent} hpMax={hpMax} />
        {hpCurrent === 0 && (
          <div style={{ marginTop: 'var(--s-1)', paddingTop: 'var(--s-1)', borderTop: '1px solid var(--danger-border)' }}>
            <DeathSavesTracker characterId={characterId} sheet={sheet} />
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border-leather-dim)', flexShrink: 0 }} />

      {/* Conditions */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600,
          letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6,
        }}>
          Condizioni Attive
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-1)', alignItems: 'center', minHeight: 24 }}>
          {conditions.length === 0 && (
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)' }}>
              Nessuna condizione
            </span>
          )}
          {conditions.map(c => {
            const def = CONDITIONS.find(d => d.key === c.conditionKey);
            return def
              ? <ConditionBadge key={c.id} conditionId={c.id} characterId={characterId} name={def.name} icon={def.icon} />
              : null;
          })}
          <AddConditionButton characterId={characterId} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep HpStrip
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/character/sheet/HpStrip.tsx
git commit -m "feat: aggiungi HpStrip come componente server autonomo"
```

---

## Task 3: Restructure desktop page

**Files:**
- Modify: `app/characters/[id]/page.tsx`

Context: The desktop right panel currently has: `BackstoryCard` at top, then a `grid gridTemplateColumns: 'repeat(3, 1fr)'` with 3 columns (Col 2: stats/salvezze/abilità; Col 3: HP/condizioni/attacchi; Col 4: inventario/denaro/incantesimi). The new layout has: `HpStrip` above `SheetTabBar`. The 4 panels are assembled from the existing JSX blocks, just reorganized.

The file currently also has an old `display: 'none'` block (lines ~721–828) containing duplicate code — this should be deleted.

Add these two imports at the top of the existing import list:

```tsx
import SheetTabBar from '@/components/character/sheet/SheetTabBar';
import HpStrip from '@/components/character/sheet/HpStrip';
```

- [ ] **Step 1: Add imports**

In `app/characters/[id]/page.tsx`, add after the last existing import (`import type { Character } from '@/lib/db/schema';`):

```tsx
import SheetTabBar from '@/components/character/sheet/SheetTabBar';
import HpStrip from '@/components/character/sheet/HpStrip';
```

- [ ] **Step 2: Replace the right panel (pannello destro) with the new layout**

Find the block starting at:
```tsx
{/* ════ Pannello destro: grid 3 colonne + BackstoryCard ════ */}
<div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
```

Replace everything inside that `<div>` (all children, from `BackstoryCard` through the closing `</div>` that ends `{/* Fine pannello destro */}`) with the following — keeping the outer `<div style={{ flex: 1, minWidth: 0, ... }}>` wrapper:

```tsx
{/* ════ Pannello destro: HP strip + Tab navigation ════ */}
<div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>

  {/* HP Strip — sempre visibile */}
  <HpStrip
    characterId={char.id}
    hpCurrent={char.hpCurrent}
    hpMax={char.hpMax}
    hpTemp={char.hpTemp}
    hpPct={hpPct}
    hpColor={hpColor}
    hitDie={hitDie}
    level={level}
    conditions={conditions}
    sheet={sheet}
  />

  {/* Tab navigation */}
  <SheetTabBar
    combat={
      <div style={{ padding: 'var(--s-2)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--s-2)', alignItems: 'start' }}>

        {/* Col A: Caratteristiche + Tiri Salvezza */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          <div style={CARD}>
            <SectionTitle>Caratteristiche</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-1)' }}>
              {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(key => {
                const val = stats[key];
                const mod = abilityModifier(val);
                const isNeg = mod < 0;
                const isZero = mod === 0;
                return (
                  <div key={key} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1)', textAlign: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--fg-2)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{ABILITY_NAMES[key]}</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, color: isNeg ? 'var(--danger)' : isZero ? 'var(--fg-2)' : 'var(--gold)', lineHeight: 1, display: 'block' }}>
                      {formatModifier(mod)}
                    </span>
                    <span style={{ display: 'inline-block', marginTop: 4, backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-2)', padding: '1px var(--s-1)', minWidth: 24 }}>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={CARD}>
            <SectionTitle>Tiri Salvezza</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(key => {
                const proficient = (savingThrows as Record<string, boolean>)[key] ?? false;
                const bonus = abilityModifier(stats[key]) + (proficient ? prof : 0);
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 'var(--r-sm)', border: `1.5px solid ${proficient ? 'var(--gold)' : 'var(--fg-3)'}`, backgroundColor: proficient ? 'var(--gold)' : 'transparent', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: 'var(--fg-1)' }}>{ABILITY_NAMES[key]}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: bonus > 0 ? 'var(--gold)' : bonus < 0 ? 'var(--danger)' : 'var(--fg-2)' }}>
                      {formatModifier(bonus)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Col B: Stats combattimento + Attacchi + Risorse pinnate attive */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          <div style={CARD}>
            <SectionTitle>Statistiche di Combattimento</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--s-1)' }}>
                {[
                  ['C.A.', sheet.armorClass ?? (10 + abilityModifier(stats.dex))],
                  ['Iniziativa', formatModifier(abilityModifier(stats.dex) + (sheet.initiativeBonus ?? 0))],
                  ['Velocità', `${sheet.speed ?? 9}m`],
                ].map(([l, v]) => (
                  <div key={String(l)} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1)', textAlign: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--fg-2)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{l}</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', display: 'block' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-1)' }}>
                {[
                  ['Bonus Comp.', `+${prof}`],
                  ['Perc. Passiva', passPerc],
                  ...(spellDC !== null ? [['CD Incant.', spellDC], ['Att. Incant.', formatModifier(spellAtk!)]] : []),
                ].map(([l, v]) => (
                  <div key={String(l)} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1)', textAlign: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--fg-2)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{l}</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--fg-1)', display: 'block' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={CARD}>
            <SectionTitle>Attacchi</SectionTitle>
            {(sheet.weapons?.length ?? 0) === 0 ? (
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)' }}>
                Nessuna arma — aggiungi equipaggiamento nella scheda
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr>
                    {['Arma', 'Car.', 'Danno', 'Acc.'].map(h => (
                      <th key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.09em', color: 'var(--fg-2)', textAlign: 'left', paddingBottom: 'var(--s-1)', borderBottom: '1px solid var(--border-leather)', fontWeight: 400, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(sheet.weapons ?? []).map(w => {
                    const atkMod = abilityModifier(stats[w.attackStat]) + prof + (w.magicBonus ?? 0);
                    const dmgMod = abilityModifier(stats[w.attackStat]) + (w.magicBonus ?? 0);
                    return (
                      <tr key={w.id}>
                        <td style={{ padding: '5px 0', borderBottom: '.5px solid var(--bg-elevated)', color: 'var(--fg-1)' }}>{w.name}{w.magic && w.magicBonus ? ` +${w.magicBonus}` : ''}</td>
                        <td style={{ padding: '5px 0', borderBottom: '.5px solid var(--bg-elevated)', color: 'var(--fg-2)', fontSize: '10px' }}>{w.attackStat.toUpperCase()}</td>
                        <td style={{ padding: '5px 0', borderBottom: '.5px solid var(--bg-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--gold)', fontSize: '11px', fontWeight: 500 }}>
                          {w.damageDice}{dmgMod !== 0 ? formatModifier(dmgMod) : ''}
                        </td>
                        <td style={{ padding: '5px 0', borderBottom: '.5px solid var(--bg-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--hp-healthy)', fontSize: '11px' }}>
                          {formatModifier(atkMod)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {pinnedActive.length > 0 && (
            <PinnedActiveResources
              characterId={char.id}
              features={pinnedActive}
              resources={resources}
            />
          )}
        </div>

        {/* Col C: Abilità */}
        <div style={CARD}>
          <SectionTitle>Abilità</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 var(--s-1)' }}>
            <div>
              {leftAbilities.map((ability, abilityIdx) => {
                const abilitySkills = SKILLS.filter(s => s.ability === ability);
                if (!abilitySkills.length) return null;
                return (
                  <div key={ability}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 2, paddingLeft: 'var(--s-2)', marginTop: abilityIdx === 0 ? 0 : 'var(--s-1)' }}>
                      {ABILITY_SHORT[ability]}
                    </div>
                    {abilitySkills.map(skill => {
                      const sk = skillMap[skill.key] ?? { proficient: false, expertise: false };
                      const bonus = skillBonus(stats[skill.ability], level, sk.proficient, sk.expertise);
                      return (
                        <div key={skill.key} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px var(--s-1)', borderRadius: 'var(--r-sm)' }}>
                          <div style={{ width: 6, height: 6, borderRadius: 'var(--r-sm)', border: `1.5px solid ${sk.expertise ? 'var(--arcane)' : sk.proficient ? 'var(--gold)' : 'var(--fg-3)'}`, backgroundColor: sk.proficient ? (sk.expertise ? 'var(--arcane)' : 'var(--gold)') : 'transparent', flexShrink: 0 }} />
                          <span style={{ flex: 1, color: 'var(--fg-2)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill.name}</span>
                          <span style={{ fontSize: '8px', color: 'var(--fg-3)', flexShrink: 0 }}>{ABILITY_SHORT[ability]}</span>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, color: bonus > 0 ? 'var(--gold)' : bonus < 0 ? 'var(--danger)' : 'var(--fg-2)', minWidth: 22, textAlign: 'right', flexShrink: 0 }}>
                            {formatModifier(bonus)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div>
              {rightAbilities.map((ability, abilityIdx) => {
                const abilitySkills = SKILLS.filter(s => s.ability === ability);
                if (!abilitySkills.length) return null;
                return (
                  <div key={ability}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 2, paddingLeft: 'var(--s-2)', marginTop: abilityIdx === 0 ? 0 : 'var(--s-1)' }}>
                      {ABILITY_SHORT[ability]}
                    </div>
                    {abilitySkills.map(skill => {
                      const sk = skillMap[skill.key] ?? { proficient: false, expertise: false };
                      const bonus = skillBonus(stats[skill.ability], level, sk.proficient, sk.expertise);
                      return (
                        <div key={skill.key} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px var(--s-1)', borderRadius: 'var(--r-sm)' }}>
                          <div style={{ width: 6, height: 6, borderRadius: 'var(--r-sm)', border: `1.5px solid ${sk.expertise ? 'var(--arcane)' : sk.proficient ? 'var(--gold)' : 'var(--fg-3)'}`, backgroundColor: sk.proficient ? (sk.expertise ? 'var(--arcane)' : 'var(--gold)') : 'transparent', flexShrink: 0 }} />
                          <span style={{ flex: 1, color: 'var(--fg-2)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill.name}</span>
                          <span style={{ fontSize: '8px', color: 'var(--fg-3)', flexShrink: 0 }}>{ABILITY_SHORT[ability]}</span>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, color: bonus > 0 ? 'var(--gold)' : bonus < 0 ? 'var(--danger)' : 'var(--fg-2)', minWidth: 22, textAlign: 'right', flexShrink: 0 }}>
                            {formatModifier(bonus)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    }
    equipment={
      <div style={{ padding: 'var(--s-2)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <InventoryCard
          characterId={char.id}
          inventory={sheet.inventory ?? []}
          money={sheet.money ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }}
        />
        <div style={CARD}>
          <SectionTitle>Capacità di Trasporto</SectionTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--fg-2)', marginBottom: 'var(--s-1)' }}>
            <span>Peso trasportato</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: carryOverloaded ? 'var(--danger)' : 'var(--fg-1)' }}>
              {carriedKg.toFixed(1)} / {carryMax} kg
            </span>
          </div>
          <div style={{ height: 4, backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${carryPct}%`, backgroundColor: carryOverloaded ? 'var(--danger)' : 'var(--gold)', borderRadius: 'var(--r-sm)', opacity: 0.7 }} />
          </div>
        </div>
        {sheet.money && (
          <div style={CARD}>
            <SectionTitle>Denaro</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--s-1)', marginBottom: 'var(--s-1)' }}>
              {([
                ['PP', 'var(--fg-1)', sheet.money.pp],
                ['PO', 'var(--gold)',    sheet.money.gp],
                ['PE', '#a0a0c8',               sheet.money.ep],
                ['PA', '#a8a8a8',               sheet.money.sp],
                ['PR', '#b06030',               sheet.money.cp],
              ] as [string, string, number][]).map(([label, color, val]) => (
                <div key={label} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1) 4px', textAlign: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.08em', color, display: 'block', marginBottom: 2, textTransform: 'uppercase' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 600, color: 'var(--fg-1)', display: 'block' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-1)' }}>
              <button style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em', height: 32, borderRadius: 'var(--r-sm)', border: '1px solid var(--border-leather)', background: 'var(--bg-card)', color: 'var(--fg-2)', cursor: 'pointer', transition: 'all .2s' }}>+ Aggiungi</button>
              <button style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em', height: 32, borderRadius: 'var(--r-sm)', border: '1px solid var(--border-leather)', background: 'var(--bg-card)', color: 'var(--fg-2)', cursor: 'pointer', transition: 'all .2s' }}>Assegna Denaro</button>
            </div>
          </div>
        )}
        {sheet.dmNotes && isDm && (
          <div style={{ ...CARD, border: '1px solid var(--danger-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s-1)' }}>
              <div style={{ width: 2, height: 14, backgroundColor: 'var(--danger)', opacity: 0.7, borderRadius: 'var(--r-sm)' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-1)' }}>Note DM</span>
            </div>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{sheet.dmNotes}</p>
          </div>
        )}
      </div>
    }
    spells={
      <div style={{ padding: 'var(--s-2)', opacity: canCast ? 1 : 0.55 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-1)' }}>
          <SectionTitle mb={false}>Incantesimi</SectionTitle>
          {canCast && (
            <AddSpellButton
              characterId={char.id}
              currentSpells={knownSpells}
              casterClassKeys={casterClassKeys}
              characterClasses={sheet.classes ?? []}
              characterStats={stats}
            />
          )}
        </div>
        {!canCast && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', lineHeight: 1.6 }}>
            Il tuo personaggio non possiede le capacità per lanciare incantesimi. Per iniziare a usare la magia, scegli una classe o un archetipo che conferisce questa capacità.
          </p>
        )}
        {knownSpells.length === 0 && activeSpellSlots.length === 0 && canCast && (
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)', padding: '4px 0' }}>
            Nessun incantesimo — usa + Aggiungi per iniziare.
          </p>
        )}
        <SpellSectionTabs
          knownSpells={knownSpells}
          activeSpellSlots={activeSpellSlots}
          isPreparedCaster={['cleric','druid','paladin','wizard'].some(k => casterClassKeys.includes(k))}
          schoolAbbr={SCHOOL_ABBR}
        />
      </div>
    }
    bio={
      <div style={{ padding: 'var(--s-2)' }}>
        <BackstoryCard
          characterId={char.id}
          charName={char.name}
          initialBackstory={sheet.backstory ?? ''}
          personality={sheet.personality}
          ideals={sheet.ideals}
          bonds={sheet.bonds}
          flaws={sheet.flaws}
          isOwner={!isDm}
        />
      </div>
    }
  />

</div>
```

- [ ] **Step 3: Delete the dead `display: 'none'` block**

Find and delete the entire block that starts with `{/* ═══ (old COL4 placeholder — content moved) ═══ */}` and its corresponding `<div style={{ display: 'none' }}>...</div>` wrapper (currently lines ~721–828). This block already had `display: 'none'` — it is safe to remove completely.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors. Fix any that appear (typically unused variable warnings from the old `conditions` block or leftover references).

- [ ] **Step 5: Commit**

```bash
git add app/characters/\[id\]/page.tsx
git commit -m "feat: ristruttura desktop character sheet con HpStrip + SheetTabBar"
```

---

## Task 4: Refactor `MobileSheet` — 5 tabs → 4 tabs

**Files:**
- Modify: `components/character/mobile/MobileSheet.tsx`

Context: `MobileSheet` currently has 5 tabs: `'combat' | 'stats' | 'items' | 'magic' | 'identity'`. The tab bar is at the BOTTOM (fixed). The header shows name + compact HP number (no controls). We need to:
1. Merge `combat` + `stats` into a single `combat` tab (caratteristiche go into combat)
2. Rename `items` → `equipment`, `magic` → `spells`
3. Rename `identity` → `bio` and keep its content (portrait, features, BackstoryCard)
4. Move HP controls from inside the combat tab into the sticky header (upgrade the mini-header to show HP bar + Danno/Cura buttons)
5. Update the `TABS` array and the `Tab` type

- [ ] **Step 1: Update the `Tab` type and `TABS` array**

Find:
```tsx
type Tab = 'combat' | 'stats' | 'items' | 'magic' | 'identity';
```
Replace with:
```tsx
type Tab = 'combat' | 'equipment' | 'spells' | 'bio';
```

Find:
```tsx
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'combat',   icon: '⚔',  label: 'Combat'   },
  { id: 'stats',    icon: '📊', label: 'Stats'    },
  { id: 'items',    icon: '🎒', label: 'Oggetti'  },
  { id: 'magic',    icon: '✨', label: 'Magia'    },
  { id: 'identity', icon: '🧙', label: 'Identità' },
];
```
Replace with:
```tsx
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'combat',    icon: '⚔',  label: 'Combat'  },
  { id: 'equipment', icon: '🎒', label: 'Gear'    },
  { id: 'spells',    icon: '✨', label: 'Magia'   },
  { id: 'bio',       icon: '🧙', label: 'Bio'     },
];
```

- [ ] **Step 2: Update the initial tab state**

Find:
```tsx
const [activeTab, setActiveTab] = useState<Tab>(isActiveCharacter ? 'combat' : 'identity');
```
Replace with:
```tsx
const [activeTab, setActiveTab] = useState<Tab>(isActiveCharacter ? 'combat' : 'bio');
```

- [ ] **Step 3: Upgrade the sticky header to include HP controls**

Find the `{/* ── Mini header ─────────────────────────────────── */}` block. It currently shows portrait, name/class, and compact HP number. Replace the entire header `<div>` (the one with `height: 64`) with this expanded version:

```tsx
{/* ── HP Strip (sticky header) ─────────────────── */}
<div style={{
  padding: 'var(--s-2)',
  background: 'var(--bg-deep)',
  borderBottom: '1px solid var(--border-leather-dim)',
  flexShrink: 0,
}}>
  {/* Row 1: name + HP number */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', marginBottom: 'var(--s-1)' }}>
    {/* Portrait */}
    <div style={{
      width: 36, height: 36, borderRadius: 'var(--r-sm)', flexShrink: 0,
      overflow: 'hidden', border: '1.5px solid var(--border-leather-dim)',
      background: 'var(--bg-card)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {sheet.portraitUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sheet.portraitUrl} alt={charName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 700, color: 'var(--gold)' }}>
          {charName.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
    {/* Name */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', fontWeight: 700, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {charName}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'var(--fg-3)' }}>{classLabel}</div>
    </div>
    {/* HP number */}
    <div style={{ flexShrink: 0, textAlign: 'right' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: hpColor, lineHeight: 1 }}>
        {hpCurrent}<span style={{ fontSize: 11, color: 'var(--fg-2)', fontWeight: 400 }}>/{hpMax}</span>
      </div>
      {hpTemp > 0 && (
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', color: 'var(--info)' }}>+{hpTemp} temp</div>
      )}
    </div>
  </div>
  {/* Row 2: HP bar + controls */}
  <div style={{ height: 3, backgroundColor: 'var(--bg-card)', borderRadius: 'var(--r-sm)', overflow: 'hidden', marginBottom: 'var(--s-1)' }}>
    <div style={{ height: '100%', width: `${hpPct}%`, background: hpColor, borderRadius: 'var(--r-sm)', transition: 'width .5s, background .6s' }} />
  </div>
  <HpControls characterId={characterId} hpCurrent={hpCurrent} hpMax={hpMax} />
  {hpCurrent === 0 && (
    <div style={{ marginTop: 'var(--s-1)', paddingTop: 'var(--s-1)', borderTop: '1px solid var(--danger-border)' }}>
      <DeathSavesTracker characterId={characterId} sheet={sheet} />
    </div>
  )}
</div>
```

- [ ] **Step 4: Merge combat + stats tabs**

Find the current `{/* ════════════════ TAB: COMBAT ══════════════════════ */}` block. It currently ends before `{activeTab === 'stats' && ...}`. Modify the combat tab to also include caratteristiche, tiri salvezza, and abilità (moving them from what was the `stats` tab). The order in the combat tab should be:

1. Statistiche di combattimento (CA, Init, Vel, Bonus Comp, Perc. Passiva, CD/Att. Incant.) — already there, keep as-is but REMOVE the HP card from inside it (HP is now in the header)
2. Caratteristiche (grid 3×2) — move from old stats tab
3. Tiri Salvezza — move from old stats tab
4. Abilità — move from old stats tab
5. Risorse Attive pinnate — already there, keep
6. Condizioni — already there, keep
7. Attacchi — already there, keep

Remove the old `{activeTab === 'stats' && (...)}` block entirely.

The HP block inside the old combat tab is a **separate** `<div style={CARD}>` labeled `{/* HP */}` (it contains `SH>Punti Ferita</SH>`, the big `hpCurrent` number, `HpControls`, and optionally `DeathSavesTracker`) — this entire card must be **deleted** from the tab content since HP is now in the sticky header. Do NOT delete the stats card above it (`SH>Statistiche</SH>` with CA/Init/Vel).

- [ ] **Step 5: Rename items → equipment and magic → spells tabs**

Find:
```tsx
{/* ════════════════ TAB: OGGETTI ═════════════════════ */}
{activeTab === 'items' && (
```
Replace with:
```tsx
{/* ════════════════ TAB: EQUIPAGGIAMENTO ══════════════ */}
{activeTab === 'equipment' && (
```

Find:
```tsx
{/* ════════════════ TAB: MAGIA ═══════════════════════ */}
{activeTab === 'magic' && (
```
Replace with:
```tsx
{/* ════════════════ TAB: INCANTESIMI ════════════════ */}
{activeTab === 'spells' && (
```

- [ ] **Step 6: Rename identity → bio tab**

Find:
```tsx
{/* ════════════════ TAB: IDENTITÀ ════════════════════ */}
{activeTab === 'identity' && (
```
Replace with:
```tsx
{/* ════════════════ TAB: BIO ════════════════════════ */}
{activeTab === 'bio' && (
```

- [ ] **Step 7: Update bottom tab bar accent color for spells tab**

Find inside the bottom tab bar render:
```tsx
borderTop: `2px solid ${active ? 'var(--gold)' : 'transparent'}`,
```
Replace with:
```tsx
borderTop: `2px solid ${active ? (tab.id === 'spells' ? 'var(--arcane)' : 'var(--gold)') : 'transparent'}`,
```

And for the label color:
```tsx
color: active ? 'var(--gold)' : 'var(--fg-3)',
```
Replace with:
```tsx
color: active ? (tab.id === 'spells' ? 'var(--arcane)' : 'var(--gold)') : 'var(--fg-3)',
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add components/character/mobile/MobileSheet.tsx
git commit -m "feat: refactoring MobileSheet da 5 tab a 4, HP in header sticky"
```

---

## Task 5: Verify build

- [ ] **Step 1: Run full Next.js build**

```bash
npx next build 2>&1 | tail -30
```

Expected output ends with something like:
```
Route (app)                              Size     First Load JS
┌ ○ /                                   ...
...
✓ Compiled successfully
```

No TypeScript errors, no missing export errors, all routes compile.

- [ ] **Step 2: If build fails, check error and fix**

Common causes:
- Missing import (check that `SheetTabBar` and `HpStrip` imports are correct in `page.tsx`)
- `hpTemp` prop not passed to `HpStrip` (ensure line `hpTemp={char.hpTemp}` is present)
- Unused variable `conditions` in `page.tsx` after removing the old inline block (delete the variable or use it via `HpStrip`)
- `conditions` import from `characterConditions` is still used by `HpStrip` — the `conditions` const in `page.tsx` must still be passed as prop

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: navigazione a tab character sheet completa (desktop + mobile)"
```
