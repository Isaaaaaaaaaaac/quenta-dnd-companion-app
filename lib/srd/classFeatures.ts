export interface ClassFeature {
  key: string;           // snake_case unique key, e.g. 'second_wind'
  name: string;          // Italian name from SRD
  description: string;   // SRD mechanical description in Italian, concise but complete
  unlockLevel: number;   // character level when unlocked (in that class)
  resourceKey?: string;  // if present, links to characterResources table for counter
  resetType?: 'short' | 'long'; // when the resource resets (only if resourceKey set)
  isPassive: boolean;    // true = no counter, just passive benefit
  improvesAt?: number[]; // class levels where feature improves (e.g. [9,13,17])
}

export const CLASS_FEATURES: Record<string, ClassFeature[]> = {

  // ─────────────────────────────────────────────
  // BARBARO
  // ─────────────────────────────────────────────
  barbarian: [
    {
      key: 'rage',
      name: 'Furia',
      description:
        'In battaglia puoi entrare in furia come azione bonus. Mentre sei in furia ottieni vantaggio alle prove e ai tiri salvezza di Forza, bonus ai danni da mischia pari a +2 (aumenta a +3 al 9° livello e +4 al 16°), e resistenza ai danni contundenti, perforanti e taglienti. La furia dura 1 minuto e termina prima se finisci il tuo turno senza aver attaccato una creatura ostile o subìto danni. Puoi farlo un numero di volte per riposo lungo pari alla tabella di classe.',
      unlockLevel: 1,
      resourceKey: 'rage',
      resetType: 'long',
      isPassive: false,
      improvesAt: [9, 16],
    },
    {
      key: 'unarmored_defense_barbarian',
      name: 'Difesa Senza Armatura',
      description:
        'Quando non indossi armatura, la tua Classe Armatura è pari a 10 + il modificatore di Destrezza + il modificatore di Costituzione. Puoi usare uno scudo e beneficiare comunque di questo vantaggio.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'reckless_attack',
      name: 'Attacco Spericolato',
      description:
        'A partire dal 2° livello, puoi gettare via ogni preoccupazione per la tua difesa per attaccare con ferocia. Quando effettui il tuo primo attacco nel turno, puoi decidere di attaccare in modo spericolato. Così facendo ottieni vantaggio ai tiri per colpire con armi da mischia a Forza durante questo turno, ma i tiri per colpire contro di te hanno vantaggio fino al tuo prossimo turno.',
      unlockLevel: 2,
      isPassive: false,
    },
    {
      key: 'danger_sense',
      name: 'Senso del Pericolo',
      description:
        'Al 2° livello acquisisci un senso soprannaturale dei pericoli che ti circondano. Hai vantaggio ai tiri salvezza su Destrezza contro effetti che puoi vedere (come trappole e incantesimi). Per beneficiarne non devi essere accecato, assordato o incapacitato.',
      unlockLevel: 2,
      isPassive: true,
    },
    {
      key: 'subclass_choice',
      name: 'Percorso Primordiale',
      description:
        'Al 3° livello scegli un Percorso Primordiale che plasma la natura della tua furia: Percorso del Berserker o Percorso del Guerriero Totemico (e altri percorsi dalla SRD). La tua scelta ti conferisce capacità al 3°, 6°, 10° e 14° livello.',
      unlockLevel: 3,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'extra_attack_barbarian',
      name: 'Attacco Extra',
      description:
        'A partire dal 5° livello, puoi attaccare due volte invece di una ogni volta che esegui l\'azione di Attacco nel tuo turno.',
      unlockLevel: 5,
      isPassive: true,
    },
    {
      key: 'fast_movement',
      name: 'Movimento Rapido',
      description:
        'A partire dal 5° livello, la tua velocità aumenta di 3 metri (10 piedi) mentre non indossi un\'armatura pesante.',
      unlockLevel: 5,
      isPassive: true,
    },
    {
      key: 'feral_instinct',
      name: 'Istinto Ferino',
      description:
        'Al 7° livello i tuoi istinti sono così affinati che hai vantaggio ai tiri di iniziativa. Inoltre, se sei sorpreso all\'inizio del combattimento e non sei incapacitato, puoi agire normalmente nel tuo primo turno, ma solo se entri in furia prima di fare qualsiasi altra cosa.',
      unlockLevel: 7,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'brutal_critical',
      name: 'Critico Brutale',
      description:
        'A partire dal 9° livello puoi tirare un dado del danno dell\'arma aggiuntivo quando determini i danni extra per un colpo critico con un attacco da mischia. Questo aumenta a due dadi aggiuntivi al 13° livello e a tre dadi aggiuntivi al 17° livello.',
      unlockLevel: 9,
      isPassive: true,
      improvesAt: [13, 17],
    },
    {
      key: 'relentless_rage',
      name: 'Furia Inesorabile',
      description:
        'A partire dall\'11° livello, la tua furia ti può tenere in piedi nonostante le ferite mortali. Se scendi a 0 punti ferita mentre sei in furia e non vieni ucciso all\'istante, puoi effettuare un tiro salvezza su Costituzione con CD 10. Se riesci, rimani a 1 punto ferita. Ogni volta che lo usi dopo il primo in ogni furia, la CD aumenta di 5. La CD si azzera al termine di un riposo breve o lungo.',
      unlockLevel: 11,
      isPassive: false,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'persistent_rage',
      name: 'Furia Persistente',
      description:
        'A partire dal 15° livello, la tua furia è talmente feroce che termina prima del previsto solo se perdi conoscenza o scegli tu stesso di porle fine.',
      unlockLevel: 15,
      isPassive: true,
    },
    {
      key: 'indomitable_might',
      name: 'Potenza Indomabile',
      description:
        'A partire dal 18° livello, se il totale della tua prova di Forza è inferiore al tuo punteggio di Forza, puoi usare quel punteggio al posto del totale.',
      unlockLevel: 18,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
    {
      key: 'primal_champion',
      name: 'Campione Primordiale',
      description:
        'Al 20° livello incarni il potere delle terre selvagge. Il tuo punteggio di Forza aumenta di 4 e il tuo punteggio di Costituzione aumenta di 4. Il massimo per questi punteggi diventa 24.',
      unlockLevel: 20,
      isPassive: true,
    },
  ],

  // ─────────────────────────────────────────────
  // BARDO
  // ─────────────────────────────────────────────
  bard: [
    {
      key: 'bardic_inspiration',
      name: 'Ispirazione Bardica',
      description:
        'Come azione bonus puoi ispirare un\'altra creatura entro 18 m che possa udirsi. Essa ottiene un dado di Ispirazione Bardica (d6, aumenta a d8 al 5°, d10 al 10°, d12 al 15°). La creatura può aggiungere questo dado ad un tiro per colpire, prova di caratteristica o tiro salvezza entro 10 minuti. Un personaggio può avere un solo dado di Ispirazione Bardica alla volta. Puoi usare questa capacità un numero di volte pari al tuo modificatore di Carisma (minimo 1) per riposo lungo (riposo breve dal 5° livello).',
      unlockLevel: 1,
      resourceKey: 'bardic_inspiration',
      resetType: 'long',
      isPassive: false,
      improvesAt: [5, 10, 15],
    },
    {
      key: 'spellcasting_bard',
      name: 'Incantesimi',
      description:
        'Sei un incantatore che ha imparato a incanalare il potere della magia attraverso la musica, la poesia e le arti. Carisma è la tua caratteristica da incantatore per i tuoi incantesimi da bardo.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'jack_of_all_trades',
      name: 'Factotum',
      description:
        'A partire dal 2° livello puoi aggiungere la metà del tuo bonus di competenza (arrotondato per difetto) a qualsiasi prova di caratteristica che non includa già il tuo bonus di competenza.',
      unlockLevel: 2,
      isPassive: true,
    },
    {
      key: 'song_of_rest',
      name: 'Canzone di Riposo',
      description:
        'A partire dal 2° livello puoi usare musica o discorsi tranquillizzanti per aiutare i tuoi compagni a recuperare le loro energie durante un riposo breve. Se tu o qualsiasi creatura amichevole che possa udire la tua performance recupera punti ferita al termine di un riposo breve, ciascuna creatura recupera 1d6 punti ferita extra (aumenta a d8 al 9°, d10 al 13°, d12 al 17°).',
      unlockLevel: 2,
      isPassive: true,
      improvesAt: [9, 13, 17],
    },
    {
      key: 'subclass_choice',
      name: 'Collegio Bardico',
      description:
        'Al 3° livello approfondisci la tua formazione artistica scegliendo un Collegio Bardico: Collegio della Conoscenza o Collegio del Valore (e altri dalla SRD). Il tuo archetipo ti conferisce capacità al 3°, 6° e 14° livello.',
      unlockLevel: 3,
      isPassive: true,
    },
    {
      key: 'expertise_bard',
      name: 'Specializzazione',
      description:
        'Al 3° livello scegli due competenze di abilità. Il tuo bonus di competenza è raddoppiato per qualsiasi prova di caratteristica che usi una delle competenze scelte. Al 10° livello puoi scegliere altre due competenze.',
      unlockLevel: 3,
      isPassive: true,
      improvesAt: [10],
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'font_of_inspiration',
      name: 'Fonte d\'Ispirazione',
      description:
        'A partire dal 5° livello recuperi tutti gli usi di Ispirazione Bardica al termine di un riposo breve o lungo.',
      unlockLevel: 5,
      isPassive: true,
    },
    {
      key: 'countercharm',
      name: 'Antimagia',
      description:
        'Al 6° livello acquisisci la capacità di usare note musicali o parole di potere per interrompere gli effetti che influenzano la mente. Come azione puoi iniziare una performance che dura fino alla fine del tuo turno successivo. Durante quel tempo, tu e qualsiasi creatura amichevole entro 9 m hanno vantaggio ai tiri salvezza contro essere spaventati o affascinati. La creatura deve riuscire a udire la performance.',
      unlockLevel: 6,
      isPassive: false,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'magical_secrets',
      name: 'Segreti Magici',
      description:
        'Al 10° livello hai saccheggiato la conoscenza magica da un\'ampia varietà di discipline. Scegli due incantesimi da qualsiasi classe. Un incantesimo scelto deve essere di un livello che puoi lanciare o un trucchetto. Gli incantesimi scelti contano come incantesimi da bardo per te. Apprendi altri due incantesimi da qualsiasi classe al 14° e al 18° livello.',
      unlockLevel: 10,
      isPassive: true,
      improvesAt: [14, 18],
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
    {
      key: 'superior_inspiration',
      name: 'Ispirazione Superiore',
      description:
        'Al 20° livello, quando tiri l\'iniziativa senza usi di Ispirazione Bardica rimasti, ne recuperi uno.',
      unlockLevel: 20,
      isPassive: true,
    },
  ],

  // ─────────────────────────────────────────────
  // CHIERICO
  // ─────────────────────────────────────────────
  cleric: [
    {
      key: 'spellcasting_cleric',
      name: 'Incantesimi',
      description:
        'Come condotto per il potere divino, puoi lanciare incantesimi da chierico. La Saggezza è la tua caratteristica da incantatore. Prepari la lista di incantesimi scegliendo dal tuo elenco di classe un numero di incantesimi pari al tuo modificatore di Saggezza + il tuo livello da chierico.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'subclass_choice',
      name: 'Dominio Divino',
      description:
        'Al 1° livello scegli un dominio relativo alla tua divinità: Vita, Luce, Natura, Tempesta, Conoscenza, Inganno, Guerra (e altri dalla SRD). Il dominio ti conferisce capacità al 1°, 2°, 6°, 8° e 17° livello, e incantesimi di dominio aggiuntivi.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'channel_divinity',
      name: 'Canalizzazione della Divinità',
      description:
        'Al 2° livello ottieni la capacità di canalizzare l\'energia divina direttamente dalla tua divinità, usando tale energia per alimentare effetti magici. Ottieni due effetti: Scaccia Non Morti e un effetto determinato dal dominio. Puoi usare Canalizzazione della Divinità una volta per riposo breve o lungo (due volte dal 6° livello, tre volte dal 18° livello).',
      unlockLevel: 2,
      resourceKey: 'channel_divinity',
      resetType: 'short',
      isPassive: false,
      improvesAt: [6, 18],
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'destroy_undead',
      name: 'Distruggi Non Morti',
      description:
        'A partire dal 5° livello, quando un Non Morto fallisce il suo tiro salvezza contro il tuo Scaccia Non Morti, la creatura è distrutta se il suo grado di sfida è pari o inferiore alla soglia indicata dalla tabella (CR 1/2 al 5°, CR 1 all\'8°, CR 2 all\'11°, CR 3 al 14°, CR 4 al 17°).',
      unlockLevel: 5,
      isPassive: true,
      improvesAt: [8, 11, 14, 17],
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'divine_intervention',
      name: 'Intervento Divino',
      description:
        'A partire dal 10° livello puoi invocare l\'aiuto della tua divinità. Per usare questa capacità devi descrivere l\'assistenza richiesta e tirare percentuale. Se tiri un numero pari o inferiore al tuo livello da chierico, la tua divinità interviene. Il DM decide la forma dell\'intervento. Se interviene, non puoi usare questa capacità per 7 giorni. Altrimenti puoi riprovare dopo un riposo lungo. Al 20° livello l\'intervento avviene automaticamente senza tiro.',
      unlockLevel: 10,
      isPassive: false,
      improvesAt: [20],
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
  ],

  // ─────────────────────────────────────────────
  // DRUIDO
  // ─────────────────────────────────────────────
  druid: [
    {
      key: 'druidic',
      name: 'Druidico',
      description:
        'Conosci il druidico, la lingua segreta dei druidi. Puoi parlare questa lingua e usarla per lasciare messaggi nascosti. Tu e gli altri che conoscono questa lingua notate automaticamente tali messaggi. Gli altri notano la presenza di un messaggio solo con un tiro su Sapienza (Natura) CD 15 riuscito, ma non possono decifrarlo senza magia.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'spellcasting_druid',
      name: 'Incantesimi',
      description:
        'Traendo da essenza divina della natura stessa, puoi lanciare incantesimi da druido. La Saggezza è la tua caratteristica da incantatore. Prepari la lista di incantesimi scegliendo dal tuo elenco di classe un numero di incantesimi pari al tuo modificatore di Saggezza + il tuo livello da druido.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'wild_shape',
      name: 'Forma Selvatica',
      description:
        'A partire dal 2° livello puoi usare la tua azione per trasformarti magicamente in una bestia che hai già visto in precedenza. Puoi usare questa capacità due volte, recuperandola dopo un riposo breve o lungo. Il GS massimo della bestia è 1/4 (nessuna nuotata o volo) al 2°, 1/2 (senza volo) al 4°, 1 all\'8°. Puoi rimanere trasformato per un massimo di ore pari alla metà del tuo livello da druido (arrotondato per difetto). Recuperi i punti ferita come indicato nella SRD.',
      unlockLevel: 2,
      resourceKey: 'wild_shape',
      resetType: 'short',
      isPassive: false,
      improvesAt: [4, 8],
    },
    {
      key: 'subclass_choice',
      name: 'Cerchio Druidico',
      description:
        'Al 2° livello scegli di identificarti con un Cerchio Druidico: Cerchio della Terra o Cerchio della Luna (e altri dalla SRD). Il tuo archetipo ti conferisce capacità al 2°, 6°, 10° e 14° livello.',
      unlockLevel: 2,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'timeless_body_druid',
      name: 'Corpo Senza Tempo',
      description:
        'A partire dal 18° livello il potere druidico che fluisce attraverso di te ti rende immune agli effetti dell\'invecchiamento magico e non puoi essere invecchiato magicamente. Tuttavia invecchi normalmente e soffri i normali effetti del vecchio. Hai anche bisogno di mangiare e bere solo 1/10 di cibo e acqua normali.',
      unlockLevel: 18,
      isPassive: true,
    },
    {
      key: 'beast_spells',
      name: 'Incantesimi Bestiali',
      description:
        'A partire dal 18° livello puoi lanciare molti dei tuoi incantesimi da druido in qualsiasi forma assumi usando Forma Selvatica. Puoi eseguire le componenti somatiche e verbali di un incantesimo da druido mentre sei in una forma bestiale, ma non puoi fornire componenti materiali.',
      unlockLevel: 18,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
    {
      key: 'archdruid',
      name: 'Arcidruid',
      description:
        'Al 20° livello puoi usare la tua Forma Selvatica un numero illimitato di volte. Inoltre puoi ignorare le componenti verbali e somatiche dei tuoi incantesimi da druido, nonché le componenti materiali che non hanno un costo indicato e non vengono consumate dall\'incantesimo. Ottieni questo vantaggio sia nella tua forma normale che nella tua Forma Selvatica.',
      unlockLevel: 20,
      isPassive: true,
    },
  ],

  // ─────────────────────────────────────────────
  // GUERRIERO
  // ─────────────────────────────────────────────
  fighter: [
    {
      key: 'fighting_style_fighter',
      name: 'Stile di Combattimento',
      description:
        'Adotti uno stile di combattimento particolare come specialità. Scegli uno dei seguenti: Arciere, Combattimento con Arma a Due Mani, Difesa, Duello, Combattimento con Grande Arma, Protezione. Non puoi adottare uno stile più di una volta, anche se hai una successiva possibilità di scegliere.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'second_wind',
      name: 'Secondo Fiato',
      description:
        'Hai una riserva limitata di resistenza su cui puoi attingere per proteggerti dal danno. Nel tuo turno puoi usare un\'azione bonus per recuperare punti ferita pari a 1d10 + il tuo livello da guerriero. Una volta usata questa capacità devi completare un riposo breve o lungo per poterla usare di nuovo.',
      unlockLevel: 1,
      resourceKey: 'second_wind',
      resetType: 'short',
      isPassive: false,
    },
    {
      key: 'action_surge',
      name: 'Scatto d\'Azione',
      description:
        'A partire dal 2° livello puoi spingerti oltre i tuoi normali limiti per un breve momento. Nel tuo turno puoi effettuare un\'azione aggiuntiva oltre alla tua normale azione e alla tua eventuale azione bonus. Puoi usare questa capacità una volta prima di richiedere un riposo breve o lungo, due volte al 17° livello.',
      unlockLevel: 2,
      resourceKey: 'action_surge',
      resetType: 'short',
      isPassive: false,
      improvesAt: [17],
    },
    {
      key: 'subclass_choice',
      name: 'Archetipo Marziale',
      description:
        'Al 3° livello scegli un archetipo che aspiri a emulare nei tuoi stili e tecniche di combattimento: Campione, Maestro di Battaglia, Cavaliere Mistico (e altri dalla SRD). L\'archetipo ti conferisce capacità al 3°, 7°, 10°, 15° e 18° livello.',
      unlockLevel: 3,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'extra_attack_fighter',
      name: 'Attacco Extra',
      description:
        'A partire dal 5° livello puoi attaccare due volte invece di una ogni volta che esegui l\'azione di Attacco nel tuo turno. Il numero di attacchi aumenta a tre al 11° livello e a quattro al 20° livello.',
      unlockLevel: 5,
      isPassive: true,
      improvesAt: [11, 20],
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 6,
      isPassive: true,
    },
    {
      key: 'indomitable',
      name: 'Indomabile',
      description:
        'A partire dall\'9° livello puoi ritirare un tiro salvezza che hai fallito. Se lo fai, devi usare il nuovo risultato. Non puoi usare questa capacità di nuovo finché non completi un riposo lungo. Puoi usare questa capacità due volte tra i riposi lunghi al 13° livello e tre volte al 17° livello.',
      unlockLevel: 9,
      resourceKey: 'indomitable',
      resetType: 'long',
      isPassive: false,
      improvesAt: [13, 17],
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 14,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
  ],

  // ─────────────────────────────────────────────
  // MONACO
  // ─────────────────────────────────────────────
  monk: [
    {
      key: 'unarmored_defense_monk',
      name: 'Difesa Senza Armatura',
      description:
        'A partire dal 1° livello, mentre non indossi armatura né scudo, la tua CA è pari a 10 + modificatore di Destrezza + modificatore di Saggezza.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'martial_arts',
      name: 'Arti Marziali',
      description:
        'Al 1° livello la tua pratica delle arti marziali ti conferisce la padronanza degli stili di combattimento che usano pugni e armi da monaco. Puoi usare Destrezza invece di Forza per i tiri per colpire e danni di pugni e armi da monaco. Puoi tirare un d4 al posto del normale danno dei pugni (il dado aumenta con il livello: d6 al 5°, d8 all\'11°, d10 al 17°). Quando esegui l\'azione di Attacco con un\'arma da monaco o con i pugni, puoi fare un attacco con un pugno come azione bonus.',
      unlockLevel: 1,
      isPassive: true,
      improvesAt: [5, 11, 17],
    },
    {
      key: 'ki',
      name: 'Ki',
      description:
        'A partire dal 2° livello la tua allenamento ti permette di sfruttare la riserva mistica di energia ki che scorre nel tuo corpo. Hai un numero di punti ki pari al tuo livello da monaco. Recuperi tutti i punti ki spesi al termine di un riposo breve o lungo. Puoi spendere ki per: Pioggia di Colpi (azione bonus: due pugni), Passo del Vento (azione bonus: Disingaggio o Scatto, raddoppia il salto), Difesa Paziente (azione bonus: Schivata).',
      unlockLevel: 2,
      resourceKey: 'ki',
      resetType: 'short',
      isPassive: false,
    },
    {
      key: 'unarmored_movement',
      name: 'Movimento Senza Armatura',
      description:
        'A partire dal 2° livello la tua velocità aumenta di 3 m (10 piedi) mentre non indossi armatura né scudo. Questo bonus aumenta con il livello da monaco. Al 9° livello acquisisci la capacità di muoverti lungo pareti verticali e su superfici di liquido nel tuo turno senza cadere durante il movimento.',
      unlockLevel: 2,
      isPassive: true,
      improvesAt: [6, 10, 14, 18],
    },
    {
      key: 'subclass_choice',
      name: 'Tradizione Monastica',
      description:
        'Al 3° livello ti impegni in una tradizione monastica: Via della Mano Aperta, Via dell\'Ombra, Via degli Elementi (e altre dalla SRD). La tradizione ti conferisce capacità al 3°, 6°, 11° e 17° livello.',
      unlockLevel: 3,
      isPassive: true,
    },
    {
      key: 'deflect_missiles',
      name: 'Deflettere Proiettili',
      description:
        'A partire dal 3° livello puoi usare la tua reazione per deflettere o catturare il proiettile quando vieni colpito da un attacco con arma a distanza. Quando lo fai, il danno che subisci si riduce di 1d10 + modificatore di Destrezza + livello da monaco. Se riduci il danno a 0, puoi spendere 1 punto ki per restituire il proiettile come se stessi effettuando un attacco con un\'arma a distanza con competenza.',
      unlockLevel: 3,
      isPassive: false,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'slow_fall',
      name: 'Caduta Lenta',
      description:
        'A partire dal 4° livello puoi usare la tua reazione quando stai cadendo per ridurre qualsiasi danno da caduta che subisci di un ammontare pari a cinque volte il tuo livello da monaco.',
      unlockLevel: 4,
      isPassive: false,
    },
    {
      key: 'extra_attack_monk',
      name: 'Attacco Extra',
      description:
        'A partire dal 5° livello puoi attaccare due volte invece di una ogni volta che esegui l\'azione di Attacco nel tuo turno.',
      unlockLevel: 5,
      isPassive: true,
    },
    {
      key: 'stunning_strike',
      name: 'Colpo Stordente',
      description:
        'A partire dal 5° livello puoi interferire con il flusso di ki nel corpo di un avversario. Quando colpisci un\'altra creatura con un attacco da mischia con arma, puoi spendere 1 punto ki per tentare un colpo stordente. Il bersaglio deve riuscire in un tiro salvezza su Costituzione o essere stordito fino alla fine del tuo prossimo turno.',
      unlockLevel: 5,
      isPassive: false,
    },
    {
      key: 'ki_empowered_strikes',
      name: 'Colpi Potenziati dal Ki',
      description:
        'A partire dal 6° livello i tuoi attacchi non armati contano come magici allo scopo di superare la resistenza e l\'immunità ai danni non magici.',
      unlockLevel: 6,
      isPassive: true,
    },
    {
      key: 'evasion_monk',
      name: 'Evasione',
      description:
        'Al 7° livello la tua agilità istintiva ti permette di schivare certi effetti di aree. Quando sei soggetto a un effetto che ti consente di effettuare un tiro salvezza su Destrezza per subire solo la metà del danno, invece non subisci alcun danno se riesci nel tiro salvezza, e solo la metà del danno se fallisci.',
      unlockLevel: 7,
      isPassive: true,
    },
    {
      key: 'stillness_of_mind',
      name: 'Quiete della Mente',
      description:
        'Al 7° livello puoi usare la tua azione per porre fine a un effetto di fascino o paura su di te.',
      unlockLevel: 7,
      isPassive: false,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'purity_of_body',
      name: 'Purezza del Corpo',
      description:
        'Al 10° livello la tua padronanza del ki che scorre nel tuo corpo lo rende immune alle malattie e al veleno.',
      unlockLevel: 10,
      isPassive: true,
    },
    {
      key: 'tongue_of_sun_and_moon',
      name: 'Lingua del Sole e della Luna',
      description:
        'A partire dal 13° livello apprendi a toccare il ki degli altri esseri. Puoi comprendere tutte le lingue parlate, e ogni creatura che può comprendere una lingua può comprendere quello che dici.',
      unlockLevel: 13,
      isPassive: true,
    },
    {
      key: 'diamond_soul',
      name: 'Anima di Diamante',
      description:
        'A partire dal 14° livello la tua padronanza del ki ti conferisce la competenza in tutti i tiri salvezza. Inoltre, ogni volta che effettui un tiro salvezza e fallisci, puoi spendere 1 punto ki per ritirarlo e devi usare il secondo risultato.',
      unlockLevel: 14,
      isPassive: true,
    },
    {
      key: 'timeless_body_monk',
      name: 'Corpo Senza Tempo',
      description:
        'Al 15° livello il tuo ki sostiene il tuo corpo affinché non soffra degli influssi negativi dell\'invecchiamento. Non puoi più essere invecchiato magicamente e non soffri dei difetti dell\'invecchiamento anziano. Hai ancora bisogno di mangiare e bere.',
      unlockLevel: 15,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'empty_body',
      name: 'Corpo Vuoto',
      description:
        'A partire dal 18° livello puoi usare la tua azione per spendere 4 punti ki per diventare invisibile per 1 minuto. Durante questo periodo hai anche resistenza a tutti i danni eccetto quello psichico. Inoltre puoi spendere 8 punti ki per lanciare l\'incantesimo proiezione astrale senza bisogno di componenti materiali, anche se non puoi portare altri con te.',
      unlockLevel: 18,
      isPassive: false,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
    {
      key: 'perfect_self',
      name: 'Sé Perfetto',
      description:
        'Al 20° livello, quando tiri l\'iniziativa e non hai punti ki rimasti, recuperi 4 punti ki.',
      unlockLevel: 20,
      isPassive: true,
    },
  ],

  // ─────────────────────────────────────────────
  // PALADINO
  // ─────────────────────────────────────────────
  paladin: [
    {
      key: 'divine_sense',
      name: 'Senso Divino',
      description:
        'La presenza del male potente registra ai tuoi sensi come un odore nauseante, e il bene potente come musica celestiale. Come azione puoi aprire la tua consapevolezza per rilevare tali forze. Fino alla fine del tuo prossimo turno conosci la posizione di qualsiasi celestiale, infernale o non morto entro 18 m che non sia dietro una copertura totale. Conosci il tipo (celestiale, infernale, non morto) ma non l\'identità. Puoi usare questa capacità un numero di volte pari a 1 + modificatore di Carisma per riposo lungo.',
      unlockLevel: 1,
      resourceKey: 'divine_sense',
      resetType: 'long',
      isPassive: false,
    },
    {
      key: 'lay_on_hands',
      name: 'Imposizione delle Mani',
      description:
        'Il tuo tocco benedetto può guarire le ferite. Hai una riserva di punti ferita che puoi ripristinare, pari al tuo livello da paladino × 5. Come azione puoi toccare una creatura e attingere alla riserva per ripristinare i punti ferita di quella creatura fino al massimo rimasto nella riserva. In alternativa puoi spendere 5 punti dalla riserva per curare la creatura da una malattia o neutralizzare un veleno. Recuperi la riserva al termine di un riposo lungo.',
      unlockLevel: 1,
      resourceKey: 'lay_on_hands',
      resetType: 'long',
      isPassive: false,
    },
    {
      key: 'fighting_style_paladin',
      name: 'Stile di Combattimento',
      description:
        'Al 2° livello adotti uno stile di combattimento particolare come specialità. Scegli uno tra: Difesa, Duello, Grande Arma, Protezione.',
      unlockLevel: 2,
      isPassive: true,
    },
    {
      key: 'spellcasting_paladin',
      name: 'Incantesimi',
      description:
        'Al 2° livello hai appreso a attingere alla magia divina attraverso la meditazione e la preghiera. Il Carisma è la tua caratteristica da incantatore.',
      unlockLevel: 2,
      isPassive: true,
    },
    {
      key: 'divine_smite',
      name: 'Colpo Divino',
      description:
        'A partire dal 2° livello quando colpisci una creatura con un attacco da mischia con arma puoi spendere uno slot incantesimo per infliggere danni radiosi al bersaglio aggiuntivi al danno dell\'arma. I danni extra sono 2d8 per uno slot di 1° livello, più 1d8 per ogni livello di slot sopra il 1°, fino a un massimo di 5d8. I danni aumentano di 1d8 se il bersaglio è un non morto o un infernale, fino a un massimo di 6d8.',
      unlockLevel: 2,
      isPassive: false,
    },
    {
      key: 'divine_health',
      name: 'Salute Divina',
      description:
        'Al 3° livello la magia divina che scorre attraverso di te ti rende immune alle malattie.',
      unlockLevel: 3,
      isPassive: true,
    },
    {
      key: 'subclass_choice',
      name: 'Giuramento Sacro',
      description:
        'Al 3° livello presti il giuramento sacro che ti lega come paladino per sempre. Scegli tra: Giuramento di Devozione, Giuramento degli Antichi, Giuramento della Vendetta (e altri dalla SRD). Il giuramento ti conferisce giuramenti di incantesimi, usi di Canalizzazione della Divinità e capacità al 3°, 7°, 15° e 20° livello.',
      unlockLevel: 3,
      isPassive: true,
    },
    {
      key: 'channel_divinity_paladin',
      name: 'Canalizzazione della Divinità',
      description:
        'Al 3° livello il tuo giuramento ti permette di canalizzare l\'energia divina per alimentare effetti magici. Ogni uso di Canalizzazione della Divinità è definito dal tuo giuramento. Devi completare un riposo breve o lungo per riusarla.',
      unlockLevel: 3,
      resourceKey: 'channel_divinity',
      resetType: 'short',
      isPassive: false,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'extra_attack_paladin',
      name: 'Attacco Extra',
      description:
        'A partire dal 5° livello puoi attaccare due volte invece di una ogni volta che esegui l\'azione di Attacco nel tuo turno.',
      unlockLevel: 5,
      isPassive: true,
    },
    {
      key: 'aura_of_protection',
      name: 'Aura di Protezione',
      description:
        'A partire dal 6° livello ogni volta che tu o una creatura amichevole entro 3 m (9 m al 18° livello) deve effettuare un tiro salvezza, la creatura ottiene un bonus al tiro salvezza pari al tuo modificatore di Carisma (con un minimo di +1). Devi essere cosciente per concedere questo bonus.',
      unlockLevel: 6,
      isPassive: true,
      improvesAt: [18],
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'aura_of_courage',
      name: 'Aura di Coraggio',
      description:
        'A partire dal 10° livello tu e le creature amichevoli entro 3 m (9 m al 18° livello) non potete essere spaventati finché sei cosciente.',
      unlockLevel: 10,
      isPassive: true,
      improvesAt: [18],
    },
    {
      key: 'improved_divine_smite',
      name: 'Colpo Divino Migliorato',
      description:
        'A partire dall\'11° livello sei così impregnato di giustizia che tutti i tuoi colpi con armi da mischia portano la potenza divina. Quando colpisci una creatura con un\'arma da mischia, la creatura subisce 1d8 danni radiosi extra.',
      unlockLevel: 11,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'cleansing_touch',
      name: 'Tocco Purificante',
      description:
        'A partire dal 14° livello puoi usare la tua azione per porre fine a un incantesimo su di te o su un\'altra creatura volontaria che tocchi. Puoi usare questa capacità un numero di volte pari al tuo modificatore di Carisma (con un minimo di una volta). Recuperi gli usi spesi al termine di un riposo lungo.',
      unlockLevel: 14,
      resourceKey: 'cleansing_touch',
      resetType: 'long',
      isPassive: false,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
  ],

  // ─────────────────────────────────────────────
  // RANGER
  // ─────────────────────────────────────────────
  ranger: [
    {
      key: 'favored_enemy',
      name: 'Nemico Prescelto',
      description:
        'A partire dal 1° livello hai esperienza significativa nello studiare, tracciare, cacciare e persino parlare con un certo tipo di nemico. Scegli un tipo di nemico prescelto: aberrazioni, bestie, celestiali, costrutti, draghi, elementali, fate, folletti, giganti, mostruosità, melme, non morti o piante; oppure due razze di umanoidi. Hai vantaggio alle prove di Sapienza per tracciare i tuoi nemici prescelti e sulle prove di Intelligenza per ricordare informazioni su di loro. Quando guadagni questa capacità scegli anche una lingua aggiuntiva parlata dai tuoi nemici prescelti. Scegli un tipo aggiuntivo al 6° e al 14° livello.',
      unlockLevel: 1,
      isPassive: true,
      improvesAt: [6, 14],
    },
    {
      key: 'natural_explorer',
      name: 'Esploratore Naturale',
      description:
        'Sei particolarmente familiare con un tipo di ambiente naturale e sei abile nel viaggiarvi e sopravvivervi. Scegli un tipo di terreno prescelto: artico, costa, deserto, foresta, prateria, montagna, palude o Sottosuolo. Quando effettui una prova di Intelligenza o Saggezza relativa al tuo terreno prescelto, il tuo bonus di competenza è raddoppiato. Mentre viaggi per almeno un\'ora nel tuo terreno prescelto ottieni vari benefici alla navigazione e al rilevamento. Scegli un tipo aggiuntivo al 6° e al 10° livello.',
      unlockLevel: 1,
      isPassive: true,
      improvesAt: [6, 10],
    },
    {
      key: 'fighting_style_ranger',
      name: 'Stile di Combattimento',
      description:
        'Al 2° livello adotti uno stile di combattimento particolare come specialità. Scegli tra: Arciere, Combattimento con Arma Doppia, Difesa.',
      unlockLevel: 2,
      isPassive: true,
    },
    {
      key: 'spellcasting_ranger',
      name: 'Incantesimi',
      description:
        'Al 2° livello hai appreso a usare la magia per incanalare la potenza della natura. La Saggezza è la tua caratteristica da incantatore. Conosci un numero limitato di incantesimi e puoi cambiarne uno per riposo lungo al termine di ogni livello.',
      unlockLevel: 2,
      isPassive: true,
    },
    {
      key: 'subclass_choice',
      name: 'Archetipo Ranger',
      description:
        'Al 3° livello scegli un archetipo che ti si addice: Cacciatore o Signore delle Bestie (e altri dalla SRD). L\'archetipo ti conferisce capacità al 3°, 7°, 11° e 15° livello.',
      unlockLevel: 3,
      isPassive: true,
    },
    {
      key: 'primeval_awareness',
      name: 'Consapevolezza Primordiale',
      description:
        'A partire dal 3° livello puoi usare la tua azione e spendere uno slot incantesimo da ranger per concentrare la tua consapevolezza sull\'area circostante. Per 1 minuto per livello dello slot speso puoi sentire se i seguenti tipi di creature sono presenti entro 1,5 km da te (o entro 9,5 km se sei nel tuo terreno prescelto): aberrazioni, celestiali, draghi, elementali, fate, infernali e non morti. Non conosci posizione o numero.',
      unlockLevel: 3,
      isPassive: false,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'extra_attack_ranger',
      name: 'Attacco Extra',
      description:
        'A partire dal 5° livello puoi attaccare due volte invece di una ogni volta che esegui l\'azione di Attacco nel tuo turno.',
      unlockLevel: 5,
      isPassive: true,
    },
    {
      key: 'lands_stride',
      name: 'Passo della Terra',
      description:
        'A partire dal 8° livello muovere attraverso terreno difficile non magico non ti costa movimento extra. Puoi anche passare attraverso piante non magiche senza essere rallentato da esse e senza subire danni se hanno spine, aculei o un pericolo simile. Hai anche vantaggio ai tiri salvezza contro piante create magicamente o manipolate per impedire il movimento.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'hide_in_plain_sight',
      name: 'Nascondersi alla Vista',
      description:
        'A partire dal 10° livello puoi trascorrere 1 minuto a creare un mimetismo utilizzando fango, sporcizia, piante, fuliggine e altri materiali naturali. Una volta mascherato in questo modo puoi tentare di nasconderti premendoti contro una superficie solida come un albero o una parete, larga e alta almeno quanto te. Ottieni un bonus di +10 alle prove di Furtività finché rimani immobile e non attacchi.',
      unlockLevel: 10,
      isPassive: false,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'vanish',
      name: 'Sparire',
      description:
        'A partire dal 14° livello puoi usare l\'azione di Nascondersi come azione bonus nel tuo turno. Non puoi essere tracciato da creature non magiche a meno che tu non scelga di lasciare una traccia.',
      unlockLevel: 14,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'feral_senses',
      name: 'Sensi Ferini',
      description:
        'Al 18° livello acquisisci sensi soprannaturali acuiti che ti aiutano quando combatti creature che non puoi vedere. Quando attacchi una creatura che non puoi vedere, la tua incapacità di vederla non impone svantaggio ai tiri per colpire contro di essa. Sei anche consapevole della posizione di qualsiasi creatura invisibile entro 9 m, a condizione che la creatura non sia nascosta e non sei accecato o assordato.',
      unlockLevel: 18,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
    {
      key: 'foe_slayer',
      name: 'Sterminatore di Nemici',
      description:
        'Al 20° livello diventi di una forza ineguagliabile nei confronti dei tuoi nemici. Una volta in ogni tuo turno puoi aggiungere il tuo modificatore di Saggezza al tiro per colpire o al tiro per i danni di un attacco contro uno dei tuoi nemici prescelti. Puoi scegliere di usare questa capacità prima o dopo il tiro, ma prima che eventuali effetti del tiro vengano applicati.',
      unlockLevel: 20,
      isPassive: true,
    },
  ],

  // ─────────────────────────────────────────────
  // LADRO
  // ─────────────────────────────────────────────
  rogue: [
    {
      key: 'expertise_rogue',
      name: 'Specializzazione',
      description:
        'Al 1° livello scegli due competenze di abilità o una competenza di abilità e una competenza con gli strumenti da ladro. Il tuo bonus di competenza è raddoppiato per qualsiasi prova di caratteristica che usi una delle competenze scelte. Scegli altre due competenze al 6° livello.',
      unlockLevel: 1,
      isPassive: true,
      improvesAt: [6],
    },
    {
      key: 'sneak_attack',
      name: 'Attacco Furtivo',
      description:
        'A partire dal 1° livello sai come colpire subdolamente e sfruttare le distrazioni del nemico. Una volta per turno puoi infliggere 1d6 danni extra a una creatura che colpisci con un attacco se hai vantaggio al tiro per colpire. L\'attacco deve usare un\'arma raffinata o a distanza. Non hai bisogno del vantaggio se un altro nemico del bersaglio è entro 1,5 m da esso, non sei in svantaggio e non sei incapacitato. Il dado aumenta: 2d6 al 3°, 3d6 al 5°, 4d6 al 7°, 5d6 al 9°, 6d6 all\'11°, 7d6 al 13°, 8d6 al 15°, 9d6 al 17°, 10d6 al 19°.',
      unlockLevel: 1,
      isPassive: true,
      improvesAt: [3, 5, 7, 9, 11, 13, 15, 17, 19],
    },
    {
      key: 'thieves_cant',
      name: 'Gergo dei Ladri',
      description:
        'Durante il tuo addestramento da ladro hai appreso il gergo dei ladri, un mix segreto di dialetto, gergo e codice che ti permette di nascondere messaggi in conversazioni apparentemente normali. Solo un altro individuo che conosce il gergo dei ladri capisce tali messaggi. Ci vuole quattro volte più tempo per trasmettere un tale messaggio rispetto a quello che ci vorrebbe a dichiararlo apertamente.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'cunning_action',
      name: 'Azione Scaltra',
      description:
        'A partire dal 2° livello la tua agilità mentale e fisica ti consente di agire e pensare velocemente. Puoi usare un\'azione bonus in ogni tuo turno nel combattimento per Scattare, Disimpegnarti o Nasconderti.',
      unlockLevel: 2,
      isPassive: false,
    },
    {
      key: 'subclass_choice',
      name: 'Archetipo da Ladro',
      description:
        'Al 3° livello scegli un archetipo che esemplifica le tue capacità: Ladro, Assassino, Impostore Arcano (e altri dalla SRD). L\'archetipo ti conferisce capacità al 3°, 9°, 13° e 17° livello.',
      unlockLevel: 3,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'uncanny_dodge',
      name: 'Schivata Prodigiosa',
      description:
        'A partire dal 5° livello quando un attaccante che puoi vedere ti colpisce con un attacco, puoi usare la tua reazione per dimezzare il danno dell\'attacco contro di te.',
      unlockLevel: 5,
      isPassive: false,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'evasion_rogue',
      name: 'Evasione',
      description:
        'Al 7° livello puoi schivare agilmente certi effetti di area. Quando sei soggetto a un effetto che ti consente di effettuare un tiro salvezza su Destrezza per subire solo la metà del danno, non subisci alcun danno se riesci nel tiro salvezza, e solo la metà del danno se fallisci.',
      unlockLevel: 7,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 10,
      isPassive: true,
    },
    {
      key: 'reliable_talent',
      name: 'Talento Affidabile',
      description:
        'Al 11° livello hai affinato le tue abilità scelte fino alla perfezione. Ogni volta che effettui una prova di caratteristica che ti consente di aggiungere il tuo bonus di competenza, puoi trattare un tiro di 9 o inferiore sul d20 come se avessi tirato un 10.',
      unlockLevel: 11,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'blindsense',
      name: 'Percezione del Buio',
      description:
        'Al 14° livello se riesci a udire, sei a conoscenza della posizione di qualsiasi creatura nascosta o invisibile entro 3 m da te.',
      unlockLevel: 14,
      isPassive: true,
    },
    {
      key: 'slippery_mind',
      name: 'Mente Sfuggente',
      description:
        'Al 15° livello hai acquisito una maggiore forza mentale. Ottieni la competenza nei tiri salvezza su Saggezza.',
      unlockLevel: 15,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'elusive',
      name: 'Sfuggente',
      description:
        'A partire dal 18° livello sei così elusivo che gli avversari raramente ottengono un vantaggio su di te. Nessun tiro per colpire ha vantaggio contro di te finché non sei incapacitato.',
      unlockLevel: 18,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
    {
      key: 'stroke_of_luck',
      name: 'Colpo di Fortuna',
      description:
        'Al 20° livello hai una incredibile capacità di sbarazzarti dei fallimenti. Se il tuo attacco manca un bersaglio nel raggio, puoi trasformare la mancata in un colpo. In alternativa se fallisci una prova di caratteristica, puoi trattare il tiro d20 come se avessi tirato un 20. Una volta usata questa capacità devi completare un riposo breve o lungo per poterla usare di nuovo.',
      unlockLevel: 20,
      resourceKey: 'stroke_of_luck',
      resetType: 'short',
      isPassive: false,
    },
  ],

  // ─────────────────────────────────────────────
  // STREGONE
  // ─────────────────────────────────────────────
  sorcerer: [
    {
      key: 'spellcasting_sorcerer',
      name: 'Incantesimi',
      description:
        'Un evento nel tuo passato, o nella vita di un genitore o antenato, ti ha lasciato una impronta di potere magico soprannaturale che si manifesta in modi inaspettati. Il Carisma è la tua caratteristica da incantatore. Conosci un numero fisso di incantesimi della lista da stregone.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'subclass_choice',
      name: 'Origine Stregonesca',
      description:
        'Al 1° livello scegli un\'origine stregonesca che descrive la fonte del tuo potere magico innato: Discendenza Draconiana o Magia Selvaggia (e altre dalla SRD). Il tuo archetipo ti conferisce capacità al 1°, 6°, 14° e 18° livello.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'font_of_magic',
      name: 'Fonte di Magia',
      description:
        'Al 2° livello attingi a una profonda riserva di magia che risiedee in te. Questa riserva è rappresentata dai punti stregoneria, che ti permettono di creare vari effetti magici. Hai 2 punti stregoneria e ne guadagni un altro per ogni livello da stregone oltre il 2°. Recuperi tutti i punti stregoneria spesi al termine di un riposo lungo. Puoi convertire slot in punti e punti in slot come indicato nella SRD.',
      unlockLevel: 2,
      resourceKey: 'sorcery_points',
      resetType: 'long',
      isPassive: false,
    },
    {
      key: 'metamagic',
      name: 'Metamagia',
      description:
        'Al 3° livello ottieni la capacità di distorcere i tuoi incantesimi in modo da soddisfare le tue esigenze. Ottieni due opzioni di Metamagia a tua scelta dal seguente elenco: Incantesimo Attento, Incantesimo Distante, Incantesimo Potenziato, Incantesimo Esteso, Incantesimo Furtivo, Incantesimo Rapido, Incantesimo Sottile, Incantesimo Gemellato. Puoi usare un\'unica opzione di Metamagia per incantesimo a meno che non sia specificato diversamente. Guadagni un\'altra opzione di Metamagia al 10° e al 17° livello.',
      unlockLevel: 3,
      isPassive: false,
      improvesAt: [10, 17],
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
    {
      key: 'sorcerous_restoration',
      name: 'Restauro Stregonesco',
      description:
        'Al 20° livello recuperi 4 punti stregoneria spesi ogni volta che finisci un riposo breve.',
      unlockLevel: 20,
      isPassive: true,
    },
  ],

  // ─────────────────────────────────────────────
  // WARLOCK
  // ─────────────────────────────────────────────
  warlock: [
    {
      key: 'otherworldly_patron',
      name: 'Patrono Ultraterreno',
      description:
        'Al 1° livello hai stretto un accordo con un essere ultraterreno di tua scelta: l\'Arcidemone, il Signore dei Folletti, il Grande Antico (e altri dalla SRD). La tua scelta ti conferisce capacità al 1° e al 6° livello.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'pact_magic',
      name: 'Magia del Patto',
      description:
        'Il tuo ricercato arcano patto con un essere ultraterreno ti conferisce capacità di lanciare incantesimi. Vedi il capitolo SRD per gli slot del patto: guadagni slot che si recuperano dopo un riposo breve o lungo. Il Carisma è la tua caratteristica da incantatore. Il numero di slot e il loro livello aumentano con i livelli da warlock.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'eldritch_invocations',
      name: 'Invocazioni Occulte',
      description:
        'Nel tuo studio della conoscenza occulta hai dissotterrato invocazioni occulte, frammenti di sapere proibito che ti infondono una capacità magica. Al 2° livello ottieni due invocazioni occulte a tua scelta. Ottieni una invocazione aggiuntiva ai livelli successivi come da tabella. Puoi sostituire una invocazione al termine di un riposo lungo ogni volta che guadagni un livello da warlock.',
      unlockLevel: 2,
      isPassive: true,
      improvesAt: [5, 7, 9, 12, 15, 18],
    },
    {
      key: 'pact_boon',
      name: 'Dono del Patto',
      description:
        'Al 3° livello il tuo patrono ultraterreno ti concede un dono per i tuoi servizi fedeli. Scegli uno dei seguenti doni: Patto della Catena, Patto della Lama, Patto del Tomo. Il dono scelto ti conferisce capacità specifiche.',
      unlockLevel: 3,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'mystic_arcanum',
      name: 'Arcano Mistico',
      description:
        'Al 11° livello il tuo patrono ti conferisce un segreto magico chiamato Arcano. Scegli un incantesimo di 6° livello dalla lista da warlock come arcano. Puoi lanciare questo incantesimo una volta senza spendere uno slot incantesimo. Devi completare un riposo lungo prima di poterlo fare di nuovo. Guadagni un ulteriore incantesimo di Arcano Mistico ai livelli superiori: 7° al 13°, 8° al 15°, 9° al 17°.',
      unlockLevel: 11,
      isPassive: false,
      improvesAt: [13, 15, 17],
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
    {
      key: 'eldritch_master',
      name: 'Maestro Occulto',
      description:
        'Al 20° livello puoi attingere alla tua riserva interiore di potere mistico mentre supplichi il tuo patrono di restituirti gli slot incantesimo spesi. Puoi trascorrere 1 minuto in preghiera o meditazione e poi recuperare tutti gli slot da warlock spesi. Una volta usata questa capacità devi completare un riposo lungo prima di poterla usare di nuovo.',
      unlockLevel: 20,
      resourceKey: 'eldritch_master',
      resetType: 'long',
      isPassive: false,
    },
  ],

  // ─────────────────────────────────────────────
  // MAGO
  // ─────────────────────────────────────────────
  wizard: [
    {
      key: 'spellcasting_wizard',
      name: 'Incantesimi',
      description:
        'Come studioso della magia arcana, hai un libro degli incantesimi che contiene incantesimi che mostrano i primi bagliori della tua vera potenza. L\'Intelligenza è la tua caratteristica da incantatore. Prepari la lista di incantesimi scegliendo dal tuo libro degli incantesimi: puoi preparare un numero di incantesimi da mago pari al tuo modificatore di Intelligenza + il tuo livello da mago.',
      unlockLevel: 1,
      isPassive: true,
    },
    {
      key: 'arcane_recovery',
      name: 'Recupero Arcano',
      description:
        'Hai imparato a recuperare parte della tua energia magica studiando il tuo libro degli incantesimi. Una volta al giorno, quando finisci un riposo breve, puoi scegliere gli slot incantesimo spesi da recuperare. I livelli degli slot da recuperare devono sommarsi a un valore pari o inferiore alla metà del tuo livello da mago (arrotondato per eccesso), e nessuno degli slot può essere di 6° livello o superiore.',
      unlockLevel: 1,
      resourceKey: 'arcane_recovery',
      resetType: 'long',
      isPassive: false,
    },
    {
      key: 'subclass_choice',
      name: 'Tradizione Arcana',
      description:
        'Al 2° livello scegli una tradizione arcana, affinando la tua pratica magica attraverso una delle scuole: Evocazione, Abiurazione, Divinazione, Illusione, Necromanzia, Trasmutazione, Ammaliamento, Congiunzione (e altre dalla SRD). La tradizione ti conferisce capacità al 2°, 6°, 10° e 14° livello.',
      unlockLevel: 2,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 4,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 8,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 12,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 16,
      isPassive: true,
    },
    {
      key: 'spell_mastery',
      name: 'Maestria degli Incantesimi',
      description:
        'Al 18° livello hai raggiunto tale padronanza di certi incantesimi da poterli lanciare a volontà. Scegli un incantesimo da mago di 1° livello e un incantesimo da mago di 2° livello che sono nel tuo libro degli incantesimi. Puoi lanciare quegli incantesimi al loro livello minimo senza spendere uno slot incantesimo quando li hai preparati. Se vuoi lanciare uno di questi incantesimi a un livello superiore devi spendere uno slot incantesimo come normale. Puoi scambiare uno o entrambi gli incantesimi scelti con un lungo studio del tuo libro degli incantesimi della durata di 8 ore.',
      unlockLevel: 18,
      isPassive: true,
    },
    {
      key: 'asi',
      name: 'Incremento Punteggi Caratteristica',
      description:
        'Puoi aumentare un punteggio di caratteristica di 2, oppure due punteggi di caratteristica di 1 ciascuno. Non puoi aumentare un punteggio oltre 20 con questa capacità.',
      unlockLevel: 19,
      isPassive: true,
    },
    {
      key: 'signature_spells',
      name: 'Incantesimi Firma',
      description:
        'Al 20° livello ottieni padronanza di due potenti incantesimi e puoi lanciarli con poco sforzo. Scegli due incantesimi da mago di 3° livello nel tuo libro degli incantesimi come i tuoi incantesimi firma. Li hai sempre preparati, non contano nel limite degli incantesimi preparati, e puoi lanciare ciascuno di essi una volta a livello 3 senza spendere uno slot. Recuperi questi usi dopo un riposo breve o lungo.',
      unlockLevel: 20,
      resourceKey: 'signature_spells',
      resetType: 'short',
      isPassive: false,
    },
  ],
};

export function getClassFeatures(classKey: string): ClassFeature[] {
  return CLASS_FEATURES[classKey] ?? [];
}

export function getUnlockedFeatures(classKey: string, classLevel: number): ClassFeature[] {
  return getClassFeatures(classKey).filter(f => f.unlockLevel <= classLevel);
}
