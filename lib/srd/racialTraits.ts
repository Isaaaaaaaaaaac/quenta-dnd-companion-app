export type ChoiceType =
  | 'stat_bonus'          // scegliere quali caratteristiche ottengono +N
  | 'skill_proficiency'   // scegliere competenze nelle abilità
  | 'language'            // scegliere lingue extra
  | 'weapon_proficiency'  // scegliere competenze nelle armi
  | 'cantrip'             // scegliere un trucchetto
  | 'feat'                // scegliere un talento
  | 'tool_proficiency';   // scegliere una competenza negli strumenti

export interface TraitChoice {
  type: ChoiceType;
  count: number;           // quante opzioni scegliere
  options?: string[];      // se insieme limitato di opzioni (vuoto = qualsiasi)
  statAmount?: number;     // per stat_bonus: entità del bonus (+1 predefinito)
  excludeStats?: string[]; // per stat_bonus: caratteristiche escluse dalla scelta (es. ['cha'] per mezzelfo)
}

export interface RacialTraitFull {
  key: string;            // snake_case, corrisponde alla stringa in races.ts traits[]
  name: string;           // Nome in italiano
  description: string;    // Descrizione meccanica completa SRD in italiano
  choice?: TraitChoice;   // se il giocatore deve compiere una scelta per questo tratto
  subraceOnly?: string[]; // se valido solo per specifiche sottorazza (chiavi sottorazza)
}

export interface RaceTrait {
  raceKey: string;
  traits: RacialTraitFull[];
}

