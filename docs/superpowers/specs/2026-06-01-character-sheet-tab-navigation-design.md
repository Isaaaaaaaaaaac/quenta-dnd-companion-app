# Character Sheet — Tab Navigation Design

## Obiettivo

Introdurre una navigazione a tab nel character sheet (`/characters/[id]` e `/my-character`) per massimizzare lo spazio disponibile, migliorare la leggibilità durante le sessioni e dare a Incantesimi ed Equipaggiamento sezioni dedicate invece di essere compressi in fondo alla pagina.

---

## Decisioni di design

### Scope
Tab navigation su **entrambe le versioni**: desktop (≥ 768px) e mobile (< 768px). Il layout cambia per ciascuna ma la struttura a tab è condivisa.

### HP strip — sempre visibile
I Punti Ferita, i tasti Danno/Cura/Temp e le Condizioni attive rimangono **ancorati sopra le tab** in ogni contesto. Non scompaiono mai quando si cambia tab. Questo è un requisito non negoziabile per l'uso al tavolo: HP è l'informazione più critica durante il combattimento.

### Struttura tab (4 tab)

| Tab | Label | Accent color | Contenuto |
|-----|-------|-------------|-----------|
| 1 | Combattimento | `--gold` | CA, Iniziativa, Velocità · Caratteristiche (6 ability scores) · Tiri Salvezza · Abilità · Attacchi · Risorse pinnate attive |
| 2 | Equipaggiamento | `--gold` | Inventario · Capacità di trasporto · Denaro |
| 3 | Incantesimi | `--arcane` | Slot incantesimo per livello · Lista incantesimi raggruppata per livello · Statistiche casting (DC, bonus attacco) |
| 4 | Bio | `--gold` | Narrativa (Tratto, Ideale, Legame, Difetto) · Storia del personaggio (backstory) |

Caratteristiche, Tiri Salvezza e Abilità vanno **nel tab Combattimento** (non in un tab separato). Motivazione: al tavolo si usano insieme — un Tiro Salvezza su FOR richiede di vedere sia il modificatore FOR che il vantaggio/svantaggio, spesso mentre si è anche consultando gli attacchi.

La tab Incantesimi è sempre visibile anche per personaggi non-caster, con un messaggio esplicativo ("nessuna capacità magica — scegli una classe con spellcasting").

### Stato tab

Il tab attivo è salvato in `localStorage` con chiave `quenta:sheet-tab`. Persiste tra refresh e navigazioni. Non viene inserito nell'URL per non complicare il routing Next.js.

---

## Layout desktop (≥ 768px)

```
┌──────────────────────────────────────────────────────────┐
│  Breadcrumb: Campagne / Aethon / Gianni                  │
├──────────────┬───────────────────────────────────────────┤
│              │  ┌─ HP STRIP (sempre visibile) ──────────┐ │
│   SIDEBAR    │  │  PF: 32/32  [Danno] [Cura] [Temp]    │ │
│   (232px)    │  │  Condizioni: Nessuna                  │ │
│   Invariata  │  └───────────────────────────────────────┘ │
│              │                                           │
│  - Portrait  │  ┌─ TAB BAR ─────────────────────────────┐ │
│  - Nome      │  │ [Combattimento] Equipaggiamento ...   │ │
│  - Classe    │  ├───────────────────────────────────────┤ │
│  - XP bar    │  │                                       │ │
│  - Level up  │  │  TAB CONTENT (3 colonne interne)      │ │
│  - Identity  │  │  col A: Caratteristiche + Tiri Salv.  │ │
│  - Features  │  │  col B: Stats combat + Attacchi       │ │
│              │  │  col C: Abilità                       │ │
│              │  │                                       │ │
└──────────────┴───────────────────────────────────────────┘
```

Il contenuto interno alla tab usa il layout multi-colonna esistente, riorganizzato per tema. Non si perde la densità informativa del desktop.

### Colonne interne per ogni tab

**Tab Combattimento:**
- Col A: 6 ability score cards (griglia 3×2) + Tiri Salvezza lista
- Col B: CA / Iniziativa / Velocità (row 3 cards) + tabella Attacchi + Risorse pinnate attive
- Col C: lista Abilità completa

**Tab Equipaggiamento:**
- Layout a 2 colonne: inventario (largo) + denaro + peso (stretto)

**Tab Incantesimi:**
- Row slot per livello (orizzontale, scrollabile se necessario)
- Lista incantesimi raggruppata per livello (come `SpellSectionTabs` esistente, ma con più spazio)

**Tab Bio:**
- Grid 2×2 per Narrativa (Tratto, Ideale, Legame, Difetto)
- Sezione Backstory sotto (full width)

