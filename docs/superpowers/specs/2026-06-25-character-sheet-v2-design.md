# Character Sheet Redesign v2 — Design

## Contesto

Handoff di design (HTML prototipi `Scheda Personaggio A/B.dc.html` + `thorin-data.js` + README) per un nuovo layout della scheda personaggio desktop. Il sheet desktop è già passato per un refactor recente (`HpStrip` + `SheetTabBar`, 4 tab: Combattimento, Equipaggiamento, Incantesimi, Bio). Questo design **sostituisce completamente** quella struttura desktop con un nuovo layout a 5 tab, in linea con la "Scheda B" del bundle (sidebar fissa + tab con pannelli lista/dettaglio).

I token colore (`#BC8E4F`, `#DCC795`, `#17191D`, ecc.) e i font (Source Serif 4 + Public Sans) del mockup **coincidono già** con `DESIGN_SYSTEM.md` — nessun conflitto di palette o tipografia, nessuna nota del README su questo punto è applicabile.

## Scope

**In scope:**
- Nuovo layout desktop (≥1100px) condiviso tra `/characters/[id]` (DM) e `/my-character` (player)
- 5 tab: Caratteristiche, Combattimento, Incantesimi, Inventario, Narrativa
- Sidebar con identità, XP, feature links, riposi, + sezione DM-only condizionale
- Sistema di toast (nuovo, non esiste oggi)
- Picker per aggiungere condizioni (al posto del random del prototipo)
- Bottone "Usa" per capacità di classe con risorsa limitata nel dettaglio Combattimento

**Out of scope:**
- Mobile (`MobileSheet`, <1100px) — resta intatto, non toccato in questo progetto
- Editing dei 4 tratti narrativi (Tratto/Ideale/Legame/Difetto) — restano read-only come oggi
- Sistema portrait reale (placeholder glifo, come nel mockup)
- Nuovi campi di schema DB — si usano solo dati/calcoli già esistenti

## Architettura

**Componente condiviso**: `components/character/sheet/v2/CharacterSheetView.tsx` (client component), usato sia da `/characters/[id]/page.tsx` che da `/my-character/page.tsx`. Riceve i dati del personaggio (caricati server-side dalla rispettiva page, pattern attuale invariato) più un prop `viewerRole: 'dm' | 'player'` per attivare la sezione DM-only nella sidebar.

Sostituisce, solo per il breakpoint desktop (≥1100px): `SheetTabBar`, l'attuale griglia 3-colonne di `/characters/[id]`, e il layout inline di `/my-character`. `MobileSheet` continua a gestire <1100px, invariato.

Tutte le azioni (danno/cura, condizioni, slot, equip, monete, riposi, consumo risorsa) restano le **server action esistenti** in `lib/db/actions.ts` — nessuna nuova logica di business, solo nuova UI che le invoca e mostra toast di conferma.

### Struttura file

```
components/character/sheet/v2/
  CharacterSheetView.tsx       # contenitore: stato tab/selezioni, orchestrazione azioni
  Sidebar.tsx
  SidebarDmActions.tsx         # sezione condizionale (viewerRole === 'dm')
  HpStatsRow.tsx                # HP compact + 5 combat stat card
  ConditionsRow.tsx             # condizioni attive + picker
  TabNav.tsx
  tabs/
    StatsTab.tsx                # Caratteristiche
    CombatTab.tsx                # Combattimento
    SpellsTab.tsx                # Incantesimi
    InventoryTab.tsx             # Inventario
    NarrativeTab.tsx             # Narrativa
  ListDetailPanel.tsx           # pattern lista+dettaglio riusabile
  Toast.tsx
  useToast.ts                   # context/hook
```

### Stato

`CharacterSheetView` possiede: tab attivo (persistito in localStorage, scoped per personaggio — stesso pattern già usato da `SheetTabBar`), sotto-tab e selezione per Combattimento/Incantesimi/Inventario. Lo stato non persiste tra reload tranne il tab principale (coerente col mockup: "ogni tab mantiene il proprio stato — la navigazione tra tab non resetta la selezione", ma solo durante la sessione).

### Toast

`ToastProvider` (context), montato una volta in `CharacterSheetView`, espone `useToast().show(message)`. Un solo messaggio visibile alla volta (un nuovo show rimpiazza il precedente), fade-in 0.2s, auto-dismiss dopo 1.8s, fixed bottom-center. Implementazione custom (non Radix Toast): il caso d'uso è single-message senza stacking né azioni interattive, Radix aggiungerebbe overhead di configurazione senza beneficio.

Agganciato a: danno/cura/temp HP, aggiunta/rimozione condizione, consumo/reset slot incantesimo, equip/unequip oggetto, modifica monete, riposo breve/lungo, uso capacità con risorsa.

## Sezioni UI

### Sidebar (220px, fixed)

- Card unica, stile esistente (`--bg-card`, `--border-leather-dim`, `--r-lg`)
- Portrait placeholder (glifo) + nome (Source Serif 4, gold) + classe/livello + badge allineamento
- XP bar — `characters.xp` esiste già nello schema; "XP prossimo livello" si ricava dalla tabella livelli SRD già usata per `proficiencyBonus()`/level up
- Identità: Razza, Background, Bonus Comp. (`proficiencyBonus()`), Perc. Passiva (`passivePerception()`), Velocità — tutti da `lib/rules/calculations.ts`
- 3 Feature links (Caratteristiche di Classe, Tratti Razziali, Talenti) → aprono le modali esistenti
- Riposo Breve / Riposo Lungo → `shortRest()` / `longRest()` esistenti, con toast
- **Sezione DM-only** (visibile solo se `viewerRole === 'dm'`): Level up, Assegna player, ASI retroattivo, Note DM — logica attuale, restilizzata con i token della sidebar