export const RACIAL_TRAITS: RaceTrait[] = [
  // ─────────────────────────────────────────────────────────────────
  // UMANO
  // ─────────────────────────────────────────────────────────────────
  {
    raceKey: 'human',
    traits: [
      {
        key: 'versatilità_delle_lingue',
        name: 'Versatilità delle Lingue',
        description:
          'Parli, leggi e scrivi il Comune e una lingua aggiuntiva a tua scelta. ' +
          'Gli umani tipicamente imparano le lingue dei popoli con cui hanno a che fare, ' +
          'inclusi dialetti oscuri. Sono noti per la loro grande capacità di imparare ' +
          'le lingue degli altri popoli, dal Nanico al Gigante.',
        choice: {
          type: 'language',
          count: 1,
          options: [],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // UMANO (VARIANTE)
  // ─────────────────────────────────────────────────────────────────
  {
    raceKey: 'human_variant',
    traits: [
      {
        key: 'competenza_(1_abilità_a_scelta)',
        name: 'Competenza (1 abilità a scelta)',
        description:
          'Ottieni competenza in un\'abilità a tua scelta.',
        choice: {
          type: 'skill_proficiency',
          count: 1,
          options: [],
        },
      },
      {
        key: 'talento_(1_talento_a_scelta)',
        name: 'Talento (1 Talento a Scelta)',
        description:
          'Ottieni un talento a tua scelta. I talenti sono funzionalità speciali ' +
          'che non rientrano in una normale categoria di classi e razze, ' +
          'rappresentando la formazione, le esperienze e le capacità oltre quelle ' +
          'conferite dalla classe.',
        choice: {
          type: 'feat',
          count: 1,
          options: [],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // ELFO  (include tratti di Alto Elfo, Elfo del Bosco, Drow)
  // ─────────────────────────────────────────────────────────────────
  {
    raceKey: 'elf',
    traits: [
      {
        key: 'visione_nel_buio',
        name: 'Visione nel Buio',
        description:
          'Abituato ai boschi ombrosi degli elfi e al cielo notturno, possiedi ' +
          'una visione superiore nel buio e nella luce fioca. Entro 18 metri puoi ' +
          'vedere in luce fioca come se fosse piena luce, e nell\'oscurità come se ' +
          'fosse luce fioca. Non puoi distinguere i colori nell\'oscurità, ' +
          'solo le sfumature di grigio.',
      },
      {
        key: 'sensi_acuti',
        name: 'Sensi Acuti',
        description:
          'Sei competente nell\'abilità Percezione.',
      },
      {
        key: 'discendenza_fatata',
        name: 'Discendenza Fatata',
        description:
          'Hai vantaggio ai tiri salvezza contro gli effetti di ammaliamento ' +
          'e la magia non può farti addormentare.',
      },
      {
        key: 'trance',
        name: 'Trance',
        description:
          'Gli elfi non hanno bisogno di dormire. Invece, meditano in uno stato ' +
          'di semicoscienza per 4 ore al giorno. (La parola comune per questa ' +
          'meditazione è "trance".) Quando mediti in questo modo, puoi sognare ' +
          'a modo tuo; tali sogni sono in realtà esercizi mentali che si sono ' +
          'evoluti attraverso anni di pratica. Dopo il riposo in questo modo ' +
          'ottieni lo stesso beneficio che un umano riceve da 8 ore di sonno.',
      },
      // ── Alto Elfo ──────────────────────────────────────────────
      {
        key: 'trucchetto_da_mago',
        name: 'Trucchetto da Mago',
        description:
          'Conosci un trucchetto a tua scelta dalla lista degli incantesimi del ' +
          'mago. L\'Intelligenza è la tua caratteristica da incantatore per ' +
          'questo trucchetto.',
        choice: {
          type: 'cantrip',
          count: 1,
          options: [],
        },
        subraceOnly: ['high_elf'],
      },
      {
        key: 'addestramento_con_le_armi_degli_elfi',
        name: 'Addestramento con le Armi degli Elfi',
        description:
          'Sei competente nella spada corta, nella spada lunga, nell\'arco corto ' +
          'e nell\'arco lungo.',
        subraceOnly: ['high_elf', 'wood_elf'],
      },
      // ── Elfo del Bosco ─────────────────────────────────────────
      {
        key: 'maschera_della_natura_selvaggia',
        name: 'Maschera della Natura Selvaggia',
        description:
          'Puoi tentare di nasconderti anche quando sei solo leggermente ' +
          'oscurato da fogliame, pioggia intensa, neve che cade, nebbia e altri ' +
          'fenomeni naturali.',
        subraceOnly: ['wood_elf'],
      },
      // ── Drow ───────────────────────────────────────────────────
      {
        key: 'visione_nel_buio_superiore',
        name: 'Visione nel Buio Superiore',
        description:
          'La tua visione nel buio ha un raggio di 36 metri invece di 18.',
        subraceOnly: ['dark_elf'],
      },
      {
        key: 'magia_drow',
        name: 'Magia Drow',
        description:
          'Conosci il trucchetto luci danzanti. Quando raggiungi il 3° livello, ' +
          'puoi lanciare l\'incantesimo fata fuoco una volta con questo tratto e ' +
          'recuperare la capacità di farlo dopo un riposo lungo. Quando raggiungi ' +
          'il 5° livello, puoi anche lanciare oscurità una volta con questo tratto ' +
          'e recuperare la capacità di farlo dopo un riposo lungo. Il Carisma è ' +
          'la tua caratteristica da incantatore per questi incantesimi.',
        subraceOnly: ['dark_elf'],
      },
      {
        key: 'sensibilità_alla_luce_del_sole',
        name: 'Sensibilità alla Luce del Sole',
        description:
          'Hai svantaggio ai tiri per colpire e alle prove di Saggezza ' +
          '(Percezione) che si basano sulla vista quando tu o il bersaglio ' +
          'che stai attaccando siete esposti alla luce solare diretta.',
        subraceOnly: ['dark_elf'],
      },
      {
        key: 'addestramento_con_le_armi_drow',
        name: 'Addestramento con le Armi Drow',
        description:
          'Sei competente nella rapiera, nella spada corta e nelle balestre a mano.',
        subraceOnly: ['dark_elf'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // NANO  (include Nano delle Colline, Nano delle Montagne)
  // ─────────────────────────────────────────────────────────────────
  {
    raceKey: 'dwarf',
    traits: [
      {
        key: 'visione_nel_buio',
        name: 'Visione nel Buio',
        description:
          'Abituato alla vita sotterranea, possiedi una visione superiore ' +
          'nel buio e nella luce fioca. Entro 18 metri puoi vedere in luce ' +
          'fioca come se fosse piena luce, e nell\'oscurità come se fosse ' +
          'luce fioca. Non puoi distinguere i colori nell\'oscurità, ' +
          'solo le sfumature di grigio.',
      },
      {
        key: 'resilienza_nanica',
        name: 'Resilienza Nanica',
        description:
          'Hai vantaggio ai tiri salvezza contro il veleno e hai resistenza ' +
          'ai danni da veleno.',
      },
      {
        key: 'addestramento_con_le_armi_naniche',
        name: 'Addestramento con le Armi Naniche',
        description:
          'Sei competente nell\'ascia, nell\'ascia da battaglia, nel ' +
          'martello leggero e nel martello da guerra.',
      },
      {
        key: 'conoscenza_della_pietra',
        name: 'Conoscenza della Pietra',
        description:
          'Ogni volta che fai una prova di Intelligenza (Storia) relativa ' +
          'all\'origine di un\'opera in pietra, sei considerato competente ' +
          'nell\'abilità Storia e aggiungi il doppio del tuo bonus di ' +
          'competenza alla prova, invece che il normale bonus di competenza. ' +
          'Inoltre, sei competente negli strumenti da muratore.',
      },
      // ── Nano delle Colline ──────────────────────────────────────
      {
        key: 'tenacia_nanica_(+1_hp_per_livello)',
        name: 'Tenacia Nanica',
        description:
          'Il tuo massimo di punti ferita aumenta di 1 e aumenta di ' +
          'ulteriore 1 ogni volta che guadagni un livello.',
        subraceOnly: ['hill_dwarf'],
      },
      // ── Nano delle Montagne ─────────────────────────────────────
      {
        key: 'addestramento_con_le_armature_naniche',
        name: 'Addestramento con le Armature Naniche',
        description:
          'Sei competente nelle armature leggere e medie.',
        subraceOnly: ['mountain_dwarf'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // HALFLING  (include Piede Lesto, Tarchiato)
  // ─────────────────────────────────────────────────────────────────
  {
    raceKey: 'halfling',
    traits: [
      {
        key: 'fortunato',
        name: 'Fortunato',
        description:
          'Quando ottieni un 1 naturale su un tiro per colpire, una prova ' +
          'di caratteristica o un tiro salvezza, puoi ritirare il dado e ' +
          'devi usare il nuovo risultato.',
      },
      {
        key: 'coraggioso',
        name: 'Coraggioso',
        description:
          'Hai vantaggio ai tiri salvezza contro la paura.',
      },
      {
        key: 'agilità_halfling',
        name: 'Agilità Halfling',
        description:
          'Puoi muoverti attraverso lo spazio di qualsiasi creatura di taglia ' +
          'superiore alla tua.',
      },
      // ── Piede Lesto ─────────────────────────────────────────────
      {
        key: 'naturalmente_furtivo',
        name: 'Naturalmente Furtivo',
        description:
          'Puoi tentare di nasconderti anche quando sei oscurato solo da ' +
          'una creatura di taglia Media o superiore.',
        subraceOnly: ['lightfoot'],
      },
      // ── Tarchiato ───────────────────────────────────────────────
      {
        key: 'resilienza_tarchiata',
        name: 'Resilienza Tarchiata',
        description:
          'Hai vantaggio ai tiri salvezza contro il veleno e hai resistenza ' +
          'ai danni da veleno.',
        subraceOnly: ['stout'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // MEZZELFO
  // ─────────────────────────────────────────────────────────────────
  {
    raceKey: 'half_elf',
    traits: [
      {
        key: 'bonus_+1_a_due_caratteristiche_a_scelta',
        name: 'Bonus +1 a Due Caratteristiche a Scelta',
        description:
          'Il punteggio di due caratteristiche a tua scelta, diverse dal ' +
          'Carisma, aumenta di 1.',
        choice: {
          type: 'stat_bonus',
          count: 2,
          statAmount: 1,
          excludeStats: ['cha'],
        },
      },
      {
        key: 'visione_nel_buio',
        name: 'Visione nel Buio',
        description:
          'Grazie al tuo sangue elfico, possiedi una visione superiore nel ' +
          'buio e nella luce fioca. Entro 18 metri puoi vedere in luce fioca ' +
          'come se fosse piena luce, e nell\'oscurità come se fosse luce fioca. ' +
          'Non puoi distinguere i colori nell\'oscurità, solo le sfumature di grigio.',
      },
      {
        key: 'resistenza_fatata',
        name: 'Resistenza Fatata',
        description:
          'Hai vantaggio ai tiri salvezza contro gli effetti di ammaliamento ' +
          'e la magia non può farti addormentare.',
      },
      {
        key: 'poliedricità_(2_abilità_a_scelta)',
        name: 'Poliedricità (2 Abilità a Scelta)',
        description:
          'Ottieni competenza in due abilità a tua scelta.',
        choice: {
          type: 'skill_proficiency',
          count: 2,
          options: [],
        },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // MEZZORCO
  // ─────────────────────────────────────────────────────────────────
  {
    raceKey: 'half_orc',
    traits: [
      {
        key: 'visione_nel_buio',
        name: 'Visione nel Buio',
        description:
          'Grazie al tuo sangue orchesco, possiedi una visione superiore ' +
          'nel buio e nella luce fioca. Entro 18 metri puoi vedere in luce ' +
          'fioca come se fosse piena luce, e nell\'oscurità come se fosse ' +
          'luce fioca. Non puoi distinguere i colori nell\'oscurità, ' +
          'solo le sfumature di grigio.',
      },
      {
        key: 'minaccioso',
        name: 'Minaccioso',
        description:
          'Sei competente nell\'abilità Intimidazione.',
      },
      {
        key: 'resistenza_implacabile',
        name: 'Resistenza Implacabile',
        description:
          'Quando i danni ti ridurrebbero a 0 punti ferita, puoi invece ' +
          'scendere a 1 punto ferita. Non puoi usare di nuovo questo tratto ' +
          'finché non completi un riposo lungo.',
      },
      {
        key: 'attacchi_selvaggi',
        name: 'Attacchi Selvaggi',
        description:
          'Quando ottieni un colpo critico con un\'arma da mischia, puoi ' +
          'tirare uno dei dadi dei danni dell\'arma un\'altra volta e ' +
          'aggiungere il risultato ai danni extra del colpo critico.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // DRACONICO
  // ─────────────────────────────────────────────────────────────────
  {
    raceKey: 'dragonborn',
    traits: [
      {
        key: 'ascendenza_draconica',
        name: 'Ascendenza Draconica',
        description:
          'Hai discendenza draconica da uno specifico tipo di drago. ' +
          'Scegli un tipo di drago dalla tabella seguente. Il tipo scelto ' +
          'determina il tipo di danno del tuo soffio dragonico e il tipo ' +
          'di resistenza ai danni che ottieni.\n\n' +
          'Nero: Acido (linea 1,5 m × 9 m, TS Des) | ' +
          'Blu: Fulmine (linea 1,5 m × 9 m, TS Des) | ' +
          'Ottone: Fuoco (linea 1,5 m × 9 m, TS Des) | ' +
          'Bronzo: Fulmine (linea 1,5 m × 9 m, TS Des) | ' +
          'Rame: Acido (linea 1,5 m × 9 m, TS Des) | ' +
          'Oro: Fuoco (cono 4,5 m, TS Des) | ' +
          'Verde: Veleno (cono 4,5 m, TS Cos) | ' +
          'Rosso: Fuoco (cono 4,5 m, TS Des) | ' +
          'Argento: Freddo (cono 4,5 m, TS Cos) | ' +
          'Bianco: Freddo (cono 4,5 m, TS Cos)',
        choice: {
          type: 'stat_bonus',
          count: 1,
          options: [
            'nero',
            'blu',
            'ottone',
            'bronzo',
            'rame',
            'oro',
            'verde',
            'rosso',
            'argento',
            'bianco',
          ],
        },
      },
      {
        key: 'soffio_dragonico',
        name: 'Soffio Dragonico',
        description:
          'Puoi usare la tua azione per esalare energia distruttiva. ' +
          'La forma del soffio e il tipo di danno sono determinati dalla ' +
          'tua ascendenza draconica.\n\n' +
          'Quando usi il tuo soffio dragonico, tutte le creature nell\'area ' +
          'del soffio devono effettuare un tiro salvezza, il cui tipo è ' +
          'determinato dalla tua ascendenza draconica. La CD per il tiro ' +
          'salvezza è pari a 8 + il tuo modificatore di Costituzione + ' +
          'il tuo bonus di competenza. Una creatura subisce 2d6 danni di ' +
          'successo, o la metà in caso di successo. I danni aumentano a ' +
          '3d6 al 6° livello, 4d6 all\'11° livello e 5d6 al 16° livello.\n\n' +
          'Dopo aver usato il tuo soffio dragonico, non puoi usarlo di nuovo ' +
          'finché non completi un riposo breve o lungo.',
      },
      {
        key: 'resistenza_al_danno',
        name: 'Resistenza al Danno',
        description:
          'Hai resistenza al tipo di danno associato alla tua ascendenza ' +
          'draconica.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // GNOMO  (include Gnomo dei Boschi, Gnomo delle Rocce)
  // ─────────────────────────────────────────────────────────────────
  {
    raceKey: 'gnome',
    traits: [
      {
        key: 'visione_nel_buio',
        name: 'Visione nel Buio',
        description:
          'Abituato alla vita in tunnel sotterranei e nelle grotte, possiedi ' +
          'una visione superiore nel buio e nella luce fioca. Entro 18 metri ' +
          'puoi vedere in luce fioca come se fosse piena luce, e ' +
          'nell\'oscurità come se fosse luce fioca. Non puoi distinguere i ' +
          'colori nell\'oscurità, solo le sfumature di grigio.',
      },
      {
        key: 'astuzia_gnomica',
        name: 'Astuzia Gnomica',
        description:
          'Hai vantaggio a tutti i tiri salvezza di Intelligenza, Saggezza ' +
          'e Carisma contro la magia.',
      },
      // ── Gnomo dei Boschi ────────────────────────────────────────
      {
        key: 'illusionista_naturale',
        name: 'Illusionista Naturale',
        description:
          'Conosci il trucchetto illusione minore. L\'Intelligenza è la tua ' +
          'caratteristica da incantatore per questo trucchetto.',
        subraceOnly: ['forest_gnome'],
      },
      {
        key: 'parlare_con_i_piccoli_animali',
        name: 'Parlare con i Piccoli Animali',
        description:
          'Attraverso suoni e gesti, puoi comunicare idee semplici con ' +
          'bestie Piccole o più piccole. I gnomi dei boschi amano gli ' +
          'animali e spesso tengono scoiattoli, tassi, conigli, talpe, ' +
          'picchi e altre creature come animali domestici.',
        subraceOnly: ['forest_gnome'],
      },
      // ── Gnomo delle Rocce ───────────────────────────────────────
      {
        key: 'conoscitore_artigiano',
        name: 'Conoscitore Artigiano',
        description:
          'Ogni volta che fai una prova di Intelligenza (Storia) relativa ' +
          'a oggetti magici, congegni alchemici o macchinari tecnologici, ' +
          'puoi aggiungere il doppio del tuo bonus di competenza invece del ' +
          'normale bonus di competenza.',
        subraceOnly: ['rock_gnome'],
      },
      {
        key: 'chiacchierono',
        name: 'Chiacchierono',
        description:
          'Puoi costruire un minuscolo congegno (CD di Intelligenza 10). ' +
          'Il congegno può essere uno dei seguenti: Giocattolo Meccanico, ' +
          'Accendino, o Scatola Musicale. Puoi avere fino a tre di tali ' +
          'congegni alla volta. Quando ne crei un quarto, uno dei tre ' +
          'precedenti smette di funzionare. Puoi smontare il congegno non ' +
          'funzionante per recuperare i materiali usati per crearlo.',
        subraceOnly: ['rock_gnome'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // TIEFLING
  // ─────────────────────────────────────────────────────────────────
  {
    raceKey: 'tiefling',
    traits: [
      {
        key: 'visione_nel_buio',
        name: 'Visione nel Buio',
        description:
          'Grazie al tuo retaggio infernale, possiedi una visione superiore ' +
          'nel buio e nella luce fioca. Entro 18 metri puoi vedere in luce ' +
          'fioca come se fosse piena luce, e nell\'oscurità come se fosse ' +
          'luce fioca. Non puoi distinguere i colori nell\'oscurità, ' +
          'solo le sfumature di grigio.',
      },
      {
        key: 'resistenza_infernale',
        name: 'Resistenza Infernale',
        description:
          'Hai resistenza ai danni da fuoco.',
      },
      {
        key: 'lascito_infernale_(magia)',
        name: 'Lascito Infernale (Magia)',
        description:
          'Conosci il trucchetto taumaturgia. Quando raggiungi il 3° livello, ' +
          'puoi lanciare l\'incantesimo puntura infernale una volta come ' +
          'incantesimo di 2° livello, e recuperi la capacità di farlo dopo ' +
          'un riposo lungo. Quando raggiungi il 5° livello, puoi anche ' +
          'lanciare l\'incantesimo oscurità una volta, e recuperi la ' +
          'capacità di farlo dopo un riposo lungo. Il Carisma è la tua ' +
          'caratteristica da incantatore per questi incantesimi.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Funzioni di utilità
// ─────────────────────────────────────────────────────────────────────────────

export function getRacialTraits(raceKey: string): RacialTraitFull[] {
  return RACIAL_TRAITS.find(r => r.raceKey === raceKey)?.traits ?? [];
}

export function getTraitsWithChoices(raceKey: string): RacialTraitFull[] {
  return getRacialTraits(raceKey).filter(t => t.choice !== undefined);
}