---

## Layout mobile (< 768px)

```
┌─────────────────────────┐
│  HP STRIP sticky        │
│  Nome · PF: 32/32       │
│  [Danno] [Cura] [Temp]  │
├─────────────────────────┤
│ Combat | Gear | Spell | Bio │  ← tab bar sticky
├─────────────────────────┤
│                         │
│   CONTENUTO TAB         │
│   (scroll libero)       │
│                         │
└─────────────────────────┘
         [FAB ✦]          ← invariato
```

Sul mobile, la tab Combattimento mostra:
1. Griglia 3×2 delle 6 caratteristiche
2. Row CA / Iniziativa / Velocità
3. Tabella Attacchi
4. Tiri Salvezza (lista compatta)
5. Abilità (lista compatta, le stesse di oggi)

---

## Architettura componenti

### Nuovo componente: `SheetTabBar`

**File:** `components/character/sheet/SheetTabBar.tsx`
**Tipo:** `'use client'` (gestisce stato tab con localStorage)

```tsx
type TabId = 'combat' | 'equipment' | 'spells' | 'bio';

interface Props {
  combat: React.ReactNode;
  equipment: React.ReactNode;
  spells: React.ReactNode;
  bio: React.ReactNode;
}
```

Il Server Component padre renderizza tutti e 4 i pannelli e li passa come props nominali. `SheetTabBar` mantiene solo `activeTab` in stato locale (inizializzato da `localStorage`) e mostra/nasconde i pannelli via CSS (`display: none`). Nessun re-render dei pannelli al cambio tab — il DOM è già lì.

### Approccio rendering

Il Server Component `/characters/[id]/page.tsx` renderizza **tutto il contenuto di tutti i tab** in una volta sola. `SheetTabBar` (client) riceve i 4 pannelli come children e nasconde quelli inattivi con CSS (`display: none`). Questo evita:
- Fetch aggiuntivi al cambio tab
- Flash di contenuto vuoto
- Complessità di state management

### Componente `HpStrip`

**File:** `components/character/sheet/HpStrip.tsx`
**Tipo:** Server Component (riceve dati dal padre, delega i tasti interattivi a `HpControls` già esistente)

Estrae la sezione HP + condizioni che oggi è inline nel page. Rimane invariata funzionalmente.

### Mobile: refactor `MobileSheet`

`MobileSheet.tsx` (677 righe attuale) viene riorganizzato internamente per usare la stessa struttura a 4 tab. Non cambia l'interfaccia Props. Il FAB (`MobileFab`) rimane invariato.

---

## Token DS rispettati

- Tab indicator attivo: `border-bottom: 2px solid var(--gold)` (tab 1/2/4) o `var(--arcane)` (tab 3 Incantesimi)
- Tab label inattiva: `color: var(--fg-3)`
- Tab label attiva: `color: var(--gold)` o `var(--arcane)` per Incantesimi
- Background tab bar: `background: var(--bg-deep)`
- Nessun `border-radius` sul singolo tab (solo sul container esterno: `--r-lg`)
- Transizione cambio tab: `120ms` (fast, come da DS)

---

## File toccati

| File | Azione |
|------|--------|
| `app/characters/[id]/page.tsx` | Modificato — riorganizzazione contenuto in 4 pannelli, uso di `SheetTabBar` e `HpStrip` |
| `components/character/sheet/SheetTabBar.tsx` | Creato — gestisce stato tab + show/hide pannelli |
| `components/character/sheet/HpStrip.tsx` | Creato — estrae HP strip dal page |
| `components/character/mobile/MobileSheet.tsx` | Modificato — riorganizzazione interna in 4 tab |
| `app/my-character/page.tsx` | Verificato — se usa già `MobileSheet` come unico child, nessuna modifica necessaria; se contiene layout inline proprio, va aggiornato con la stessa struttura a 4 tab |

---

## Cosa NON cambia

- Sidebar identità (Col 1 desktop): invariata
- `MobileFab`: invariato
- `SpellSectionTabs`: riusato dentro il pannello Incantesimi
- `InventoryCard`: riusato dentro il pannello Equipaggiamento
- `HpControls`, `ConditionBadge`, `AddConditionButton`: tutti riusati nella HP strip
- Tutti i bottoni DM (assegna giocatore, XP, level up): restano dove sono ora

---

## Fuori scope

- Drag-and-drop per riordinare i tab
- Tab personalizzabili dall'utente
- Animazioni di transizione tra tab (solo `display: none` / visibilità CSS)
- Modifica del routing o degli URL
