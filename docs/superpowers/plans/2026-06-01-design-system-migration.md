# Design System Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrare tutta la codebase Quenta dal Design System v2 (warm-brown) al nuovo sistema cool-slate definito in `DESIGN_SYSTEM.md`, layer per layer, con clean break su ogni layer.

**Architecture:** 4 layer sequenziali — Colori → Font → Spacing → Radius+Utility. Ogni layer finisce con un commit prima di iniziare il successivo. Nessun alias temporaneo: il vecchio token sparisce e il nuovo lo sostituisce ovunque nello stesso layer.

**Tech Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS v4 (`@theme inline`) · CSS custom properties via `:root`

---

## Layer 1 — Colori

### Task 1: Riscrittura `:root` e `@theme inline` in globals.css (token di colore)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Sostituisci il blocco `:root` completo**

Apri `app/globals.css`. Sostituisci tutto il blocco `:root { … }` con:

```css
:root {
  /* ── Backgrounds (cool-slate) ── */
  --bg-deep:     #111316;
  --bg-card:     #17191D;
  --bg-inner:    #1D2025;
  --bg-elevated: #262A31;

  /* ── Text (parchment) ── */
  --fg-1: #DCC795;
  --fg-2: #9E8868;
  --fg-3: #5E5240;

  /* ── Accent (sepia ink) ── */
  --gold:      #BC8E4F;
  --gold-dim:  #7E5C2E;
  --gold-soft: rgba(188,142,79,0.14);

  /* ── Borders ── */
  --border-leather:     #3A4048;
  --border-leather-dim: #262B33;
  --border-neutral:     #2C3038;
  --border-neutral-dim: #1C2026;

  /* ── Semantic — Danger ── */
  --danger:        #A8331C;
  --danger-strong: #8B2010;
  --danger-bg:     #2A0F08;

  /* ── Semantic — Success ── */
  --success:        #6B8E3D;
  --success-strong: #4A6B2A;
  --success-bg:     #15200E;

  /* ── Semantic — Warning ── */
  --warning:        #C9701F;
  --warning-strong: #A85814;
  --warning-bg:     #2A1608;

  /* ── Semantic — Arcane ── */
  --arcane:        #8A5CC4;
  --arcane-strong: #6B3FA0;
  --arcane-bg:     #1E1530;

  /* ── Semantic — Info ── */
  --info:        #6B9AC4;
  --info-strong: #4A7AAA;
  --info-bg:     #0F1A28;

  /* ── HP states ── */
  --hp-healthy:  #6B8E3D;
  --hp-wounded:  #C9701F;
  --hp-critical: #B82A18;
  --hp-track:    #1D2025;

  /* ── Font (invariati — aggiornati in Layer 2) ── */
  --font-serif:   'Lora', Georgia, serif;
  --font-sans:    'Work Sans', system-ui, sans-serif;
  --font-display: var(--font-serif);
  --font-body:    var(--font-sans);
  --font-label:   var(--font-sans);

  /* ── Radius (invariati — aggiornati in Layer 4) ── */
  --r:  5px;
  --r2: 9px;

  /* ── Spacing (invariato — aggiornato in Layer 3) ── */
  --sp-1: 8px;
  --sp-2: 16px;
  --sp-3: 24px;
  --sp-4: 32px;
  --sp-6: 48px;

  /* ── Shadows ── */
  --shadow-card:     0 2px 4px rgba(0,0,0,.5), 0 6px 18px rgba(0,0,0,.55);
  --shadow-elevated: 0 4px 8px rgba(0,0,0,.6), 0 12px 32px rgba(0,0,0,.7), 0 0 0 1px rgba(0,0,0,.4);
  --shadow-inset:    inset 0 1px 0 rgba(220,199,149,.05);

  /* ── Transitions ── */
  --transition-fast: 120ms ease;
  --transition-bar:  200ms ease;
}
```

- [ ] **Step 2: Sostituisci il blocco `@theme inline`**

Nel file `app/globals.css`, sostituisci tutto il blocco `@theme inline { … }` con:

