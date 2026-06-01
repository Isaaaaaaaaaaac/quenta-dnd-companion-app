# Quenta — Design System

> Dark-mode-only design system for **Quenta**, a D&D 5e Dungeon Master companion app.
> Italian-language UI, dark-fantasy tone, anchored to the Player's Handbook visual vocabulary
> reinterpreted as a **cool-neutral editorial** system: cool slate surfaces, sepia-ochre
> illuminated-ink accents, parchment text, blood-deep semantic reds.
>
> **Target stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 (`@theme inline`) · Radix UI primitives.
> Reference this file from `CLAUDE.md`.

---

## 0. Non-negotiable rules

These constraints are structural. Violating them breaks the brand.

1. **Dark mode only.** No light theme. Surfaces are cool-neutral near-black with a slight `B > G > R` lean.
2. **Two type families, three roles.** Source Serif 4 covers Display (heavy, mixed-case) **and** Narrative/Numerals (≥24px). Public Sans covers all functional UI.
3. **Numerals split by size.** `≥24px` → Source Serif 4 with lining + tabular figures. `<24px` inline → Public Sans tabular. Modifier `+5`, HP `32`, CA `18` are serif; inline `1d4+1`, `+3`, `9m` are sans.
4. **Eyebrows are sans, uppercase, tracked.** `FORZA`, `SLOT LV 1`, `BONUS COMP.` → Public Sans 10px/600, `0.14em` tracking. **Never** the serif/display role; **never** all-caps the display role.
5. **8px grid, no exceptions.** Only `8 · 16 · 24 · 32 · 40 · 48 · 56 · 64 · 80 · 96 · 120`. No 6, 10, 12.
6. **Two radii only.** `8px` (controls) and `12px` (cards/overlays). Never pill, never 0, never >12.
7. **"Gold" is editorial sepia ink, not metallic.** `#BC8E4F` reads as pigment on aged paper. The CSS var is named `--gold` for backward-compat; the *role* is ink.
8. **No emoji, no gradients, no glassmorphism, no glow.** Warmth comes from the sepia accent + parchment text, never from light effects.
9. **Italian copy.** All product strings, labels, section titles in Italian.

---

## 1. Design Tokens

### 1.1 Color — Surfaces (4-level depth)

Cool-neutral near-black stack. Each step is the next elevation level.

| Token | HEX | HSL | Role |
|---|---|---|---|
| `--bg-deep` | `#111316` | `hsl(216 12% 7%)` | Page background, deepest |
| `--bg-card` | `#17191D` | `hsl(220 11% 10%)` | Card / panel surface |
| `--bg-inner` | `#1D2025` | `hsl(220 12% 13%)` | Inner surface — inputs, stat boxes inside cards |
| `--bg-elevated` | `#262A31` | `hsl(218 13% 17%)` | Hover / popover / focused elevation |

### 1.2 Color — Text (parchment / sepia ink)

Never pure white.

| Token | HEX | HSL | Role |
|---|---|---|---|
| `--fg-1` | `#DCC795` | `hsl(43 53% 73%)` | Primary text — aged parchment |
| `--fg-2` | `#9E8868` | `hsl(38 24% 51%)` | Secondary / muted, body de-emphasis |
| `--fg-3` | `#5E5240` | `hsl(40 20% 31%)` | Tertiary — ghost text, hints, disabled |

### 1.3 Color — Accent (sepia ochre ink)

| Token | HEX | HSL | Role |
|---|---|---|---|
| `--gold` | `#BC8E4F` | `hsl(36 43% 52%)` | Primary accent — section titles, icons, highlights, primary CTA |
| `--gold-dim` | `#7E5C2E` | `hsl(34 47% 34%)` | De-emphasised accent / support |
| `--gold-soft` | `rgba(188,142,79,0.14)` | — | Accent tint for highlight fills (badge bg, active rows) |

### 1.4 Color — Borders

