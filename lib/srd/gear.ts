// D&D 5e SRD 5.1 — Capitolo 5: Equipaggiamento non magico, non armatura, non arma

export type GearCategory =
  | 'attrezzatura'        // Adventuring gear generale
  | 'contenitore'         // Borse, botti, bauli, borse, fiasche, ecc.
  | 'abbigliamento'       // Vestiti e abiti
  | 'focus'               // Focus arcano, druidico, simbolo sacro
  | 'munizioni_mundane'   // Frecce, quadrelli, palle, aghi
  | 'strumento_artigiano' // Attrezzi artigianali (18 categorie)
  | 'strumento_speciale'  // Kit speciali (ladro, travestimento, ecc.)
  | 'gioco'               // Set da gioco
  | 'strumento_musicale'  // Strumenti musicali
  | 'cavalcatura'         // Animali da cavalcare
  | 'bardatura'           // Bardatura, finimenti, sella
  | 'veicolo'             // Veicoli terrestri e navali
  | 'consumabile'         // Cibo, bevande
  | 'merce';              // Merci da commercio

export interface SrdGearItem {
  key: string;
  name: string;
  category: GearCategory;
  weight: number;    // kg (0 = trascurabile)
  cost: string;      // es. "5 PO" "3 PA" "2 PR"
  note?: string;     // breve nota funzionale
  icon: string;       // nome icona @iconify-json/game-icons (es. "backpack")
}

// ─── Attrezzatura da Avventura ────────────────────────────────────────────────