```css
@theme inline {
  /* Font */
  --font-serif:   var(--font-serif);
  --font-sans:    var(--font-sans);
  --font-display: var(--font-display);
  --font-body:    var(--font-body);
  --font-label:   var(--font-label);

  /* Backgrounds */
  --color-bg-deep:     var(--bg-deep);
  --color-bg-card:     var(--bg-card);
  --color-bg-inner:    var(--bg-inner);
  --color-bg-elevated: var(--bg-elevated);

  /* Text */
  --color-fg-1: var(--fg-1);
  --color-fg-2: var(--fg-2);
  --color-fg-3: var(--fg-3);

  /* Accent */
  --color-gold:     var(--gold);
  --color-gold-dim: var(--gold-dim);

  /* Borders */
  --color-leather:      var(--border-leather);
  --color-leather-dim:  var(--border-leather-dim);
  --color-neutral-edge: var(--border-neutral);

  /* Semantic */
  --color-danger:  var(--danger);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-arcane:  var(--arcane);
  --color-info:    var(--info);

  /* HP */
  --color-hp-healthy:  var(--hp-healthy);
  --color-hp-wounded:  var(--hp-wounded);
  --color-hp-critical: var(--hp-critical);

  /* Radius (aggiornati in Layer 4) */
  --radius-sm: var(--r);
  --radius-md: var(--r2);

  /* Spacing (aggiornati in Layer 3) */
  --spacing-1: var(--sp-1);
  --spacing-2: var(--sp-2);
  --spacing-3: var(--sp-3);
  --spacing-4: var(--sp-4);
  --spacing-6: var(--sp-6);

  /* Shadows */
  --shadow-card:     var(--shadow-card);
  --shadow-elevated: var(--shadow-elevated);
}
```

- [ ] **Step 3: Aggiorna `html, body` in globals.css**

Trova il blocco `html, body { … }` e aggiorna i colori:

```css
html, body {
  height: 100%;
  background-color: var(--bg-deep);
  color: var(--fg-1);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
}
```

- [ ] **Step 4: Aggiorna heading colors in globals.css**

```css
h1 {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.02em;
  line-height: 1.15;
}

h2 {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.02em;
  line-height: 1.2;
}

h3 {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--fg-1);
  letter-spacing: 0.01em;
}

h4 {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  color: var(--fg-1);
  letter-spacing: 0.02em;
}

h5 {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--fg-1);
  letter-spacing: 0.02em;
}

h6 {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fg-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

- [ ] **Step 5: Aggiorna input, textarea, select, button globali**

```css
input, textarea, select {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  background-color: var(--bg-inner);
  border: 1px solid var(--border-neutral);
  color: var(--fg-1);
  border-radius: var(--r);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  appearance: none;
}

input:focus, textarea:focus, select:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 1px rgba(188,142,79,0.2);
}

input::placeholder, textarea::placeholder {
  color: var(--fg-3);
  font-style: italic;
}

input:disabled, textarea:disabled, select:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