| Token | HEX | HSL | Role |
|---|---|---|---|
| `--border-leather` | `#3A4048` | `hsl(214 11% 25%)` | **Signature card edge** (var name historical; metaphor is cool slate) |
| `--border-leather-dim` | `#262B33` | `hsl(218 15% 17%)` | Secondary edge, less prominent |
| `--border-neutral` | `#2C3038` | `hsl(218 13% 20%)` | Inner separators, input borders |
| `--border-neutral-dim` | `#1C2026` | `hsl(218 16% 13%)` | Very quiet divider |

### 1.5 Color — Semantic (PHB-anchored)

Each token has a `fg` (text/icon/border), an optional `strong` (stronger fill), and a `bg` (very-dark tinted fill that reads as shadow, not a color panel).

| Concept | `fg` | `strong` | `bg` | Meaning |
|---|---|---|---|---|
| **Danger** | `--danger #A8331C` | `--danger-strong #8B2010` | `--danger-bg #2A0F08` | Damage, enemies, destructive CTA |
| **Success** | `--success #6B8E3D` | `--success-strong #4A6B2A` | `--success-bg #15200E` | Healing, full HP, positive |
| **Warning** | `--warning #C9701F` | `--warning-strong #A85814` | `--warning-bg #2A1608` | Conditions, alerts (ember) |
| **Arcane** | `--arcane #8A5CC4` | `--arcane-strong #6B3FA0` | `--arcane-bg #1E1530` | Magic, spell slots |
| **Info** | `--info #6B9AC4` | `--info-strong #4A7AAA` | `--info-bg #0F1A28` | Reactions, spectral, neutral info |

### 1.6 Color — HP bar (3 states by % remaining)

| Token | HEX | Threshold |
|---|---|---|
| `--hp-healthy` | `#6B8E3D` | `> 50%` |
| `--hp-wounded` | `#C9701F` | `25–50%` |
| `--hp-critical` | `#B82A18` | `< 25%` |
| `--hp-track` | `#1D2025` | Empty portion of bar |

### 1.7 Typography — families

```
--font-display: 'Source Serif 4', 'Bookmania', Georgia, serif;   /* = --font-serif */
--font-serif:   'Source Serif 4', 'Bookmania', Georgia, serif;
--font-sans:    'Public Sans', 'Scala Sans', system-ui, sans-serif;
/* Backward-compat aliases */
--font-body:  var(--font-serif);
--font-label: var(--font-sans);
```

Load via `next/font/google` (see §4.2). Source Serif 4 is an optical-size variable font — request weights 400/500/600/700/800/900 + italics 400/500. Public Sans needs 400/500/600/700 + italic 400.

### 1.8 Typography — scale

| Role | Family | Size | Weight | Line-height | Tracking | Notes |
|---|---|---|---|---|---|---|
| `display-hero` | serif | 52px | 800 | 1.08 | 0.005em | Hero/character name. **Mixed case.** Max 2–3/screen, never <16px |
| `display-section` | serif | 24px | 700 | 1.2 | 0.01em | Section dividers, in `--gold`. Mixed case |
| `h1` | serif | 32px | 600 | 1.2 | — | |
| `h2` | serif | 26px | 600 | 1.25 | — | |
| `h3` | serif | 20px | 600 | 1.3 | — | |
| `serif-body` | serif | 16px | 400 | 1.55 | — | Narrative / read-mode prose |
| `flavor` | serif *italic* | 15px | 400 | 1.5 | — | In-character quotes, `--fg-2` |
| `stat-xl` | serif | 48px | 600 | 1 | — | Big modifier `+5`, big HP. `lnum`+`tnum` |
| `stat-lg` | serif | 32px | 600 | 1 | — | HP `32`, CA `18`. `lnum`+`tnum` |
| `stat-md` | serif | 24px | 600 | 1 | — | Stat-block values. `lnum`+`tnum` |
| `ui-body` | sans | 14px | 400 | 1.45 | — | Default UI text |
| `ui-button` | sans | 14px | 600 | 1 | 0.01em | Button label |
| `ui-label` | sans | 12px | 500 | 1.4 | — | Field labels, `--fg-2` |
| `ui-caption` | sans | 12px | 400 | 1.4 | — | Captions, `--fg-3` |
| `ui-small` | sans | 11px | 500 | 1.4 | — | Tooltips, meta |
| `eyebrow` | sans | 10px | 600 | 1.2 | 0.14em | **UPPERCASE.** Stat/section labels |
| `stat-inline` | sans | 13px | 600 | — | — | Inline dice/mods `1d8+4`, `+7`. `tnum`+`lnum` |