const ADVENTURING_GEAR: SrdGearItem[] = [
  { key: 'abacus',             name: 'Pallottoliere',                category: 'attrezzatura',  weight: 1,    cost: '2 PO',   note: 'Strumento di calcolo a sferette scorrevoli, usato da mercanti e studiosi', icon: 'abacus' },
  { key: 'acid_vial',          name: 'Acido (fiala)',                 category: 'attrezzatura',  weight: 0.5,  cost: '25 PO',  note: 'Lancia come improvvisata: 2d6 danni acido, incendi oggetti acidi', icon: 'poison-bottle' },
  { key: 'alchemists_fire',    name: 'Fuoco Alchemico (flacone)',     category: 'attrezzatura',  weight: 0.5,  cost: '50 PO',  note: 'Brucia per 1d4 fuoco finché spento (DC 10 Des come azione)', icon: 'fizzing-flask' },
  { key: 'antitoxin',          name: 'Antitossina (fiala)',           category: 'attrezzatura',  weight: 0,    cost: '50 PO',  note: 'Vantaggio ai TS veleno per 1 ora; nessun effetto veleno', icon: 'round-bottom-flask' },
  { key: 'ball_bearings',      name: 'Biglie (1.000)',                category: 'attrezzatura',  weight: 1,    cost: '1 PO',   note: 'Copri 3 m²: TS Des CD 10 o caduta prona', icon: 'spiked-ball' },
  { key: 'blanket',            name: 'Coperta',                       category: 'attrezzatura',  weight: 1.5,  cost: '5 PA',   note: 'Coperta di lana per proteggersi dal freddo durante i viaggi', icon: 'cape' },
  { key: 'block_tackle',       name: 'Paranco',                       category: 'attrezzatura',  weight: 2.5,  cost: '1 PO',   note: 'Quadruplica la forza di sollevamento; vantaggio alle prove di Forza', icon: 'pulley-hook' },
  { key: 'book',               name: 'Libro',                         category: 'attrezzatura',  weight: 2.5,  cost: '25 PO',  note: 'Volume rilegato; può trattare qualsiasi argomento, da racconti a trattati', icon: 'book-cover' },
  { key: 'caltrops',           name: 'Triboli (20)',                  category: 'attrezzatura',  weight: 1,    cost: '1 PO',   note: 'Copri 1,5 m²: velocità −3 m e 1 danno perforante chi li calpesta (CD 15 Des per evitare)', icon: 'spikes' },
  { key: 'candle',             name: 'Candela',                       category: 'attrezzatura',  weight: 0,    cost: '1 PR',   note: 'Luce fioca 1,5 m per 1 ora', icon: 'candle-flame' },
  { key: 'chain_10ft',         name: 'Catena (3 m)',                  category: 'attrezzatura',  weight: 5,    cost: '5 PO',   note: 'CA 19; 10 PF; immunità ai danni taglienti/perforanti', icon: 'rope-coil' },
  { key: 'chalk',              name: 'Gessetto',                      category: 'attrezzatura',  weight: 0,    cost: '1 PR',   note: 'Pezzo di gesso per scrivere o segnare superfici', icon: 'pencil-brush' },
  { key: 'climbers_kit',       name: 'Kit da Scalata',                category: 'attrezzatura',  weight: 5.5,  cost: '25 PO',  note: 'Chiodi, stivali, guanti; azione Aiuto durante arrampicata', icon: 'crowbar' },
  { key: 'crowbar',            name: 'Piede di Porco',                category: 'attrezzatura',  weight: 2.5,  cost: '2 PO',   note: 'Vantaggio alle prove di Forza dove fa leva', icon: 'crowbar' },
  { key: 'fishing_tackle',     name: 'Attrezzatura da Pesca',         category: 'attrezzatura',  weight: 2,    cost: '1 PO',   note: 'Lenza, ami, galleggianti e altri attrezzi per pescare', icon: 'fishing-pole' },
  { key: 'grappling_hook',     name: 'Rampino',                       category: 'attrezzatura',  weight: 2,    cost: '2 PO',   note: 'Gancio a più punte da legare a una corda, per scalare o agganciare oggetti', icon: 'hook' },
  { key: 'hammer',             name: 'Martello',                      category: 'attrezzatura',  weight: 1.5,  cost: '1 PO',   note: 'Martello comune da lavoro, utile per piantare chiodi o picchetti', icon: 'hammer-nails' },
  { key: 'hammer_sledge',      name: 'Mazza del Fabbro',              category: 'attrezzatura',  weight: 5,    cost: '2 PO',   note: 'Pesante martello a due mani usato per lavori di fucina o demolizione', icon: 'hammer-break' },
  { key: 'healers_kit',        name: 'Kit del Guaritore',             category: 'attrezzatura',  weight: 1.5,  cost: '5 PO',   note: '10 usi; stabilizza una creatura morente (0 PF) senza prova', icon: 'health-potion' },
  { key: 'holy_water',         name: 'Acqua Santa (fiasca)',          category: 'attrezzatura',  weight: 0.5,  cost: '25 PO',  note: '2d6 danni radiosi a non morti e demoni', icon: 'vial' },
  { key: 'hourglass',          name: 'Clessidra',                     category: 'attrezzatura',  weight: 0.5,  cost: '25 PO',  note: 'Misura il tempo trascorso tramite il flusso di sabbia tra due ampolle', icon: 'hourglass' },
  { key: 'hunting_trap',       name: 'Trappola da Caccia',            category: 'attrezzatura',  weight: 11,   cost: '5 PO',   note: '1d4 danni perforanti; CD 13 TS o intrappolata; velocità 0', icon: 'wolf-trap' },
  { key: 'ink',                name: 'Inchiostro (30 ml)',            category: 'attrezzatura',  weight: 0,    cost: '10 PO',  note: 'Boccetta di inchiostro per scrivere con una penna', icon: 'ink-swirl' },
  { key: 'ink_pen',            name: 'Penna da Inchiostro',           category: 'attrezzatura',  weight: 0,    cost: '2 PR',   note: 'Penna d\'oca o metallica per scrivere con l\'inchiostro', icon: 'quill-ink' },
  { key: 'ladder_10ft',        name: 'Scala (3 m)',                   category: 'attrezzatura',  weight: 11,   cost: '1 PA',   note: 'Scala portatile in legno, lunga 3 metri', icon: 'ladder' },
  { key: 'lamp',               name: 'Lampada',                       category: 'attrezzatura',  weight: 0.5,  cost: '5 PA',   note: 'Luce brillante 4,5 m; luce fioca +9 m; brucia per 6 ore (0,5 kg olio)', icon: 'old-lantern' },
  { key: 'lantern_bullseye',   name: 'Lanterna a Proiettore',         category: 'attrezzatura',  weight: 1,    cost: '10 PO',  note: 'Cono 18 m luce brillante, +18 m fioca; 6 ore per 0,5 kg olio', icon: 'lantern' },
  { key: 'lantern_hooded',     name: 'Lanterna con Cappuccio',        category: 'attrezzatura',  weight: 1,    cost: '5 PO',   note: 'Luce brillante 9 m; fioca +9 m; cappuccio abbassa luce; 6 ore per 0,5 kg olio', icon: 'paper-lantern' },
  { key: 'lock',               name: 'Serratura',                     category: 'attrezzatura',  weight: 0.5,  cost: '10 PO',  note: 'CD 15 per scassinare', icon: 'locked-chest' },
  { key: 'magnifying_glass',   name: 'Lente di Ingrandimento',        category: 'attrezzatura',  weight: 0,    cost: '100 PO', note: 'Vantaggio alle prove di Percezione per esame ravvicinato', icon: 'magnifying-glass' },
  { key: 'manacles',           name: 'Manette',                       category: 'attrezzatura',  weight: 3,    cost: '2 PO',   note: 'Forza CD 20 o Destrezza CD 17 (strumenti ladro) per liberarsi', icon: 'manacles' },
  { key: 'mirror_steel',       name: 'Specchio d\'Acciaio',           category: 'attrezzatura',  weight: 0.25, cost: '5 PO',   note: 'Piccolo specchio levigato, utile per segnalare o osservare dietro un angolo', icon: 'mirror-mirror' },
  { key: 'oil_flask',          name: 'Olio (fiasca)',                  category: 'attrezzatura',  weight: 0.5,  cost: '1 PA',   note: 'Alimenta lampade; lanciato: difficoltà terreno 1,5 m; incendiabile', icon: 'water-flask' },
  { key: 'paper',              name: 'Foglio di Carta',               category: 'attrezzatura',  weight: 0,    cost: '2 PA',   note: 'Un singolo foglio di carta', icon: 'paper' },
  { key: 'parchment',          name: 'Foglio di Pergamena',           category: 'attrezzatura',  weight: 0,    cost: '1 PA',   note: 'Foglio di pergamena conciata, usato per scrivere documenti o mappe', icon: 'tied-scroll' },
  { key: 'perfume',            name: 'Profumo (fiala)',                category: 'attrezzatura',  weight: 0,    cost: '5 PO',   note: 'Fiala di essenza profumata', icon: 'perfume-bottle' },
  { key: 'miners_pick',        name: 'Piccone del Minatore',          category: 'attrezzatura',  weight: 5,    cost: '2 PO',   note: 'Piccone a due punte per scavare roccia e minerali', icon: 'mining' },
  { key: 'piton',              name: 'Chiodo da Roccia',              category: 'attrezzatura',  weight: 0.1,  cost: '5 PR',   note: 'Chiodo metallico da piantare nella roccia per fissare una corda durante la scalata', icon: 'fishing-hook' },
  { key: 'poison_basic',       name: 'Veleno Basilare (fiala)',        category: 'attrezzatura',  weight: 0,    cost: '100 PO', note: 'Applica a un\'arma; CD 10 TS Cos o avvelenato per 1 minuto', icon: 'poison' },
  { key: 'pole_10ft',          name: 'Palo (3 m)',                    category: 'attrezzatura',  weight: 3.5,  cost: '5 PR',   note: 'Asta di legno lunga 3 metri, utile per sondare il terreno davanti a sé', icon: 'spear-hook' },
  { key: 'mess_kit',           name: 'Kit da Campo',                  category: 'attrezzatura',  weight: 0.5,  cost: '2 PA',   note: 'Pentolino e posate semplici per cucinare e mangiare in viaggio', icon: 'cooking-pot' },
  { key: 'portable_ram',       name: 'Ariete Portatile',              category: 'attrezzatura',  weight: 17.5, cost: '4 PO',   note: '+4 alle prove di Forza per sfondare; +2 con un aiutante', icon: 'ram' },
  { key: 'rope_hempen',        name: 'Corda di Canapa (15 m)',        category: 'attrezzatura',  weight: 4.5,  cost: '1 PO',   note: '2 PF; CD 17 Forza per romperla', icon: 'rope-coil' },
  { key: 'rope_silk',          name: 'Corda di Seta (15 m)',          category: 'attrezzatura',  weight: 2.5,  cost: '10 PO',  note: '2 PF; CD 17 Forza per romperla', icon: 'rope-coil' },
  { key: 'scale_merchant',     name: 'Bilancia da Mercante',          category: 'attrezzatura',  weight: 1.5,  cost: '5 PO',   note: 'Pesa piccole quantità di merce, in particolare metalli e gemme preziose', icon: 'compass' },
  { key: 'sealing_wax',        name: 'Ceralacca',                     category: 'attrezzatura',  weight: 0,    cost: '5 PA',   note: 'Cera che si scioglie a fuoco e si solidifica per sigillare lettere e documenti', icon: 'wax-seal' },
  { key: 'shovel',             name: 'Pala',                          category: 'attrezzatura',  weight: 2.5,  cost: '2 PO',   note: 'Pala da scavo per terra o neve', icon: 'spade' },
  { key: 'signal_whistle',     name: 'Fischietto Segnaletico',        category: 'attrezzatura',  weight: 0,    cost: '5 PR',   note: 'Fischietto usato per dare segnali a distanza', icon: 'whistle' },
  { key: 'signet_ring',        name: 'Anello con Sigillo',            category: 'attrezzatura',  weight: 0,    cost: '5 PO',   note: 'Anello incise con uno stemma, usato per sigillare documenti con la ceralacca', icon: 'ring' },
  { key: 'soap',               name: 'Sapone',                        category: 'attrezzatura',  weight: 0,    cost: '2 PR',   note: 'Un pezzo di sapone per lavarsi', icon: 'soap' },
  { key: 'spellbook',          name: 'Libro degli Incantesimi',       category: 'attrezzatura',  weight: 1.5,  cost: '50 PO',  note: '100 pagine; registra incantesimi del mago', icon: 'spell-book' },
  { key: 'spike_iron',         name: 'Chiodo di Ferro',               category: 'attrezzatura',  weight: 0.25, cost: '1 PR',   note: 'Chiodo di ferro per fissare oggetti o bloccare porte', icon: 'coiled-nail' },
  { key: 'spyglass',           name: 'Cannocchiale',                  category: 'attrezzatura',  weight: 0.5,  cost: '1.000 PO', note: 'Raddoppia la portata visiva', icon: 'magnifying-glass' },
  { key: 'tent_two_person',    name: 'Tenda (2 persone)',             category: 'attrezzatura',  weight: 10,   cost: '2 PO',   note: 'Tenda di tela in grado di ospitare due persone', icon: 'camping-tent' },
  { key: 'tinderbox',          name: 'Acciarino',                     category: 'attrezzatura',  weight: 0.5,  cost: '5 PA',   note: 'Accendi una torcia in 1 azione; altro oggetto infiammabile in 1 minuto', icon: 'flint-spark' },
  { key: 'torch',              name: 'Torcia',                        category: 'attrezzatura',  weight: 0.5,  cost: '1 PR',   note: 'Luce brillante 6 m; fioca +6 m; 1 ora; 1 danno contundente come improvvisata', icon: 'torch' },
  { key: 'whetstone',          name: 'Pietra Affilacoltelli',         category: 'attrezzatura',  weight: 0.5,  cost: '1 PR',   note: 'Pietra abrasiva per affilare lame', icon: 'curling-stone' },
  { key: 'bedroll',            name: 'Sacco a Pelo',                  category: 'attrezzatura',  weight: 3.5,  cost: '1 PO',   note: 'Imbottitura arrotolabile per dormire al riparo dal freddo del terreno', icon: 'cape-armor' },
  { key: 'bell',               name: 'Campanellino',                  category: 'attrezzatura',  weight: 0,    cost: '1 PO',   note: 'Piccola campana che produce un suono chiaro quando agitata', icon: 'ringing-bell' },
];