button {
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--r);
  transition: all var(--transition-fast);
  background: transparent;
  border: 1px solid transparent;
}
```

- [ ] **Step 6: Aggiorna scrollbar colors**

```css
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg-deep); }
::-webkit-scrollbar-thumb { background: var(--border-leather); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: var(--gold); }
```

---

### Task 2: Aggiorna le utility class in `globals.css` (colori nelle classi)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Sostituisci il blocco `@layer components` completo**

Sostituisci tutto il blocco `@layer components { … }` con:

```css
@layer components {

  /* ── Divider ── */
  .divider {
    display: flex;
    align-items: center;
    gap: var(--sp-1);
    color: var(--fg-3);
  }
  .divider::before, .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-leather);
  }
  .divider span {
    font-family: var(--font-sans);
    font-size: 11px;
    font-style: italic;
    letter-spacing: 0.15em;
    opacity: 0.5;
  }

  /* ── Label / eyebrow ── */
  .label {
    font-family: var(--font-sans);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fg-3);
  }

  .eyebrow {
    font-family: var(--font-sans);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--fg-2);
    line-height: 1.2;
  }

  .label-eyebrow {
    font-family: var(--font-sans);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gold);
    line-height: 1.2;
  }

  /* ── Flavor text ── */
  .text-flavor {
    font-family: var(--font-serif);
    font-style: italic;
    font-weight: 400;
    color: var(--fg-2);
    line-height: 1.65;
    font-size: 1rem;
  }

  /* ── Stat value ── */
  .stat-value {
    font-family: var(--font-serif);
    font-weight: 700;
    line-height: 1;
    color: var(--gold);
    font-feature-settings: 'lnum' 1, 'tnum' 1;
  }
  .stat-num {
    font-family: var(--font-serif);
    font-feature-settings: 'lnum' 1, 'tnum' 1;
    line-height: 1;
  }
  .stat-inline {
    font-family: var(--font-sans);
    font-weight: 600;
    font-feature-settings: 'tnum' 1, 'lnum' 1;
  }

  /* ── Buttons ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0 var(--sp-3);
    height: 40px;
    border: 1px solid;
    cursor: pointer;
    transition: all var(--transition-fast);
    text-decoration: none;
    border-radius: var(--r);
    background: transparent;
  }

  .btn-primary {
    background: var(--gold);
    border-color: var(--gold);
    color: var(--bg-deep);
  }
  .btn-primary:hover {
    background: #D6A364;
    border-color: #D6A364;
  }

  .btn-secondary {
    background: transparent;
    border-color: var(--border-leather);
    color: var(--fg-1);
  }
  .btn-secondary:hover {
    background: var(--bg-elevated);
    border-color: var(--gold-dim);
  }

  .btn-ghost {
    background: transparent;
    border-color: var(--border-leather);
    color: var(--fg-2);
  }
  .btn-ghost:hover {
    color: var(--fg-1);
    background: var(--bg-elevated);
  }

  .btn-danger {
    background: var(--danger-strong);
    border-color: var(--danger-strong);
    color: var(--fg-1);
  }
  .btn-danger:hover {
    background: var(--danger);
    border-color: var(--danger);
  }

  .btn-arcane {
    background: transparent;
    border-color: var(--arcane);
    color: var(--arcane);
  }
  .btn-arcane:hover {
    background: var(--arcane-bg);
  }

  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* ── Form inputs ── */
  .field-label {
    font-family: var(--font-sans);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fg-3);
    display: block;
    margin-bottom: var(--sp-1);
  }

  .field-input {
    width: 100%;
    background: var(--bg-inner);
    border: 1px solid var(--border-neutral);
    color: var(--fg-1);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    padding: var(--sp-1) var(--sp-1);
    outline: none;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    border-radius: var(--r);
    appearance: none;
  }
  .field-input::placeholder {
    color: var(--fg-3);
    font-style: italic;
  }
  .field-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 1px rgba(188,142,79,0.2);
  }
  .field-input.error {
    border-color: var(--danger);
    box-shadow: 0 0 0 1px rgba(168,51,28,0.3);
  }
  .field-input:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .field-error {
    font-family: var(--font-sans);
    font-size: 12px;
    color: var(--danger);
    font-style: italic;
    margin-top: 5px;
  }

  /* ── Badges ── */
  .badge {
    font-family: var(--font-sans);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 10px;
    border: 1px solid;
    border-radius: var(--r);
    display: inline-block;
  }

  .badge-default  { border-color: var(--border-leather); color: var(--fg-2); }
  .badge-gold     { border-color: var(--gold-dim); color: var(--gold); background: var(--gold-soft); }
  .badge-danger   { border-color: var(--danger); color: var(--danger); background: var(--danger-bg); }
  .badge-success  { border-color: var(--success); color: var(--success); background: var(--success-bg); }
  .badge-warning  { border-color: var(--warning); color: var(--warning); background: var(--warning-bg); }
  .badge-arcane   { border-color: var(--arcane); color: var(--arcane); background: var(--arcane-bg); }
  .badge-info     { border-color: var(--info); color: var(--info); background: var(--info-bg); }

  /* ── Callout ── */
  .callout {
    border-left: 2px solid;
    padding: var(--sp-2);
    border-radius: 0 var(--r) var(--r) 0;
    display: flex;
    gap: var(--sp-2);
    align-items: flex-start;
  }
  .callout-icon { font-size: 14px; margin-top: 2px; flex-shrink: 0; }
  .callout-title {
    font-family: var(--font-sans);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .callout-text {
    font-family: var(--font-serif);
    font-size: 14px;
    font-style: italic;
    line-height: 1.55;
    color: var(--fg-2);
  }

  .callout-danger  { border-color: var(--danger);  background: var(--danger-bg); }
  .callout-warning { border-color: var(--warning); background: var(--warning-bg); }
  .callout-info    { border-color: var(--info);    background: var(--info-bg); }
  .callout-arcane  { border-color: var(--arcane);  background: var(--arcane-bg); }

  .callout-danger  .callout-title { color: var(--danger); }
  .callout-warning .callout-title { color: var(--warning); }
  .callout-info    .callout-title { color: var(--info); }
  .callout-arcane  .callout-title { color: var(--arcane); }

  /* ── Card ── */
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border-leather);
    border-radius: var(--r2);
    box-shadow: var(--shadow-card), var(--shadow-inset);
    transition: border-color var(--transition-fast);
  }
  .card:hover { border-color: var(--gold-dim); }
  .card-body  { padding: var(--sp-4); }

  /* ── HP bar ── */
  .hp-bar-track {
    height: 4px;
    background: var(--hp-track);
    border-radius: 2px;
    position: relative;
    overflow: hidden;
  }
  .hp-bar-fill {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    background: var(--hp-healthy);
    border-radius: 2px;
    transition: width var(--transition-bar), background var(--transition-bar);
  }
  .hp-bar-fill.mid { background: var(--hp-wounded); }
  .hp-bar-fill.low { background: var(--hp-critical); }
}
```

- [ ] **Step 2: Rimuovi il blocco `.glow-gold` / `.glow-blood` che erano nel componente precedente**

Verifica che nel file non esistano più classi `.glow-gold`, `.glow-blood`, `.card-top-accent`. Se presenti rimuovile.

- [ ] **Step 3: Aggiorna le utility class fuori da `@layer components`**

Queste classi usano vecchi token di colore ma si trovano fuori dal blocco `@layer components`. Aggiornale manualmente:

`.site-header` — cambia il valore del background:
```css
.site-header {
  background-color: rgba(17, 19, 22, 0.97);
  border-bottom: 1px solid var(--border-leather);
}
```

`.modal-overlay` e `.talenti-catalog`, `.talenti-sidebar` — non hanno riferimenti a colori, nessuna modifica.

Verifica con:
```bash
grep -n "border-iron\|border-rust\|bg-void\|bg-surface\|accent-\|text-parchment\|text-faded\|text-ghost" app/globals.css | grep -v "@layer"
```
Expected: nessun output.

---

### Task 3: Sweep automatico token di colore nei file TSX

**Files:**
- Modify: tutti i `*.tsx` in `app/` e `components/`

- [ ] **Step 1: Esegui il rename automatico dei token CSS var()**

Dalla root del progetto:

```bash
find . \( -path ./node_modules -o -path ./.next -o -path ./docs -o -path ./.superpowers \) -prune -o -name "*.tsx" -print | \
  xargs sed -i '' \
  -e 's/var(--accent-blood-h)/var(--danger-strong)/g' \
  -e 's/var(--accent-blood)/var(--danger)/g' \
  -e 's/var(--accent-gold-l)/var(--gold)/g' \
  -e 's/var(--accent-gold)/var(--gold)/g' \
  -e 's/var(--accent-ember)/var(--warning)/g' \
  -e 's/var(--accent-arcane)/var(--arcane)/g' \
  -e 's/var(--accent-spectral)/var(--info)/g' \
  -e 's/var(--bg-void)/var(--bg-deep)/g' \
  -e 's/var(--bg-surface)/var(--bg-card)/g' \
  -e 's/var(--text-parchment)/var(--fg-1)/g' \
  -e 's/var(--text-faded)/var(--fg-2)/g' \
  -e 's/var(--text-ghost)/var(--fg-3)/g' \
  -e 's/var(--border-iron)/var(--border-leather)/g' \
  -e 's/var(--border-rust)/var(--border-leather-dim)/g' \
  -e 's/var(--border-gold-glow)/var(--gold-dim)/g' \
  -e 's/var(--color-hp-green)/var(--hp-healthy)/g' \
  -e 's/var(--color-hp-yellow)/var(--hp-wounded)/g' \
  -e 's/var(--color-hp-red)/var(--hp-critical)/g' \
  -e 's/var(--blood-soft)/var(--fg-1)/g' \
  -e 's/var(--arcane-soft)/var(--fg-1)/g' \
  -e 's/var(--ember-soft)/var(--fg-1)/g' \
  -e 's/var(--spectral-soft)/var(--fg-1)/g' \
  -e 's/var(--gold-soft)/var(--gold-soft)/g'