### 1.9 Spacing — 8px grid (11 steps)

| Token | px | Token | px |
|---|---|---|---|
| `--s-1` | 8 | `--s-7` | 56 |
| `--s-2` | 16 | `--s-8` | 64 |
| `--s-3` | 24 | `--s-9` | 80 |
| `--s-4` | 32 | `--s-10` | 96 |
| `--s-5` | 40 | `--s-11` | 120 |
| `--s-6` | 48 | | |

**Button heights:** `--btn-compact 32px` · `--btn-default 40px` · `--btn-touch 44px` (mobile min hit-target).

### 1.10 Radius

| Token | px | Applies to |
|---|---|---|
| `--r-sm` | 8 | Buttons, badges, inputs, stat boxes, tabs |
| `--r-lg` | 12 | Cards, modals, popovers, dialogs |

### 1.11 Shadows

| Token | Value | Use |
|---|---|---|
| `--shadow-card` | `0 2px 4px rgba(0,0,0,.5), 0 6px 18px rgba(0,0,0,.55)` | Resting cards |
| `--shadow-elevated` | `0 4px 8px rgba(0,0,0,.6), 0 12px 32px rgba(0,0,0,.7), 0 0 0 1px rgba(0,0,0,.4)` | Popovers, modals, dropdowns |
| `--shadow-inset` | `inset 0 1px 0 rgba(220,199,149,.05)` | Top-edge gleam, pair with `--shadow-card` on cards |

### 1.12 Transitions

All interaction transitions are short — Quenta is operated live at the table, nothing should feel slow.

```
--transition-fast: 120ms ease;   /* hover, press, color swaps */
--transition-bar:  200ms ease;   /* HP bar width, progress */
```

- **Hover:** surface steps up one level (`--bg-card → --bg-elevated`); border swaps `--border-leather → --gold-dim`. No scale change, no pulse.
- **Press:** primary darkens its fill; secondary stays on the hovered state (no shrink).
- **Focus:** 2px `--gold` outline, 2px offset. Keyboard-first, never invisible.

---

## 2. Tailwind v4 setup

`app/globals.css` — paste the full `:root` token block from `colors_and_type.css`, then expose tokens to utilities:

```css
@import "tailwindcss";

/* ...full :root { --bg-deep: …; … } block from colors_and_type.css… */

@theme inline {
  --font-display: var(--font-display);
  --font-serif:   var(--font-serif);
  --font-sans:    var(--font-sans);

  --color-bg-deep:     var(--bg-deep);
  --color-bg-card:     var(--bg-card);
  --color-bg-inner:    var(--bg-inner);
  --color-bg-elevated: var(--bg-elevated);

  --color-fg-1: var(--fg-1);
  --color-fg-2: var(--fg-2);
  --color-fg-3: var(--fg-3);

  --color-gold:     var(--gold);
  --color-gold-dim: var(--gold-dim);

  --color-leather:     var(--border-leather);
  --color-leather-dim: var(--border-leather-dim);
  --color-neutral-edge:var(--border-neutral);

  --color-danger:  var(--danger);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-arcane:  var(--arcane);
  --color-info:    var(--info);

  --color-hp-healthy:  var(--hp-healthy);
  --color-hp-wounded:  var(--hp-wounded);
  --color-hp-critical: var(--hp-critical);

  --radius-sm: var(--r-sm);
  --radius-lg: var(--r-lg);

  --spacing-1: var(--s-1);  --spacing-2: var(--s-2);  --spacing-3: var(--s-3);
  --spacing-4: var(--s-4);  --spacing-5: var(--s-5);  --spacing-6: var(--s-6);
  --spacing-7: var(--s-7);  --spacing-8: var(--s-8);  --spacing-9: var(--s-9);
  --spacing-10: var(--s-10); --spacing-11: var(--s-11);

  --shadow-card:     var(--shadow-card);
  --shadow-elevated: var(--shadow-elevated);
}
```

