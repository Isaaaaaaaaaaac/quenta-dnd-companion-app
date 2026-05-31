# Design System Migration — Spec

**Data:** 2026-06-01
**Stato:** Approvato
**Branch di lavoro:** `feature/ds-implementation`

---

## Obiettivo

Migrare l'intera codebase di Quenta dal Design System v2 (attuale, warm-brown) al nuovo sistema dichiarato in `DESIGN_SYSTEM.md` (cool-slate + sepia ink), aggiornando token CSS, font, spacing, radius e utility class globali senza modificare logica o struttura JSX.

---

## Decisioni chiave

| Decisione | Scelta | Motivazione |
|---|---|---|
| Strategia di migrazione | Incrementale per layer | App sempre funzionante; ogni layer è un commit autonomo |
| Gestione token legacy | Clean break | Nessun alias temporaneo; si evita debito tecnico e duplicazione |
| Scope | Solo stili | Nessun refactor architetturale, nessun nuovo componente condiviso |

---

## Architettura della migrazione

### Layer 1 — Colori

Il layer più visibile e più referenziato. Tutte le modifiche sono concentrate su:

**`app/globals.css`**
- Sostituisce l'intero blocco `:root` con i nuovi token del DESIGN_SYSTEM
- Sostituisce il blocco `@theme inline` con i mapping Tailwind v4 corretti
- Rimuove i glow (`box-shadow: 0 0 … rgba(…)`) su card e bottoni
- Rimuove il gradiente `.card-top-accent`
- Aggiorna i token di colore nelle utility class globali (`.btn-primary`, `.card`, `.badge-*`, ecc.) — solo i riferimenti ai colori; spacing e radius rimangono invariati fino al Layer 4

**Sweep su tutti i file TSX (~83 file)**

Token rename obbligatori:

| Vecchio | Nuovo |
|---|---|
| `--bg-void` | rimosso (usare `--bg-deep`) |
| `--bg-deep` | `--bg-deep` (invariato) |
| `--bg-surface` | `--bg-card` |
| `--bg-elevated` | `--bg-elevated` (invariato) |
| — | `--bg-inner` (nuovo, per input wells) |
| `--text-parchment` | `--fg-1` |
| `--text-faded` | `--fg-2` |
| `--text-ghost` | `--fg-3` |
| `--accent-gold` | `--gold` |
| `--accent-blood` | `--danger` |
| `--accent-ember` | `--warning` |
| `--accent-arcane` | `--arcane` |
| `--accent-spectral` | `--info` |
| — | `--success` (nuovo) |
| `--border-iron` | `--border-leather` |
| `--border-rust` | `--border-leather-dim` |
| `--border-gold-glow` | rimosso (no glow) |
| — | `--border-neutral` (nuovo) |
| — | `--border-neutral-dim` (nuovo) |
| `--color-hp-green` | `--hp-healthy` |
| `--color-hp-yellow` | `--hp-wounded` |
| `--color-hp-red` | `--hp-critical` |
| `--blood-soft`, `--arcane-soft`, ecc. | rimossi (usare `--fg-1` su sfondo semantico) |

Valori semantici con varianti `fg` / `strong` / `bg`:
- `--danger: #A8331C` / `--danger-strong: #8B2010` / `--danger-bg: #2A0F08`
- `--success: #6B8E3D` / `--success-strong: #4A6B2A` / `--success-bg: #15200E`
- `--warning: #C9701F` / `--warning-strong: #A85814` / `--warning-bg: #2A1608`
- `--arcane: #8A5CC4` / `--arcane-strong: #6B3FA0` / `--arcane-bg: #1E1530`
- `--info: #6B9AC4` / `--info-strong: #4A7AAA` / `--info-bg: #0F1A28`

Tailwind v4 — Classi utility generate (da usare nei componenti):
`bg-bg-card`, `bg-bg-inner`, `bg-bg-elevated`, `text-fg-1`, `text-fg-2`, `text-fg-3`, `text-gold`, `text-danger`, `border-leather`, `border-neutral-edge`