```

- [ ] **Step 2: Rinomina le classi badge nei TSX**

```bash
find . \( -path ./node_modules -o -path ./.next -o -path ./docs -o -path ./.superpowers \) -prune -o -name "*.tsx" -print | \
  xargs sed -i '' \
  -e 's/badge-blood/badge-danger/g' \
  -e 's/badge-spectral/badge-info/g' \
  -e 's/badge-ember/badge-warning/g'
```

- [ ] **Step 3: Verifica zero riferimenti ai vecchi token**

```bash
grep -rn "accent-blood\|accent-gold\|accent-ember\|accent-arcane\|accent-spectral\|bg-void\|bg-surface\|text-parchment\|text-faded\|text-ghost\|border-iron\|border-rust\|border-gold-glow\|color-hp-green\|color-hp-yellow\|color-hp-red\|blood-soft\|arcane-soft\|ember-soft\|spectral-soft\|badge-blood\|badge-ember\|badge-spectral" \
  app/ components/ --include="*.tsx" | grep -v node_modules
```

Expected: nessun output. Se ci sono match, correggili manualmente.

---

### Task 4: Sostituisci valori hex hardcoded nei TSX

**Files:**
- Modify: `app/layout.tsx` + altri TSX con valori hex diretti

- [ ] **Step 1: Sweep automatico dei hex più comuni**

```bash
find . \( -path ./node_modules -o -path ./.next -o -path ./docs -o -path ./.superpowers \) -prune -o -name "*.tsx" -print | \
  xargs sed -i '' \
  -e "s/'#b8860b'/var(--gold)/g" \
  -e 's/"#b8860b"/var(--gold)/g' \
  -e "s/'#141210'/var(--bg-deep)/g" \
  -e 's/"#141210"/var(--bg-deep)/g' \
  -e "s/'#9b8e7a'/var(--fg-2)/g" \
  -e 's/"#9b8e7a"/var(--fg-2)/g' \
  -e "s/'#302d2a'/var(--border-leather)/g" \
  -e 's/"#302d2a"/var(--border-leather)/g'