This yields utilities like `bg-bg-card`, `text-fg-1`, `text-gold`, `border-leather`, `rounded-lg` (→12px), `rounded-sm` (→8px), `p-3` (→24px), `shadow-card`, `font-serif`, `font-sans`.

A tiny set of component utilities is worth defining once, since they recur everywhere:

```css
@layer components {
  .eyebrow {
    font-family: var(--font-sans); font-size: 10px; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-2);
    line-height: 1.2;
  }
  .stat-num { font-family: var(--font-serif); font-feature-settings: 'lnum' 1, 'tnum' 1; line-height: 1; }
  .stat-inline { font-family: var(--font-sans); font-weight: 600; font-feature-settings: 'tnum' 1, 'lnum' 1; }
}
```

---

## 3. Components

All examples are TSX for the target stack. Radix primitives are used for behavior (focus, portals, ARIA); the visual layer is Quenta tokens. Assume `cn()` is the standard `clsx + tailwind-merge` helper.

### 3.1 Button

The primary CTA color is **still open** — the design review surfaced three candidates (sepia fill, slate-fill + sepia border, parchment-fill inverted). The example below ships the **sepia-fill** default; swap `primary` styles when the call is made.

**Variants:** `primary` · `secondary` · `ghost` · `danger`
**Sizes:** `compact` (32px) · `default` (40px) · `touch` (44px)

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm font-sans font-semibold tracking-[0.01em] " +
  "border border-transparent transition-[background,border-color,color] duration-[120ms] ease-out " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:   "bg-gold text-bg-deep hover:bg-[#D6A364] active:bg-[#A8803F]",
        secondary: "bg-transparent text-fg-1 border-leather hover:bg-bg-elevated hover:border-gold-dim",
        ghost:     "bg-transparent text-fg-2 hover:text-fg-1 hover:bg-bg-elevated",
        danger:    "bg-[var(--danger-strong)] text-fg-1 hover:bg-[var(--danger)]",
      },
      size: {
        compact: "h-8 px-3 text-[13px]",
        default: "h-10 px-4 text-sm",
        touch:   "h-11 px-5 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
```

```tsx
<Button>Lancia incantesimo</Button>
<Button variant="secondary">Annulla</Button>
<Button variant="ghost" size="compact">Modifica</Button>
<Button variant="danger" size="compact">Elimina</Button>
```

### 3.2 Badge

Small status token. Semantic variants use `fg` text + `bg` fill + a tinted border.

**Variants:** `gold` · `danger` · `success` · `warning` · `arcane` · `info`

```tsx
const badge = cva(
  "inline-flex items-center h-[22px] px-2 rounded-sm font-sans text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap border",
  {
    variants: {
      variant: {
        gold:    "text-gold bg-[var(--gold-soft)] border-gold-dim",
        danger:  "text-danger bg-[var(--danger-bg)] border-[color-mix(in_oklab,var(--danger)_35%,transparent)]",
        success: "text-success bg-[var(--success-bg)] border-[color-mix(in_oklab,var(--success)_40%,transparent)]",
        warning: "text-warning bg-[var(--warning-bg)] border-[color-mix(in_oklab,var(--warning)_35%,transparent)]",
        arcane:  "text-arcane bg-[var(--arcane-bg)] border-[color-mix(in_oklab,var(--arcane)_35%,transparent)]",
        info:    "text-info bg-[var(--info-bg)] border-[color-mix(in_oklab,var(--info)_35%,transparent)]",
      },
    },
    defaultVariants: { variant: "gold" },
  }
);

export function Badge({ variant, className, ...props }:
  React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ variant }), className)} {...props} />;
}
```

```tsx
<Badge variant="gold">FORZA</Badge>
<Badge variant="arcane">SLOT LV 3</Badge>
<Badge variant="warning">Stordito</Badge>
<Badge variant="danger">d8×6 danno</Badge>
```

### 3.3 Card

The system's most-used surface and where the brand lives: `--bg-card`, 1px `--border-leather` edge, `--r-lg` (12px), `--shadow-card` + `--shadow-inset`.

```tsx
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-bg-card border border-leather rounded-lg p-6",
        "shadow-[var(--shadow-card),var(--shadow-inset)]",
        className
      )}
      {...props}
    />
  );
}