// ─── Contenitori ──────────────────────────────────────────────────────────────

const CONTAINERS: SrdGearItem[] = [
  { key: 'backpack',           name: 'Zaino',                         category: 'contenitore',   weight: 2.5,  cost: '2 PO',   note: 'Capacità: 30 kg / 1 m³', icon: 'backpack' },
  { key: 'barrel',             name: 'Barile',                        category: 'contenitore',   weight: 32,   cost: '2 PO',   note: 'Capacità: 120 litri / 260 kg', icon: 'barrel' },
  { key: 'basket',             name: 'Cesto',                         category: 'contenitore',   weight: 1,    cost: '4 PA',   note: 'Capacità: 40 kg / 80 cm³', icon: 'basket' },
  { key: 'bottle_glass',       name: 'Bottiglia di Vetro',            category: 'contenitore',   weight: 1,    cost: '2 PO',   note: 'Capacità: 0,75 litri', icon: 'water-bottle' },
  { key: 'bucket',             name: 'Secchio',                       category: 'contenitore',   weight: 1,    cost: '5 PR',   note: 'Capacità: 15 litri / 15 kg', icon: 'full-wood-bucket' },
  { key: 'case_bolt',          name: 'Turcasso (quadrelli)',           category: 'contenitore',   weight: 0.5,  cost: '1 PO',   note: 'Contiene 20 quadrelli', icon: 'quiver' },
  { key: 'case_map',           name: 'Tubo Portamappe/Portascrolle',  category: 'contenitore',   weight: 0.5,  cost: '1 PO',   note: 'Fino a 10 fogli arrotolati', icon: 'tied-scroll' },
  { key: 'chest',              name: 'Cassa/Baule',                   category: 'contenitore',   weight: 11.5, cost: '5 PO',   note: 'Capacità: 150 kg / 300 cm³', icon: 'chest' },
  { key: 'flask',              name: 'Fiasca',                        category: 'contenitore',   weight: 0.5,  cost: '2 PR',   note: 'Capacità: 0,5 litri', icon: 'water-flask' },
  { key: 'jug',                name: 'Brocca/Caraffa',                category: 'contenitore',   weight: 2,    cost: '2 PR',   note: 'Capacità: 4 litri', icon: 'jug' },
  { key: 'pouch',              name: 'Borsa',                         category: 'contenitore',   weight: 0.5,  cost: '5 PA',   note: 'Capacità: 3 kg / 0,2 l (polveri, aghi, semi, ecc.)', icon: 'pouch-with-beads' },
  { key: 'quiver',             name: 'Faretra',                       category: 'contenitore',   weight: 0.5,  cost: '1 PO',   note: 'Contiene 20 frecce', icon: 'quiver' },
  { key: 'sack',               name: 'Sacco',                         category: 'contenitore',   weight: 0.25, cost: '1 PR',   note: 'Capacità: 15 kg / 30 cm³', icon: 'knapsack' },
  { key: 'vial',               name: 'Fiala',                         category: 'contenitore',   weight: 0,    cost: '1 PO',   note: 'Capacità: 90 ml (componenti, veleni, ecc.)', icon: 'vial' },
  { key: 'waterskin',          name: 'Borraccia',                     category: 'contenitore',   weight: 2.5,  cost: '2 PA',   note: 'Capacità: 4 litri d\'acqua (piena)', icon: 'waterskin' },
  { key: 'iron_pot',           name: 'Pentola di Ferro',              category: 'contenitore',   weight: 5,    cost: '2 PO',   note: 'Capacità: 4 litri', icon: 'cooking-pot' },
];

// ─── Abbigliamento ────────────────────────────────────────────────────────────