```

- [ ] **Step 2: Aggiorna `app/layout.tsx` manualmente**

Apri `app/layout.tsx`. Trova il blocco del logo e aggiornalo:

```tsx
<span style={{
  fontFamily: "var(--font-serif)",
  fontSize: '16px',
  fontWeight: 700,
  letterSpacing: '.12em',
  color: 'var(--gold)',
}}>
  QUENTA
</span>
```

Trova il blocco initials avatar e aggiornalo:

```tsx
<div style={{
  fontFamily: "var(--font-sans)",
  fontSize: '11px',
  fontWeight: 600,
  background: 'var(--gold)',
  color: 'var(--bg-deep)',
  padding: '0 8px',
  height: 32,
  lineHeight: '32px',
  borderRadius: 'var(--r)',
  minWidth: 32,
  textAlign: 'center',
  marginLeft: 4,
  flexShrink: 0,
}}>
  {initials}
</div>
```

Trova il bottone "Esci" desktop e aggiornalo:

```tsx
<button type="submit" style={{
  fontFamily: "var(--font-sans)",
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '.04em',
  color: 'var(--fg-2)',
  background: 'none',
  border: '1px solid var(--border-leather)',
  padding: '0 8px',
  height: 32,
  lineHeight: '30px',
  borderRadius: 'var(--r)',
  cursor: 'pointer',
  transition: `all var(--transition-fast)`,
}}>
  Esci
</button>
```

Trova il bottone "Esci" mobile (dentro `MobileNavDrawer`) e aggiornalo:

```tsx
<button type="submit" style={{
  display: 'flex', alignItems: 'center', gap: 8,
  width: '100%', background: 'none',
  border: '1px solid var(--border-leather)',
  borderRadius: 'var(--r)', padding: '0 12px',
  height: 36, cursor: 'pointer',
  fontFamily: "var(--font-sans)",
  fontSize: '12px', fontWeight: 500, letterSpacing: '.04em',
  color: 'var(--fg-2)',
}}>
  <span style={{ fontSize: 14 }}>→</span> Esci dall&apos;account
