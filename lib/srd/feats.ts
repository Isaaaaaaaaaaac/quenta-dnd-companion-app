// Talenti D&D 5e SRD 2014 — lista completa con descrizioni brevi

export interface Feat {
  key: string;
  name: string;
  prerequisite?: string;
  description: string;
  effect: string; // effetto meccanico principale in una riga
}

export const FEATS: Feat[] = [
  {
    key: 'alert',
    name: 'All\'Erta',
    description: 'Sei sempre pronto al pericolo.',
    effect: '+5 all\'Iniziativa. Non puoi essere sorpreso. I nemici non hanno vantaggio sugli attacchi contro di te per essere nascosti.',
  },
  {
    key: 'athlete',
    name: 'Atleta',
    prerequisite: 'FOR o DES 13',
    description: 'Hai un\'allenamento fisico straordinario.',
    effect: '+1 FOR o DES. Quando sei a terra alzarti costa solo 5 ft di movimento. Rampicamento non riduce il movimento. Salti con rincorsa con 5 ft di movimento.',
  },
  {
    key: 'actor',
    name: 'Attore',
    description: 'Sei esperto nel travestimento e nell\'imitazione.',
    effect: '+1 CAR. Vantaggio sulle prove di Inganno e Intrattenere quando ti travestì. Puoi imitare la voce di qualcuno dopo 1 minuto di ascolto.',
  },
  {
    key: 'charger',
    name: 'Carica',
    description: 'Puoi caricare i tuoi nemici travolgendoli.',
    effect: 'Quando usi Scatto e attacchi con un\'arma: +5 ai danni o spingi il bersaglio di 10 ft.',
  },
  {
    key: 'crossbow_expert',
    name: 'Esperto di Balestre',
    description: 'Usi le balestre con perizia letale.',
    effect: 'Ignori il requisito di ricarica. Non hai svantaggio in corpo a corpo. Puoi attaccare con una balestra leggera come bonus se hai già attaccato.',
  },
  {
    key: 'defensive_duelist',
    name: 'Duellistta Difensivo',
    prerequisite: 'DES 13',
    description: 'Usi la tua agilità per deflettere i colpi.',
    effect: 'Con un\'arma accurata: puoi usare la Reazione per aggiungere il bonus di competenza alla CA contro un attacco.',
  },
  {
    key: 'dual_wielder',
    name: 'Combattente con Due Armi',
    description: 'Padroneggi il combattimento con due armi.',
    effect: '+1 CA con due armi. Puoi usare armi non leggere per combattere con due armi. Puoi estrarre/riporre due armi in una volta.',
  },
  {
    key: 'dungeon_delver',
    name: 'Esploratore di Dungeon',
    description: 'Sei esperto nei sotterranei e nelle trappole.',
    effect: 'Vantaggio per rilevare porte segrete. Vantaggio sui TS contro trappole. Resistenza ai danni delle trappole. Puoi cercare trappole a velocità normale.',
  },
  {
    key: 'durable',
    name: 'Resistente',
    description: 'Sei particolarmente difficile da abbattere.',
    effect: '+1 COS. Quando usi i Dadi Vita per curarti, il minimo è 2×modificatore COS.',
  },
  {
    key: 'elemental_adept',
    name: 'Adepto Elementale',
    prerequisite: 'Capacità di lanciare almeno un incantesimo',
    description: 'I tuoi incantesimi ignorano la resistenza a un elemento.',
    effect: 'Scegli un elemento. I tuoi incantesimi ignorano la resistenza a quel danno. Ogni 1 nei dadi di quel danno conta come 2.',
  },
  {
    key: 'grappler',
    name: 'Lottatore',
    prerequisite: 'FOR 13',
    description: 'Hai sviluppato le tecniche per bloccare i nemici.',
    effect: 'Vantaggio sugli attacchi contro creature che hai afferrato. Puoi usare un\'azione per bloccare una creatura afferrata.',
  },
  {
    key: 'great_weapon_master',
    name: 'Maestro delle Armi a Due Mani',
    description: 'Hai padroneggiato l\'uso delle armi pesanti.',
    effect: 'Critico o kill con arma pesante: attacco bonus come azione bonus. Puoi scegliere -5 all\'attacco per +10 ai danni.',
  },
  {
    key: 'healer',
    name: 'Guaritore',
    description: 'Sei esperto nell\'uso del kit del medico.',
    effect: 'Con un kit del medico: stabilizzi con 1 PF invece di 0. Una volta per riposo breve per creatura: ripristina 1d6+4+livello PF.',
  },
  {
    key: 'heavily_armored',
    name: 'Armatura Pesante',
    prerequisite: 'Competenza in armature medie',
    description: 'Sei addestrato nell\'uso delle armature pesanti.',
    effect: '+1 FOR. Competenza nelle armature pesanti.',
  },
  {
    key: 'heavy_armor_master',
    name: 'Maestro dell\'Armatura Pesante',
    prerequisite: 'Competenza in armature pesanti',
    description: 'Usi la tua armatura per deflettere i colpi.',
    effect: '+1 FOR. Con armatura pesante: riduci i danni fisici non magici di 3.',
  },
  {
    key: 'inspiring_leader',
    name: 'Leader Ispiratore',
    prerequisite: 'CAR 13',
    description: 'Puoi ispirare i tuoi compagni con un discorso.',
    effect: '10 minuti per ispirare fino a 6 creature amiche: ricevono PF temporanei pari al tuo livello + mod CAR.',
  },
  {
    key: 'keen_mind',
    name: 'Mente Acuta',
    description: 'Hai una mente straordinariamente precisa.',
    effect: '+1 INT. Sempre sai dove sei rispetto al nord. Ricordi qualsiasi cosa vista/sentita nell\'ultimo mese.',
  },
  {
    key: 'lightly_armored',
    name: 'Armatura Leggera',
    description: 'Sei addestrato nell\'uso delle armature leggere.',
    effect: '+1 FOR o DES. Competenza nelle armature leggere.',
  },
  {
    key: 'linguist',
    name: 'Poliglotta',
    description: 'Hai studiato le lingue e i codici.',
    effect: '+1 INT. Impari 3 lingue a scelta. Puoi creare cifrari. Solo tu e chi insegni può decifrare.',
  },
  {
    key: 'lucky',
    name: 'Fortunato',
    description: 'Hai una fortuna straordinaria che si manifesta nei momenti critici.',
    effect: '3 punti fortuna per riposo lungo. Spendi uno per rilanciare qualsiasi d20 (scegli quale risultato usare).',
  },
  {
    key: 'mage_slayer',
    name: 'Ammazzamaghi',
    description: 'Hai sviluppato tecniche contro i lanciaincantesimi.',
    effect: 'Reazione per attaccare chi lancia un incantesimo entro 1,5m. Svantaggio ai TS di Concentrazione per chi attacchi. Vantaggio ai TS contro incantesimi di creature entro 1,5m.',
  },
  {
    key: 'magic_initiate',
    name: 'Iniziato alla Magia',
    description: 'Impari gli elementi base di una tradizione magica.',
    effect: 'Scegli una classe: impara 2 trucchetti e 1 incantesimo di 1° livello (lanciabile una volta per riposo lungo).',
  },
  {
    key: 'martial_adept',
    name: 'Adepto Marziale',
    description: 'Hai addestramento marziale che ti permette manovre di combattimento.',
    effect: 'Impari 2 manovre di Battle Master. Guadagni 1 dado Superiority (d6).',
  },
  {
    key: 'mobile',
    name: 'Mobile',
    description: 'Sei eccezionalmente veloce e agile.',
    effect: '+3m di velocità. Con Scatto, il terreno difficile non costa movimento extra. Se attacchi, non provochi attacchi di opportunità dalla stessa creatura.',
  },
  {
    key: 'moderately_armored',
    name: 'Armatura Media',
    prerequisite: 'Competenza in armature leggere',
    description: 'Sei addestrato nell\'uso delle armature medie e degli scudi.',
    effect: '+1 FOR o DES. Competenza nelle armature medie e negli scudi.',
  },
  {
    key: 'mounted_combatant',
    name: 'Combattente in Sella',
    description: 'Sei un soldato pericoloso a cavallo.',
    effect: 'Vantaggio sugli attacchi in mischia contro creature più piccole del tuo cavalcatura. Puoi reindirizzare i danni dalla cavalcatura a te. La cavalcatura non è soggetta agli effetti che le consentono un TS se lo superi.',
  },
  {
    key: 'observant',
    name: 'Osservatore',
    description: 'Sei rapido a notare i dettagli dell\'ambiente.',
    effect: '+1 INT o SAG. Leggi il movimento delle labbra. +5 alla Percezione e Investigare passivis.',
  },
  {
    key: 'polearm_master',
    name: 'Maestro dell\'Asta',
    description: 'Puoi tenere i nemici a distanza con armi da asta.',
    effect: 'Attacco bonus con l\'estremità dell\'asta (d4). Reazione per attaccare quando un nemico entra nel tuo raggio d\'azione.',
  },
  {
    key: 'resilient',
    name: 'Resiliente',
    prerequisite: 'Varia per caratteristica',
    description: 'Sviluppi la capacità di resistere in una caratteristica.',
    effect: '+1 alla caratteristica scelta. Competenza nei TS di quella caratteristica.',
  },
  {
    key: 'ritual_caster',
    name: 'Incantatore di Rituali',
    prerequisite: 'INT o SAG 13',
    description: 'Hai imparato a lanciare certi incantesimi come rituali.',
    effect: 'Acquisisci un libro dei rituali. Puoi lanciare gli incantesimi (rituali) al suo interno. Puoi aggiungere incantesimi rituali che trovi.',
  },
  {
    key: 'sentinel',
    name: 'Sentinella',
    description: 'Hai padroneggiato tecniche per sfruttare ogni momento di distrazione.',
    effect: 'Attacchi di opportunità riducono la velocità a 0. Reazione per attaccare chi attacca un tuo alleato. Gli avversari non si possono disimpegnare da te.',
  },
  {
    key: 'sharpshooter',
    name: 'Tiratore Scelto',
    description: 'Hai padroneggiato le armi a distanza.',
    effect: 'Nessun svantaggio per distanza lunga. Ignori copertura ½ e ¾. Puoi scegliere -5 all\'attacco per +10 ai danni.',
  },
  {
    key: 'shield_master',
    name: 'Maestro dello Scudo',
    description: 'Usi gli scudi sia per l\'attacco che per la difesa.',
    effect: 'Azione bonus: spingi un bersaglio di 5 ft. +2 ai TS di DES. Con TS di DES superato: nessun danno.',
  },
  {
    key: 'skilled',
    name: 'Esperto',
    description: 'Hai le competenze e le capacità in un\'ampia gamma di compiti.',
    effect: 'Guadagni competenza in 3 abilità o strumenti a scelta.',
  },
  {
    key: 'spell_sniper',
    name: 'Cecchino degli Incantesimi',
    prerequisite: 'Capacità di lanciare almeno un incantesimo',
    description: 'Hai imparato tecniche per potenziare i tuoi attacchi magici a distanza.',
    effect: 'Raddoppi la gittata degli incantesimi che richiedono un tiro per colpire. Ignori la copertura ½ e ¾. Impari un trucchetto con attacco d\'incantesimo.',
  },
  {
    key: 'tavern_brawler',
    name: 'Rissaiolo da Taverna',
    description: 'Sei abituato alle risse di strada.',
    effect: '+1 FOR o COS. Competenza nelle armi improvvisate e in quelle non armate. Attacco non armato infligge 1d4. Azione bonus per afferrare dopo aver colpito con mani nude o arma improvvisata.',
  },
  {
    key: 'tough',
    name: 'Duro a Morire',
    description: 'La tua carne è più resistente della media.',
    effect: 'PF massimi aumentano di 2×livello. Ogni volta che sali di livello guadagni 2 PF aggiuntivi.',
  },
  {
    key: 'war_caster',
    name: 'Combattente Magico',
    prerequisite: 'Capacità di lanciare almeno un incantesimo',
    description: 'Hai praticato la magia in mezzo al combattimento.',
    effect: 'Vantaggio sui TS di Concentrazione. Puoi eseguire componenti somatiche anche con armi/scudi. Reazione: lancia un incantesimo come attacco di opportunità.',
  },
  {
    key: 'weapon_master',
    name: 'Maestro delle Armi',
    description: 'Hai allenamento con un\'ampia varietà di armi.',
    effect: '+1 FOR o DES. Guadagni competenza con 4 armi a scelta.',
  },
];

export function searchFeats(query: string): Feat[] {
  if (!query.trim()) return FEATS;
  const q = query.toLowerCase();
  return FEATS.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.effect.toLowerCase().includes(q)
  );
}