const CLOTHING: SrdGearItem[] = [
  { key: 'clothes_common',      name: 'Abiti Comuni',                 category: 'abbigliamento', weight: 1.5,  cost: '5 PA',  note: 'Vestiti semplici e funzionali, adatti alla vita di tutti i giorni', icon: 'shirt' },
  { key: 'clothes_costume',     name: 'Abiti da Costume',             category: 'abbigliamento', weight: 2,    cost: '5 PO',  note: 'Costume teatrale o cerimoniale, utile per travestimenti e spettacoli', icon: 'carnival-mask' },
  { key: 'clothes_fine',        name: 'Abiti Eleganti',               category: 'abbigliamento', weight: 3,    cost: '15 PO', note: 'Abiti raffinati adatti a corti, banchetti e occasioni di prestigio', icon: 'dress' },
  { key: 'clothes_traveler',    name: 'Abiti da Viaggio',             category: 'abbigliamento', weight: 2,    cost: '2 PO',  note: 'Vestiti robusti pensati per resistere a lunghi spostamenti', icon: 'fur-shirt' },
  { key: 'robes',               name: 'Veste/Abito Talare',           category: 'abbigliamento', weight: 2,    cost: '1 PO',  note: 'Ampia veste indossata da sacerdoti, maghi e studiosi', icon: 'robe' },
];

// ─── Focus Magici ─────────────────────────────────────────────────────────────

const FOCUSES: SrdGearItem[] = [
  { key: 'focus_crystal',       name: 'Focus Arcano: Cristallo',      category: 'focus',         weight: 0.5,  cost: '10 PO',  note: 'Per stregoni e maghi; sostituisce componenti materiali non esotici', icon: 'crystal-ball' },
  { key: 'focus_orb',           name: 'Focus Arcano: Sfera',          category: 'focus',         weight: 1.5,  cost: '20 PO',  note: 'Per stregoni e maghi', icon: 'orb-wand' },
  { key: 'focus_rod',           name: 'Focus Arcano: Verga',          category: 'focus',         weight: 1,    cost: '10 PO',  note: 'Per stregoni, warlock e maghi', icon: 'rod-of-asclepius' },
  { key: 'focus_staff_arcane',  name: 'Focus Arcano: Bastone',        category: 'focus',         weight: 2,    cost: '5 PO',   note: 'Per stregoni, warlock e maghi; anche arma semplice', icon: 'wizard-staff' },
  { key: 'focus_wand',          name: 'Focus Arcano: Bacchetta',      category: 'focus',         weight: 0.5,  cost: '10 PO',  note: 'Per stregoni, warlock e maghi', icon: 'fairy-wand' },
  { key: 'focus_mistletoe',     name: 'Focus Druidico: Vischio',      category: 'focus',         weight: 0,    cost: '1 PO',   note: 'Ramoscello o ghirlanda; per druidi', icon: 'herbs-bundle' },
  { key: 'focus_totem',         name: 'Focus Druidico: Totem',        category: 'focus',         weight: 0,    cost: '1 PO',   note: 'Piuma, pelo o osso; per druidi', icon: 'totem' },
  { key: 'focus_staff_druidic', name: 'Focus Druidico: Bastone di Legno', category: 'focus',    weight: 2,    cost: '5 PO',   note: 'Per druidi; anche arma semplice', icon: 'crescent-staff' },
  { key: 'focus_yew_wand',      name: 'Focus Druidico: Bacchetta di Tasso', category: 'focus',  weight: 0.5,  cost: '10 PO',  note: 'Per druidi', icon: 'crystal-wand' },
  { key: 'symbol_amulet',       name: 'Simbolo Sacro: Amuleto',       category: 'focus',         weight: 0.5,  cost: '5 PO',   note: 'Per chierici e paladini; indossato o impugnato', icon: 'holy-symbol' },
  { key: 'symbol_emblem',       name: 'Simbolo Sacro: Emblema',       category: 'focus',         weight: 0,    cost: '5 PO',   note: 'Per chierici e paladini; inciso sullo scudo', icon: 'holy-symbol' },
  { key: 'symbol_reliquary',    name: 'Simbolo Sacro: Reliquiario',   category: 'focus',         weight: 1,    cost: '5 PO',   note: 'Per chierici e paladini; contenitore di reliquie sacre', icon: 'jeweled-chalice' },
  { key: 'component_pouch',     name: 'Borsa dei Componenti',         category: 'focus',         weight: 1,    cost: '25 PO',  note: 'Sostituisce tutti i componenti materiali non esotici', icon: 'pouch-with-beads' },
];

// ─── Munizioni Mundane ────────────────────────────────────────────────────────

const MUNDANE_AMMO: SrdGearItem[] = [
  { key: 'arrows_20',           name: 'Frecce (20)',                   category: 'munizioni_mundane', weight: 0.5, cost: '1 PO',  note: 'Faretra di 20 frecce per arco corto o lungo', icon: 'arrow-cluster' },
  { key: 'bolts_20',            name: 'Quadrelli per Balestra (20)',   category: 'munizioni_mundane', weight: 0.75, cost: '1 PO', note: 'Confezione di 20 quadrelli per balestra', icon: 'arrowhead' },
  { key: 'bullets_20',          name: 'Proiettili per Fionda (20)',    category: 'munizioni_mundane', weight: 0.75, cost: '4 PR', note: 'Confezione di 20 proiettili di piombo o pietra per fionda', icon: 'bullets' },
  { key: 'needles_50',          name: 'Aghi per Cerbottana (50)',      category: 'munizioni_mundane', weight: 0.5, cost: '1 PO',  note: 'Confezione di 50 aghi per cerbottana', icon: 'sewing-needle' },
];

// ─── Strumenti Artigiani ──────────────────────────────────────────────────────