/* Inner surface used inside a Card (stat box, input wells) */
export function CardInner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-bg-inner border border-neutral-edge rounded-sm p-4", className)} {...props} />;
}
```

### 3.4 StatBox

Ability-score block: eyebrow label, large serif modifier, small sans raw score.

```tsx
interface StatBoxProps { label: string; mod: number; score: number; }

export function StatBox({ label, mod, score }: StatBoxProps) {
  return (
    <div className="bg-bg-inner border border-neutral-edge rounded-sm px-1.5 py-2.5 text-center">
      <div className="eyebrow text-gold">{label}</div>
      <span className="stat-num block text-2xl font-semibold text-fg-1 my-1.5">
        {mod >= 0 ? `+${mod}` : mod}
      </span>
      <div className="stat-inline text-[11px] text-fg-2">{score}</div>
    </div>
  );
}
```

```tsx
<div className="grid grid-cols-6 gap-1.5">
  <StatBox label="FOR" mod={1} score={12} />
  <StatBox label="SAG" mod={5} score={20} />
  {/* … */}
</div>
```

### 3.5 HPBar

Three-state health bar. State derives from `%` remaining; never pass color directly.

```tsx
function hpState(hp: number, max: number) {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  const state = pct > 50 ? "healthy" : pct >= 25 ? "wounded" : "critical";
  return { pct, state } as const;
}

const HP_FILL = {
  healthy:  "bg-hp-healthy",
  wounded:  "bg-hp-wounded",
  critical: "bg-hp-critical",
} as const;

