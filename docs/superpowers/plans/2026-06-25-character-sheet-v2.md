# Character Sheet Redesign v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the desktop (≥768px) character sheet layout on `/characters/[id]` (DM) and `/my-character` (player) with a shared 5-tab sidebar+list/detail layout, per `docs/superpowers/specs/2026-06-25-character-sheet-v2-design.md`.

**Architecture:** One shared client component `CharacterSheetView` consumes a `SheetViewModel` (built by a new pure helper `buildSheetViewModel`) plus raw character data, and renders Sidebar + HpStatsRow + ConditionsRow + TabNav + 5 tab panels. Both pages keep their existing mobile (`<768px`) rendering untouched and add a new `desktop-layout` block using `CharacterSheetView`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Drizzle ORM, Tailwind v4 (CSS vars only, no utility classes added), Vitest + React Testing Library (new).

## Global Constraints

- Design tokens only from `DESIGN_SYSTEM.md` / `app/globals.css` CSS vars — no hardcoded colors, spacing, radii.
- All product text in Italian.
- No DB schema changes — only existing `lib/db/schema.ts` fields/tables are used.
- No changes to `components/character/mobile/MobileSheet.tsx` or any component it imports unmodified (`HpControls`, `ConditionBadge`, `AddConditionButton`, `DeathSavesTracker`, `InventoryCard`, `SpellSectionTabs`, `FeatureButton`, `BackstoryCard`, `PinnedActiveResources`, `PinnedPassiveSection`) — these stay byte-for-byte as-is.
- Breakpoint stays 768px (`.desktop-layout` / `.mobile-layout` CSS classes already defined in `app/globals.css:649-655`).
- No new toast library — custom `ToastProvider`/`useToast`.
- Server actions are never modified — only existing functions in `lib/db/actions.ts` are called from new UI.
- Touch targets / transitions follow CLAUDE.md §6 (not directly relevant on desktop-only scope, but don't regress mobile).

---

## File Structure

```
lib/character-sheet/
  buildSheetViewModel.ts          # NEW — pure helper, shared by both pages
  buildSheetViewModel.test.ts     # NEW

components/character/sheet/v2/
  styles.ts                       # NEW — shared CSS-in-JS tokens + modColor/hpBarColor
  styles.test.ts                  # NEW
  useToast.ts                     # NEW
  Toast.tsx                       # NEW (ToastProvider)
  Toast.test.tsx                  # NEW
  ListDetailPanel.tsx              # NEW — generic list+detail layout
  ListDetailPanel.test.tsx         # NEW
  Sidebar.tsx                      # NEW
  Sidebar.test.tsx                 # NEW
  SidebarDmActions.tsx             # NEW
  HpStatsRow.tsx                   # NEW
  HpStatsRow.test.tsx              # NEW
  ConditionsRow.tsx                # NEW
  TabNav.tsx                       # NEW
  TabNav.test.tsx                  # NEW
  CharacterSheetView.tsx           # NEW
  CharacterSheetView.test.tsx      # NEW
  tabs/
    StatsTab.tsx                   # NEW
    CombatTab.tsx                  # NEW
    CombatTab.test.tsx              # NEW
    SpellsTab.tsx                   # NEW
    InventoryTab.tsx                # NEW
    InventoryTab.test.tsx           # NEW
    NarrativeTab.tsx                # NEW

app/characters/[id]/page.tsx       # MODIFIED — swap desktop block for CharacterSheetView
app/my-character/page.tsx          # MODIFIED — add desktop block, keep current JSX as mobile fallback

vitest.config.ts                   # NEW
vitest.setup.ts                    # NEW
package.json                       # MODIFIED — add test deps + scripts
```

---

### Task 1: Set up Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json`
- Test: `lib/rules/calculations.smoke.test.ts`

**Interfaces:**
- Produces: `npm test` / `npm run test:watch` scripts usable by every later task.

- [ ] **Step 1: Install dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add scripts to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a smoke test against existing code**

Create `lib/rules/calculations.smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { abilityModifier, formatModifier } from './calculations';

describe('vitest harness smoke test', () => {
  it('computes ability modifiers correctly', () => {
    expect(abilityModifier(14)).toBe(2);
    expect(abilityModifier(8)).toBe(-1);
  });

  it('formats modifiers with sign', () => {
    expect(formatModifier(3)).toBe('+3');
    expect(formatModifier(-2)).toBe('-2');
    expect(formatModifier(0)).toBe('+0');
  });
});
```

- [ ] **Step 6: Run the test**

Run: `npm test`
Expected: PASS — 1 file, 2 tests passed. If `formatModifier(0)` doesn't return `'+0'`, check the real implementation in `lib/rules/calculations.ts` and adjust the assertion to match actual behavior (don't change the implementation).

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json lib/rules/calculations.smoke.test.ts
git commit -m "test: set up Vitest + React Testing Library"
```

---

### Task 2: `buildSheetViewModel` shared data helper

**Files:**
- Create: `lib/character-sheet/buildSheetViewModel.ts`
- Test: `lib/character-sheet/buildSheetViewModel.test.ts`

**Interfaces:**
- Consumes: `Character`, `CharacterSheet`, `CharacterSpellSlot[]` from `lib/db/schema.ts`; `abilityModifier, proficiencyBonus, passivePerception, spellSaveDC, spellAttackBonus, totalCarriedWeight, carryStatus, hpPercentage` from `lib/rules/calculations.ts`; `CLASSES, SPELLCASTING_SUBCLASSES` from `lib/srd/classes.ts`; `XP_THRESHOLDS, getXpForNextLevel` from `lib/srd/constants.ts`.
- Produces: `export interface SheetViewModel { ... }` and `export function buildSheetViewModel(char: Character, sheet: CharacterSheet, spellSlots: CharacterSpellSlot[]): SheetViewModel` — consumed by Task 16 (`CharacterSheetView`) and both page files (Tasks 17–18).

This replicates, verbatim, the computation currently inline in `app/characters/[id]/page.tsx:119-202` (read that range for the exact current logic before writing this file — do not invent different formulas).

- [ ] **Step 1: Write the failing test**

```typescript
// lib/character-sheet/buildSheetViewModel.test.ts
import { describe, it, expect } from 'vitest';
import { buildSheetViewModel } from './buildSheetViewModel';
import type { Character, CharacterSheet, CharacterSpellSlot } from '@/lib/db/schema';

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-1', name: 'Thorin', type: 'pc',
    hpCurrent: 42, hpMax: 56, hpTemp: 0,
    level: 6, xp: 14000,
    sheet: {} as CharacterSheet,
    campaignId: null, userId: null,
    createdAt: '', updatedAt: '',
    ...overrides,
  } as Character;
}

function makeSheet(overrides: Partial<CharacterSheet> = {}): CharacterSheet {
  return {
    classes: [{ classKey: 'cleric', level: 6 }],
    stats: { str: 14, dex: 12, con: 15, int: 10, wis: 17, cha: 8 },
    savingThrowProficiencies: { str: false, dex: false, con: true, int: false, wis: true, cha: false },
    skills: { perception: { proficient: true, expertise: false } },
    inventory: [],
    money: { pp: 0, gp: 45, ep: 0, sp: 12, cp: 30 },
    pinnedFeatures: [],
    ...overrides,
  } as CharacterSheet;
}