const ARTISAN_TOOLS: SrdGearItem[] = [
  { key: 'tools_alchemist',     name: 'Attrezzi da Alchimista',       category: 'strumento_artigiano', weight: 4,   cost: '50 PO',  note: 'Competenza: creare veleni, antitossine, e analizzare sostanze', icon: 'cauldron' },
  { key: 'tools_brewer',        name: 'Attrezzi da Birraio',           category: 'strumento_artigiano', weight: 4.5, cost: '20 PO',  note: 'Competenza: produrre birra, lager e altri liquori', icon: 'beer-stein' },
  { key: 'tools_calligrapher',  name: 'Attrezzi da Calligrafo',        category: 'strumento_artigiano', weight: 2.5, cost: '10 PO',  note: 'Competenza: copiare documenti e creare mappe accurate', icon: 'quill' },
  { key: 'tools_carpenter',     name: 'Attrezzi da Falegname',         category: 'strumento_artigiano', weight: 3,   cost: '8 PO',   note: 'Competenza: costruire e riparare strutture in legno', icon: 'hand-saw' },
  { key: 'tools_cartographer',  name: 'Attrezzi da Cartografo',        category: 'strumento_artigiano', weight: 3,   cost: '15 PO',  note: 'Competenza: creare e interpretare mappe', icon: 'treasure-map' },
  { key: 'tools_cobbler',       name: 'Attrezzi da Calzolaio',         category: 'strumento_artigiano', weight: 2.5, cost: '5 PO',   note: 'Competenza: riparare e creare calzature', icon: 'leather-boot' },
  { key: 'tools_cook',          name: 'Utensili da Cuoco',             category: 'strumento_artigiano', weight: 4,   cost: '1 PO',   note: 'Competenza: preparare pasti di qualità', icon: 'cooking-pot' },
  { key: 'tools_glassblower',   name: 'Attrezzi da Soffiatore di Vetro', category: 'strumento_artigiano', weight: 2.5, cost: '30 PO', note: 'Competenza: creare oggetti in vetro', icon: 'round-bottom-flask' },
  { key: 'tools_jeweler',       name: 'Attrezzi da Gioielliere',       category: 'strumento_artigiano', weight: 1,   cost: '25 PO',  note: 'Competenza: lavorare pietre preziose e metalli preziosi', icon: 'jewel-crown' },
  { key: 'tools_leatherworker', name: 'Attrezzi da Pellettiere',       category: 'strumento_artigiano', weight: 2.5, cost: '5 PO',   note: 'Competenza: creare oggetti in cuoio', icon: 'animal-hide' },
  { key: 'tools_mason',         name: 'Attrezzi da Muratore',          category: 'strumento_artigiano', weight: 4,   cost: '10 PO',  note: 'Competenza: lavorare pietra e costruire muri', icon: 'chisel' },
  { key: 'tools_navigator',     name: 'Attrezzi da Navigatore',        category: 'strumento_artigiano', weight: 1,   cost: '25 PO',  note: 'Competenza: navigare usando le stelle, carte nautiche e bussole', icon: 'sextant' },
  { key: 'tools_painter',       name: 'Attrezzi da Pittore',           category: 'strumento_artigiano', weight: 2.5, cost: '10 PO',  note: 'Competenza: creare dipinti e decorare superfici', icon: 'paint-brush' },
  { key: 'tools_potter',        name: 'Attrezzi da Vasaio',            category: 'strumento_artigiano', weight: 1.5, cost: '10 PO',  note: 'Competenza: creare ceramiche e stoviglie', icon: 'painted-pottery' },
  { key: 'tools_smith',         name: 'Attrezzi da Fabbro',            category: 'strumento_artigiano', weight: 4,   cost: '20 PO',  note: 'Competenza: forgiare metalli e armi/armature di base', icon: 'anvil' },
  { key: 'tools_tinker',        name: 'Attrezzi da Lattoniere',        category: 'strumento_artigiano', weight: 5,   cost: '50 PO',  note: 'Competenza: riparare congegni meccanici', icon: 'cog' },
  { key: 'tools_weaver',        name: 'Attrezzi da Tessitore',         category: 'strumento_artigiano', weight: 2.5, cost: '1 PO',   note: 'Competenza: tessere stoffe e creare abiti', icon: 'spinning-wheel' },
  { key: 'tools_woodcarver',    name: 'Attrezzi da Intagliatore',      category: 'strumento_artigiano', weight: 2.5, cost: '1 PO',   note: 'Competenza: intagliare legno e creare frecce', icon: 'chisel' },
];

// ─── Strumenti Speciali ───────────────────────────────────────────────────────

const SPECIAL_TOOLS: SrdGearItem[] = [
  { key: 'kit_disguise',        name: 'Kit da Travestimento',          category: 'strumento_speciale', weight: 1.5, cost: '25 PO', note: 'Competenza: creare travestimenti convincenti', icon: 'domino-mask' },
  { key: 'kit_forgery',         name: 'Kit da Falsario',               category: 'strumento_speciale', weight: 2.5, cost: '15 PO', note: 'Competenza: imitare sigilli e replicare documenti', icon: 'stamper' },
  { key: 'kit_herbalism',       name: 'Kit da Erborista',              category: 'strumento_speciale', weight: 1.5, cost: '5 PO',  note: 'Competenza: identificare piante, creare antidoti e pozioni curative', icon: 'herbs-bundle' },
  { key: 'kit_poisoner',        name: 'Kit da Avvelenatore',           category: 'strumento_speciale', weight: 1,   cost: '50 PO', note: 'Competenza: creare e applicare veleni in sicurezza', icon: 'poison-bottle' },
  { key: 'tools_thieves',       name: 'Strumenti da Ladro',            category: 'strumento_speciale', weight: 0.5, cost: '25 PO', note: 'Competenza: scassinare serrature e disinnescare trappole', icon: 'lockpicks' },
];

// ─── Set da Gioco ─────────────────────────────────────────────────────────────

const GAMING_SETS: SrdGearItem[] = [
  { key: 'game_dice',           name: 'Set di Dadi',                   category: 'gioco',         weight: 0,    cost: '1 PA',   note: 'Giochi di dadi; competenza: baro o giocatore professionista', icon: 'dice-twenty-faces-twenty' },
  { key: 'game_dragonchess',    name: 'Set di Dragonscacchi',          category: 'gioco',         weight: 0.25, cost: '1 PO',   note: 'Variante fantasy degli scacchi con draghi e cavalieri', icon: 'dragon-head' },
  { key: 'game_cards',          name: 'Mazzo di Carte',                category: 'gioco',         weight: 0,    cost: '5 PA',   note: 'Giochi di carte standard; competenza: bluffing e gioco d\'azzardo', icon: 'card-ace-spades' },
  { key: 'game_3dragon_ante',   name: 'Set Tre Draghi Ante',           category: 'gioco',         weight: 0,    cost: '1 PO',   note: 'Gioco di carte D&D famoso nelle taverne; puntata con monete', icon: 'card-king-spades' },
];

// ─── Strumenti Musicali ───────────────────────────────────────────────────────