export function HPBar({ hp, max }: { hp: number; max: number }) {
  const { pct, state } = hpState(hp, max);
  return (
    <div className="relative h-2 rounded-[2px] overflow-hidden border border-neutral-edge bg-[var(--hp-track)]">
      <div
        className={cn("absolute inset-y-0 left-0 rounded-[2px] transition-[width] duration-200 ease-out", HP_FILL[state])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

### 3.6 Eyebrow + Display + Stat text

Typographic primitives — thin wrappers that enforce the role rules so they can't drift.

```tsx
export const Eyebrow = ({ className, ...p }: React.HTMLAttributes<HTMLSpanElement>) =>
  <span className={cn("eyebrow", className)} {...p} />;

export const DisplayHero = ({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) =>
  <h1 className={cn("font-serif text-[52px] font-extrabold leading-[1.08] tracking-[0.005em] text-fg-1", className)} {...p} />;

export const SectionTitle = ({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) =>
  <h2 className={cn("font-serif text-2xl font-bold leading-tight tracking-[0.01em] text-gold", className)} {...p} />;

/* Big numeral — choose size by role; always serif + lining/tabular */
export const Stat = ({ size = "lg", className, ...p }:
  { size?: "md" | "lg" | "xl" } & React.HTMLAttributes<HTMLSpanElement>) =>
  <span className={cn("stat-num font-semibold text-fg-1",
    size === "xl" && "text-5xl", size === "lg" && "text-[32px]", size === "md" && "text-2xl", className)} {...p} />;
```

### 3.7 Radix-backed: Dialog

Use Radix primitives for behavior; skin with tokens. Same pattern applies to `Popover`, `Tabs`, `Tooltip`, `DropdownMenu`, `Progress`.

```tsx
import * as Dialog from "@radix-ui/react-dialog";

export function Modal({ trigger, title, children }:
  { trigger: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/65 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,560px)]",
            "bg-bg-card border border-leather rounded-lg p-6 shadow-[var(--shadow-elevated)]",
            "focus:outline-none"
          )}
        >
          <Dialog.Title className="font-serif text-2xl font-bold tracking-[0.01em] text-gold">{title}</Dialog.Title>
          <div className="mt-4 font-sans text-sm text-fg-1">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

> **Radix mapping cheatsheet** — overlay: `bg-black/65`. Floating surface: `bg-bg-card border-leather rounded-lg shadow-elevated`. Hovered item inside a menu: `bg-bg-elevated text-fg-1`. Active tab underline / progress fill: `--gold`. Focus ring everywhere: `outline-2 outline-offset-2 outline-gold`.

### 3.8 AppShell (layout)

Three-column live-session layout: nav sidebar (224px) · main · action log (320px, collapses < 1280px).

```tsx
export function AppShell({ sidebar, log, children }: {
  sidebar: React.ReactNode; log: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-bg-deep text-fg-1
                    grid-cols-[200px_1fr] xl:grid-cols-[224px_1fr_320px]">
      <nav className="bg-bg-card border-r border-leather p-4 flex flex-col gap-1">{sidebar}</nav>
      <main className="p-8 flex flex-col gap-6 overflow-y-auto">{children}</main>
      <aside className="hidden xl:flex flex-col bg-bg-card border-l border-leather p-4">{log}</aside>
    </div>
  );
}
```

---

## 4. Usage guidelines

### 4.1 Component selection

- **Card vs CardInner.** A `Card` is a top-level panel on `--bg-deep`. A `CardInner` is a nested well *inside* a Card (stat boxes, input groups, meters). Never nest Card-in-Card — go one elevation step with CardInner.
- **Button variants.** `primary` = one per view, the main action (Tira d'iniziativa, Lancia). `secondary` = supporting actions. `ghost` = low-stakes inline (Modifica, Pulisci). `danger` = destructive only (Elimina, Uccidi).
- **Badge vs semantic text.** Badge = a discrete status pill (condition, slot count). For inline emphasis inside a sentence, color the text token directly, don't wrap in a badge.
- **HP color is computed, never literal.** Always derive from `%` via `hpState()`. Don't let a caller pass `critical` for a full-HP combatant.

### 4.2 Fonts in Next.js

```ts
// app/fonts.ts
import { Source_Serif_4, Public_Sans } from "next/font/google";

export const serif = Source_Serif_4({
  subsets: ["latin"], display: "swap",
  weight: ["400","500","600","700","800","900"],
  style: ["normal","italic"], variable: "--font-source-serif",
});
export const sans = Public_Sans({
  subsets: ["latin"], display: "swap",
  weight: ["400","500","600","700"],
  style: ["normal","italic"], variable: "--font-public-sans",
});
```
Then in `:root`, point `--font-serif`/`--font-display` → `var(--font-source-serif)` and `--font-sans` → `var(--font-public-sans)`, and apply both variable classes on `<html>`.

### 4.3 Visual hierarchy & composition

1. **One display element per view** anchors the eye (character name / screen title). Two max. Never three.
2. **Section titles in `--gold`** (`SectionTitle`) open each block; body returns to `--fg-1`.
3. **Eyebrows label, they don't headline.** An eyebrow always sits *above* the value it describes (`FORZA` over `+5`), tight spacing between them (`--s-1` or less).
4. **Numerals carry the data weight.** In any stat-dense view, the serif numerals are the visual focus; surrounding sans labels recede in `--fg-2`/`--fg-3`.
5. **Borders define regions, shadows define elevation.** Use a leather border to separate adjacent surfaces at the same depth; reserve shadow for things that float (popovers, dragged cards).
6. **Spacing rhythm:** `--s-2` (16) inside compact components, `--s-3` (24) card padding, `--s-4`+ (32+) between major sections. Stay on the grid.

### 4.4 Patterns to avoid

- ❌ All-caps on the display/serif role. Caps belong to **eyebrows only**.
- ❌ Cinzel or any second display face — the system is deliberately one serif family.
- ❌ Serif for small inline numerals (`+3`, `1d4`) — those are sans/tabular. Serif numerals start at 24px.
- ❌ Off-grid spacing (`p-2.5`, `gap-[10px]`), arbitrary radii, pill shapes.
- ❌ Metallic-gold gradients, glow, neon, backdrop-blur, glassmorphism.
- ❌ Pure white (`#fff`) or pure black (`#000`) text/surfaces.
- ❌ Long/eased animations (>200ms). The app runs live; motion must be near-instant.
- ❌ Card-in-card nesting; use CardInner one elevation down instead.
- ❌ Emoji as iconography. Use the icon set (Lucide-style stroke, 1.5–2px) on `--gold`/`--fg-1`.

### 4.5 Accessibility

- **Focus visibility** is mandatory: `outline-2 outline-offset-2 outline-gold` on every interactive element. Don't remove it; Radix focus management depends on it.
- **Contrast.** `--fg-1` on `--bg-deep` ≈ 9:1 (AAA body). `--gold` on `--bg-deep` ≈ 5.6:1 (AA for ≥normal text and UI). Avoid `--fg-3` for anything users must read — it's for decorative ghost text only.
- **HP state is not color-only.** Always pair the bar color with a numeric `hp/max` and/or a state badge (`FERITO`, `CRITICO`) so the state survives color-blindness and projector washout.
- **Touch targets** ≥ 44px on touch surfaces (`size="touch"`). The 32px compact button is desktop/pointer-only.
- **Hit `prefers-reduced-motion`:** drop the HP-bar width transition and any Radix open/close animation to instant.
- **Semantic color is never the only signal** — pair with an icon, label, or position.

---

## 5. Reference files

| File | What it is |
|---|---|
| `colors_and_type.css` | Source of truth — every CSS custom property + element defaults + the `@theme inline` block (commented at the bottom). |
| `specimen.html` | Visual specimen of all type + color in use with real strings. |
| `preview/*.html` | Per-token review cards (type, color, spacing, radius, shadow, buttons, badges). |
| `ui_kits/quenta-app/` | Reference implementation: `AppShell`, `CombatTracker`, `CharacterDetail` (JSX). Visual templates — re-implement against real data in the target stack. |
| `README.md` | Brand context, content/tone rules, full visual-foundations narrative. |

---

## 6. Open decisions (flag before locking)

- **Primary button color** — sepia fill (current) vs slate-fill+sepia-border vs parchment-fill inverted. Awaiting product call; update §3.1 when decided.
- **No logo / wordmark** — `Quenta` is set as literal Source Serif 4 text. Replace with real mark when available.
- **Icons** — Lucide (or Lucide-weight custom SVG for D&D glyphs) is the documented default, not a delivered asset. Confirm or replace.
- **Font substitutions** — Source Serif 4 stands in for Bookmania; Public Sans for Scala Sans. Both are deliberate screen-first choices; swap if licensed originals are preferred.