describe('buildSheetViewModel', () => {
  it('computes proficiency bonus, hp percentage and color for a level 6 character', () => {
    const model = buildSheetViewModel(makeCharacter(), makeSheet(), []);
    expect(model.prof).toBe(3);
    expect(model.hpPct).toBe(75);
    expect(model.hpColor).toBe('var(--success)');
  });

  it('flags the character as a caster when its class has a spellcasting ability', () => {
    const model = buildSheetViewModel(makeCharacter(), makeSheet(), []);
    expect(model.canCast).toBe(true);
    expect(model.spellDC).not.toBeNull();
  });

  it('flags the character as a non-caster when no class casts spells', () => {
    const sheet = makeSheet({ classes: [{ classKey: 'fighter', level: 6 }] });
    const model = buildSheetViewModel(makeCharacter(), sheet, []);
    expect(model.canCast).toBe(false);
    expect(model.spellDC).toBeNull();
    expect(model.spellAtk).toBeNull();
  });

  it('computes xp progress toward next level', () => {
    const model = buildSheetViewModel(makeCharacter({ level: 6, xp: 14000 }), makeSheet(), []);
    expect(model.nextXp).toBe(23000);
    expect(model.xpPct).toBe(0);
    expect(model.canLevelUp).toBe(false);
  });

  it('marks canLevelUp true once xp reaches the next threshold', () => {
    const model = buildSheetViewModel(makeCharacter({ level: 6, xp: 23000 }), makeSheet(), []);
    expect(model.canLevelUp).toBe(true);
  });

  it('splits pinnedFeatures into passive and active by resourceKey presence', () => {
    const sheet = makeSheet({
      pinnedFeatures: [
        { key: 'a', type: 'class', name: 'Passiva' },
        { key: 'b', type: 'class', name: 'Attiva', resourceKey: 'channel_divinity', resetType: 'short' },
      ],
    });
    const model = buildSheetViewModel(makeCharacter(), sheet, []);
    expect(model.pinnedAll).toHaveLength(2);
    expect(model.pinnedPassive).toHaveLength(1);
    expect(model.pinnedActive).toHaveLength(1);
    expect(model.pinnedActive[0].key).toBe('b');
  });

  it('only includes spell slots with a positive total, sorted by level', () => {
    const slots = [
      { characterId: 'char-1', slotLevel: 3, total: 3, used: 0 },
      { characterId: 'char-1', slotLevel: 1, total: 4, used: 1 },
      { characterId: 'char-1', slotLevel: 5, total: 0, used: 0 },
    ] as CharacterSpellSlot[];
    const model = buildSheetViewModel(makeCharacter(), makeSheet(), slots);
    expect(model.activeSpellSlots.map(s => s.slotLevel)).toEqual([1, 3]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- buildSheetViewModel`
Expected: FAIL — `Cannot find module './buildSheetViewModel'`

- [ ] **Step 3: Read the reference implementation**

Open `app/characters/[id]/page.tsx` lines 119-202 and copy the exact computation logic (don't re-derive formulas from scratch).

- [ ] **Step 4: Implement `buildSheetViewModel.ts`**

```typescript
import type {
  Character, CharacterSheet, CharacterSpellSlot, CharacterStats, PinnedFeature, KnownSpell, CharacterClass,
} from '@/lib/db/schema';
import {
  proficiencyBonus, passivePerception, spellSaveDC, spellAttackBonus,
  totalCarriedWeight, carryStatus, hpPercentage,
} from '@/lib/rules/calculations';
import { CLASSES, SPELLCASTING_SUBCLASSES } from '@/lib/srd/classes';
import { XP_THRESHOLDS, getXpForNextLevel } from '@/lib/srd/constants';
import type { Ability } from '@/lib/srd/skills';

export interface SheetViewModel {
  level: number;
  prof: number;
  stats: CharacterStats;
  savingThrows: Record<Ability, boolean>;
  skillMap: CharacterSheet['skills'];
  hpPct: number;
  hpColor: string;
  passPerc: number;
  spellDC: number | null;
  spellAtk: number | null;
  carriedKg: number;
  carryMax: number;
  carryPct: number;
  carryOverloaded: boolean;
  nextXp: number | null;
  xpPct: number;
  canLevelUp: boolean;
  classLabel: string;
  hitDie: number;
  casterClassKeys: string[];
  canCast: boolean;
  pinnedAll: PinnedFeature[];
  pinnedPassive: PinnedFeature[];
  pinnedActive: PinnedFeature[];
  classesWithSubclass: CharacterClass[];
  activeSpellSlots: CharacterSpellSlot[];
  knownSpells: KnownSpell[];
}

export function buildSheetViewModel(
  char: Character,
  sheet: CharacterSheet,
  spellSlots: CharacterSpellSlot[],
): SheetViewModel {
  const level = char.level;
  const prof = proficiencyBonus(level);
  const stats = sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const savingThrows = sheet.savingThrowProficiencies ?? { str: false, dex: false, con: false, int: false, wis: false, cha: false };
  const skillMap = sheet.skills ?? {};
  const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);

  const hpPct = hpPercentage(char.hpCurrent, char.hpMax);
  const hpColor = hpPct > 60 ? 'var(--success)' : hpPct > 30 ? 'var(--warning)' : 'var(--danger)';

  const perceptionSkill = skillMap['perception'];
  const passPerc = passivePerception(stats.wis, level, perceptionSkill?.proficient ?? false, perceptionSkill?.expertise ?? false);

  const castingAbility = cls?.spellcastingAbility as Ability | undefined;
  const castingScore = castingAbility ? stats[castingAbility] : 0;
  const spellDC = castingAbility ? spellSaveDC(castingScore, level) : null;
  const spellAtk = castingAbility ? spellAttackBonus(castingScore, level) : null;

  const carriedKg = totalCarriedWeight(sheet.inventory ?? []);
  const carryMax = Math.floor(stats.str * 7.5);
  const carryPct = Math.min(100, carryMax > 0 ? (carriedKg / carryMax) * 100 : 0);
  const carryOverloaded = carryStatus(stats.str, carriedKg) !== 'normal';

  const nextXp = getXpForNextLevel(level);
  const currentLevelXp = XP_THRESHOLDS[level] ?? 0;
  const xpPct = nextXp ? Math.min(100, Math.round(((char.xp - currentLevelXp) / (nextXp - currentLevelXp)) * 100)) : 100;
  const canLevelUp = nextXp !== null && char.xp >= nextXp;

  const classLabel = sheet.classes?.map(c => {
    const found = CLASSES.find(cl => cl.key === c.classKey);
    return `${found?.name ?? c.classKey} ${c.level}`;
  }).join(' / ') ?? '';

  const hitDie = cls?.hitDie ?? 8;

  const casterClassKeys: string[] = [];
  for (const c of sheet.classes ?? []) {
    const classDef = CLASSES.find(cl => cl.key === c.classKey);
    if (classDef && classDef.spellcastingType !== 'none') {
      if (!casterClassKeys.includes(c.classKey)) casterClassKeys.push(c.classKey);
    }
    const subclassSpells = SPELLCASTING_SUBCLASSES[c.classKey];
    if (subclassSpells && c.subclass) {
      const match = subclassSpells.find(s => s.subclassName === c.subclass);
      if (match && !casterClassKeys.includes(match.spellList)) {
        casterClassKeys.push(match.spellList);
      }
    }
  }
  const canCast = casterClassKeys.length > 0;

  const pinnedAll = sheet.pinnedFeatures ?? [];
  const pinnedPassive = pinnedAll.filter(f => !f.resourceKey);
  const pinnedActive = pinnedAll.filter(f => !!f.resourceKey);

  const classesWithSubclass = (sheet.classes ?? []).filter(c => c.subclass);

  const activeSpellSlots = spellSlots.filter(s => s.total > 0).sort((a, b) => a.slotLevel - b.slotLevel);
  const knownSpells = sheet.knownSpells ?? [];

  return {
    level, prof, stats, savingThrows, skillMap, hpPct, hpColor, passPerc,
    spellDC, spellAtk, carriedKg, carryMax, carryPct, carryOverloaded,
    nextXp, xpPct, canLevelUp, classLabel, hitDie, casterClassKeys, canCast,
    pinnedAll, pinnedPassive, pinnedActive, classesWithSubclass,
    activeSpellSlots, knownSpells,
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- buildSheetViewModel`
Expected: PASS — 7 tests passed. If `hpColor` thresholds don't match (e.g. test expects `var(--success)` but a different var name is used elsewhere), check `DESIGN_SYSTEM.md` semantic token names and align the test, not invent a new token.

- [ ] **Step 6: Commit**

```bash
git add lib/character-sheet/buildSheetViewModel.ts lib/character-sheet/buildSheetViewModel.test.ts
git commit -m "feat: add buildSheetViewModel shared character sheet data helper"
```

---

### Task 3: Shared style tokens and color helpers

**Files:**
- Create: `components/character/sheet/v2/styles.ts`
- Test: `components/character/sheet/v2/styles.test.ts`

**Interfaces:**
- Produces: `card`, `innerBox`, `sectionLabel: CSSProperties`; `modColor(mod: number): string`; `hpBarColor(pct: number): string` — used by every component task from Task 5 onward.

- [ ] **Step 1: Write the failing test**

```typescript
// components/character/sheet/v2/styles.test.ts
import { describe, it, expect } from 'vitest';
import { modColor, hpBarColor } from './styles';

describe('modColor', () => {
  it('returns danger for negative modifiers', () => {
    expect(modColor(-2)).toBe('var(--danger)');
  });
  it('returns muted text for a zero modifier', () => {
    expect(modColor(0)).toBe('var(--fg-2)');
  });
  it('returns gold for positive modifiers', () => {
    expect(modColor(3)).toBe('var(--gold)');
  });
});

describe('hpBarColor', () => {
  it('returns success above 60%', () => {
    expect(hpBarColor(75)).toBe('var(--success)');
  });
  it('returns warning between 30% and 60%', () => {
    expect(hpBarColor(45)).toBe('var(--warning)');
  });
  it('returns danger at or below 30%', () => {
    expect(hpBarColor(20)).toBe('var(--danger)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- styles`
Expected: FAIL — `Cannot find module './styles'`

- [ ] **Step 3: Implement `styles.ts`**

```typescript
import type { CSSProperties } from 'react';

export const card: CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-leather-dim)',
  borderRadius: 'var(--r-lg)',
  padding: 'var(--s-2)',
};

export const innerBox: CSSProperties = {
  background: 'var(--bg-inner)',
  border: '1px solid var(--border-leather)',
  borderRadius: 'var(--r-sm)',
};

export const sectionLabel: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '8px',
  fontWeight: 600,
  letterSpacing: '.1em',
  color: 'var(--gold)',
  textTransform: 'uppercase',
};

export function modColor(mod: number): string {
  if (mod < 0) return 'var(--danger)';
  if (mod === 0) return 'var(--fg-2)';
  return 'var(--gold)';
}

export function hpBarColor(pct: number): string {
  if (pct > 60) return 'var(--success)';
  if (pct > 30) return 'var(--warning)';
  return 'var(--danger)';
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- styles`
Expected: PASS — 6 tests passed.

- [ ] **Step 5: Commit**

```bash
git add components/character/sheet/v2/styles.ts components/character/sheet/v2/styles.test.ts
git commit -m "feat: add shared style tokens for character sheet v2"
```

---

### Task 4: Toast system (`useToast` + `ToastProvider`)

**Files:**
- Create: `components/character/sheet/v2/useToast.ts`
- Create: `components/character/sheet/v2/Toast.tsx`
- Test: `components/character/sheet/v2/Toast.test.tsx`

**Interfaces:**
- Produces: `useToast(): { show: (message: string) => void }`; `ToastProvider({ children }: { children: ReactNode })` — consumed by `CharacterSheetView` (Task 16) which mounts one `ToastProvider`, and by every tab/row component that calls server actions (Tasks 8, 9, 12, 13).

- [ ] **Step 1: Write the failing test**

```typescript
// components/character/sheet/v2/Toast.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider } from './Toast';
import { useToast } from './useToast';

function Consumer() {
  const { show } = useToast();
  return <button onClick={() => show('Ciao')}>trigger</button>;
}

describe('ToastProvider', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders no toast initially', () => {
    render(<ToastProvider><Consumer /></ToastProvider>);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows a message when show() is called', () => {
    render(<ToastProvider><Consumer /></ToastProvider>);
    act(() => { screen.getByText('trigger').click(); });
    expect(screen.getByRole('status')).toHaveTextContent('Ciao');
  });

  it('auto-dismisses after 1.8s', () => {
    vi.useFakeTimers();
    render(<ToastProvider><Consumer /></ToastProvider>);
    act(() => { screen.getByText('trigger').click(); });
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1800); });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('replaces the current message instead of stacking', () => {
    vi.useFakeTimers();
    function DoubleConsumer() {
      const { show } = useToast();
      return (
        <>
          <button onClick={() => show('Primo')}>first</button>
          <button onClick={() => show('Secondo')}>second</button>
        </>
      );
    }
    render(<ToastProvider><DoubleConsumer /></ToastProvider>);
    act(() => { screen.getByText('first').click(); });
    act(() => { vi.advanceTimersByTime(500); });
    act(() => { screen.getByText('second').click(); });
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Secondo');
  });

  it('throws if useToast is used outside a ToastProvider', () => {
    function Orphan() { useToast(); return null; }
    expect(() => render(<Orphan />)).toThrow('useToast must be used within a ToastProvider');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Toast`
Expected: FAIL — `Cannot find module './Toast'`

- [ ] **Step 3: Implement `useToast.ts`**

```typescript
'use client';

import { createContext, useContext } from 'react';

export interface ToastContextValue {
  show: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
```

- [ ] **Step 4: Implement `Toast.tsx`**

```tsx
'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from './useToast';

const DISMISS_MS = 1800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    timerRef.current = setTimeout(() => setMessage(null), DISMISS_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-card)',
            border: '1px solid var(--gold)',
            color: 'var(--fg-1)',
            fontSize: '12px',
            padding: '8px 16px',
            borderRadius: 'var(--r-sm)',
            zIndex: 200,
          }}
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- Toast`
Expected: PASS — 5 tests passed.

- [ ] **Step 6: Commit**

```bash
git add components/character/sheet/v2/useToast.ts components/character/sheet/v2/Toast.tsx components/character/sheet/v2/Toast.test.tsx
git commit -m "feat: add toast notification system for character sheet v2"
```

---

### Task 5: `ListDetailPanel` generic reusable component

**Files:**
- Create: `components/character/sheet/v2/ListDetailPanel.tsx`
- Test: `components/character/sheet/v2/ListDetailPanel.test.tsx`

**Interfaces:**
- Produces: `export interface ListDetailItem { id: string }` and `export default function ListDetailPanel<T extends ListDetailItem>(props: { items: T[]; selectedId: string | null; onSelect: (id: string) => void; renderListItem: (item: T, isSelected: boolean) => ReactNode; renderDetail: (item: T) => ReactNode; emptyDetailText: string }): ReactNode` — consumed by `CombatTab` (Task 11), `SpellsTab` (Task 12), `InventoryTab` (Task 13).

- [ ] **Step 1: Write the failing test**

```tsx
// components/character/sheet/v2/ListDetailPanel.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ListDetailPanel`
Expected: FAIL — `Cannot find module './ListDetailPanel'`

- [ ] **Step 3: Implement `ListDetailPanel.tsx`**

```tsx
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
        ...card, position: 'sticky', top: 64,
        maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', overflowX: 'hidden',
      }}>
        {selected ? renderDetail(selected) : (
          <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px',
            color: 'var(--fg-3)', textAlign: 'center', padding: '40px 20px', margin: 0,
          }}>
            {emptyDetailText}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- ListDetailPanel`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add components/character/sheet/v2/ListDetailPanel.tsx components/character/sheet/v2/ListDetailPanel.test.tsx
git commit -m "feat: add reusable ListDetailPanel component"
```

---

### Task 6: `Sidebar` component

**Files:**
- Create: `components/character/sheet/v2/Sidebar.tsx`
- Test: `components/character/sheet/v2/Sidebar.test.tsx`

**Interfaces:**
- Consumes: `PortraitButton` (`@/components/character/portrait/PortraitButton`, props `{characterId, characterName, classLabel, portraitUrl?}`), `XpControls` (`@/components/dashboard/XpControls`, props `{characterId, label?}`), `LevelUpButton` (`@/components/character/sheet/LevelUpButton`, props `{character: Character, canLevelUp: boolean}`), `AsiRetroactiveButton` (`@/components/character/sheet/AsiRetroactiveButton`, props `{character: Character}`), `ActiveCharacterButton` (`@/components/character/sheet/ActiveCharacterButton`, props `{characterId, isActive, currentActiveName}`), `FeatureButton` (`@/components/character/features/FeatureButton`), `shortRest`/`longRest` from `@/lib/db/actions`, `useToast` (Task 4).
- Produces: `export interface SidebarProps { character: Character; sheet: CharacterSheet; model: SheetViewModel; resources: CharacterResource[]; campaign: { id: string; name: string } | null; isActiveCharacter: boolean; currentActiveName: string | null; dmActions?: ReactNode }` and `export default function Sidebar(props: SidebarProps): ReactNode` — consumed by `CharacterSheetView` (Task 16).

This reproduces, with new compact styling, the sidebar content currently in `app/characters/[id]/page.tsx:191-367` (Portrait, name, class label, alignment badge, XP bar + XpControls + LevelUpButton, Identity rows, classesWithSubclass, the 3 `FeatureButton`s, `AsiRetroactiveButton`, `ActiveCharacterButton`, Riposo Breve/Lungo). It does **not** include `AssignPlayerButton` or the "Note DM" card — those are DM-only and live in `SidebarDmActions` (Task 7), rendered via the `dmActions` slot.

- [ ] **Step 1: Write the failing test**

```tsx
// components/character/sheet/v2/Sidebar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/db/actions', () => ({
  shortRest: vi.fn().mockResolvedValue(undefined),
  longRest: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/components/character/portrait/PortraitButton', () => ({ default: () => <div>portrait</div> }));
vi.mock('@/components/dashboard/XpControls', () => ({ default: () => <div>xp-controls</div> }));
vi.mock('@/components/character/sheet/LevelUpButton', () => ({ default: () => <div>level-up</div> }));
vi.mock('@/components/character/sheet/AsiRetroactiveButton', () => ({ default: () => <div>asi-retroactive</div> }));
vi.mock('@/components/character/sheet/ActiveCharacterButton', () => ({ default: () => <div>active-character</div> }));
vi.mock('@/components/character/features/FeatureButton', () => ({ default: ({ label }: { label: string }) => <div>{label}</div> }));

import Sidebar from './Sidebar';
import { ToastProvider } from './Toast';
import { shortRest, longRest } from '@/lib/db/actions';
import type { Character, CharacterSheet } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

const character = { id: 'char-1', name: 'Thorin', xp: 14000 } as Character;
const sheet = { race: 'Nano', background: 'Acolito', alignment: 'LEGALE BUONO' } as CharacterSheet;
const model = {
  level: 6, prof: 3, passPerc: 15, classLabel: 'Chierico 6', nextXp: 23000, xpPct: 60,
  canLevelUp: false, classesWithSubclass: [],
} as unknown as SheetViewModel;

function renderSidebar() {
  return render(
    <ToastProvider>
      <Sidebar
        character={character}
        sheet={sheet}
        model={model}
        resources={[]}
        campaign={null}
        isActiveCharacter={true}
        currentActiveName={null}
      />
    </ToastProvider>
  );
}

describe('Sidebar', () => {
  it('renders identity info and the three feature links', () => {
    renderSidebar();
    expect(screen.getByText('THORIN')).toBeInTheDocument();
    expect(screen.getByText('Chierico 6')).toBeInTheDocument();
    expect(screen.getByText('Caratteristiche di Classe')).toBeInTheDocument();
    expect(screen.getByText('Tratti Razziali')).toBeInTheDocument();
    expect(screen.getByText('Talenti')).toBeInTheDocument();
  });

  it('calls shortRest when "Riposo Breve" is clicked', async () => {
    renderSidebar();
    fireEvent.click(screen.getByText('Riposo Breve'));
    expect(shortRest).toHaveBeenCalledWith('char-1');
  });

  it('calls longRest when "Riposo Lungo" is clicked', async () => {
    renderSidebar();
    fireEvent.click(screen.getByText('Riposo Lungo'));
    expect(longRest).toHaveBeenCalledWith('char-1');
  });

  it('renders the dmActions slot when provided', () => {
    render(
      <ToastProvider>
        <Sidebar
          character={character} sheet={sheet} model={model} resources={[]}
          campaign={null} isActiveCharacter={true} currentActiveName={null}
          dmActions={<div>dm-only-section</div>}
        />
      </ToastProvider>
    );
    expect(screen.getByText('dm-only-section')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Sidebar`
Expected: FAIL — `Cannot find module './Sidebar'`

- [ ] **Step 3: Implement `Sidebar.tsx`**

```tsx
'use client';

import type { ReactNode } from 'react';
import { startTransition } from 'react';
import { card, sectionLabel } from './styles';
import { useToast } from './useToast';
import { shortRest, longRest } from '@/lib/db/actions';
import PortraitButton from '@/components/character/portrait/PortraitButton';
import XpControls from '@/components/dashboard/XpControls';
import LevelUpButton from '@/components/character/sheet/LevelUpButton';
import AsiRetroactiveButton from '@/components/character/sheet/AsiRetroactiveButton';
import ActiveCharacterButton from '@/components/character/sheet/ActiveCharacterButton';
import FeatureButton from '@/components/character/features/FeatureButton';
import type { Character, CharacterSheet, CharacterResource } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

export interface SidebarProps {
  character: Character;
  sheet: CharacterSheet;
  model: SheetViewModel;
  resources: CharacterResource[];
  campaign: { id: string; name: string } | null;
  isActiveCharacter: boolean;
  currentActiveName: string | null;
  dmActions?: ReactNode;
}

const restButton: React.CSSProperties = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
  height: 28, border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)',
  fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.04em',
  color: 'var(--fg-2)', cursor: 'pointer', background: 'none',
};

export default function Sidebar({
  character, sheet, model, resources, campaign, isActiveCharacter, currentActiveName, dmActions,
}: SidebarProps) {
  const { show } = useToast();

  function handleShortRest() {
    startTransition(async () => {
      await shortRest(character.id);
      show('Riposo breve completato');
    });
  }

  function handleLongRest() {
    startTransition(async () => {
      await longRest(character.id);
      show('Riposo lungo completato');
    });
  }

  return (
    <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <div style={card}>
        <div style={{ display: 'flex', gap: 'var(--s-1)', marginBottom: 'var(--s-2)' }}>
          <PortraitButton
            characterId={character.id}
            characterName={character.name}
            classLabel={model.classLabel}
            portraitUrl={sheet.portraitUrl}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 700,
              color: 'var(--gold)', letterSpacing: '.04em', lineHeight: 1.15,
            }}>
              {character.name.toUpperCase()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--fg-2)', marginTop: 2 }}>{model.classLabel}</div>
            {sheet.alignment && (
              <span style={{
                display: 'inline-block', marginTop: 4, fontFamily: 'var(--font-sans)',
                fontSize: '7.5px', letterSpacing: '.09em', color: 'var(--fg-2)',
                border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: '1px 7px',
              }}>
                {sheet.alignment}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--fg-2)', marginBottom: 4 }}>
          <span style={{ letterSpacing: '.06em' }}>Livello {model.level}</span>
          <span>{character.xp.toLocaleString('it-IT')}{model.nextXp ? ` / ${model.nextXp.toLocaleString('it-IT')}` : ''} XP</span>
        </div>
        <div style={{ height: 3, background: 'var(--bg-inner)', borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--border-leather-dim)' }}>
          <div style={{ height: '100%', width: `${model.xpPct}%`, background: 'var(--gold)', borderRadius: 'var(--r-sm)' }} />
        </div>
        <XpControls characterId={character.id} />
        <LevelUpButton character={character} canLevelUp={model.canLevelUp} />

        <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />

        <div style={{ ...sectionLabel, display: 'flex', alignItems: 'center', gap: 'var(--s-1)', marginBottom: 'var(--s-1)' }}>
          Identità
          <span style={{ flex: 1, height: '.5px', background: 'var(--border-leather-dim)' }} />
        </div>
        {[
          { label: 'Razza', value: sheet.race },
          { label: 'Background', value: sheet.background },
          { label: 'Bonus Comp.', value: `+${model.prof}` },
          { label: 'Perc. Passiva', value: String(model.passPerc) },
        ].filter(row => row.value).map(row => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '3px 0', borderBottom: '.5px solid var(--bg-elevated)',
          }}>
            <span style={{ color: 'var(--fg-2)', fontSize: '10px' }}>{row.label}</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', fontWeight: 600, color: 'var(--gold)' }}>{row.value}</span>
          </div>
        ))}

        {model.classesWithSubclass.length > 0 && (
          <>
            <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />
            {model.classesWithSubclass.map(c => (
              <div key={c.classKey} style={{ fontSize: '10px', color: 'var(--fg-2)', padding: '2px 0' }}>{c.subclass}</div>
            ))}
          </>
        )}

        <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FeatureButton
            mode="class"
            label="Caratteristiche di Classe"
            count={null}
            characterClasses={sheet.classes}
            resources={resources}
            pinnedFeatures={sheet.pinnedFeatures}
          />
          <FeatureButton
            mode="racial"
            label="Tratti Razziali"
            count={null}
            characterId={character.id}
            raceKey={sheet.race}
            raceName={sheet.race}
            subraceKey={sheet.subrace}
            racialChoices={sheet.racialChoices}
            pinnedFeatures={sheet.pinnedFeatures}
          />
          <FeatureButton
            mode="feats"
            label="Talenti"
            count={sheet.feats?.length ?? 0}
            currentFeats={sheet.feats}
            asiHistory={sheet.asiHistory}
            stats={model.stats}
          />
        </div>

        <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />

        <AsiRetroactiveButton character={character} />
        {campaign && (
          <ActiveCharacterButton
            characterId={character.id}
            isActive={isActiveCharacter}
            currentActiveName={currentActiveName}
          />
        )}

        <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />

        <div style={{ display: 'flex', gap: 4 }}>
          <button style={restButton} onClick={handleShortRest}>Riposo Breve</button>
          <button style={restButton} onClick={handleLongRest}>Riposo Lungo</button>
        </div>
      </div>

      {dmActions}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- Sidebar`
Expected: PASS — 4 tests passed. If `model.stats` is referenced but not in the test's mock `model`, add `stats: { str: 14, dex: 12, con: 15, int: 10, wis: 17, cha: 8 }` to the test's `model` object.

- [ ] **Step 5: Commit**

```bash
git add components/character/sheet/v2/Sidebar.tsx components/character/sheet/v2/Sidebar.test.tsx
git commit -m "feat: add Sidebar component for character sheet v2"
```

---

### Task 7: `SidebarDmActions` component

**Files:**
- Create: `components/character/sheet/v2/SidebarDmActions.tsx`

**Interfaces:**
- Consumes: `AssignPlayerButton` (`@/components/character/sheet/AssignPlayerButton`, props `{characterId, currentUserId}`).
- Produces: `export interface SidebarDmActionsProps { characterId: string; currentUserId: string | null; dmNotes?: string }` and `export default function SidebarDmActions(props: SidebarDmActionsProps): ReactNode` — passed as the `dmActions` prop to `Sidebar` (Task 6) only when `viewerRole === 'dm'` (wired in `CharacterSheetView`, Task 16).

This reproduces `app/characters/[id]/page.tsx:359-367` (AssignPlayerButton, conditional on `isDm`) and the "Note DM" card at lines 624-631 (plain read-only text, no edit UI — do not add editing capability).

- [ ] **Step 1: Implement `SidebarDmActions.tsx`** (no test — thin composition of one existing button + static text, covered by manual QA in Task 19)

```tsx
import { card, sectionLabel } from './styles';
import AssignPlayerButton from '@/components/character/sheet/AssignPlayerButton';

export interface SidebarDmActionsProps {
  characterId: string;
  currentUserId: string | null;
  dmNotes?: string;
}

export default function SidebarDmActions({ characterId, currentUserId, dmNotes }: SidebarDmActionsProps) {
  return (
    <div style={card}>
      <div style={{ ...sectionLabel, display: 'flex', alignItems: 'center', gap: 'var(--s-1)', marginBottom: 'var(--s-1)' }}>
        Azioni DM
        <span style={{ flex: 1, height: '.5px', background: 'var(--border-leather-dim)' }} />
      </div>
      <AssignPlayerButton characterId={characterId} currentUserId={currentUserId} />
      {dmNotes && (
        <>
          <div style={{ height: 1, background: 'var(--border-leather-dim)', margin: 'var(--s-1) 0' }} />
          <div style={{ ...sectionLabel, marginBottom: 'var(--s-1)' }}>Note DM</div>
          <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '11px',
            color: 'var(--fg-2)', whiteSpace: 'pre-wrap', margin: 0,
          }}>
            {dmNotes}
          </p>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/character/sheet/v2/SidebarDmActions.tsx
git commit -m "feat: add DM-only sidebar actions for character sheet v2"
```

---

### Task 8: `HpStatsRow` component

**Files:**
- Create: `components/character/sheet/v2/HpStatsRow.tsx`
- Test: `components/character/sheet/v2/HpStatsRow.test.tsx`

**Interfaces:**
- Consumes: `applyDamage(characterId: string, amount: number): Promise<void>`, `applyHealing(characterId: string, amount: number): Promise<void>`, `setTempHp(characterId: string, amount: number): Promise<void>` from `@/lib/db/actions`; `DeathSavesTracker` (`@/components/character/sheet/DeathSavesTracker`, props `{characterId, sheet}`); `hpBarColor` (Task 3); `useToast` (Task 4).
- Produces: `export interface HpStatsRowProps { character: Character; sheet: CharacterSheet; model: SheetViewModel }` and `export default function HpStatsRow(props: HpStatsRowProps): ReactNode` — consumed by `CharacterSheetView` (Task 16).

- [ ] **Step 1: Write the failing test**

```tsx
// components/character/sheet/v2/HpStatsRow.test.tsx
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
const sheet = {} as CharacterSheet;

function makeModel(overrides: Partial<SheetViewModel> = {}): SheetViewModel {
  return {
    hpPct: 75, hpColor: 'var(--success)', canCast: true, spellDC: 16, spellAtk: 6,
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- HpStatsRow`
Expected: FAIL — `Cannot find module './HpStatsRow'`

- [ ] **Step 3: Implement `HpStatsRow.tsx`**

```tsx
'use client';

import { startTransition, useState } from 'react';
import { card } from './styles';
import { useToast } from './useToast';
import { applyDamage, applyHealing, setTempHp } from '@/lib/db/actions';
import DeathSavesTracker from '@/components/character/sheet/DeathSavesTracker';
import type { Character, CharacterSheet } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

export interface HpStatsRowProps {
  character: Character;
  sheet: CharacterSheet;
  model: SheetViewModel;
}

const iconButton = (color: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 22, height: 22, borderRadius: 'var(--r-sm)', border: `1px solid ${color}`,
  color, background: 'none', cursor: 'pointer', fontSize: '10px',
});

export default function HpStatsRow({ character, sheet, model }: HpStatsRowProps) {
  const { show } = useToast();
  const [input, setInput] = useState('');

  function parsedAmount(): number {
    return parseInt(input, 10) || 0;
  }

  function handleDamage() {
    const v = parsedAmount();
    if (!v) return;
    startTransition(async () => {
      await applyDamage(character.id, v);
      show(`-${v} HP`);
      setInput('');
    });
  }

  function handleHeal() {
    const v = parsedAmount();
    if (!v) return;
    startTransition(async () => {
      await applyHealing(character.id, v);
      show(`+${v} HP`);
      setInput('');
    });
  }

  function handleTemp() {
    const v = parsedAmount();
    if (!v) return;
    startTransition(async () => {
      await setTempHp(character.id, v);
      show(`+${v} HP temp`);
      setInput('');
    });
  }

  const stats: { label: string; value: string }[] = [
    { label: 'C.A.', value: String(sheet.armorClass ?? '—') },
    { label: 'Iniziativa', value: String(model.prof) },
    { label: 'Velocità', value: sheet.speed ? `${sheet.speed}m` : '—' },
  ];
  if (model.canCast) {
    stats.push(
      { label: 'CD Incantesimi', value: String(model.spellDC) },
      { label: 'Attacco Incantesimi', value: String(model.spellAtk) },
    );
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'stretch' }}>
      <div style={{ width: 200, flexShrink: 0, ...card, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 3 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, color: model.hpColor }}>
            {character.hpCurrent}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--fg-2)' }}>
            / {character.hpMax}{character.hpTemp > 0 ? ` (+${character.hpTemp} temp)` : ''}
          </span>
        </div>
        <div style={{ height: 3, background: 'var(--bg-inner)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{
            height: '100%', width: `${model.hpPct}%`, background: model.hpColor, borderRadius: 3,
            transition: 'width .5s ease, background .6s',
          }} />
        </div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <input
            type="number" min={0} placeholder="0" value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              width: 32, height: 22, padding: '0 2px', textAlign: 'center',
              background: 'var(--bg-inner)', border: '1px solid var(--border-leather)',
              borderRadius: 'var(--r-sm)', color: 'var(--fg-1)', fontSize: '10px',
            }}
          />
          <button title="Danno" onClick={handleDamage} style={iconButton('var(--danger)')}>−</button>
          <button title="Cura" onClick={handleHeal} style={iconButton('var(--success)')}>+</button>
          <button title="Temp" onClick={handleTemp} style={{ ...iconButton('var(--gold)'), width: 'auto', padding: '0 5px', fontSize: '7px' }}>TMP</button>
        </div>
        {character.hpCurrent <= 0 && (
          <div style={{ marginTop: 5, paddingTop: 5, borderTop: '1px solid rgba(168,51,28,.35)' }}>
            <DeathSavesTracker characterId={character.id} sheet={sheet} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 'var(--s-2)' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ flex: 1, ...card, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '7px', fontWeight: 600, letterSpacing: '.06em', color: 'var(--fg-2)', textTransform: 'uppercase', marginBottom: 2 }}>
              {stat.label}
            </span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: 'var(--fg-1)' }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- HpStatsRow`
Expected: PASS — 6 tests passed.

- [ ] **Step 5: Commit**

```bash
git add components/character/sheet/v2/HpStatsRow.tsx components/character/sheet/v2/HpStatsRow.test.tsx
git commit -m "feat: add HpStatsRow component for character sheet v2"
```

---

### Task 9: `ConditionsRow` component

**Files:**
- Create: `components/character/sheet/v2/ConditionsRow.tsx`

**Interfaces:**
- Consumes: `ConditionBadge` (`@/components/dashboard/ConditionBadge`, props `{conditionId, characterId, name, icon}`), `AddConditionButton` (`@/components/dashboard/AddConditionButton`, props `{characterId}` — already a picker over `CONDITIONS`, not random, so it is reused unmodified), `getCondition(key: string)` from `@/lib/srd/conditions`.
- Produces: `export interface ConditionsRowProps { characterId: string; conditions: CharacterCondition[] }` and `export default function ConditionsRow(props: ConditionsRowProps): ReactNode` — consumed by `CharacterSheetView` (Task 16).

No test for this task: it is a thin layout wrapper composing two already-tested, unmodified shared components (`ConditionBadge`, `AddConditionButton`); covered by manual QA in Task 19.

- [ ] **Step 1: Implement `ConditionsRow.tsx`**

```tsx
import { card } from './styles';
import ConditionBadge from '@/components/dashboard/ConditionBadge';
import AddConditionButton from '@/components/dashboard/AddConditionButton';
import { getCondition } from '@/lib/srd/conditions';
import type { CharacterCondition } from '@/lib/db/schema';

export interface ConditionsRowProps {
  characterId: string;
  conditions: CharacterCondition[];
}

export default function ConditionsRow({ characterId, conditions }: ConditionsRowProps) {
  return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 'var(--s-1)', flexWrap: 'wrap', minHeight: 32 }}>
      <span style={{ fontSize: '7px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--gold)', textTransform: 'uppercase', flexShrink: 0 }}>
        Condizioni Attive
      </span>
      {conditions.length === 0 && (
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '10px', color: 'var(--fg-3)' }}>
          Nessuna condizione
        </span>
      )}
      {conditions.map(cond => {
        const def = getCondition(cond.conditionKey);
        if (!def) return null;
        return (
          <ConditionBadge
            key={cond.id}
            conditionId={cond.id}
            characterId={characterId}
            name={def.name}
            icon={def.icon}
          />
        );
      })}
      <AddConditionButton characterId={characterId} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/character/sheet/v2/ConditionsRow.tsx
git commit -m "feat: add ConditionsRow component for character sheet v2"
```

---

### Task 10: `TabNav` component with localStorage persistence

**Files:**
- Create: `components/character/sheet/v2/TabNav.tsx`
- Test: `components/character/sheet/v2/TabNav.test.tsx`

**Interfaces:**
- Produces: `export type SheetTabId = 'stats' | 'combat' | 'spells' | 'inventory' | 'narrative'` and `export default function TabNav(props: { characterId: string; activeTab: SheetTabId; onChange: (tab: SheetTabId) => void }): ReactNode` — consumed by `CharacterSheetView` (Task 16), which owns the actual `activeTab` state and persistence side effect (Task 10 only renders the nav and reports clicks; `CharacterSheetView` reads/writes localStorage using the same key pattern as `SheetTabBar.tsx:25-31`, namespaced per-character so a v1→v2 storage key collision can't carry over a stale 4-tab value — see Task 16).

- [ ] **Step 1: Write the failing test**

```tsx
// components/character/sheet/v2/TabNav.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabNav from './TabNav';

describe('TabNav', () => {
  it('renders all 5 tab labels', () => {
    render(<TabNav characterId="char-1" activeTab="stats" onChange={() => {}} />);
    expect(screen.getByText('Caratteristiche')).toBeInTheDocument();
    expect(screen.getByText('Combattimento')).toBeInTheDocument();
    expect(screen.getByText('Incantesimi')).toBeInTheDocument();
    expect(screen.getByText('Inventario')).toBeInTheDocument();
    expect(screen.getByText('Narrativa')).toBeInTheDocument();
  });

  it('calls onChange with the clicked tab id', () => {
    const onChange = vi.fn();
    render(<TabNav characterId="char-1" activeTab="stats" onChange={onChange} />);
    fireEvent.click(screen.getByText('Combattimento'));
    expect(onChange).toHaveBeenCalledWith('combat');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- TabNav`
Expected: FAIL — `Cannot find module './TabNav'`

- [ ] **Step 3: Implement `TabNav.tsx`**

```tsx
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- TabNav`
Expected: PASS — 2 tests passed.

- [ ] **Step 5: Commit**

```bash
git add components/character/sheet/v2/TabNav.tsx components/character/sheet/v2/TabNav.test.tsx
git commit -m "feat: add TabNav component for character sheet v2"
```

---

### Task 11: `StatsTab` component (Caratteristiche)

**Files:**
- Create: `components/character/sheet/v2/tabs/StatsTab.tsx`
- Test: `components/character/sheet/v2/tabs/StatsTab.test.tsx`

**Interfaces:**
- Consumes: `abilityModifier, skillBonus, formatModifier` from `@/lib/rules/calculations`; `SKILLS, ABILITY_NAMES, ABILITY_SHORT, type Ability` from `@/lib/srd/skills`; `modColor, card` from `../styles`.
- Produces: `export interface StatsTabProps { stats: CharacterStats; savingThrows: Record<Ability, boolean>; skillMap: CharacterSheet['skills']; level: number }` and `export default function StatsTab(props: StatsTabProps): ReactNode` — consumed by `CharacterSheetView` (Task 16).

- [ ] **Step 1: Write the failing test**

```tsx
// components/character/sheet/v2/tabs/StatsTab.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsTab from './StatsTab';

const stats = { str: 14, dex: 12, con: 15, int: 10, wis: 17, cha: 8 };
const savingThrows = { str: false, dex: false, con: true, int: false, wis: true, cha: false };
const skillMap = { religion: { proficient: true, expertise: true }, medicine: { proficient: true, expertise: false } };

describe('StatsTab', () => {
  it('renders all 6 ability score badges with their modifier', () => {
    render(<StatsTab stats={stats} savingThrows={savingThrows} skillMap={skillMap} level={6} />);
    expect(screen.getByText('FOR')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument(); // str mod
    expect(screen.getByText('+3')).toBeInTheDocument(); // wis mod
  });

  it('renders all 6 saving throws with proficiency-adjusted bonus', () => {
    render(<StatsTab stats={stats} savingThrows={savingThrows} skillMap={skillMap} level={6} />);
    expect(screen.getByText('Costituzione')).toBeInTheDocument();
    expect(screen.getByText('Saggezza')).toBeInTheDocument();
  });

  it('renders all 18 skills', () => {
    render(<StatsTab stats={stats} savingThrows={savingThrows} skillMap={skillMap} level={6} />);
    expect(screen.getByText('Religione')).toBeInTheDocument();
    expect(screen.getByText('Medicina')).toBeInTheDocument();
    expect(screen.getByText('Atletica')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- StatsTab`
Expected: FAIL — `Cannot find module './StatsTab'`

- [ ] **Step 3: Implement `StatsTab.tsx`**

```tsx
import { abilityModifier, skillBonus, formatModifier, proficiencyBonus } from '@/lib/rules/calculations';
import { SKILLS, ABILITY_NAMES, ABILITY_SHORT, type Ability } from '@/lib/srd/skills';
import { card, innerBox, sectionLabel, modColor } from '../styles';
import type { CharacterStats, CharacterSheet } from '@/lib/db/schema';

export interface StatsTabProps {
  stats: CharacterStats;
  savingThrows: Record<Ability, boolean>;
  skillMap: CharacterSheet['skills'];
  level: number;
}

const ABILITIES: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export default function StatsTab({ stats, savingThrows, skillMap, level }: StatsTabProps) {
  const prof = proficiencyBonus(level);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {ABILITIES.map(ab => {
          const mod = abilityModifier(stats[ab]);
          return (
            <div key={ab} style={{ flex: 1, minWidth: 0, ...innerBox, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '.06em', color: 'var(--fg-2)' }}>{ABILITY_SHORT[ab]}</span>
                <span style={{ fontSize: '10px', color: 'var(--fg-3)' }}>{stats[ab]}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, color: modColor(mod) }}>
                {formatModifier(mod)}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-2)', maxHeight: 'calc(100vh - 280px)' }}>
        <div style={{ ...card, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          <div style={{ ...sectionLabel, marginBottom: 'var(--s-1)' }}>Tiri Salvezza</div>
          {ABILITIES.map(ab => {
            const prof_ = savingThrows[ab];
            const bonus = abilityModifier(stats[ab]) + (prof_ ? prof : 0);
            return (
              <div key={ab} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '.5px solid var(--bg-elevated)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 7, border: `1.5px solid ${prof_ ? 'var(--gold)' : 'var(--fg-3)'}`, background: prof_ ? 'var(--gold)' : 'transparent' }} />
                  <span style={{ fontSize: '12px', color: 'var(--fg-1)' }}>{ABILITY_NAMES[ab]}</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, color: modColor(bonus) }}>{formatModifier(bonus)}</span>
              </div>
            );
          })}
        </div>

        <div style={{ ...card, maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          <div style={{ ...sectionLabel, marginBottom: 'var(--s-1)' }}>Abilità</div>
          {SKILLS.map(sk => {
            const skill = skillMap[sk.key];
            const proficient = skill?.proficient ?? false;
            const expertise = skill?.expertise ?? false;
            const bonus = skillBonus(stats[sk.ability], level, proficient, expertise);
            const pipColor = expertise ? 'var(--arcane)' : proficient ? 'var(--gold)' : 'var(--fg-3)';
            return (
              <div key={sk.key} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 4px' }}>
                <div style={{ width: 5, height: 5, borderRadius: 5, border: `1.5px solid ${pipColor}`, background: proficient ? pipColor : 'transparent' }} />
                <span style={{ flex: 1, color: 'var(--fg-2)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sk.name}</span>
                <span style={{ fontSize: '8px', color: 'var(--fg-3)' }}>{ABILITY_SHORT[sk.ability]}</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: modColor(bonus), minWidth: 22, textAlign: 'right' }}>{formatModifier(bonus)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- StatsTab`
Expected: PASS — 3 tests passed.

- [ ] **Step 5: Commit**

```bash
git add components/character/sheet/v2/tabs/StatsTab.tsx components/character/sheet/v2/tabs/StatsTab.test.tsx
git commit -m "feat: add StatsTab (Caratteristiche) for character sheet v2"
```

---

### Task 12: `CombatTab` component (Combattimento)

**Files:**
- Create: `components/character/sheet/v2/tabs/CombatTab.tsx`
- Test: `components/character/sheet/v2/tabs/CombatTab.test.tsx`

**Interfaces:**
- Consumes: `ListDetailPanel` (Task 5); `useClassResource(characterId: string, resourceKey: string, delta: number): Promise<void>` from `@/lib/db/actions`; `abilityModifier, formatModifier` from `@/lib/rules/calculations`; `useToast` (Task 4); `card, innerBox` from `../styles`.
- Produces: `export interface CombatTabProps { characterId: string; weapons: CharacterWeapon[]; stats: CharacterStats; prof: number; pinnedAll: PinnedFeature[]; resources: CharacterResource[]; spellDC: number | null; canCast: boolean }` and `export default function CombatTab(props: CombatTabProps): ReactNode` — consumed by `CharacterSheetView` (Task 16).

Per the spec: the "Capacità" list shows **all** `pinnedFeatures` (passive and active). Features with a `resourceKey` show a "Usa" button (calling `useClassResource(characterId, resourceKey, -1)`) and their current/max from the matching `resources` row; features without a `resourceKey` show "Illimitato". When `canCast` is true, the detail panel also shows a "CD" stat using the character's overall `spellDC` (Channel-Divinity-style class features use the character's spellcasting ability for their save DC in 5e — there is no per-feature DC field in the schema, so the character's own `spellDC` is the correct source, not an invented value).

- [ ] **Step 1: Write the failing test**

```tsx
// components/character/sheet/v2/tabs/CombatTab.test.tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- CombatTab`
Expected: FAIL — `Cannot find module './CombatTab'`

- [ ] **Step 3: Implement `CombatTab.tsx`**

```tsx
'use client';

import { startTransition, useState } from 'react';
import ListDetailPanel from '../ListDetailPanel';
import { useToast } from '../useToast';
import { useClassResource } from '@/lib/db/actions';
import { abilityModifier, formatModifier } from '@/lib/rules/calculations';
import { innerBox } from '../styles';
import type { CharacterWeapon, PinnedFeature, CharacterResource, CharacterStats } from '@/lib/db/schema';

export interface CombatTabProps {
  characterId: string;
  weapons: CharacterWeapon[];
  stats: CharacterStats;
  prof: number;
  pinnedAll: PinnedFeature[];
  resources: CharacterResource[];
  spellDC: number | null;
  canCast: boolean;
}

interface AttackItem { id: string; weapon: CharacterWeapon; }
interface FeatureItem { id: string; feature: PinnedFeature; }

export default function CombatTab({ characterId, weapons, stats, prof, pinnedAll, resources, spellDC, canCast }: CombatTabProps) {
  const { show } = useToast();
  const [subTab, setSubTab] = useState<'attacks' | 'abilities'>('attacks');
  const [selectedAttackId, setSelectedAttackId] = useState<string | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  const attackItems: AttackItem[] = weapons.map(w => ({ id: w.id, weapon: w }));
  const featureItems: FeatureItem[] = pinnedAll.map(f => ({ id: f.key, feature: f }));

  function handleUse(resourceKey: string) {
    startTransition(async () => {
      await useClassResource(characterId, resourceKey, -1);
      show('Capacità utilizzata');
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 2, marginBottom: 10, background: 'var(--bg-inner)', borderRadius: 'var(--r-sm)', padding: 2, width: 'fit-content' }}>
        <div
          onClick={() => setSubTab('attacks')}
          style={{ padding: '5px 14px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '9px', fontWeight: 600, letterSpacing: '.05em', color: subTab === 'attacks' ? 'var(--fg-1)' : 'var(--fg-2)', background: subTab === 'attacks' ? 'var(--bg-card)' : 'transparent' }}
        >
          Attacchi ({attackItems.length})
        </div>
        <div
          onClick={() => setSubTab('abilities')}
          style={{ padding: '5px 14px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '9px', fontWeight: 600, letterSpacing: '.05em', color: subTab === 'abilities' ? 'var(--fg-1)' : 'var(--fg-2)', background: subTab === 'abilities' ? 'var(--bg-card)' : 'transparent' }}
        >
          Capacità ({featureItems.length})
        </div>
      </div>

      {subTab === 'attacks' ? (
        <ListDetailPanel
          items={attackItems}
          selectedId={selectedAttackId}
          onSelect={setSelectedAttackId}
          emptyDetailText="Seleziona un attacco per vederne i dettagli"
          renderListItem={(item) => (
            <div style={{ padding: '7px 8px', borderRadius: 'var(--r-sm)' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', color: 'var(--fg-1)' }}>{item.weapon.name}</div>
              <div style={{ fontSize: '9px', color: 'var(--fg-3)' }}>{item.weapon.damageType}</div>
            </div>
          )}
          renderDetail={(item) => {
            const w = item.weapon;
            const atkMod = abilityModifier(stats[w.attackStat]) + prof + (w.magicBonus ?? 0);
            const dmgMod = abilityModifier(stats[w.attackStat]) + (w.magicBonus ?? 0);
            return (
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', marginBottom: 12 }}>{w.name}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <div style={{ ...innerBox, padding: '5px 10px' }}>
                    <div style={{ fontSize: '7px', color: 'var(--fg-3)', textTransform: 'uppercase' }}>Tiro per Colpire</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>{formatModifier(atkMod)}</div>
                  </div>
                  <div style={{ ...innerBox, padding: '5px 10px' }}>
                    <div style={{ fontSize: '7px', color: 'var(--fg-3)', textTransform: 'uppercase' }}>Danno</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fg-1)' }}>{w.damageDice}{formatModifier(dmgMod)} {w.damageType}</div>
                  </div>
                </div>
              </div>
            );
          }}
        />
      ) : (
        <ListDetailPanel
          items={featureItems}
          selectedId={selectedFeatureId}
          onSelect={setSelectedFeatureId}
          emptyDetailText="Seleziona una capacità per vederne i dettagli"
          renderListItem={(item) => (
            <div style={{ padding: '7px 8px', borderRadius: 'var(--r-sm)' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '12px', color: 'var(--fg-1)' }}>{item.feature.name}</div>
            </div>
          )}
          renderDetail={(item) => {
            const feature = item.feature;
            const resource = feature.resourceKey ? resources.find(r => r.resourceKey === feature.resourceKey) : null;
            return (
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', marginBottom: 12 }}>{feature.name}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  <div style={{ ...innerBox, padding: '5px 10px' }}>
                    <div style={{ fontSize: '7px', color: 'var(--fg-3)', textTransform: 'uppercase' }}>Utilizzi</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold)' }}>
                      {resource ? `${resource.current}/${resource.maximum}` : 'Illimitato'}
                    </div>
                  </div>
                  {canCast && feature.resourceKey && (
                    <div style={{ ...innerBox, padding: '5px 10px' }}>
                      <div style={{ fontSize: '7px', color: 'var(--fg-3)', textTransform: 'uppercase' }}>CD</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>{spellDC}</div>
                    </div>
                  )}
                </div>
                {feature.resourceKey && (
                  <button
                    onClick={() => handleUse(feature.resourceKey!)}
                    style={{ fontSize: '10px', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: 'var(--r-sm)', padding: '4px 12px', background: 'none', cursor: 'pointer' }}
                  >
                    Usa
                  </button>
                )}
                {feature.description && (
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--fg-2)', lineHeight: 1.65, marginTop: 12 }}>{feature.description}</p>
                )}
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- CombatTab`
Expected: PASS — 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add components/character/sheet/v2/tabs/CombatTab.tsx components/character/sheet/v2/tabs/CombatTab.test.tsx
git commit -m "feat: add CombatTab (Combattimento) for character sheet v2"
```

---

### Task 13: `SpellsTab` component (Incantesimi)

**Files:**
- Create: `components/character/sheet/v2/tabs/SpellsTab.tsx`
- Test: `components/character/sheet/v2/tabs/SpellsTab.test.tsx`

**Interfaces:**
- Consumes: `ListDetailPanel` (Task 5); `useSpellSlot(characterId: string, slotLevel: number): Promise<void>`, `restoreSpellSlot(characterId: string, slotLevel: number): Promise<void>` from `@/lib/db/actions`; `SRD_SPELLS, SCHOOLS_IT, type SrdSpell` from `@/lib/srd/spells`; `useToast` (Task 4).
- Produces: `export interface SpellsTabProps { characterId: string; activeSpellSlots: CharacterSpellSlot[]; knownSpells: KnownSpell[]; canCast: boolean }` and `export default function SpellsTab(props: SpellsTabProps): ReactNode` — consumed by `CharacterSheetView` (Task 16).

There is no bulk "reset slot level" or "reset all slots" server action — only `useSpellSlot` (+1 used) and `restoreSpellSlot` (-1 used). "Click a fully-used level to reset it" and the global "Reset" button are implemented by calling `restoreSpellSlot` once per currently-used charge in that level (a small loop over existing single-step actions, not a new action).

- [ ] **Step 1: Write the failing test**

```tsx
// components/character/sheet/v2/tabs/SpellsTab.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/db/actions', () => ({
  useSpellSlot: vi.fn().mockResolvedValue(undefined),
  restoreSpellSlot: vi.fn().mockResolvedValue(undefined),
}));

import SpellsTab from './SpellsTab';
import { ToastProvider } from '../Toast';
import { useSpellSlot, restoreSpellSlot } from '@/lib/db/actions';
import type { CharacterSpellSlot, KnownSpell } from '@/lib/db/schema';

const activeSpellSlots: CharacterSpellSlot[] = [
  { characterId: 'char-1', slotLevel: 1, total: 4, used: 1 },
];
const knownSpells: KnownSpell[] = [
  { id: 'guidance', name: 'Guida', level: 0, prepared: true },
  { id: 'command', name: 'Comando', level: 1, prepared: false },
];

function renderTab(spells = knownSpells) {
  return render(
    <ToastProvider>
      <SpellsTab characterId="char-1" activeSpellSlots={activeSpellSlots} knownSpells={spells} canCast={true} />
    </ToastProvider>
  );
}

describe('SpellsTab', () => {
  it('shows an empty state with no spells when the character cannot cast', () => {
    render(
      <ToastProvider>
        <SpellsTab characterId="char-1" activeSpellSlots={[]} knownSpells={[]} canCast={false} />
      </ToastProvider>
    );
    expect(screen.getByText('Nessun incantesimo disponibile')).toBeInTheDocument();
  });

  it('lists known spells by default (Tutti)', () => {
    renderTab();
    expect(screen.getByText('Guida')).toBeInTheDocument();
    expect(screen.getByText('Comando')).toBeInTheDocument();
  });

  it('filters to only prepared spells', () => {
    renderTab();
    fireEvent.click(screen.getByText(/Preparati/));
    expect(screen.getByText('Guida')).toBeInTheDocument();
    expect(screen.queryByText('Comando')).toBeNull();
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- SpellsTab`
Expected: FAIL — `Cannot find module './SpellsTab'`

- [ ] **Step 3: Implement `SpellsTab.tsx`**

```tsx
'use client';

import { startTransition, useState } from 'react';
import ListDetailPanel from '../ListDetailPanel';
import { useToast } from '../useToast';
import { useSpellSlot, restoreSpellSlot } from '@/lib/db/actions';
import { SRD_SPELLS, SCHOOLS_IT } from '@/lib/srd/spells';
import { innerBox } from '../styles';
import type { CharacterSpellSlot, KnownSpell } from '@/lib/db/schema';

export interface SpellsTabProps {
  characterId: string;
  activeSpellSlots: CharacterSpellSlot[];
  knownSpells: KnownSpell[];
  canCast: boolean;
}

interface SpellItem { id: string; known: KnownSpell; srd: typeof SRD_SPELLS[number] | undefined; }

export default function SpellsTab({ characterId, activeSpellSlots, knownSpells, canCast }: SpellsTabProps) {
  const { show } = useToast();
  const [filter, setFilter] = useState<'all' | 'prepared'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleSlotClick(slot: CharacterSpellSlot) {
    startTransition(async () => {
      if (slot.used >= slot.total) {
        for (let i = 0; i < slot.total; i++) await restoreSpellSlot(characterId, slot.slotLevel);
        show(`Slot livello ${slot.slotLevel} ripristinati`);
      } else {
        await useSpellSlot(characterId, slot.slotLevel);
        show(`Slot livello ${slot.slotLevel} consumato`);
      }
    });
  }

  function handleResetAll() {
    startTransition(async () => {
      for (const slot of activeSpellSlots) {
        for (let i = 0; i < slot.used; i++) await restoreSpellSlot(characterId, slot.slotLevel);
      }
      show('Slot ripristinati');
    });
  }

  if (!canCast) {
    return (
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px', color: 'var(--fg-3)', textAlign: 'center', padding: '40px 0' }}>
        Nessun incantesimo disponibile
      </p>
    );
  }

  const filtered = filter === 'prepared' ? knownSpells.filter(sp => sp.prepared) : knownSpells;
  const preparedCount = knownSpells.filter(sp => sp.prepared).length;
  const items: SpellItem[] = filtered.map(known => ({
    id: known.id, known, srd: SRD_SPELLS.find(s => s.id === known.id),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>Slot Incantesimo</span>
          <span onClick={handleResetAll} style={{ fontSize: '8px', color: 'var(--fg-3)', cursor: 'pointer' }}>Reset</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {activeSpellSlots.map(slot => {
            const remaining = slot.total - slot.used;
            const allUsed = remaining === 0;
            return (
              <div
                key={slot.slotLevel}
                data-testid={`slot-badge-${slot.slotLevel}`}
                onClick={() => handleSlotClick(slot)}
                style={{
                  flex: 1, minWidth: 60, display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 8px',
                  borderRadius: 'var(--r-sm)', cursor: 'pointer',
                  background: allUsed ? 'rgba(168,51,28,.06)' : 'rgba(138,92,196,.06)',
                  border: `1px solid ${allUsed ? 'rgba(168,51,28,.25)' : 'rgba(138,92,196,.25)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--arcane)' }}>{slot.slotLevel}°</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: allUsed ? 'var(--danger)' : 'var(--fg-1)' }}>{remaining}/{slot.total}</span>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: slot.total }, (_, i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: 7, background: i < remaining ? 'var(--arcane)' : 'var(--border-leather-dim)' }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => setFilter('all')} style={{ fontSize: '9px', padding: '0 10px', height: 22, borderRadius: 'var(--r-sm)', border: `1px solid ${filter === 'all' ? 'var(--gold)' : 'var(--border-leather)'}`, color: filter === 'all' ? 'var(--gold)' : 'var(--fg-2)', background: 'none', cursor: 'pointer' }}>
          Tutti
        </button>
        <button onClick={() => setFilter('prepared')} style={{ fontSize: '9px', padding: '0 10px', height: 22, borderRadius: 'var(--r-sm)', border: `1px solid ${filter === 'prepared' ? 'var(--gold)' : 'var(--border-leather)'}`, color: filter === 'prepared' ? 'var(--gold)' : 'var(--fg-2)', background: 'none', cursor: 'pointer' }}>
          Preparati ({preparedCount})
        </button>
      </div>

      <ListDetailPanel
        items={items}
        selectedId={selectedId}
        onSelect={setSelectedId}
        emptyDetailText="Seleziona un incantesimo dalla lista per vederne i dettagli"
        renderListItem={(item) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px' }}>
            <span style={{ fontSize: '7px', fontWeight: 700, color: 'var(--arcane)', minWidth: 32 }}>
              {item.known.level === 0 ? 'Truc.' : `Lv ${item.known.level}`}
            </span>
            <span style={{ flex: 1, fontSize: '11px', color: item.known.prepared ? 'var(--fg-1)' : 'var(--fg-2)' }}>{item.known.name}</span>
            {item.known.concentration && <span style={{ fontSize: '7px', color: 'var(--info)' }}>C</span>}
          </div>
        )}
        renderDetail={(item) => {
          const srd = item.srd;
          return (
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', marginBottom: 4 }}>{item.known.name}</div>
              {srd && (
                <>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', marginBottom: 10 }}>
                    {SCHOOLS_IT[srd.school] ?? srd.school}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
                    <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Tempo di Lancio</div><div style={{ fontSize: '11px', color: 'var(--fg-1)' }}>{srd.castingTime}</div></div>
                    <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Gittata</div><div style={{ fontSize: '11px', color: 'var(--fg-1)' }}>{srd.range}</div></div>
                    <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Durata</div><div style={{ fontSize: '11px', color: 'var(--fg-1)' }}>{srd.duration}</div></div>
                    <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Componenti</div><div style={{ fontSize: '11px', color: 'var(--fg-1)' }}>{srd.components}</div></div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--fg-2)', lineHeight: 1.65 }}>{srd.description}</p>
                </>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- SpellsTab`
Expected: PASS — 5 tests passed.

- [ ] **Step 5: Commit**

```bash
git add components/character/sheet/v2/tabs/SpellsTab.tsx components/character/sheet/v2/tabs/SpellsTab.test.tsx
git commit -m "feat: add SpellsTab (Incantesimi) for character sheet v2"
```

---

### Task 14: `InventoryTab` component

**Files:**
- Create: `components/character/sheet/v2/tabs/InventoryTab.tsx`
- Test: `components/character/sheet/v2/tabs/InventoryTab.test.tsx`

**Interfaces:**
- Consumes: `ListDetailPanel` (Task 5); `equipInventoryItem(characterId: string, itemId: string, action: 'equip'|'unequip'|'attune'|'unattune'): Promise<{error?: string}>`, `saveInventory(characterId: string, inventory: CharacterSheet['inventory'], money: CharacterSheet['money']): Promise<void>` from `@/lib/db/actions`; `@radix-ui/react-popover` (`Popover.Root/Trigger/Portal/Content`); `useToast` (Task 4).
- Produces: `export interface InventoryTabProps { characterId: string; inventory: InventoryItem[]; money: CharacterSheet['money']; carriedKg: number; carryMax: number }` and `export default function InventoryTab(props: InventoryTabProps): ReactNode` — consumed by `CharacterSheetView` (Task 16).

Coin denominations use the labels PP/MO/ME/MA/MR mapping to schema keys `pp/gp/ep/sp/cp` respectively (Italian display labels over the existing English-keyed `money` object — no schema change).

- [ ] **Step 1: Write the failing test**

```tsx
// components/character/sheet/v2/tabs/InventoryTab.test.tsx
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
    const goldRow = screen.getByText('MO').closest('div')!.parentElement!;
    const input = goldRow.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.click(screen.getByText('+', { selector: 'div' }) ?? screen.getAllByText('+')[0]);
    expect(saveInventory).toHaveBeenCalledWith('char-1', inventory, { ...money, gp: 55 });
  });

  it('selects an item and shows its detail with an equip toggle calling equipInventoryItem', () => {
    renderTab();
    fireEvent.click(screen.getByText('Torce'));
    fireEvent.click(screen.getByText('Indossa'));
    expect(equipInventoryItem).toHaveBeenCalledWith('char-1', 'i2', 'equip');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- InventoryTab`
Expected: FAIL — `Cannot find module './InventoryTab'`

- [ ] **Step 3: Implement `InventoryTab.tsx`**

```tsx
'use client';

import { startTransition, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import ListDetailPanel from '../ListDetailPanel';
import { useToast } from '../useToast';
import { equipInventoryItem, saveInventory } from '@/lib/db/actions';
import { card, innerBox } from '../styles';
import type { InventoryItem, CharacterSheet } from '@/lib/db/schema';

export interface InventoryTabProps {
  characterId: string;
  inventory: InventoryItem[];
  money: CharacterSheet['money'];
  carriedKg: number;
  carryMax: number;
}

const COIN_LABELS: Record<keyof CharacterSheet['money'], string> = { pp: 'PP', gp: 'MO', ep: 'ME', sp: 'MA', cp: 'MR' };
const COIN_KEYS = Object.keys(COIN_LABELS) as (keyof CharacterSheet['money'])[];

export default function InventoryTab({ characterId, inventory, money, carriedKg, carryMax }: InventoryTabProps) {
  const { show } = useToast();
  const [tab, setTab] = useState<'all' | 'equipped'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [coinInputs, setCoinInputs] = useState<Record<string, string>>({ pp: '', gp: '', ep: '', sp: '', cp: '' });

  function adjustCoin(key: keyof CharacterSheet['money'], sign: 1 | -1) {
    const amount = parseInt(coinInputs[key], 10) || 1;
    const next = { ...money, [key]: Math.max(0, money[key] + sign * amount) };
    startTransition(async () => {
      await saveInventory(characterId, inventory, next);
      show(`${sign > 0 ? '+' : '-'}${amount} ${COIN_LABELS[key]}`);
      setCoinInputs(prev => ({ ...prev, [key]: '' }));
    });
  }

  function handleEquipToggle(item: InventoryItem) {
    startTransition(async () => {
      const result = await equipInventoryItem(characterId, item.id, item.equipped ? 'unequip' : 'equip');
      if (result.error) { show(result.error); return; }
      show(item.equipped ? `${item.name} rimosso` : `${item.name} equipaggiato`);
      setOpenMenuId(null);
    });
  }

  function handleDrop(item: InventoryItem) {
    startTransition(async () => {
      await saveInventory(characterId, inventory.filter(i => i.id !== item.id), money);
      show(`${item.name} lasciato`);
      setOpenMenuId(null);
      if (selectedId === item.id) setSelectedId(null);
    });
  }

  const filtered = tab === 'equipped' ? inventory.filter(i => i.equipped) : inventory;
  const equippedCount = inventory.filter(i => i.equipped).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--warning)', textTransform: 'uppercase' }}>Denaro</span>
          <span style={{ fontSize: '9px', color: 'var(--fg-1)' }}>{carriedKg} / {carryMax} kg</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {COIN_KEYS.map(key => (
            <div key={key} style={{ flex: 1, minWidth: 0, ...innerBox, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '8px', fontWeight: 700, color: 'var(--gold)' }}>{COIN_LABELS[key]}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700, color: 'var(--fg-1)' }}>{money[key]}</span>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                <div onClick={() => adjustCoin(key, -1)} style={{ width: 20, height: 20, borderRadius: 5, border: '1px solid var(--border-leather)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</div>
                <input
                  value={coinInputs[key]}
                  onChange={e => setCoinInputs(prev => ({ ...prev, [key]: e.target.value }))}
                  style={{ flex: 1, minWidth: 0, height: 20, textAlign: 'center', background: 'var(--bg-deep)', border: '1px solid var(--border-leather)', borderRadius: 5, color: 'var(--fg-1)', fontSize: '9px' }}
                  placeholder="1"
                />
                <div onClick={() => adjustCoin(key, 1)} style={{ width: 20, height: 20, borderRadius: 5, border: '1px solid var(--border-leather)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ListDetailPanel
        items={filtered}
        selectedId={selectedId}
        onSelect={setSelectedId}
        emptyDetailText="Seleziona un oggetto dalla lista per vederne i dettagli"
        renderListItem={(item) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', color: item.equipped ? 'var(--fg-1)' : 'var(--fg-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
              </div>
              <div style={{ fontSize: '8px', color: 'var(--fg-3)' }}>{item.category}</div>
            </div>
            {item.equipped && <span style={{ fontSize: '7px', color: 'var(--success)' }}>E</span>}
            <span style={{ fontSize: '9px', color: 'var(--fg-3)' }}>{item.weight * item.quantity} kg</span>
            <Popover.Root open={openMenuId === item.id} onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}>
              <Popover.Trigger asChild>
                <button onClick={(e) => e.stopPropagation()} style={{ width: 22, height: 22, border: 'none', background: 'none', color: 'var(--fg-3)', cursor: 'pointer', fontSize: '14px' }}>⋯</button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content style={{ background: 'var(--bg-inner)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 4, minWidth: 120, zIndex: 50 }}>
                  <div onClick={() => handleEquipToggle(item)} style={{ padding: '6px 10px', fontSize: '10px', color: item.equipped ? 'var(--danger)' : 'var(--success)', cursor: 'pointer' }}>
                    {item.equipped ? 'Rimuovi' : 'Indossa'}
                  </div>
                  <div onClick={() => handleDrop(item)} style={{ padding: '6px 10px', fontSize: '10px', color: 'var(--danger)', cursor: 'pointer' }}>
                    Lascia
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        )}
        renderDetail={(item) => (
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', marginBottom: 4 }}>{item.name}</div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--fg-2)', textTransform: 'uppercase', marginBottom: 12 }}>{item.category}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Peso</div><div style={{ fontSize: '13px', color: 'var(--fg-1)' }}>{item.weight * item.quantity} kg</div></div>
              {item.quantity > 1 && <div style={innerBox}><div style={{ fontSize: '7px', color: 'var(--fg-3)' }}>Quantità</div><div style={{ fontSize: '13px', color: 'var(--fg-1)' }}>{item.quantity}</div></div>}
            </div>
            {item.notes && <p style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--fg-2)', lineHeight: 1.65 }}>{item.notes}</p>}
          </div>
        )}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- InventoryTab`
Expected: PASS — 5 tests passed. The "+" button query may need adjusting to a `data-testid` if multiple "+" glyphs collide across coin rows — if so, add `data-testid={`coin-plus-${key}`}` to the `+` div and update the test to use `screen.getByTestId('coin-plus-gp')`.

- [ ] **Step 5: Commit**

```bash
git add components/character/sheet/v2/tabs/InventoryTab.tsx components/character/sheet/v2/tabs/InventoryTab.test.tsx
git commit -m "feat: add InventoryTab for character sheet v2"
```

---

### Task 15: `NarrativeTab` component

**Files:**
- Create: `components/character/sheet/v2/tabs/NarrativeTab.tsx`

**Interfaces:**
- Consumes: `BackstoryCard` (`@/components/character/sheet/BackstoryCard`, props `{characterId, charName, initialBackstory, personality?, ideals?, bonds?, flaws?, isOwner, vertical?}`).
- Produces: `export interface NarrativeTabProps { characterId: string; charName: string; sheet: CharacterSheet; isOwner: boolean }` and `export default function NarrativeTab(props: NarrativeTabProps): ReactNode` — consumed by `CharacterSheetView` (Task 16).

No new test: this is a direct pass-through to the existing, already-tested-in-production `BackstoryCard` (mobile-shared, unmodified) with `vertical={false}` to get the `1fr 2fr` two-column layout it already supports for non-vertical usage. Covered by manual QA in Task 19.

- [ ] **Step 1: Implement `NarrativeTab.tsx`**

```tsx
import BackstoryCard from '@/components/character/sheet/BackstoryCard';
import type { CharacterSheet } from '@/lib/db/schema';

export interface NarrativeTabProps {
  characterId: string;
  charName: string;
  sheet: CharacterSheet;
  isOwner: boolean;
}

export default function NarrativeTab({ characterId, charName, sheet, isOwner }: NarrativeTabProps) {
  return (
    <BackstoryCard
      characterId={characterId}
      charName={charName}
      initialBackstory={sheet.backstory ?? ''}
      personality={sheet.personality}
      ideals={sheet.ideals}
      bonds={sheet.bonds}
      flaws={sheet.flaws}
      isOwner={isOwner}
      vertical={false}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/character/sheet/v2/tabs/NarrativeTab.tsx
git commit -m "feat: add NarrativeTab for character sheet v2"
```

---

### Task 16: `CharacterSheetView` container component

**Files:**
- Create: `components/character/sheet/v2/CharacterSheetView.tsx`
- Test: `components/character/sheet/v2/CharacterSheetView.test.tsx`

**Interfaces:**
- Consumes: `Sidebar` (Task 6), `SidebarDmActions` (Task 7), `HpStatsRow` (Task 8), `ConditionsRow` (Task 9), `TabNav`/`SheetTabId` (Task 10), `ToastProvider` (Task 4), `StatsTab` (Task 11), `CombatTab` (Task 12), `SpellsTab` (Task 13), `InventoryTab` (Task 14), `NarrativeTab` (Task 15).
- Produces: `export interface CharacterSheetViewProps { character: Character; sheet: CharacterSheet; model: SheetViewModel; conditions: CharacterCondition[]; resources: CharacterResource[]; campaign: { id: string; name: string } | null; isActiveCharacter: boolean; currentActiveName: string | null; viewerRole: 'dm' | 'player'; currentUserId: string | null; isOwner: boolean }` and `export default function CharacterSheetView(props: CharacterSheetViewProps): ReactNode` — consumed by `app/characters/[id]/page.tsx` (Task 17) and `app/my-character/page.tsx` (Task 18).

Persists the active tab in `localStorage` under key `quenta:sheet-v2-tab:${characterId}` — a **different** key prefix than the old `SheetTabBar` (`quenta:sheet-tab:${characterId}`, see `SheetTabBar.tsx:25-26`), so a stale 4-tab value from before this redesign can never be read as one of the new 5 tab ids.

- [ ] **Step 1: Write the failing test**

```tsx
// components/character/sheet/v2/CharacterSheetView.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/db/actions', () => ({
  shortRest: vi.fn().mockResolvedValue(undefined),
  longRest: vi.fn().mockResolvedValue(undefined),
  applyDamage: vi.fn().mockResolvedValue(undefined),
  applyHealing: vi.fn().mockResolvedValue(undefined),
  setTempHp: vi.fn().mockResolvedValue(undefined),
  useClassResource: vi.fn().mockResolvedValue(undefined),
  useSpellSlot: vi.fn().mockResolvedValue(undefined),
  restoreSpellSlot: vi.fn().mockResolvedValue(undefined),
  equipInventoryItem: vi.fn().mockResolvedValue({}),
  saveInventory: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/components/character/portrait/PortraitButton', () => ({ default: () => <div>portrait</div> }));
vi.mock('@/components/dashboard/XpControls', () => ({ default: () => <div>xp-controls</div> }));
vi.mock('@/components/character/sheet/LevelUpButton', () => ({ default: () => <div>level-up</div> }));
vi.mock('@/components/character/sheet/AsiRetroactiveButton', () => ({ default: () => <div>asi-retroactive</div> }));
vi.mock('@/components/character/sheet/ActiveCharacterButton', () => ({ default: () => <div>active-character</div> }));
vi.mock('@/components/character/sheet/AssignPlayerButton', () => ({ default: () => <div>assign-player</div> }));
vi.mock('@/components/character/features/FeatureButton', () => ({ default: ({ label }: { label: string }) => <div>{label}</div> }));
vi.mock('@/components/character/sheet/DeathSavesTracker', () => ({ default: () => <div>death-saves</div> }));
vi.mock('@/components/character/sheet/BackstoryCard', () => ({ default: () => <div>backstory-card</div> }));

import CharacterSheetView from './CharacterSheetView';
import type { Character, CharacterSheet } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

const character = { id: 'char-1', name: 'Thorin', xp: 14000, hpCurrent: 42, hpMax: 56, hpTemp: 0 } as Character;
const sheet = { stats: { str: 14, dex: 12, con: 15, int: 10, wis: 17, cha: 8 }, money: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 } } as CharacterSheet;
const model = {
  level: 6, prof: 3, passPerc: 15, classLabel: 'Chierico 6', nextXp: 23000, xpPct: 60,
  canLevelUp: false, classesWithSubclass: [], stats: sheet.stats, savingThrows: {}, skillMap: {},
  hpPct: 75, hpColor: 'var(--success)', canCast: false, spellDC: null, spellAtk: null,
  carriedKg: 0, carryMax: 105, pinnedAll: [], activeSpellSlots: [], knownSpells: [],
} as unknown as SheetViewModel;

function renderView(viewerRole: 'dm' | 'player' = 'player') {
  return render(
    <CharacterSheetView
      character={character} sheet={sheet} model={model} conditions={[]} resources={[]}
      campaign={null} isActiveCharacter={true} currentActiveName={null}
      viewerRole={viewerRole} currentUserId="user-1" isOwner={true}
    />
  );
}

describe('CharacterSheetView', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to the Caratteristiche tab', () => {
    renderView();
    expect(screen.getByText('Tiri Salvezza')).toBeInTheDocument();
  });

  it('switches tabs and persists the choice in localStorage under the v2 key', () => {
    renderView();
    fireEvent.click(screen.getByText('Inventario'));
    expect(screen.getByText('Denaro')).toBeInTheDocument();
    expect(window.localStorage.getItem('quenta:sheet-v2-tab:char-1')).toBe('inventory');
  });

  it('does not render DM-only actions for a player viewer', () => {
    renderView('player');
    expect(screen.queryByText('assign-player')).toBeNull();
  });

  it('renders DM-only actions for a dm viewer', () => {
    renderView('dm');
    expect(screen.getByText('assign-player')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- CharacterSheetView`
Expected: FAIL — `Cannot find module './CharacterSheetView'`

- [ ] **Step 3: Implement `CharacterSheetView.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import SidebarDmActions from './SidebarDmActions';
import HpStatsRow from './HpStatsRow';
import ConditionsRow from './ConditionsRow';
import TabNav, { type SheetTabId } from './TabNav';
import { ToastProvider } from './Toast';
import StatsTab from './tabs/StatsTab';
import CombatTab from './tabs/CombatTab';
import SpellsTab from './tabs/SpellsTab';
import InventoryTab from './tabs/InventoryTab';
import NarrativeTab from './tabs/NarrativeTab';
import type { Character, CharacterSheet, CharacterCondition, CharacterResource } from '@/lib/db/schema';
import type { SheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';

export interface CharacterSheetViewProps {
  character: Character;
  sheet: CharacterSheet;
  model: SheetViewModel;
  conditions: CharacterCondition[];
  resources: CharacterResource[];
  campaign: { id: string; name: string } | null;
  isActiveCharacter: boolean;
  currentActiveName: string | null;
  viewerRole: 'dm' | 'player';
  currentUserId: string | null;
  isOwner: boolean;
}

const STORAGE_PREFIX = 'quenta:sheet-v2-tab:';
const VALID_TABS: SheetTabId[] = ['stats', 'combat', 'spells', 'inventory', 'narrative'];

function readStoredTab(characterId: string): SheetTabId {
  if (typeof window === 'undefined') return 'stats';
  const saved = window.localStorage.getItem(`${STORAGE_PREFIX}${characterId}`);
  return (VALID_TABS as string[]).includes(saved ?? '') ? (saved as SheetTabId) : 'stats';
}

export default function CharacterSheetView({
  character, sheet, model, conditions, resources, campaign,
  isActiveCharacter, currentActiveName, viewerRole, currentUserId, isOwner,
}: CharacterSheetViewProps) {
  const [activeTab, setActiveTab] = useState<SheetTabId>('stats');

  useEffect(() => {
    setActiveTab(readStoredTab(character.id));
  }, [character.id]);

  function handleTabChange(tab: SheetTabId) {
    setActiveTab(tab);
    window.localStorage.setItem(`${STORAGE_PREFIX}${character.id}`, tab);
  }

  return (
    <ToastProvider>
      <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'start' }}>
        <Sidebar
          character={character}
          sheet={sheet}
          model={model}
          resources={resources}
          campaign={campaign}
          isActiveCharacter={isActiveCharacter}
          currentActiveName={currentActiveName}
          dmActions={viewerRole === 'dm' ? (
            <SidebarDmActions characterId={character.id} currentUserId={currentUserId} dmNotes={sheet.dmNotes} />
          ) : undefined}
        />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          <HpStatsRow character={character} sheet={sheet} model={model} />
          <ConditionsRow characterId={character.id} conditions={conditions} />
          <TabNav characterId={character.id} activeTab={activeTab} onChange={handleTabChange} />

          {activeTab === 'stats' && (
            <StatsTab stats={model.stats} savingThrows={model.savingThrows} skillMap={model.skillMap} level={model.level} />
          )}
          {activeTab === 'combat' && (
            <CombatTab
              characterId={character.id}
              weapons={sheet.weapons ?? []}
              stats={model.stats}
              prof={model.prof}
              pinnedAll={model.pinnedAll}
              resources={resources}
              spellDC={model.spellDC}
              canCast={model.canCast}
            />
          )}
          {activeTab === 'spells' && (
            <SpellsTab
              characterId={character.id}
              activeSpellSlots={model.activeSpellSlots}
              knownSpells={model.knownSpells}
              canCast={model.canCast}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryTab
              characterId={character.id}
              inventory={sheet.inventory ?? []}
              money={sheet.money}
              carriedKg={model.carriedKg}
              carryMax={model.carryMax}
            />
          )}
          {activeTab === 'narrative' && (
            <NarrativeTab characterId={character.id} charName={character.name} sheet={sheet} isOwner={isOwner} />
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- CharacterSheetView`
Expected: PASS — 4 tests passed.

- [ ] **Step 5: Commit**

```bash
git add components/character/sheet/v2/CharacterSheetView.tsx components/character/sheet/v2/CharacterSheetView.test.tsx
git commit -m "feat: add CharacterSheetView container for character sheet v2"
```

---

### Task 17: Wire `CharacterSheetView` into `app/characters/[id]/page.tsx` (DM view)

**Files:**
- Modify: `app/characters/[id]/page.tsx`

**Interfaces:**
- Consumes: `buildSheetViewModel` (Task 2), `CharacterSheetView` (Task 16).

This task only changes the **desktop** render block. The `<div className="mobile-layout">...<MobileSheet ... /></div>` block and the `PendingRestBanner` above it stay untouched.

- [ ] **Step 1: Read the current file end-to-end**

Open `app/characters/[id]/page.tsx` in full. Locate three regions by content (line numbers may have drifted slightly from the research pass — match by the markers below, not by line number):
1. The inline computation block starting at `const sheet = char.sheet as CharacterSheet;` and ending at `const knownSpells = sheet.knownSpells ?? [];` (originally lines 119-202).
2. The opening `<div className="desktop-layout" style={{ minWidth: 1100, padding: '16px 24px 48px' }}>` and its matching closing `</div>` immediately before `<div className="mobile-layout">`.
3. The unused-after-this-task imports: `HpStrip`, `SheetTabBar`, `InventoryCard`, `AddSpellButton`, `PortraitButton`, `SpellSectionTabs`, `FeatureButton`, `PinnedPassiveSection`, `PinnedActiveResources`, `BackstoryCard`, `LevelUpButton`, `AsiRetroactiveButton`, `AssignPlayerButton`, `ActiveCharacterButton`, `XpControls`.

- [ ] **Step 2: Replace the inline computation block with `buildSheetViewModel`**

Replace everything from `const sheet = char.sheet as CharacterSheet;` through `const knownSpells = sheet.knownSpells ?? [];` with:

```typescript
const sheet = char.sheet as CharacterSheet;
const model = buildSheetViewModel(char, sheet, spellSlots);
```

Anywhere later in the **kept** code (the `PendingRestBanner` props, in particular `conModifier`, `isPreparedCaster`, `casterClassKeys`, `currentSpells`, `characterStats`) that referenced the old local variables, update to read from `model`:
- `conModifier={abilityModifier(model.stats.con)}` (keep the `abilityModifier` import — it is the only remaining direct use in this file)
- `casterClassKeys={model.casterClassKeys}`
- `isPreparedCaster={['cleric','druid','paladin','wizard'].some(k => model.casterClassKeys.includes(k))}`
- `currentSpells={model.knownSpells}`
- `characterStats={model.stats}`
- `hpCurrent={char.hpCurrent}` / `hpMax={char.hpMax}` (unchanged, these read `char` directly)

- [ ] **Step 3: Replace the desktop JSX block**

Replace the entire content **inside** `<div className="desktop-layout" ...>` — from after the `PendingRestBanner` block (which stays) and the breadcrumb (which stays) through the rest of the old 3-column sidebar + `SheetTabBar` markup — with:

```tsx
<CharacterSheetView
  character={char}
  sheet={sheet}
  model={model}
  conditions={conditions}
  resources={resources}
  campaign={campaign ? { id: campaign.id, name: campaign.name } : null}
  isActiveCharacter={isActiveCharacter}
  currentActiveName={currentActiveName}
  viewerRole={isDm ? 'dm' : 'player'}
  currentUserId={session?.user?.id ?? null}
  isOwner={isDm || isActiveCharacter}
/>
```

If `session.user.id` is not already typed on the NextAuth session (check `auth.ts` callbacks — `session()` adds `id`, `role`, `onboarded` per `lib/auth-helpers.ts` research), this should type-check without changes; if TypeScript complains the session type doesn't include `id`, check how `isDm` already reads `session?.user?.email` two lines above and mirror that same access pattern/type assertion rather than introducing a new one.

- [ ] **Step 4: Update imports**

Add:
```typescript
import { buildSheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';
import CharacterSheetView from '@/components/character/sheet/v2/CharacterSheetView';
```

Remove the now-unused imports listed in Step 1.3 (`HpStrip`, `SheetTabBar`, `InventoryCard`, `AddSpellButton`, `PortraitButton`, `SpellSectionTabs`, `FeatureButton`, `PinnedPassiveSection`, `PinnedActiveResources`, `BackstoryCard`, `LevelUpButton`, `AsiRetroactiveButton`, `AssignPlayerButton`, `ActiveCharacterButton`, `XpControls`) — **but only the ones that are no longer referenced anywhere else in this file**; keep any that are still used inside the `PendingRestBanner`/mobile block you did not touch.

- [ ] **Step 5: Type-check and build**

Run: `npx tsc --noEmit`
Expected: no errors. Fix any leftover reference to a removed import or a deleted local variable before proceeding.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Manual verification in the browser**

Run: `npm run dev`, open `http://localhost:3000/characters/<an existing character id>` as the DM user (matching `NEXT_PUBLIC_DM_EMAIL`).
Expected: sidebar, HP+stats row, conditions row, and 5 tabs render; switching tabs works and persists across a page reload; the DM-only sidebar section (Assegna player) is visible; resizing the window below 768px shows the existing `MobileSheet` unchanged.

- [ ] **Step 7: Commit**

```bash
git add app/characters/\[id\]/page.tsx
git commit -m "feat: wire CharacterSheetView into the DM character page"
```

---

### Task 18: Wire `CharacterSheetView` into `app/my-character/page.tsx` (player view)

**Files:**
- Modify: `app/my-character/page.tsx`

**Interfaces:**
- Consumes: `buildSheetViewModel` (Task 2), `CharacterSheetView` (Task 16).

Unlike `app/characters/[id]/page.tsx`, this page currently has **no** `.desktop-layout`/`.mobile-layout` split — its single existing JSX (lines ~104-331 per research) renders at every width. To keep mobile (<768px) untouched while bringing desktop in line with the new design, this task **adds** a `.desktop-layout` block with `CharacterSheetView` and wraps the **existing, unmodified** JSX in a `.mobile-layout` block as the sub-768px fallback — mirroring the pattern already used in `app/characters/[id]/page.tsx`.

- [ ] **Step 1: Add the `buildSheetViewModel` call**

After the existing line computing `const sheet = char.sheet as CharacterSheet;`, add:

```typescript
const model = buildSheetViewModel(char, sheet, spellSlots);
```

(`spellSlots` is already fetched earlier in this file per the research pass — confirm the exact variable name in the file and use it as-is; do not refetch.)

- [ ] **Step 2: Wrap the existing JSX in a `.mobile-layout` block**

Find the current top-level returned JSX fragment (the header card, HP/AC/Speed grid, abilities, etc.) and wrap it:

```tsx
<div className="mobile-layout">
  {/* ... all existing JSX, unchanged ... */}
</div>
```

- [ ] **Step 3: Add the new `.desktop-layout` block above it**

Immediately before the `.mobile-layout` div, add:

```tsx
<div className="desktop-layout" style={{ minWidth: 1100, padding: '16px 24px 48px' }}>
  {campaign && (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: '11px', color: 'var(--fg-3)', marginBottom: 'var(--s-2)' }}>
      <a href="/my-characters" style={{ color: 'var(--fg-2)' }}>Personaggi</a>
      <span>/</span>
      <span style={{ color: 'var(--fg-1)' }}>{char.name}</span>
    </div>
  )}
  <CharacterSheetView
    character={char}
    sheet={sheet}
    model={model}
    conditions={conditions}
    resources={[]}
    campaign={campaign ? { id: campaign.id, name: campaign.name } : null}
    isActiveCharacter={true}
    currentActiveName={null}
    viewerRole="player"
    currentUserId={user.id}
    isOwner={true}
  />
</div>
```

Use `resources={[]}` only if this page does not already fetch `characterResources` — check the file first; if it does fetch them (needed for the Combat tab's "Capacità" Usa/Illimitato distinction), pass the real array instead of `[]`. If it doesn't fetch them yet, add the query (mirroring `app/characters/[id]/page.tsx`'s `db.select().from(characterResources).where(eq(characterResources.characterId, id))`) so the Combat tab on the player view has real resource data instead of treating every feature as unlimited.

- [ ] **Step 4: Update imports**

Add:
```typescript
import { buildSheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';
import CharacterSheetView from '@/components/character/sheet/v2/CharacterSheetView';
```

If Step 3 added a `characterResources` query, also add the `characterResources` import from `@/lib/db/schema` and `eq` from `drizzle-orm` if not already imported.

- [ ] **Step 5: Type-check and build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Manual verification in the browser**

Run: `npm run dev`, sign in as a player with an active character, open `http://localhost:3000/my-character`.
Expected: at ≥768px, the new sidebar+5-tab layout renders with `viewerRole="player"` (no DM-only sidebar section); at <768px, the page looks exactly as it did before this task (today's single-column layout, unchanged).

- [ ] **Step 7: Commit**

```bash
git add app/my-character/page.tsx
git commit -m "feat: wire CharacterSheetView into the player character page"
```

---

### Task 19: Full manual QA pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full automated suite**

Run: `npm test`
Expected: all tests across all 14 test files pass.

- [ ] **Step 2: Type-check and lint the whole project**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual browser pass — DM view (`/characters/[id]`)**

With `npm run dev` running, as the DM:
- Open a caster character (e.g. a Cleric/Wizard): confirm 5 combat stat cards (C.A./Iniziativa/Velocità/CD Incantesimi/Attacco Incantesimi), Incantesimi tab shows slots + spell list/detail.
- Open a non-caster character (e.g. a pure Fighter/Rogue with no caster class): confirm only 3 combat stat cards, Incantesimi tab shows "Nessun incantesimo disponibile" with no fabricated data.
- Damage/heal/temp HP via `HpStatsRow`: confirm the toast appears and the HP bar/number update without a full page reload.
- Reduce HP to 0: confirm death saves appear inline in the HP card.
- Add a condition via the picker in `ConditionsRow`, then remove it: confirm both actions show a toast and update the badge list.
- Combattimento tab: select an attack, confirm damage/to-hit detail; switch to Capacità, use a limited-resource feature (confirm "Usa" decrements and shows "Illimitato" for features with no resource).
- Incantesimi tab: consume a spell slot, then consume the rest of that level to confirm clicking it again resets it; click global "Reset".
- Inventario tab: equip/unequip an item via the "⋯" popover, confirm AC updates on the HpStatsRow if armor changed; adjust a coin amount; drop an item.
- Narrativa tab: open "Leggi e modifica", edit the backstory, confirm it saves (existing `BackstoryModal` behavior, unchanged).
- Switch tabs, reload the page: confirm the previously active tab is restored.
- Confirm the DM-only sidebar section (Assegna player) is visible and "Note DM" shows when `sheet.dmNotes` is set.
- Resize the browser below 768px: confirm `MobileSheet` renders exactly as before this project (4 tabs: Combattimento, Equipaggiamento, Incantesimi, Bio).

- [ ] **Step 4: Manual browser pass — player view (`/my-character`)**

As a player with an active character:
- Repeat the same checks as Step 3 (HP, conditions, all 5 tabs).
- Confirm the DM-only sidebar section does **not** render.
- Resize below 768px: confirm the page looks exactly as it did before this project (today's single-column layout).

- [ ] **Step 5: Confirm no regressions in `MobileSheet`-dependent flows**

Since `HpControls`, `ConditionBadge`, `AddConditionButton`, `DeathSavesTracker`, `InventoryCard`, `SpellSectionTabs`, `FeatureButton`, `BackstoryCard`, `PinnedActiveResources`, `PinnedPassiveSection` were reused unmodified, open `MobileSheet` (resize <768px) on both routes and confirm all 4 existing mobile tabs still work exactly as before (this is a regression check, not new functionality).

This task has no commit — it's the final verification gate before considering the feature done.

---

## Self-Review

**Spec coverage:** Sidebar (Task 6-7), HP+combat stats row with caster-aware card count (Task 8), conditions row with picker reuse (Task 9), 5-tab nav with persistence (Task 10), Caratteristiche (11), Combattimento with Usa button (12), Incantesimi with slot consume/reset (13), Inventario with coins + popover equip menu (14), Narrativa via existing BackstoryCard (15), toast system (4), shared container + DM/player role gating (16), wiring into both routes while preserving mobile (17-18), manual QA (19). All spec sections have a corresponding task.

**Placeholder scan:** No "TBD"/"TODO" left in any step; every code block is complete, runnable code referencing real exported names confirmed during research (`applyDamage`, `applyHealing`, `setTempHp`, `shortRest`, `longRest`, `addCondition`, `removeCondition`, `useSpellSlot`, `restoreSpellSlot`, `equipInventoryItem`, `saveInventory`, `useClassResource`, `buildSheetViewModel`).

**Type consistency:** `SheetViewModel` fields (`prof`, `stats`, `savingThrows`, `skillMap`, `hpPct`, `hpColor`, `passPerc`, `spellDC`, `spellAtk`, `carriedKg`, `carryMax`, `carryPct`, `carryOverloaded`, `nextXp`, `xpPct`, `canLevelUp`, `classLabel`, `hitDie`, `casterClassKeys`, `canCast`, `pinnedAll`, `pinnedPassive`, `pinnedActive`, `classesWithSubclass`, `activeSpellSlots`, `knownSpells`) defined in Task 2 are consumed with the same names in Tasks 6, 8, 11, 12, 13, 16 — verified consistent. `SheetTabId` defined in Task 10 (`'stats' | 'combat' | 'spells' | 'inventory' | 'narrative'`) matches the tab keys switched on in Task 16.

**Scope check:** Single cohesive feature (one shared component tree, two call sites) — not decomposed further, consistent with the "single shared sheet component" decision made during brainstorming.