const INSTRUMENTS: SrdGearItem[] = [
  { key: 'bagpipes',            name: 'Cornamusa',                     category: 'strumento_musicale', weight: 3,  cost: '30 PO',  note: 'Strumento a fiato con sacca d\'aria e canne, tipico delle tradizioni popolari', icon: 'bagpipes' },
  { key: 'drum',                name: 'Tamburo',                       category: 'strumento_musicale', weight: 1.5, cost: '6 PO',  note: 'Strumento a percussione a membrana tesa', icon: 'drum' },
  { key: 'dulcimer',            name: 'Salterio',                      category: 'strumento_musicale', weight: 5,  cost: '25 PO',  note: 'Strumento a corde percosse con piccoli martelletti', icon: 'harp' },
  { key: 'flute',               name: 'Flauto',                        category: 'strumento_musicale', weight: 0.5, cost: '2 PO',  note: 'Strumento a fiato in legno o metallo', icon: 'flute' },
  { key: 'hand_drum',           name: 'Tamburello',                    category: 'strumento_musicale', weight: 0.5, cost: '6 PO',  note: 'Piccolo tamburo a mano, spesso con sonagli', icon: 'tambourine' },
  { key: 'horn',                name: 'Corno',                         category: 'strumento_musicale', weight: 1,  cost: '3 PO',   note: 'Strumento a fiato ricavato da un corno animale o lavorato in metallo', icon: 'trumpet' },
  { key: 'lute',                name: 'Liuto',                         category: 'strumento_musicale', weight: 1,  cost: '35 PO',  note: 'Strumento a corde pizzicate con cassa a forma di pera', icon: 'guitar' },
  { key: 'lyre',                name: 'Lira',                          category: 'strumento_musicale', weight: 1,  cost: '30 PO',  note: 'Antico strumento a corde pizzicate a forma di U', icon: 'lyre' },
  { key: 'pan_flute',           name: 'Flauto di Pan',                 category: 'strumento_musicale', weight: 1,  cost: '12 PO',  note: 'Strumento a fiato composto da più canne di lunghezza diversa', icon: 'pan-flute' },
  { key: 'shawm',               name: 'Scalmeia',                      category: 'strumento_musicale', weight: 0.5, cost: '2 PO',  note: 'Antico strumento a fiato dal suono penetrante, antenato dell\'oboe', icon: 'banjo' },
  { key: 'viol',                name: 'Viola',                         category: 'strumento_musicale', weight: 0.5, cost: '30 PO', note: 'Strumento a corde suonato con un archetto', icon: 'viola' },
];

// ─── Cavalcature ──────────────────────────────────────────────────────────────

const MOUNTS: SrdGearItem[] = [
  { key: 'camel',               name: 'Cammello',                      category: 'cavalcatura',   weight: 0,    cost: '50 PO',  note: 'Vel. 15 m; CA 9; 15 PF; Forza 16; terreno desertico', icon: 'camel' },
  { key: 'donkey',              name: 'Asino/Mulo',                    category: 'cavalcatura',   weight: 0,    cost: '8 PO',   note: 'Vel. 12 m; CA 10; 11 PF; Forza 14; soma paziente', icon: 'donkey' },
  { key: 'elephant',            name: 'Elefante',                      category: 'cavalcatura',   weight: 0,    cost: '200 PO', note: 'Vel. 12 m; CA 12; 76 PF; Forza 22; calpesta (2d12 + 7)', icon: 'elephant' },
  { key: 'horse_draft',         name: 'Cavallo da Tiro',               category: 'cavalcatura',   weight: 0,    cost: '50 PO',  note: 'Vel. 12 m; CA 10; 19 PF; Forza 18; soma pesante', icon: 'horse-head' },
  { key: 'horse_riding',        name: 'Cavallo da Sella',              category: 'cavalcatura',   weight: 0,    cost: '75 PO',  note: 'Vel. 18 m; CA 10; 13 PF; Forza 16', icon: 'horse-head' },
  { key: 'mastiff',             name: 'Mastino',                       category: 'cavalcatura',   weight: 0,    cost: '25 PO',  note: 'Vel. 12 m; CA 12; 5 PF; Forza 13; buon cane guardia/accompagnatore', icon: 'wolf-head' },
  { key: 'pony',                name: 'Pony',                          category: 'cavalcatura',   weight: 0,    cost: '30 PO',  note: 'Vel. 12 m; CA 10; 11 PF; Forza 15; adatto ai piccoli', icon: 'horse-head' },
  { key: 'warhorse',            name: 'Destriero',                     category: 'cavalcatura',   weight: 0,    cost: '400 PO', note: 'Vel. 18 m; CA 11; 19 PF; Forza 18; addestrato al combattimento', icon: 'horse-head' },
  { key: 'riding_dog',          name: 'Cane da Sella',                 category: 'cavalcatura',   weight: 0,    cost: '25 PO',  note: 'Vel. 12 m; CA 12; 5 PF; Forza 13; per piccole creature', icon: 'wolf-head' },
];

// ─── Finimenti e Bardature ────────────────────────────────────────────────────

const TACK_HARNESS: SrdGearItem[] = [
  { key: 'barding',             name: 'Bardatura (armatura per bestia)', category: 'bardatura',  weight: 0,    cost: 'var.',   note: 'Quadruplica costo e peso dell\'armatura corrispondente', icon: 'armor-vest' },
  { key: 'bit_bridle',          name: 'Morso e Briglie',                category: 'bardatura',   weight: 0.25, cost: '2 PO',   note: 'Imboccatura e cinghie per guidare una cavalcatura', icon: 'horseshoe' },
  { key: 'saddle_exotic',       name: 'Sella Esotica',                  category: 'bardatura',   weight: 20,   cost: '60 PO',  note: 'Per cavalcature volanti o acquatiche; non si cade automaticamente', icon: 'saddle' },
  { key: 'saddle_military',     name: 'Sella Militare',                 category: 'bardatura',   weight: 15,   cost: '20 PO',  note: 'Vantaggio ai tiri per non essere disarcionati', icon: 'saddle' },
  { key: 'saddle_pack',         name: 'Sella da Soma',                  category: 'bardatura',   weight: 7.5,  cost: '5 PO',   note: 'Sella pensata per il trasporto di carichi piuttosto che per cavalcare', icon: 'saddle' },
  { key: 'saddle_riding',       name: 'Sella da Equitazione',           category: 'bardatura',   weight: 11,   cost: '10 PO',  note: 'Sella standard per cavalcare comodamente', icon: 'saddle' },
  { key: 'saddlebags',          name: 'Bisacce',                        category: 'bardatura',   weight: 4,    cost: '4 PO',   note: 'Capacità: 15 kg / lato', icon: 'knapsack' },
  { key: 'stabling_day',        name: 'Stalla (per giorno)',            category: 'bardatura',   weight: 0,    cost: '5 PA',   note: 'Affitto di una stalla per il riposo di una cavalcatura per un giorno', icon: 'dog-house' },
  { key: 'feed_day',            name: 'Foraggio (per giorno)',          category: 'bardatura',   weight: 5,    cost: '5 PR',   note: 'Razione di foraggio per nutrire una cavalcatura per un giorno', icon: 'herbs-bundle' },
];

// ─── Veicoli ──────────────────────────────────────────────────────────────────