### Riga HP + Stat Combattimento

- **HP compact** (200px): numero HP grande con colore dinamico (verde >60%, giallo 30-60%, rosso <30%), barra 3px animata (`transition: width .5s ease, background .6s`), input + bottoni Danno/Cura/Temp (riuso logica `HpControls`). Death saves inline quando `hp === 0` (riuso `DeathSavesTracker`, nuovo guscio visivo)
- **Combat stat cards**: C.A. (`calcAC()`), Iniziativa (mod DEX), Velocità sempre presenti; CD Incantesimi e Attacco Incantesimi (`spellSaveDC()`, `spellAttackBonus()`) **solo se il personaggio è un incantatore** — altrimenti la riga mostra 3 card invece di 5 (niente placeholder "—")

### Riga Condizioni

- Badge condizioni attive (`characterConditions`), click per rimuovere (+ toast)
- Bottone "+ Condizione" apre un **picker/dropdown** con le condizioni SRD non ancora attive (`lib/srd/conditions.ts`) — **non** randomico come nel prototipo, che era solo un placeholder di demo

### Tab Nav

5 tab: Caratteristiche, Combattimento, Incantesimi, Inventario, Narrativa. Tab attivo persistito in localStorage scoped per personaggio. Se il personaggio non è incantatore, il tab Incantesimi resta visibile con stato vuoto ("Nessun incantesimo disponibile") — nessuna logica di tab condizionali.

### Tab: Caratteristiche

- Striscia 6 badge punteggio/modificatore (FOR/DES/COS/INT/SAG/CAR), colore dinamico esistente
- Due colonne (`1fr 1fr`, `max-height: calc(100vh - 280px)`, scroll interno): Tiri Salvezza (pallino proficiency + bonus) e Abilità (18 righe, pallino prof/expertise + bonus)
- Tutti i calcoli da `lib/rules/calculations.ts`, nessuna nuova formula

### Tab: Combattimento

Pattern `ListDetailPanel`:
- **Lista**: toggle Attacchi / Capacità
  - Attacchi: da `weapons: CharacterWeapon[]` — nome, tipo, danno, tiro per colpire
  - Capacità: **tutte le `pinnedFeatures` attive**, incluse quelle senza risorsa limitata (mostrano "Illimitato" invece di un contatore); CD calcolata quando applicabile
- **Dettaglio**: sticky, icona+nome+tipo, stats grid (per attacchi: tiro per colpire/danno/tipo/gittata; per capacità: utilizzi/ricarica/CD), descrizione, empty state se nessuna selezione (default: nessuna riga pre-selezionata)
- **Bottone "Usa"** nel dettaglio di una capacità con risorsa limitata: consuma un utilizzo via azione server esistente, con toast. Capacità senza risorsa ("Illimitato") non hanno bottone "Usa"

### Tab: Incantesimi

- **Slot strip**: da `characterSpellSlots` (solo livelli con `total > 0`), badge livello + pallini usati/disponibili, click consuma uno slot, click su slot esaurito resetta il livello a 0; bottone "Reset" globale per azzerare tutti gli usi
- **Lista**: filtro Tutti / Preparati (N), righe con livello, nome, badge concentrazione, scuola
- **Dettaglio**: nome+badge livello, scuola, griglia 2×2 (Tempo di Lancio da `castingTime`, Gittata da `range`, Durata da `duration`, Componenti da `components` — tutti già presenti su `SrdSpell` in `lib/srd/spells.ts`), tag Concentrazione/Preparato, descrizione
- Se non incantatore: slot strip e lista vuoti con messaggio, nessun dato inventato

### Tab: Inventario

- **Monete strip**: 5 badge (PP/MO/ME/MA/MR) da `character.money`, bottoni +/− e input quantità (default ±1 se input vuoto), azione server esistente, toast
- **Lista**: toggle Tutti (N) / Equipaggiato (N), righe con icona, nome, badge "E" se equipaggiato, peso, bottone "⋯" → **Radix Popover** (Indossa/Rimuovi + Lascia) — qui Radix è il primitivo corretto (focus trap, click-outside, posizionamento)
- **Dettaglio**: nome, categoria, stat (C.A./Danno/Peso/Quantità se >1), proprietà, stato equipaggiato + azioni, descrizione
- Equip/unequip e "Lascia" usano `equipInventoryItem()` e l'azione di rimozione esistenti; l'AC si ricalcola automaticamente lato server come già accade oggi

### Tab: Narrativa

- Griglia `1fr 2fr`: 4 card tratti (Tratto/Ideale/Legame/Difetto, read-only) a sinistra; Storia del Personaggio a destra con bottone "Leggi e modifica" che apre `BackstoryModal` esistente — nessuna nuova UI di editing per i tratti

## Design tokens

Nessun nuovo token: si usano esclusivamente quelli già definiti in `DESIGN_SYSTEM.md` (`--bg-card`, `--bg-inner`, `--gold`, `--fg-1/2/3`, `--border-leather*`, `--r-sm`/`--r-lg`, spacing `--s-*`, Source Serif 4 / Public Sans).

## Testing

- Unit test per i calcoli riusati (`lib/rules/calculations.ts`) — già esistenti, non richiedono modifiche
- Component test per `ListDetailPanel` (selezione, empty state) dato che è il pattern più riusato e a più alto rischio di bug di stato
- Component test per `CharacterSheetView`: persistenza tab attivo, sezione DM-only condizionale per `viewerRole`
- Test manuale (no E2E nuovo) per le azioni che toccano server actions esistenti (danno/cura, equip, slot, monete, riposi) — verificare che i toast appaiano e i dati si aggiornino coerentemente con la UI attuale già testata