---

### Layer 2 — Font

**`app/layout.tsx`**
- Rimuove import di `Lora` e `Work Sans` da `next/font/google`
- Aggiunge Source Serif 4 (pesi: 400/500/600/700/800/900, italic 400/500) e Public Sans (pesi: 400/500/600/700, italic 400)
- Applica le variabili CSS ai tag `<html>` o `<body>`

**`app/globals.css`**
- Aggiorna `--font-serif: 'Source Serif 4', 'Bookmania', Georgia, serif`
- Aggiorna `--font-sans: 'Public Sans', 'Scala Sans', system-ui, sans-serif`
- Rimuove `@import url('https://fonts.googleapis.com/...')` (sostituito da next/font)

**Nessun sweep sui componenti** — verificato: nessun file TSX contiene `font-family` hardcoded; tutti i riferimenti usano già `var(--font-serif)` / `var(--font-sans)` o le utility Tailwind `font-serif` / `font-sans`.

---

### Layer 3 — Spacing

**`app/globals.css`**
- Sostituisce `--sp-1…--sp-6` con `--s-1…--s-11` (griglia 8px estesa a 11 step)
- Aggiunge `--btn-compact: 32px`, `--btn-default: 40px`, `--btn-touch: 44px`
- Aggiorna `@theme inline`: `--spacing-1: var(--s-1)` … `--spacing-11: var(--s-11)`

**Sweep su tutti i file TSX**
- `var(--sp-1) → var(--s-1)`, `var(--sp-2) → var(--s-2)` … `var(--sp-6) → var(--s-6)`
- Rimozione/sostituzione di valori hardcoded fuori griglia (6px, 10px, 12px) trovati nei componenti

---

### Layer 4 — Radius + Utility class finali

**`app/globals.css`**
- `--r: 5px → --r-sm: 8px`
- `--r2: 9px → --r-lg: 12px`
- Aggiorna `@theme inline`: `--radius-sm: var(--r-sm)`, `--radius-lg: var(--r-lg)`
- Aggiunge utility class finali al blocco `@layer components`:
  - `.eyebrow` — Public Sans 10px/600, tracking 0.14em, uppercase, `var(--fg-2)`
  - `.stat-num` — font-serif, `font-feature-settings: 'lnum' 1, 'tnum' 1`
  - `.stat-inline` — font-sans, weight 600, tabular figures

**Sweep su tutti i file TSX**
- `var(--r) → var(--r-sm)`, `var(--r2) → var(--r-lg)`
- Rimozione di `rounded-full` nei className (sostituire con `rounded-sm` o `rounded-lg`)
- Rimozione di valori custom di border-radius

---

## Fuori scope

- Refactor architetturale dei componenti
- Creazione di nuovi componenti condivisi (Button, Badge, Card come primitivi)
- Modifiche a logica, routing, o struttura JSX
- Aggiunta di nuove feature

---

## File coinvolti

**Modificati in ogni layer:**
- `app/globals.css` — risorsa centrale di tutti i token

**Solo Layer 2:**
- `app/layout.tsx` — font import

**Sweep nei layer 1, 3, 4:**
- `app/**/*.tsx` (~22 file)
- `components/**/*.tsx` (~61 file)

---

## Criteri di completamento per layer

Ogni layer è completo quando:
1. `globals.css` non contiene più riferimenti ai vecchi token
2. Nessun file TSX usa i vecchi token del layer corrente
3. L'app si avvia senza errori (`npm run dev`)
4. La UI è visivamente coerente col DESIGN_SYSTEM.md per i token migrati

---

## Vincoli

- Nessun valore hardcoded di colore, spacing o radius nei componenti — solo token CSS
- Nessun `rounded-full`, nessun glow, nessun gradiente
- Tutti i testi in italiano (invariato rispetto all'attuale)
- Dark mode only (invariato)