const VEHICLES: SrdGearItem[] = [
  // Terrestri
  { key: 'cart',                name: 'Carro',                          category: 'veicolo',      weight: 90,   cost: '15 PO',  note: 'Vel. 18 m (un cavallo); capacità 270 kg', icon: 'old-wagon' },
  { key: 'carriage',            name: 'Carrozza',                       category: 'veicolo',      weight: 270,  cost: '100 PO', note: 'Vel. 18 m (due cavalli); passeggeri 4', icon: 'old-wagon' },
  { key: 'chariot',             name: 'Carro da Guerra',                category: 'veicolo',      weight: 45,   cost: '250 PO', note: 'Vel. 24 m (due cavalli); CA 13; 50 PF', icon: 'chariot' },
  { key: 'sled',                name: 'Slitta',                         category: 'veicolo',      weight: 135,  cost: '20 PO',  note: 'Su neve/ghiaccio con bestie da soma', icon: 'old-wagon' },
  { key: 'wagon',               name: 'Carro Merci',                    category: 'veicolo',      weight: 360,  cost: '35 PO',  note: 'Vel. 18 m (quattro cavalli); capacità 1.350 kg', icon: 'old-wagon' },
  // Navali
  { key: 'rowboat',             name: 'Barca a Remi',                   category: 'veicolo',      weight: 0,    cost: '50 PO',  note: 'Vel. 1,5 km/h; remi; 2–3 persone', icon: 'paper-boat' },
  { key: 'keelboat',            name: 'Barca a Chiglia',                category: 'veicolo',      weight: 0,    cost: '3.000 PO', note: 'Vel. 2,4 km/h (remi) o 4,8 km/h (vela); 6 rematori', icon: 'sailboat' },
  { key: 'longship',            name: 'Drakkar',                        category: 'veicolo',      weight: 0,    cost: '10.000 PO', note: 'Vel. 4,8 km/h; 40 rematori; CA 15; 300 PF', icon: 'galley' },
  { key: 'sailing_ship',        name: 'Nave a Vela',                    category: 'veicolo',      weight: 0,    cost: '10.000 PO', note: 'Vel. 6,4 km/h; equipaggio 20; CA 15; 300 PF', icon: 'cargo-ship' },
  { key: 'galley',              name: 'Galea',                          category: 'veicolo',      weight: 0,    cost: '30.000 PO', note: 'Vel. 4,8 km/h; 80 rematori; CA 15; 500 PF', icon: 'galley' },
  { key: 'warship',             name: 'Nave da Guerra',                 category: 'veicolo',      weight: 0,    cost: '25.000 PO', note: 'Vel. 4,8 km/h; equipaggio 60; CA 15; 500 PF; catapulte', icon: 'battleship' },
];

// ─── Consumabili: Cibo e Bevande ──────────────────────────────────────────────

const FOOD_DRINK: SrdGearItem[] = [
  // Cibo
  { key: 'rations_day',         name: 'Razioni (1 giorno)',            category: 'consumabile',   weight: 1,    cost: '5 PA',   note: 'Carne secca, gallette, formaggio; 1 giorno di nutrimento', icon: 'meat-hook' },
  { key: 'bread_loaf',          name: 'Pane (pagnotta)',               category: 'consumabile',   weight: 0.5,  cost: '2 PR',   note: 'Una pagnotta di pane fresco', icon: 'wheat' },
  { key: 'cheese_hunk',         name: 'Formaggio (pezzo)',             category: 'consumabile',   weight: 0.25, cost: '1 PA',   note: 'Un pezzo di formaggio stagionato', icon: 'cheese-wedge' },
  { key: 'meat_chunk',          name: 'Carne (porzione)',              category: 'consumabile',   weight: 0.5,  cost: '3 PA',   note: 'Una porzione di carne, fresca o conservata', icon: 'meat' },
  { key: 'chicken_whole',       name: 'Pollo Intero',                  category: 'consumabile',   weight: 1,    cost: '2 PA',   note: 'Un pollo intero, crudo o cucinato', icon: 'chicken' },
  // Bevande
  { key: 'ale_gallon',          name: 'Birra (gallone)',               category: 'consumabile',   weight: 4,    cost: '2 PA',   note: 'Una damigiana di birra, circa 4,5 litri', icon: 'beer-stein' },
  { key: 'ale_mug',             name: 'Birra (boccale)',               category: 'consumabile',   weight: 0.5,  cost: '4 PR',   note: 'Un boccale di birra', icon: 'beer-stein' },
  { key: 'cider_gallon',        name: 'Sidro (gallone)',               category: 'consumabile',   weight: 4,    cost: '2 PA',   note: 'Una damigiana di sidro, circa 4,5 litri', icon: 'wine-bottle' },
  { key: 'wine_common',         name: 'Vino Comune (brocca)',          category: 'consumabile',   weight: 2,    cost: '2 PA',   note: 'Una brocca di vino di qualità modesta', icon: 'wine-bottle' },
  { key: 'wine_fine',           name: 'Vino Pregiato (bottiglia)',     category: 'consumabile',   weight: 1,    cost: '10 PO',  note: 'Una bottiglia di vino di alta qualità', icon: 'wine-bottle' },
  { key: 'banquet_person',      name: 'Banchetto (a persona)',         category: 'consumabile',   weight: 0,    cost: '10 PO',  note: 'Pasto sontuoso per una persona, adatto a celebrazioni e cerimonie', icon: 'roast-chicken' },
  // Pasti per stile di vita
  { key: 'meal_squalid',        name: 'Pasto Squalido',                category: 'consumabile',   weight: 0.5,  cost: '3 PR',   note: 'Stile di vita squalido', icon: 'meat-hook' },
  { key: 'meal_poor',           name: 'Pasto Povero',                  category: 'consumabile',   weight: 0.5,  cost: '6 PR',   note: 'Stile di vita povero', icon: 'meat-hook' },
  { key: 'meal_modest',         name: 'Pasto Modesto',                 category: 'consumabile',   weight: 0.5,  cost: '3 PA',   note: 'Stile di vita modesto', icon: 'cooking-pot' },
  { key: 'meal_comfortable',    name: 'Pasto Confortevole',            category: 'consumabile',   weight: 0.5,  cost: '5 PA',   note: 'Stile di vita confortevole', icon: 'cooking-pot' },
  { key: 'meal_wealthy',        name: 'Pasto Benestante',              category: 'consumabile',   weight: 0.5,  cost: '8 PA',   note: 'Stile di vita benestante', icon: 'roast-chicken' },
  { key: 'meal_aristocratic',   name: 'Pasto Aristocratico',           category: 'consumabile',   weight: 0.5,  cost: '2 PO',   note: 'Stile di vita aristocratico', icon: 'roast-chicken' },
];

// ─── Merci da Commercio ───────────────────────────────────────────────────────