</button>
```

- [ ] **Step 3: Rimuovi il glow inline in `components/combat/CombatStartButton.tsx` (riga ~59)**

Trova il bottone con `boxShadow: '0 0 20px rgba(139,26,26,0.3)'` e rimuovi solo la proprietà `boxShadow` dall'inline style. Il resto del style rimane invariato.

- [ ] **Step 4: Verifica zero hex hardcoded rimanenti**

```bash
grep -rn "'#[0-9a-fA-F]\{6\}'\|\"#[0-9a-fA-F]\{6\}\"" app/ components/ --include="*.tsx" | grep -v node_modules
```

Per ogni match rimanente: valuta se è un colore di sistema (sostituisci con token) o un colore specifico di una feature visuale (lascia invariato documentando il motivo).

---

### Task 5: Verifica Layer 1 e commit

**Files:** nessuno

- [ ] **Step 1: Avvia il dev server e controlla**

```bash
npm run dev
```

Expected: il server parte senza errori TypeScript. Apri `http://localhost:3000` nel browser.

- [ ] **Step 2: Verifica visiva rapida**

Controlla:
- [ ] Sfondo della pagina: cool-slate (#111316), non warm-brown
- [ ] Testo primario: parchment giallo (#DCC795), non bianco puro
- [ ] Bottone primario: oro (#BC8E4F) con testo scuro, non rosso sangue
- [ ] Bordi delle card: slate freddo (#3A4048)
- [ ] Nessun glow visibile su hover di card o bottoni

- [ ] **Step 3: Verifica zero vecchi token in globals.css**

```bash
grep -n "bg-void\|bg-surface\|text-parchment\|text-faded\|text-ghost\|accent-gold\|accent-blood\|accent-ember\|accent-arcane\|accent-spectral\|border-iron\|border-rust\|color-hp-green\|color-hp-yellow\|color-hp-red\|glow-gold\|glow-blood\|card-top-accent" app/globals.css
```

Expected: nessun output.

- [ ] **Step 4: Commit**

```bash
git add -p app/globals.css
git add app/layout.tsx components/combat/CombatStartButton.tsx
git add $(git diff --name-only app/ components/ | grep -v node_modules)
git commit -m "feat: layer 1 — migrazione token colore al nuovo design system"
```

---

## Layer 2 — Font

### Task 6: Aggiorna font import in `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Aggiungi import next/font/google**

In cima a `app/layout.tsx`, dopo gli altri import, aggiungi:

```tsx
import { Source_Serif_4, Public_Sans } from 'next/font/google';

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});
```

- [ ] **Step 2: Applica le variabili font all'elemento `<html>`**

Trova `<html lang="it" className="h-full">` e aggiorna:

```tsx
<html lang="it" className={`h-full ${sourceSerif4.variable} ${publicSans.variable}`}>
```

- [ ] **Step 3: Rimuovi le stringhe font hardcoded nel logo di layout.tsx**

Il logo usa ora `fontFamily: "var(--font-serif)"` (già aggiornato in Layer 1). Verifica che non ci siano più stringhe `"'Lora', Georgia, serif"` o `"'Work Sans', system-ui, sans-serif"` hardcoded in layout.tsx.

```bash
grep -n "Lora\|Work Sans" app/layout.tsx
```

Expected: nessun output.

---

### Task 7: Aggiorna `app/globals.css` — font families e rimuovi @import

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Rimuovi la riga `@import url(...)` di Google Fonts**

Trova e cancella questa riga in cima a globals.css:

```
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
```

- [ ] **Step 2: Aggiorna i valori font nel blocco `:root`**

Nel blocco `:root`, aggiorna:

```css
--font-serif:   'Source Serif 4', 'Bookmania', Georgia, serif;
--font-sans:    'Public Sans', 'Scala Sans', system-ui, sans-serif;
--font-display: var(--font-serif);
--font-body:    var(--font-sans);
--font-label:   var(--font-sans);
```

---

### Task 8: Verifica Layer 2 e commit

- [ ] **Step 1: Avvia il dev server**

```bash
npm run dev
```

Expected: nessun errore di font missing. Apri `http://localhost:3000`.

- [ ] **Step 2: Verifica visiva font**

Controlla:
- [ ] Logo "QUENTA": Source Serif 4 (serif moderno, non Lora)
- [ ] Titoli H1/H2: Source Serif 4
- [ ] Body text e bottoni: Public Sans (sans-serif pulito, non Work Sans)
- [ ] L'aspetto generale è leggermente più editoriale/moderno

- [ ] **Step 3: Verifica zero riferimenti a Lora/Work Sans**

```bash
grep -rn "Lora\|Work Sans\|Work_Sans" app/ components/ --include="*.tsx" --include="*.css" | grep -v node_modules | grep -v .next
```

Expected: nessun output.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "feat: layer 2 — migrazione font a Source Serif 4 + Public Sans"
```

---

## Layer 3 — Spacing

### Task 9: Aggiorna token spacing in `app/globals.css`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Aggiorna il blocco spacing nel `:root`**

Sostituisci i token spacing vecchi con i nuovi nel blocco `:root`:

```css
/* ── Spacing — griglia 8px (11 step) ── */
--s-1:  8px;
--s-2:  16px;
--s-3:  24px;
--s-4:  32px;
--s-5:  40px;
--s-6:  48px;
--s-7:  56px;
--s-8:  64px;
--s-9:  80px;
--s-10: 96px;
--s-11: 120px;

/* ── Button heights ── */
--btn-compact: 32px;
--btn-default: 40px;
--btn-touch:   44px;
```

Rimuovi dal `:root` i vecchi token `--sp-1`, `--sp-2`, `--sp-3`, `--sp-4`, `--sp-6`.

- [ ] **Step 2: Aggiorna `@theme inline` per lo spacing**

Nel blocco `@theme inline`, sostituisci le righe spacing con:

```css
--spacing-1:  var(--s-1);
--spacing-2:  var(--s-2);
--spacing-3:  var(--s-3);
--spacing-4:  var(--s-4);
--spacing-5:  var(--s-5);
--spacing-6:  var(--s-6);
--spacing-7:  var(--s-7);
--spacing-8:  var(--s-8);
--spacing-9:  var(--s-9);
--spacing-10: var(--s-10);
--spacing-11: var(--s-11);
```

---

### Task 10: Sweep token spacing nei file TSX

**Files:**
- Modify: tutti i `*.tsx` in `app/` e `components/`

- [ ] **Step 1: Rename automatico `--sp-*` → `--s-*`**

```bash
find . \( -path ./node_modules -o -path ./.next -o -path ./docs -o -path ./.superpowers \) -prune -o -name "*.tsx" -print | \
  xargs sed -i '' \
  -e 's/var(--sp-1)/var(--s-1)/g' \
  -e 's/var(--sp-2)/var(--s-2)/g' \
  -e 's/var(--sp-3)/var(--s-3)/g' \
  -e 's/var(--sp-4)/var(--s-4)/g' \
  -e 's/var(--sp-6)/var(--s-6)/g'
```

Esegui lo stesso su globals.css (le utility class lo usano ancora con le vecchie variabili):

```bash
sed -i '' \
  -e 's/var(--sp-1)/var(--s-1)/g' \
  -e 's/var(--sp-2)/var(--s-2)/g' \
  -e 's/var(--sp-3)/var(--s-3)/g' \
  -e 's/var(--sp-4)/var(--s-4)/g' \
  -e 's/var(--sp-6)/var(--s-6)/g' \
  app/globals.css
```

- [ ] **Step 2: Verifica zero riferimenti ai vecchi token**

```bash
grep -rn "var(--sp-" app/ components/ --include="*.tsx" --include="*.css" | grep -v node_modules
```

Expected: nessun output.

---

### Task 11: Verifica Layer 3 e commit

- [ ] **Step 1: Avvia il dev server**

```bash
npm run dev
```

Expected: nessun errore.

- [ ] **Step 2: Verifica visiva spacing**

Controlla che spaziatura e padding nelle card e nei form siano visivamente coerenti (nessun crash di layout).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git add $(git diff --name-only app/ components/ | grep -v node_modules)
git commit -m "feat: layer 3 — migrazione spacing --sp-* → --s-*"
```

---

## Layer 4 — Radius + Utility class finali

### Task 12: Aggiorna token radius in `app/globals.css` e aggiungi utility class

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Aggiorna radius nel blocco `:root`**

Nel blocco `:root`, sostituisci:

```css
/* ── Radius — solo due valori ── */
--r-sm: 8px;
--r-lg: 12px;
```

Rimuovi `--r: 5px;` e `--r2: 9px;`.

- [ ] **Step 2: Aggiorna `@theme inline` per il radius**

Nel blocco `@theme inline`, aggiorna:

```css
--radius-sm: var(--r-sm);
--radius-lg: var(--r-lg);
```

- [ ] **Step 3: Aggiorna tutti i riferimenti a `--r` e `--r2` in globals.css**

L'ordine conta: prima `--r2` (più specifico), poi `--r)` (nota: `--r)` è il nome del token seguito dalla chiusura della funzione CSS, non intercetta `--r-sm)` o `--r-lg)`).

```bash
# 1. Rinomina --r2 → --r-lg
sed -i '' 's/--r2)/--r-lg)/g' app/globals.css

# 2. Rinomina il vecchio --r → --r-sm (ciò che rimane dopo il passo sopra è solo il vecchio token)
sed -i '' 's/--r)/--r-sm)/g' app/globals.css
```

Verifica:
```bash
grep -n "\-\-r)" app/globals.css | grep -v "\-\-r-"
```

Expected: nessun output.

---

### Task 13: Sweep radius nei file TSX

**Files:**
- Modify: tutti i `*.tsx` in `app/` e `components/`

- [ ] **Step 1: Rename automatico `--r2` e `--r` nei TSX**

L'ordine conta: prima il token più lungo (`--r2`), poi il più corto (`--r`), altrimenti `--r-sm)` potrebbe essere già presente e il secondo pass lo lascia intatto.

```bash
# Pass 1 — rinomina --r2 → --r-lg
find . \( -path ./node_modules -o -path ./.next -o -path ./docs -o -path ./.superpowers \) -prune -o -name "*.tsx" -print | \
  xargs sed -i '' -e "s/--r2)/--r-lg)/g"

# Pass 2 — rinomina il vecchio --r → --r-sm (solo ciò che resta)
find . \( -path ./node_modules -o -path ./.next -o -path ./docs -o -path ./.superpowers \) -prune -o -name "*.tsx" -print | \
  xargs sed -i '' -e "s/--r)/--r-sm)/g"
```

- [ ] **Step 2: Cerca e rimuovi `rounded-full` nei className**

```bash
grep -rn "rounded-full" app/ components/ --include="*.tsx" | grep -v node_modules
```

Per ogni occorrenza trovata: sostituisci con `rounded-sm` (per elementi inline/badge) o `rounded-lg` (per card/modal) in base al contesto. Non eseguire in modo automatico — valuta caso per caso.

- [ ] **Step 3: Verifica zero riferimenti a `--r` e `--r2` non migrati**

```bash
grep -rn "var(--r2)\|var(--r)[^-]" app/ components/ --include="*.tsx" | grep -v node_modules
```

Expected: nessun output.

---

### Task 14: Verifica finale e commit

- [ ] **Step 1: Avvia il dev server**

```bash
npm run dev
```

Expected: nessun errore TypeScript o CSS.

- [ ] **Step 2: Verifica visiva completa**

Naviga nelle schermate principali:

- [ ] `/sign-in` — form di login, bordi e spaziatura corretti
- [ ] `/onboarding` — wizard con radius 8px sui controlli, 12px sulle card
- [ ] `/campaigns` — lista campagne con card system
- [ ] `/my-character` — character sheet completo: stat box, HP bar, badge slot incantesimo
- [ ] Character sheet — bottone primario (oro), bottoni ghost (slate)
- [ ] Combat view — badge danger per le condizioni, info per healing

- [ ] **Step 3: Verifica finale token globale**

```bash
# Nessun vecchio token deve sopravvivere
grep -rn "bg-void\|bg-surface\|text-parchment\|text-faded\|text-ghost\|accent-gold\|accent-blood\|border-iron\|border-rust\|sp-[0-9]\|--r2\b\|var(--r)[^-]" \
  app/ components/ --include="*.tsx" --include="*.css" | grep -v node_modules | grep -v .next
```

Expected: nessun output.

- [ ] **Step 4: Commit finale**

```bash
git add app/globals.css
git add $(git diff --name-only app/ components/ | grep -v node_modules)
git commit -m "feat: layer 4 — migrazione radius e utility class; design system completo"
```