const TRADE_GOODS: SrdGearItem[] = [
  { key: 'goods_wheat',         name: 'Grano (0,5 kg)',               category: 'merce',         weight: 0.5,  cost: '1 PR',  note: 'Materia prima per la panificazione', icon: 'wheat' },
  { key: 'goods_flour',         name: 'Farina (0,5 kg)',              category: 'merce',         weight: 0.5,  cost: '2 PR',  note: 'Farina macinata', icon: 'wheat' },
  { key: 'goods_salt',          name: 'Sale (0,5 kg)',                category: 'merce',         weight: 0.5,  cost: '5 PR',  note: 'Merce preziosa per la conservazione del cibo', icon: 'powder' },
  { key: 'goods_iron',          name: 'Ferro (0,5 kg)',               category: 'merce',         weight: 0.5,  cost: '1 PA',  note: 'Ferro grezzo o lavorato', icon: 'metal-bar' },
  { key: 'goods_canvas',        name: 'Tela (0,09 m²)',               category: 'merce',         weight: 0.25, cost: '1 PA',  note: 'Tela grezza, usata per vele, tende e sacchi', icon: 'rolled-cloth' },
  { key: 'goods_cotton',        name: 'Cotone (0,09 m²)',             category: 'merce',         weight: 0.25, cost: '5 PA',  note: 'Stoffa di cotone', icon: 'rolled-cloth' },
  { key: 'goods_ginger',        name: 'Zenzero (0,5 kg)',             category: 'merce',         weight: 0.5,  cost: '1 PO',  note: 'Radice di zenzero, spezia pregiata', icon: 'herbs-bundle' },
  { key: 'goods_cinnamon',      name: 'Cannella (0,5 kg)',            category: 'merce',         weight: 0.5,  cost: '2 PO',  note: 'Spezia aromatica di valore', icon: 'herbs-bundle' },
  { key: 'goods_pepper',        name: 'Pepe (0,5 kg)',                category: 'merce',         weight: 0.5,  cost: '2 PO',  note: 'Una delle spezie più richieste nel commercio', icon: 'herbs-bundle' },
  { key: 'goods_cloves',        name: 'Chiodi di Garofano (0,5 kg)', category: 'merce',         weight: 0.5,  cost: '3 PO',  note: 'Spezia rara e costosa', icon: 'herbs-bundle' },
  { key: 'goods_saffron',       name: 'Zafferano (0,5 kg)',           category: 'merce',         weight: 0.5,  cost: '15 PO', note: 'Una delle spezie più rare e preziose', icon: 'herbs-bundle' },
  { key: 'goods_silk',          name: 'Seta (0,09 m²)',               category: 'merce',         weight: 0.1,  cost: '10 PO', note: 'Stoffa di seta, materiale di lusso', icon: 'rolled-cloth' },
  { key: 'goods_silver',        name: 'Argento (0,5 kg)',             category: 'merce',         weight: 0.5,  cost: '5 PO',  note: 'Argento grezzo', icon: 'metal-bar' },
  { key: 'goods_porcelain',     name: 'Porcellana (0,5 kg)',          category: 'merce',         weight: 0.5,  cost: '5 PO',  note: 'Porcellana finemente lavorata', icon: 'jug' },
  { key: 'goods_glass',         name: 'Vetro (0,5 kg)',               category: 'merce',         weight: 0.5,  cost: '5 PO',  note: 'Vetro lavorato o grezzo', icon: 'water-bottle' },
  { key: 'goods_fur',           name: 'Pelliccia pregiata',           category: 'merce',         weight: 0.5,  cost: '5 PO',  note: 'Pelliccia di animale pregiato, ricercata dai mercanti di tessuti', icon: 'animal-hide' },
  { key: 'goods_ivory',         name: 'Avorio (0,5 kg)',              category: 'merce',         weight: 0.5,  cost: '10 PO', note: 'Materiale raro usato per intagli e ornamenti', icon: 'ivory-tusks' },
  { key: 'goods_gold',          name: 'Oro (0,5 kg)',                 category: 'merce',         weight: 0.5,  cost: '50 PO', note: 'Oro grezzo', icon: 'gold-bar' },
  { key: 'goods_platinum',      name: 'Platino (0,5 kg)',             category: 'merce',         weight: 0.5,  cost: '500 PO', note: 'Tra i metalli più preziosi', icon: 'metal-bar' },
];

// ─── Export Principale ────────────────────────────────────────────────────────

export const GEAR_ITEMS: SrdGearItem[] = [
  ...ADVENTURING_GEAR,
  ...CONTAINERS,
  ...CLOTHING,
  ...FOCUSES,
  ...MUNDANE_AMMO,
  ...ARTISAN_TOOLS,
  ...SPECIAL_TOOLS,
  ...GAMING_SETS,
  ...INSTRUMENTS,
  ...MOUNTS,
  ...TACK_HARNESS,
  ...VEHICLES,
  ...FOOD_DRINK,
  ...TRADE_GOODS,
];

// ─── Helper ───────────────────────────────────────────────────────────────────

export function findGearItem(key: string): SrdGearItem | undefined {
  return GEAR_ITEMS.find(i => i.key === key);
}

/** Cerca un oggetto comune per chiave SRD, poi per nome (case-insensitive). */
export function findGearItemByKeyOrName(item: { srdKey?: string; name: string }): SrdGearItem | undefined {
  return GEAR_ITEMS.find(i => i.key === item.srdKey || i.name.toLowerCase() === item.name.toLowerCase());
}

export function getGearByCategory(category: GearCategory): SrdGearItem[] {
  return GEAR_ITEMS.filter(i => i.category === category);
}

export const GEAR_CAT_IT: Record<GearCategory, string> = {
  attrezzatura:        'Attrezzatura',
  contenitore:         'Contenitore',
  abbigliamento:       'Abbigliamento',
  focus:               'Focus Magico',
  munizioni_mundane:   'Munizioni',
  strumento_artigiano: 'Attrezzi Artigiano',
  strumento_speciale:  'Strumento Speciale',
  gioco:               'Gioco',
  strumento_musicale:  'Strumento Musicale',
  cavalcatura:         'Cavalcatura',
  bardatura:           'Finimenti',
  veicolo:             'Veicolo',
  consumabile:         'Consumabile',
  merce:               'Merce',
};

export const GEAR_CAT_ICON: Record<GearCategory, string> = {
  attrezzatura:        '🎒',
  contenitore:         '📦',
  abbigliamento:       '👕',
  focus:               '🔮',
  munizioni_mundane:   '🏹',
  strumento_artigiano: '🔧',
  strumento_speciale:  '🛠️',
  gioco:               '🎲',
  strumento_musicale:  '🎵',
  cavalcatura:         '🐴',
  bardatura:           '⛓️',
  veicolo:             '⛵',
  consumabile:         '🍺',
  merce:               '💰',
};

// Mappa la categoria SRD alla categoria della modale equipaggiamento
export function gearCatToModalCat(category: GearCategory): string {
  switch (category) {
    case 'strumento_artigiano':
    case 'strumento_speciale':
    case 'gioco':
    case 'strumento_musicale':
      return 'Strumento';
    case 'cavalcatura':
    case 'bardatura':
    case 'veicolo':
      return 'Cavalcatura';
    case 'consumabile':
    case 'merce':
      return 'Consumabile';
    default:
      return 'Comune';
  }
}
