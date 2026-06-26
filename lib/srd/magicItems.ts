// D&D 5e SRD 5.1 — Oggetti Magici (Magic Items)

export type MagicItemType =
  | 'meraviglioso'
  | 'arma'
  | 'armatura'
  | 'scudo'
  | 'anello'
  | 'pozione'
  | 'bacchetta'
  | 'bastone'
  | 'verga'
  | 'munizioni'
  | 'strumento';

export type MagicItemRarity =
  | 'comune'
  | 'non_comune'
  | 'raro'
  | 'molto_raro'
  | 'leggendario'
  | 'artefatto';

export interface SrdMagicItem {
  key: string;
  name: string;
  type: MagicItemType;
  rarity: MagicItemRarity;
  requiresAttunement: boolean;
  attunementNote?: string;
  description: string;
}

// ─── Oggetti Meravigliosi ──────────────────────────────────────────────────────

const WONDROUS: SrdMagicItem[] = [
  { key: 'alchemy_jug',               name: 'Brocca Alchemica',                        type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Produce quotidianamente vari liquidi (acido, birra, miele, acqua, vino, ecc.).' },
  { key: 'amulet_health',             name: 'Amuleto della Salute',                    type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'La tua Costituzione è 19 mentre indossi questo amuleto.' },
  { key: 'amulet_proof_detection',    name: 'Amuleto di Protezione dal Rilevamento',   type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Ti scherma dalla magia di individuazione e localizzazione.' },
  { key: 'amulet_planes',             name: 'Amuleto dei Piani',                       type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Permette di usare un\'azione per recarsi in qualsiasi piano di esistenza.' },
  { key: 'animated_shield',           name: 'Scudo Animato',                           type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Può animarsi e difenderti lasciandoti entrambe le mani libere.' },
  { key: 'apparatus_crab',            name: 'Apparato del Granchio',                   type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: false, description: 'Veicolo sottomarino corazzato a forma di granchio, capace di ospitare due creature.' },
  { key: 'bag_beans',                 name: 'Sacco dei Fagioli',                       type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Contiene 3d4 fagioli magici con effetti imprevedibili se piantati o lanciati.' },
  { key: 'bag_devouring',             name: 'Sacco Divoratore',                        type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Oggetto maledetto: divora qualsiasi cosa ci venga introdotta.' },
  { key: 'bag_holding',               name: 'Borsa del Tenere',                        type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Contiene fino a 500 kg in uno spazio extradimensionale di 2,1 m³.' },
  { key: 'bag_tricks_gray',           name: 'Sacco dei Trucchi (Grigio)',               type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Tre volte al giorno estrai una figurina che si trasforma in una bestia di taglia piccola.' },
  { key: 'bag_tricks_rust',           name: 'Sacco dei Trucchi (Ruggine)',              type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Tre volte al giorno estrai una figurina che si trasforma in una bestia di taglia media.' },
  { key: 'bag_tricks_tan',            name: 'Sacco dei Trucchi (Ocra)',                 type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Tre volte al giorno estrai una figurina che si trasforma in una bestia di taglia grande.' },
  { key: 'bead_force',                name: 'Perla di Forza',                          type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Lancia questa perla per racchiudere il bersaglio in una sfera di forza per 1 minuto.' },
  { key: 'belt_dwarvenkind',          name: 'Cintura della Robustezza dei Nani',       type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'La tua Cos aumenta di 2 e ottieni visione nel buio e varie competenze nanica.' },
  { key: 'belt_hill_giant',           name: 'Cintura della Forza dei Giganti del Monte', type: 'meraviglioso', rarity: 'non_comune', requiresAttunement: true,  description: 'La tua Forza è 21 mentre indossi questa cintura.' },
  { key: 'belt_stone_giant',          name: 'Cintura della Forza dei Giganti della Pietra', type: 'meraviglioso', rarity: 'raro',  requiresAttunement: true,  description: 'La tua Forza è 23 mentre indossi questa cintura.' },
  { key: 'belt_frost_giant',          name: 'Cintura della Forza dei Giganti del Gelo', type: 'meraviglioso', rarity: 'raro',       requiresAttunement: true,  description: 'La tua Forza è 23 mentre indossi questa cintura.' },
  { key: 'belt_fire_giant',           name: 'Cintura della Forza dei Giganti del Fuoco', type: 'meraviglioso', rarity: 'raro',     requiresAttunement: true,  description: 'La tua Forza è 25 mentre indossi questa cintura.' },
  { key: 'belt_cloud_giant',          name: 'Cintura della Forza dei Giganti delle Nubi', type: 'meraviglioso', rarity: 'molto_raro', requiresAttunement: true, description: 'La tua Forza è 27 mentre indossi questa cintura.' },
  { key: 'belt_storm_giant',          name: 'Cintura della Forza dei Giganti del Tuono', type: 'meraviglioso', rarity: 'leggendario', requiresAttunement: true, description: 'La tua Forza è 29 mentre indossi questa cintura.' },
  { key: 'boots_elvenkind',           name: 'Stivali degli Elfi',                      type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'I tuoi passi non emettono suoni e hai vantaggio alle prove di Furtività (movimento).' },
  { key: 'boots_levitation',          name: 'Stivali di Levitazione',                  type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Puoi levitare verticalmente a volontà fino a 6 m.' },
  { key: 'boots_speed',               name: 'Stivali della Velocità',                  type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Bonus: raddoppia la tua velocità per 10 minuti al giorno.' },
  { key: 'boots_striding_springing',  name: 'Stivali del Passo e del Balzo',           type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Velocità minima 9 m e puoi saltare tre volte la distanza normale.' },
  { key: 'boots_winterlands',         name: 'Stivali delle Terre d\'Inverno',           type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Resistenza al freddo, cammini su ghiaccio senza scivolare, sopporti temperature gelide.' },
  { key: 'bowl_water_elementals',     name: 'Coppa del Comando delle Acque Elementali', type: 'meraviglioso', rarity: 'raro',        requiresAttunement: false, description: 'Evoca un elementale dell\'acqua (usa solo al giorno, ricarica all\'alba).' },
  { key: 'bracers_archery',           name: 'Bracciali del Tiro con l\'Arco',           type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: '+2 ai tiri per colpire con armi a distanza (archi).' },
  { key: 'bracers_defense',           name: 'Bracciali di Difesa',                     type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: '+2 alla CA mentre non indossi armatura né scudo.' },
  { key: 'brazier_fire_elementals',   name: 'Braciere del Comando dei Fuochi Elementali', type: 'meraviglioso', rarity: 'raro',      requiresAttunement: false, description: 'Evoca un elementale del fuoco (usa solo al giorno, ricarica all\'alba).' },
  { key: 'brooch_shielding',          name: 'Spilla di Scudo',                         type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Immunità ai danni dei Dardi Magici e resistenza ai danni della forza.' },
  { key: 'broom_flying',              name: 'Scopa Volante',                           type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Puoi volare cavalcando questa scopa a 15 m (o 9 m con passeggero).' },
  { key: 'candle_invocation',         name: 'Candela dell\'Invocazione',               type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Bruciata concede vantaggio ai tiri salvezza e incantesimi aggiuntivi ai chierici nel proprio dominio.' },
  { key: 'cape_mountebank',           name: 'Mantello del Saltimbanco',                type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Una volta al giorno puoi teleportarti fino a 9 m (come Passo Nebbioso).' },
  { key: 'carpet_flying',             name: 'Tappeto Volante',                         type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Tappeto volante che porta 1–4 creature a 24 m di velocità.' },
  { key: 'censer_air_elementals',     name: 'Incensiere del Comando delle Elementali d\'Aria', type: 'meraviglioso', rarity: 'raro', requiresAttunement: false, description: 'Evoca un elementale dell\'aria (usa solo al giorno, ricarica all\'alba).' },
  { key: 'chime_opening',             name: 'Campana dell\'Apertura',                  type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: '10 utilizzi: apre ogni serratura, sbarra o lucchetto entro 36 m.' },
  { key: 'circlet_blasting',          name: 'Diadema del Lampo',                       type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Una volta al giorno lancia Raggio Solare (CD 13 salvezza Cos, 4d6 danni radiosi).' },
  { key: 'cloak_arachnida',           name: 'Mantello dell\'Aracnide',                 type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Velocità di arrampicata uguale a quella a piedi, immunità al veleno dei ragni, Comunicare con i Ragni.' },
  { key: 'cloak_displacement',        name: 'Mantello dello Spostamento',              type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Proietti un\'immagine spostata: i nemici hanno svantaggio ai tiri per colpirti.' },
  { key: 'cloak_elvenkind',           name: 'Mantello degli Elfi',                     type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Vantaggio alle prove di Furtività; le percezioni passive dei nemici sono dimezzate contro di te.' },
  { key: 'cloak_protection',          name: 'Mantello di Protezione',                  type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: '+1 alla CA e ai tiri salvezza.' },
  { key: 'cloak_bat',                 name: 'Mantello del Pipistrello',                type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Vantaggio alle prove di Furtività al buio, velocità di volo 9 m, trasformazione in pipistrello.' },
  { key: 'cloak_manta_ray',           name: 'Mantello della Manta',                   type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Velocità di nuoto 18 m e respirazione subacquea.' },
  { key: 'crystal_ball',              name: 'Sfera di Cristallo',                      type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Lancia Scrutare (CD 17) tramite questa sfera.' },
  { key: 'crystal_ball_mind_reading', name: 'Sfera di Cristallo (Lettura del Pensiero)', type: 'meraviglioso', rarity: 'leggendario', requiresAttunement: true, description: 'Come la Sfera di Cristallo, più Individuare i Pensieri sulle creature osservate.' },
  { key: 'crystal_ball_telepathy',    name: 'Sfera di Cristallo (Telepatia)',           type: 'meraviglioso', rarity: 'leggendario', requiresAttunement: true,  description: 'Come la Sfera di Cristallo, più comunicazione telepatica con le creature osservate.' },
  { key: 'crystal_ball_true_seeing',  name: 'Sfera di Cristallo (Visione Verace)',     type: 'meraviglioso', rarity: 'leggendario', requiresAttunement: true,  description: 'Come la Sfera di Cristallo, più Visione del Vero su te stesso durante lo scrutare.' },
  { key: 'cube_force',                name: 'Cubo di Forza',                           type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: '36 cariche; attiva facce per produrre barriere di forza con vari effetti.' },
  { key: 'cubic_gate',                name: 'Portale Cubico',                          type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: false, description: 'Ogni faccia è sintonizzata su un piano; premila per aprire un portale.' },
  { key: 'daerns_instant_fortress',   name: 'Fortezza Istantanea di Daern',            type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Si espande in una torre di adamantio 6×6×9 m, con porta e tetto.' },
  { key: 'decanter_endless_water',    name: 'Brocca dell\'Acqua Infinita',             type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Eroga acqua in tre modalità: goccia, fontana o geyser.' },
  { key: 'deck_illusions',            name: 'Mazzo delle Illusioni',                   type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: '34 carte: ogni carta crea una illusione specifica per 1 ora.' },
  { key: 'deck_many_things',          name: 'Mazzo delle Molte Cose',                  type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: false, description: 'Mazzo leggendario con 13–22 carte dagli effetti catastrofici o meravigliosi.' },
  { key: 'dimensional_shackles',      name: 'Ceppi Dimensionali',                      type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Impedisce il movimento extradimensionale alla creatura incatenata.' },
  { key: 'dust_disappearance',        name: 'Polvere della Sparizione',                type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Rende invisibile la creatura cosparsa per 2d4 minuti.' },
  { key: 'dust_dryness',              name: 'Polvere della Siccità',                   type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Assorbe liquidi; può essere lanciata per creare un\'esplosione d\'acqua (2d6 danni).' },
  { key: 'dust_sneezing',             name: 'Polvere dello Starnuto e dello Strozzamento', type: 'meraviglioso', rarity: 'non_comune', requiresAttunement: false, description: 'Maledetta: causa starnuti e incapacità per 5d6 minuti se aperta.' },
  { key: 'efficient_quiver',          name: 'Faretra Efficiente',                      type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Tre scomparti extradimensionali per frecce, lance e armi simili.' },
  { key: 'efreeti_bottle',            name: 'Bottiglia dell\'Efreeti',                 type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Contiene un efreeti che potrebbe servirti, fuggire o attaccarti.' },
  { key: 'elemental_gem',             name: 'Gemma Elementale',                        type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Frantumata evoca un elementale del tipo corrispondente al colore.' },
  { key: 'eversmoking_bottle',        name: 'Bottiglia del Fumo Perenne',              type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Emette un fumo denso che oscura 18 m in ogni direzione finché non viene tappata.' },
  { key: 'eyes_charming',             name: 'Occhi dell\'Incantamento',                type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Tre volte al giorno: Incantare Persone su una creatura che ti guarda negli occhi (CD 13).' },
  { key: 'eyes_minute_seeing',        name: 'Occhi della Vista Minuta',                type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Visione in dettaglio estremo entro 30 cm; vantaggio su prove di percezione a corto raggio.' },
  { key: 'eyes_eagle',                name: 'Occhi dell\'Aquila',                      type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Vantaggio alle prove di Percezione (vista); puoi leggere a 1,5 km di distanza.' },
  { key: 'feather_token',             name: 'Simbolo di Piuma',                        type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Una piccola piuma che si trasforma in ancora, ventilatore, barca, albero o uccello.' },
  { key: 'figurine_bronze_griffon',   name: 'Figurina: Grifone di Bronzo',             type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Si trasforma in un grifone per 6 ore al giorno.' },
  { key: 'figurine_ebony_fly',        name: 'Figurina: Mosca d\'Ebano',               type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Si trasforma in una mosca gigante per 12 ore ogni 2 giorni.' },
  { key: 'figurine_golden_lions',     name: 'Figurina: Leoni d\'Oro (coppia)',         type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Si trasformano in due leoni per 1 ora, poi aspettano 7 giorni.' },
  { key: 'figurine_ivory_goats',      name: 'Figurina: Capre d\'Avorio (tre)',         type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Tre capre con poteri diversi: da guerra, viaggi o terrore.' },
  { key: 'figurine_marble_elephant',  name: 'Figurina: Elefante di Marmo',             type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Si trasforma in un elefante per 24 ore ogni 7 giorni.' },
  { key: 'figurine_obsidian_steed',   name: 'Figurina: Destriero d\'Ossidiana',        type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Si trasforma in un cavallo del Inferno con 90% di lealtà, 10% di tradimento.' },
  { key: 'figurine_onyx_dog',         name: 'Figurina: Cane d\'Onice',                type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Si trasforma in un mastino con olfatto extraordinario per 6 ore ogni 7 giorni.' },
  { key: 'figurine_serpentine_owl',   name: 'Figurina: Civetta di Serpentina',         type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Si trasforma in un gufo gigante per 8 ore ogni 2 giorni.' },
  { key: 'figurine_silver_raven',     name: 'Figurina: Corvo d\'Argento',              type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Si trasforma in un corvo per 12 ore, può anche usare Messaggio Animale.' },
  { key: 'folding_boat',              name: 'Barca Pieghevole',                        type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Scatola che si espande in barca a remi o in barca a vela.' },
  { key: 'gem_brightness',            name: 'Gemma della Luminosità',                  type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: '50 cariche: luce intensa, frecce di luce (4d6 danni raggianti), flash accecante.' },
  { key: 'gem_seeing',                name: 'Gemma della Visione',                     type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Tre volte al giorno: Visione del Vero per 10 minuti.' },
  { key: 'gloves_missile_snaring',    name: 'Guanti dello Scherma dei Proiettili',     type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Puoi usare la reazione per ridurre di 1d10+bonus di Des i danni dei proiettili.' },
  { key: 'gloves_swimming_climbing',  name: 'Guanti del Nuoto e dell\'Arrampicata',    type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Velocità di nuoto e arrampicata pari a quella a piedi, +5 ai relativi tiri.' },
  { key: 'gloves_thievery',           name: 'Guanti del Ladro',                        type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: '+5 ai tiri per Destrezza (Rapidità di Mano) e per aprire serrature.' },
  { key: 'goggles_night',             name: 'Occhiali della Notte',                    type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Visione nel buio entro 18 m o, se già ce l\'hai, la raddoppia.' },
  { key: 'handy_haversack',           name: 'Zaino Maneggevole',                       type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Tre scomparti extradimensionali; l\'oggetto cercato viene sempre trovato per primo.' },
  { key: 'hat_disguise',              name: 'Cappello del Travestimento',               type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Lancia Travestimento a volontà.' },
  { key: 'headband_intellect',        name: 'Fascia dell\'Intelletto',                 type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'La tua Intelligenza è 19 mentre indossi questa fascia.' },
  { key: 'helm_brilliance',           name: 'Elmo della Brillantezza',                 type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Lancia Raggi di Sole, Muro di Fuoco, Palla di Fuoco e Luce dalle gemme incastonate.' },
  { key: 'helm_comprehend_languages', name: 'Elmo della Comprensione delle Lingue',    type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Una volta al giorno lancia Comprendi le Lingue.' },
  { key: 'helm_telepathy',            name: 'Elmo della Telepatia',                    type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Lancia Individua i Pensieri a volontà; puoi inviare messaggi telepatici.' },
  { key: 'helm_teleportation',        name: 'Elmo della Teleportazione',               type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Tre volte al giorno lancia Teletrasporto (solo te stesso).' },
  { key: 'horn_blasting',             name: 'Corno del Fragore',                       type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Tre suoni: suono ordinario, stordente (CD13 Cos) o distruttivo (5d6 tuoni, CD13).' },
  { key: 'horn_valhalla_silver',      name: 'Corno del Valhalla d\'Argento',           type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Evoca 2d4+2 berserker (richiede competenza con armi semplici o la maledizione).' },
  { key: 'horn_valhalla_brass',       name: 'Corno del Valhalla d\'Ottone',            type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Evoca 3d4+3 berserker (richiede competenza con armi marziali).' },
  { key: 'horn_valhalla_bronze',      name: 'Corno del Valhalla di Bronzo',            type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Evoca 4d4+4 berserker (richiede competenza con tutti gli strumenti).' },
  { key: 'horn_valhalla_iron',        name: 'Corno del Valhalla di Ferro',             type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: false, description: 'Evoca 5d4+5 berserker (richiede competenza con tutti gli strumenti da guerra).' },
  { key: 'horseshoes_zephyr',         name: 'Ferri di Cavallo del Vento',              type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'La cavalcatura vola a 24 m e lascia tracce d\'aria al posto degli zoccoli.' },
  { key: 'horseshoes_speed',          name: 'Ferri di Cavallo della Velocità',         type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'La velocità della cavalcatura aumenta di 9 m.' },
  { key: 'ioun_stone_absorption',     name: 'Pietra di Ioun (Assorbimento)',            type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Assorbe slot incantesimo 1°-5° livello; capacità massima 50 livelli.' },
  { key: 'ioun_stone_agility',        name: 'Pietra di Ioun (Agilità)',                type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'La tua Destrezza aumenta di 2 (massimo 20).' },
  { key: 'ioun_stone_awareness',      name: 'Pietra di Ioun (Consapevolezza)',          type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Non puoi essere sorpreso.' },
  { key: 'ioun_stone_fortitude',      name: 'Pietra di Ioun (Fortitudine)',             type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'La tua Costituzione aumenta di 2 (massimo 20).' },
  { key: 'ioun_stone_greater_absorb', name: 'Pietra di Ioun (Grande Assorbimento)',    type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: true,  description: 'Assorbe slot incantesimo fino al 9° livello; capacità massima 50 livelli.' },
  { key: 'ioun_stone_insight',        name: 'Pietra di Ioun (Perspicacia)',             type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'La tua Saggezza aumenta di 2 (massimo 20).' },
  { key: 'ioun_stone_intellect',      name: 'Pietra di Ioun (Intelletto)',              type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'La tua Intelligenza aumenta di 2 (massimo 20).' },
  { key: 'ioun_stone_leadership',     name: 'Pietra di Ioun (Leadership)',              type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Il tuo Carisma aumenta di 2 (massimo 20).' },
  { key: 'ioun_stone_mastery',        name: 'Pietra di Ioun (Padronanza)',              type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: true,  description: 'Il tuo bonus di competenza aumenta di 1.' },
  { key: 'ioun_stone_protection',     name: 'Pietra di Ioun (Protezione)',              type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: '+1 alla Classe Armatura.' },
  { key: 'ioun_stone_regeneration',   name: 'Pietra di Ioun (Rigenerazione)',           type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: true,  description: 'Recuperi 15 PF ogni alba; ristabilisce anche le membra perdute.' },
  { key: 'ioun_stone_reserve',        name: 'Pietra di Ioun (Riserva)',                 type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Memorizza fino a 3 livelli di incantesimi da spendere per lanciarne altri.' },
  { key: 'ioun_stone_strength',       name: 'Pietra di Ioun (Forza)',                   type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'La tua Forza aumenta di 2 (massimo 20).' },
  { key: 'ioun_stone_sustenance',     name: 'Pietra di Ioun (Sostentamento)',           type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Non hai bisogno di mangiare né bere.' },
  { key: 'iron_bands_bilarro',        name: 'Anelli di Ferro di Bilarro',              type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Una volta al giorno: lancia la sfera per immobilizzare una creatura (forza CA 20).' },
  { key: 'iron_flask',                name: 'Fiasca di Ferro',                         type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: false, description: 'Intrappola qualsiasi creatura; il prigioniero obbedisce per 1 ora se liberato.' },
  { key: 'lantern_revealing',         name: 'Lanterna della Rivelazione',               type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Rivela creature e oggetti invisibili entro il suo raggio di luce.' },
  { key: 'mantle_spell_resistance',   name: 'Manto della Resistenza agli Incantesimi', type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Vantaggio ai tiri salvezza contro incantesimi.' },
  { key: 'manual_bodily_health',      name: 'Manuale della Salute Corporea',            type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Letto in 48 ore, la tua Costituzione aumenta di 2 (massimo 24); poi il libro scompare.' },
  { key: 'manual_gainful_exercise',   name: 'Manuale dell\'Esercizio Proficuo',         type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Letto in 48 ore, la tua Forza aumenta di 2 (massimo 24); poi il libro scompare.' },
  { key: 'manual_golems',             name: 'Manuale dei Golem',                        type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Contiene le istruzioni per costruire un golem specifico (argilla, carne, ferro o pietra).' },
  { key: 'manual_quickness',          name: 'Manuale della Rapidità d\'Azione',         type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Letto in 48 ore, la tua Destrezza aumenta di 2 (massimo 24); poi il libro scompare.' },
  { key: 'medallion_thoughts',        name: 'Medaglione dei Pensieri',                 type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Tre volte al giorno lancia Individuare i Pensieri (CD 13).' },
  { key: 'mirror_life_trapping',      name: 'Specchio della Trappola Vitale',           type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Intrappola creature che si riflettono in uno dei suoi 12 scomparti.' },
  { key: 'necklace_adaptation',       name: 'Collana dell\'Adattamento',               type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Puoi respirare in qualsiasi ambiente; immunità ai veleni gassosi.' },
  { key: 'necklace_fireballs',        name: 'Collana delle Palle di Fuoco',             type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: '1–7 sfere (3d6 danni ciascuna), lanciabili individualmente.' },
  { key: 'necklace_prayer_beads',     name: 'Collana delle Perle della Preghiera',     type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'chierico, druido o paladino', description: 'Ogni perla permette di lanciare un incantesimo clericale (Benedizione, Guarigione, ecc.).' },
  { key: 'nolzurs_pigments',          name: 'Pigmenti Meravigliosi di Nolzur',         type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Dipingi oggetti che diventano reali; le scene tridimensionali diventano veri spazi.' },
  { key: 'oil_etherealness',          name: 'Olio dell\'Etereo',                        type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Applicato: metti la creatura nel Piano Etereo per 1 ora.' },
  { key: 'oil_sharpness',             name: 'Olio dell\'Affilatura',                    type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Applicato a un\'arma tagliente: +3 ai tiri per colpire e ai danni per 1 ora.' },
  { key: 'oil_slipperiness',          name: 'Olio della Scivolosità',                   type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Rende la creatura impossibile da afferrare per 8 ore.' },
  { key: 'pearl_power',               name: 'Perla del Potere',                         type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  attunementNote: 'incantatore', description: 'Una volta al giorno: recupera un slot incantesimo già speso (fino al 3° livello).' },
  { key: 'periapt_health',            name: 'Periapto della Salute',                   type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Immunità alle malattie.' },
  { key: 'periapt_proof_poison',      name: 'Periapto di Protezione dal Veleno',       type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Immunità al veleno (danni e condizione avvelenato).' },
  { key: 'periapt_wound_closure',     name: 'Periapto della Chiusura delle Ferite',    type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Stabilizzati automaticamente, recupero raddoppiato, i dadi vita recuperano il doppio.' },
  { key: 'philter_love',              name: 'Filtro d\'Amore',                          type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Chi lo beve si innamora della prima creatura che vede per 1 ora.' },
  { key: 'pipes_haunting',            name: 'Trombette degli Spiriti',                 type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Tre volte al giorno: Paura su un massimo di 10 creature che sentono la musica (CD 13).' },
  { key: 'pipes_sewers',              name: 'Trombette delle Fognature',               type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Comunicare con i Topi e richiamare 1d3×10 ratti giganti.' },
  { key: 'portable_hole',             name: 'Buco Portatile',                           type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Panno che apre un varco in uno spazio extradimensionale 1,8 m di diametro × 3 m.' },
  { key: 'restorative_ointment',      name: 'Unguento Restorativo',                    type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Cura 2d8+2 PF e neutralizza veleni e malattie (fino a 4 dosi per vaso).' },
  { key: 'robe_eyes',                 name: 'Veste degli Occhi',                        type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Visione del Vero e percezione al buio su ogni lato; non puoi chiudere gli occhi.' },
  { key: 'robe_scintillating',        name: 'Veste dei Colori Scintillanti',            type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Emette luce abbagliante; proietta 3 raggi colorati al turno con effetti casuali.' },
  { key: 'robe_stars',                name: 'Veste delle Stelle',                       type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Serbatoio di incantesimi; puoi entrare nel Piano Astrale come azione.' },
  { key: 'robe_archmagi',             name: 'Veste dell\'Arcimago',                    type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: true,  attunementNote: 'stregone, warlock o mago', description: 'CD incantesimi +2, attacco +2, CA 15 + Des e vantaggio ai tiri salvezza contro incantesimi.' },
  { key: 'robe_useful_items',         name: 'Veste degli Oggetti Utili',               type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Patch strappabili che si trasformano in oggetti utili (scala, barca, porte, gemme, ecc.).' },
  { key: 'rope_climbing',             name: 'Corda dell\'Arrampicata',                 type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Si arrampica, si annoda e si distende da sola; porta fino a 450 kg.' },
  { key: 'rope_entanglement',         name: 'Corda del Viluppo',                        type: 'meraviglioso', rarity: 'raro',         requiresAttunement: false, description: 'Ordina: intrappola la creatura avvolta (forza CD 15 per liberarsi).' },
  { key: 'saddle_cavalier',           name: 'Sella del Cavaliere',                     type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Non puoi essere disarcionato involontariamente; la cavalcatura non rischia di cadere.' },
  { key: 'scarab_protection',         name: 'Scarabeo di Protezione',                  type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: true,  description: '12 cariche: immunità ai non morti, vantaggio ai TS contro incantesimi, spendi cariche contro effetti.' },
  { key: 'sending_stones',            name: 'Pietre dell\'Invio (coppia)',              type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Come l\'incantesimo Messaggio (25 parole) tra i due possessori, una volta al giorno ciascuno.' },
  { key: 'slippers_spider_climbing',  name: 'Pantofole dell\'Arrampicata del Ragno',   type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Velocità di arrampicata uguale a quella a piedi, anche su soffitti.' },
  { key: 'sphere_annihilation',       name: 'Sfera dell\'Annientamento',               type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: false, description: 'Sfera di 60 cm che distrugge qualsiasi materia non magica che tocca.' },
  { key: 'stone_earth_elementals',    name: 'Pietra del Controllo degli Elementali della Terra', type: 'meraviglioso', rarity: 'raro', requiresAttunement: false, description: 'Evoca un elementale della terra (usa solo al giorno, ricarica all\'alba).' },
  { key: 'stone_good_luck',           name: 'Pietra della Buona Fortuna',              type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: '+1 ai tiri per colpire, alle prove di caratteristica e ai tiri salvezza.' },
  { key: 'talisman_pure_good',        name: 'Talismano del Puro Bene',                 type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: true,  attunementNote: 'creatura buona', description: '7 cariche: apre voragini sotto i malvagi; +2 ai tiri salvezza.' },
  { key: 'talisman_sphere',           name: 'Talismano della Sfera',                   type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: true,  description: 'Controllo sulla Sfera dell\'Annientamento con vantaggio alle prove di Arcana.' },
  { key: 'talisman_ultimate_evil',    name: 'Talismano del Male Assoluto',             type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: true,  attunementNote: 'creatura malvagia', description: '6 cariche: apre voragini sotto i buoni; +2 ai tiri salvezza.' },
  { key: 'tome_clear_thought',        name: 'Tomo del Pensiero Limpido',               type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Letto in 48 ore, la tua Intelligenza aumenta di 2 (massimo 24); poi il libro scompare.' },
  { key: 'tome_leadership',           name: 'Tomo della Leadership e dell\'Influenza', type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Letto in 48 ore, il tuo Carisma aumenta di 2 (massimo 24); poi il libro scompare.' },
  { key: 'tome_understanding',        name: 'Tomo della Comprensione',                 type: 'meraviglioso', rarity: 'molto_raro',   requiresAttunement: false, description: 'Letto in 48 ore, la tua Saggezza aumenta di 2 (massimo 24); poi il libro scompare.' },
  { key: 'universal_solvent',         name: 'Solvente Universale',                     type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: false, description: 'Scioglie qualsiasi adesivo, compresi i prodotti della Colla Universale.' },
  { key: 'well_many_worlds',          name: 'Pozza dei Mille Mondi',                   type: 'meraviglioso', rarity: 'leggendario',  requiresAttunement: false, description: 'Apre un portale bidirezionale verso un piano casuale.' },
  { key: 'wind_fan',                  name: 'Ventaglio del Vento',                     type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: false, description: 'Una volta al giorno lancia Raffiche di Vento; 10% di probabilità di rompersi ad ogni uso.' },
  { key: 'winged_boots',              name: 'Stivali Alati',                           type: 'meraviglioso', rarity: 'non_comune',  requiresAttunement: true,  description: 'Velocità di volo uguale a quella a piedi per 4 ore al giorno (ricarica all\'alba).' },
  { key: 'wings_flying',              name: 'Ali del Volo',                            type: 'meraviglioso', rarity: 'raro',         requiresAttunement: true,  description: 'Velocità di volo 18 m.' },
  // Strumenti dei Bardi
  { key: 'instrument_fochulan',       name: 'Bandora di Fochulan',                     type: 'strumento',    rarity: 'non_comune',  requiresAttunement: true,  attunementNote: 'bardo', description: 'Incantesimi del bardo: Favore del Druido, Amicizia con gli Animali, Parla con gli Animali.' },
  { key: 'instrument_macfuirmidh',    name: 'Cetera di Mac-Fuirmidh',                 type: 'strumento',    rarity: 'non_comune',  requiresAttunement: true,  attunementNote: 'bardo', description: 'Incantesimi del bardo: Cura Ferite, Individuare il Male e il Bene, Protezione dal Veleno.' },
  { key: 'instrument_doss',           name: 'Liuto di Doss',                           type: 'strumento',    rarity: 'non_comune',  requiresAttunement: true,  attunementNote: 'bardo', description: 'Incantesimi del bardo: Amicizia con gli Animali, Protezione Contro il Male e il Bene, Santuario.' },
  { key: 'instrument_canaith',        name: 'Mandolino di Canaith',                    type: 'strumento',    rarity: 'raro',         requiresAttunement: true,  attunementNote: 'bardo', description: 'Incantesimi del bardo: Cura Ferite (3°), Controprestigio, Dispel Magic, Protezione dal Veleno.' },
  { key: 'instrument_cli',            name: 'Cetra di Cli',                            type: 'strumento',    rarity: 'raro',         requiresAttunement: true,  attunementNote: 'bardo', description: 'Incantesimi del bardo: Cura Ferite (6°), Guarire, Liberare dalla Maledizione.' },
  { key: 'instrument_anstruth',       name: 'Arpa di Anstruth',                        type: 'strumento',    rarity: 'molto_raro',   requiresAttunement: true,  attunementNote: 'bardo', description: 'Incantesimi del bardo: Cura Ferite (8°), Controllo del Tempo Atmosferico, Tempesta di Ghiaccio.' },
  { key: 'instrument_ollamh',         name: 'Arpa di Ollamh',                          type: 'strumento',    rarity: 'leggendario',  requiresAttunement: true,  attunementNote: 'bardo', description: 'L\'arpa più potente dei bardi; include tutti gli incantesimi delle arpe inferiori più Muro di Tuono.' },
];

// ─── Anelli ───────────────────────────────────────────────────────────────────

const RINGS: SrdMagicItem[] = [
  { key: 'ring_animal_influence',    name: 'Anello dell\'Influenza sugli Animali',    type: 'anello', rarity: 'raro',         requiresAttunement: false, description: '3 cariche: Amicizia con gli Animali, Paura degli Animali, Parlare con gli Animali.' },
  { key: 'ring_djinni_summoning',    name: 'Anello dell\'Invocazione del Djinni',     type: 'anello', rarity: 'leggendario',  requiresAttunement: true,  description: 'Evoca un djinni legato (servitore fedele) una volta al giorno.' },
  { key: 'ring_elemental_command_air',  name: 'Anello del Comando Elementale (Aria)',  type: 'anello', rarity: 'leggendario',  requiresAttunement: true,  description: 'Padronanza sugli elementali dell\'aria e 5 incantesimi legati al vento.' },
  { key: 'ring_elemental_command_earth', name: 'Anello del Comando Elementale (Terra)', type: 'anello', rarity: 'leggendario', requiresAttunement: true,  description: 'Padronanza sugli elementali della terra e 5 incantesimi legati alla terra.' },
  { key: 'ring_elemental_command_fire', name: 'Anello del Comando Elementale (Fuoco)', type: 'anello', rarity: 'leggendario',  requiresAttunement: true,  description: 'Padronanza sugli elementali del fuoco e 5 incantesimi legati al fuoco.' },
  { key: 'ring_elemental_command_water', name: 'Anello del Comando Elementale (Acqua)', type: 'anello', rarity: 'leggendario', requiresAttunement: true,  description: 'Padronanza sugli elementali dell\'acqua e 5 incantesimi legati all\'acqua.' },
  { key: 'ring_evasion',             name: 'Anello dell\'Evasione',                  type: 'anello', rarity: 'raro',         requiresAttunement: true,  description: '3 cariche: reazione per convertire un fallimento su TS Des in successo.' },
  { key: 'ring_feather_falling',     name: 'Anello della Caduta delle Piume',         type: 'anello', rarity: 'raro',         requiresAttunement: true,  description: 'Rallenta la tua caduta come l\'incantesimo Caduta delle Piume.' },
  { key: 'ring_free_action',         name: 'Anello della Libertà d\'Azione',          type: 'anello', rarity: 'raro',         requiresAttunement: true,  description: 'Immunità alle condizioni rallentato e paralizzato; terreno difficile non ti rallenta.' },
  { key: 'ring_invisibility',        name: 'Anello dell\'Invisibilità',               type: 'anello', rarity: 'leggendario',  requiresAttunement: true,  description: 'Diventi invisibile finché non attacchi, lanci incantesimi o rimuovi l\'anello.' },
  { key: 'ring_jumping',             name: 'Anello del Salto',                        type: 'anello', rarity: 'non_comune',  requiresAttunement: true,  description: 'Bonus: l\'incantesimo Saltare su te stesso finché lo desideri.' },
  { key: 'ring_mind_shielding',      name: 'Anello della Schermatura Mentale',        type: 'anello', rarity: 'non_comune',  requiresAttunement: true,  description: 'Immunità alla lettura del pensiero, allineamento non rilevabile; anima intrappolata alla morte.' },
  { key: 'ring_protection',          name: 'Anello di Protezione',                   type: 'anello', rarity: 'raro',         requiresAttunement: true,  description: '+1 alla CA e ai tiri salvezza.' },
  { key: 'ring_regeneration',        name: 'Anello della Rigenerazione',              type: 'anello', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Recuperi 1d6 PF ogni 10 minuti; ristabilisce le membra perdute in 1d6+1 giorni.' },
  { key: 'ring_resistance',          name: 'Anello della Resistenza',                 type: 'anello', rarity: 'raro',         requiresAttunement: true,  description: 'Resistenza a un tipo di danno (acido, freddo, fuoco, fulmine, tuono, ecc.).' },
  { key: 'ring_shooting_stars',      name: 'Anello delle Stelle Cadenti',             type: 'anello', rarity: 'molto_raro',   requiresAttunement: true,  attunementNote: 'all\'aperto di notte', description: '6 cariche di stelle (5d4 danni ciascuna), scintille (1–3 bersagli, 1–6 danni per scintilla).' },
  { key: 'ring_spell_storing',       name: 'Anello dell\'Immagazzinamento degli Incantesimi', type: 'anello', rarity: 'raro', requiresAttunement: true, description: 'Memorizza fino a 5 livelli di incantesimi; chiunque possa lanciare incantesimi può caricarli.' },
  { key: 'ring_spell_turning',       name: 'Anello della Deviazione degli Incantesimi', type: 'anello', rarity: 'leggendario', requiresAttunement: true, description: 'Vantaggio ai TS contro incantesimi; se tiri 20, l\'incantesimo si ritorce sul lanciatore.' },
  { key: 'ring_swimming',            name: 'Anello del Nuoto',                        type: 'anello', rarity: 'non_comune',  requiresAttunement: false, description: 'Velocità di nuoto 9 m.' },
  { key: 'ring_telekinesis',         name: 'Anello della Telecinesi',                 type: 'anello', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Lancia Telecinesi a volontà.' },
  { key: 'ring_the_ram',             name: 'Anello dell\'Ariete',                     type: 'anello', rarity: 'raro',         requiresAttunement: true,  description: '3 cariche: forza magica che colpisce (1–3 cariche, 2d10 danni e spinge indietro).' },
  { key: 'ring_three_wishes',        name: 'Anello dei Tre Desideri',                 type: 'anello', rarity: 'leggendario',  requiresAttunement: false, description: '3 cariche: lancia Desiderio.' },
  { key: 'ring_warmth',              name: 'Anello del Calore',                       type: 'anello', rarity: 'non_comune',  requiresAttunement: true,  description: 'Resistenza al freddo; sopporti temperature gelide senza protezioni.' },
  { key: 'ring_water_walking',       name: 'Anello del Cammino sull\'Acqua',          type: 'anello', rarity: 'non_comune',  requiresAttunement: false, description: 'Cammini su superfici liquide come se fossero terra solida.' },
  { key: 'ring_xray_vision',         name: 'Anello della Visione ai Raggi X',         type: 'anello', rarity: 'raro',         requiresAttunement: true,  description: 'Vedi attraverso i materiali solidi entro 9 m; non funziona attraverso oro o piombo.' },
];

// ─── Verghe ───────────────────────────────────────────────────────────────────

const RODS: SrdMagicItem[] = [
  { key: 'rod_immovable',     name: 'Verga Immobile',                 type: 'verga', rarity: 'non_comune',  requiresAttunement: false, description: 'Si fissa nello spazio, resistendo fino a 4.000 kg di forza.' },
  { key: 'rod_absorption',    name: 'Verga dell\'Assorbimento',       type: 'verga', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Assorbe incantesimi diretti verso di te e converte i loro slot in cariche (max 50).' },
  { key: 'rod_alertness',     name: 'Verga della Vigilanza',          type: 'verga', rarity: 'molto_raro',   requiresAttunement: true,  description: '+1 a Percezione, non puoi essere sorpreso, Individua il Male e il Bene, campo di forza.' },
  { key: 'rod_lordly_might',  name: 'Verga del Potere Signorile',     type: 'verga', rarity: 'leggendario',  requiresAttunement: true,  description: 'Combina un mazzafrusto magico con sei funzioni speciali attivabili (bulldozer, blocco, ecc.).' },
  { key: 'rod_rulership',     name: 'Verga della Signoria',           type: 'verga', rarity: 'raro',         requiresAttunement: true,  description: 'Una volta al giorno: Dominare Persone su creature entro 36 m (CD 15) per 8 ore.' },
  { key: 'rod_security',      name: 'Verga della Sicurezza',          type: 'verga', rarity: 'molto_raro',   requiresAttunement: false, description: 'Trasporta fino a 200 creature in un paradiso extradimensionale per 200 giorni.' },
];

// ─── Bastoni ──────────────────────────────────────────────────────────────────

const STAFFS: SrdMagicItem[] = [
  { key: 'staff_charming',         name: 'Bastone dell\'Incantamento',          type: 'bastone', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'bardo, chierico, druido, stregone, warlock o mago', description: '10 cariche: Incantare Persone, Amicizia, Compulsione, Dominare Persone.' },
  { key: 'staff_fire',             name: 'Bastone del Fuoco',                   type: 'bastone', rarity: 'molto_raro',   requiresAttunement: true,  attunementNote: 'druido, stregone, warlock o mago', description: '10 cariche: Mano Ardente, Palla di Fuoco, Muro di Fuoco; resistenza al fuoco.' },
  { key: 'staff_frost',            name: 'Bastone del Gelo',                    type: 'bastone', rarity: 'molto_raro',   requiresAttunement: true,  attunementNote: 'druido, stregone, warlock o mago', description: '10 cariche: Nebbia Blocca Vista, Cono di Freddo, Muro di Ghiaccio; resistenza al freddo.' },
  { key: 'staff_healing',          name: 'Bastone della Guarigione',            type: 'bastone', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'bardo, chierico o druido', description: '10 cariche: Guarisci Ferite, Cura le Ferite di Massa, Ristorare.' },
  { key: 'staff_power',            name: 'Bastone del Potere',                  type: 'bastone', rarity: 'molto_raro',   requiresAttunement: true,  attunementNote: 'stregone, warlock o mago', description: '20 cariche; +2 CA e TS; Dardi Magici, Palla di Fuoco, Tempesta di Ghiaccio, ecc.' },
  { key: 'staff_striking',         name: 'Bastone del Colpo',                   type: 'bastone', rarity: 'molto_raro',   requiresAttunement: true,  description: '10 cariche: spendi per infliggere danni forza extra (1d6 per carica, max 3).' },
  { key: 'staff_swarming_insects', name: 'Bastone degli Insetti Sciamanti',     type: 'bastone', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'chierico, druido, stregone, warlock o mago', description: '10 cariche: Sciame di Insetti, Veleno di Ragno, Nuvola Ammorbante.' },
  { key: 'staff_python',           name: 'Bastone del Pitone',                  type: 'bastone', rarity: 'non_comune',  requiresAttunement: true,  attunementNote: 'chierico, druido o warlock', description: 'Si trasforma in un pitone gigante che combatte per te; 3 volte usabile (poi nubis).' },
  { key: 'staff_woodlands',        name: 'Bastone dei Boschi',                  type: 'bastone', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'druido', description: '10 cariche; trasformazione in albero, Parlare con le Piante, Passare senza Tracce e altro.' },
  { key: 'staff_thunder_lightning',name: 'Bastone dei Tuoni e dei Fulmini',     type: 'bastone', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Sei funzioni giornaliere: fulmine (2d6), tuono (2d6+stordimento), tempesta, ecc.' },
  { key: 'staff_withering',        name: 'Bastone del Deperimento',             type: 'bastone', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'chierico, druido o warlock', description: '3 cariche: colpire riduce la Cos della creatura di 1d4 e dimezza i PF recuperabili.' },
];

// ─── Bacchette ────────────────────────────────────────────────────────────────

const WANDS: SrdMagicItem[] = [
  { key: 'wand_binding',           name: 'Bacchetta dell\'Incatenamento',       type: 'bacchetta', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'stregone, warlock o mago', description: '7 cariche: Blocca Persone, Blocca Mostro.' },
  { key: 'wand_enemy_detection',   name: 'Bacchetta dell\'Individuazione dei Nemici', type: 'bacchetta', rarity: 'raro',   requiresAttunement: true,  description: '7 cariche: rileva la direzione del nemico più vicino entro 18 m per 1 minuto.' },
  { key: 'wand_fear',              name: 'Bacchetta del Timore',                type: 'bacchetta', rarity: 'raro',         requiresAttunement: true,  description: '7 cariche: Paura in cono di 18 m (CD 15 TS Sag).' },
  { key: 'wand_fireballs',         name: 'Bacchetta delle Palle di Fuoco',      type: 'bacchetta', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'stregone, warlock o mago', description: '7 cariche: Palla di Fuoco (CD 15, +7 all\'attacco, scala con cariche).' },
  { key: 'wand_lightning_bolts',   name: 'Bacchetta dei Fulmini',               type: 'bacchetta', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'stregone, warlock o mago', description: '7 cariche: Fulmine (CD 15, scala con cariche).' },
  { key: 'wand_magic_detection',   name: 'Bacchetta dell\'Individuazione della Magia', type: 'bacchetta', rarity: 'non_comune', requiresAttunement: false, description: '3 cariche: Individuazione della Magia.' },
  { key: 'wand_magic_missiles',    name: 'Bacchetta dei Dardi Magici',          type: 'bacchetta', rarity: 'non_comune',  requiresAttunement: false, description: '7 cariche: Dardo Magico (scala con cariche, max 6° livello).' },
  { key: 'wand_paralysis',         name: 'Bacchetta della Paralisi',            type: 'bacchetta', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'stregone, warlock o mago', description: '7 cariche: paralizza un bersaglio per 1 minuto (CD 15 TS Cos).' },
  { key: 'wand_polymorph',         name: 'Bacchetta del Polimorfismo',          type: 'bacchetta', rarity: 'molto_raro',   requiresAttunement: true,  attunementNote: 'stregone, warlock o mago', description: '7 cariche: Polimorfismo (CD 15 TS Sag).' },
  { key: 'wand_secrets',           name: 'Bacchetta dei Segreti',               type: 'bacchetta', rarity: 'non_comune',  requiresAttunement: false, description: '3 cariche: rivela porte segrete e trappole entro 9 m.' },
  { key: 'wand_war_mage_1',        name: 'Bacchetta del Mago Guerriero +1',     type: 'bacchetta', rarity: 'non_comune',  requiresAttunement: true,  attunementNote: 'incantatore', description: '+1 ai tiri per colpire degli incantesimi e ignori metà copertura.' },
  { key: 'wand_war_mage_2',        name: 'Bacchetta del Mago Guerriero +2',     type: 'bacchetta', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'incantatore', description: '+2 ai tiri per colpire degli incantesimi e ignori metà copertura.' },
  { key: 'wand_war_mage_3',        name: 'Bacchetta del Mago Guerriero +3',     type: 'bacchetta', rarity: 'molto_raro',   requiresAttunement: true,  attunementNote: 'incantatore', description: '+3 ai tiri per colpire degli incantesimi e ignori metà copertura.' },
  { key: 'wand_web',               name: 'Bacchetta della Tela',                type: 'bacchetta', rarity: 'non_comune',  requiresAttunement: true,  attunementNote: 'stregone, warlock o mago', description: '7 cariche: Ragnatela (CD 15).' },
  { key: 'wand_wonder',            name: 'Bacchetta della Meraviglia',          type: 'bacchetta', rarity: 'raro',         requiresAttunement: true,  attunementNote: 'stregone, warlock o mago', description: '7 cariche: effetto casuale su d100 (farfalle, raggi colorati, erba, bestia, ecc.).' },
];

// ─── Armi Magiche ─────────────────────────────────────────────────────────────

const MAGIC_WEAPONS: SrdMagicItem[] = [
  { key: 'weapon_plus_1',          name: 'Arma +1',                            type: 'arma', rarity: 'non_comune',  requiresAttunement: false, description: '+1 ai tiri per colpire e ai danni.' },
  { key: 'weapon_plus_2',          name: 'Arma +2',                            type: 'arma', rarity: 'raro',         requiresAttunement: false, description: '+2 ai tiri per colpire e ai danni.' },
  { key: 'weapon_plus_3',          name: 'Arma +3',                            type: 'arma', rarity: 'molto_raro',   requiresAttunement: false, description: '+3 ai tiri per colpire e ai danni.' },
  { key: 'ammunition_plus_1',      name: 'Munizioni +1',                       type: 'munizioni', rarity: 'non_comune', requiresAttunement: false, description: '+1 ai tiri per colpire e ai danni; si distrugge dopo l\'uso.' },
  { key: 'ammunition_plus_2',      name: 'Munizioni +2',                       type: 'munizioni', rarity: 'raro',     requiresAttunement: false, description: '+2 ai tiri per colpire e ai danni; si distrugge dopo l\'uso.' },
  { key: 'ammunition_plus_3',      name: 'Munizioni +3',                       type: 'munizioni', rarity: 'molto_raro', requiresAttunement: false, description: '+3 ai tiri per colpire e ai danni; si distrugge dopo l\'uso.' },
  { key: 'arrow_slaying',          name: 'Freccia dell\'Abbattimento',         type: 'munizioni', rarity: 'molto_raro', requiresAttunement: false, description: 'Infligge 6d10 danni aggiuntivi a una creatura di tipo specifico (CD 17 TS Cos per dimezzare).' },
  { key: 'berserker_axe',          name: 'Ascia del Berserkir',                type: 'arma', rarity: 'raro',         requiresAttunement: true,  description: 'Maledetta: +1 ai tiri, ma la furia ti costringe ad attaccare creature vicine.' },
  { key: 'dagger_venom',           name: 'Pugnale del Veleno',                 type: 'arma', rarity: 'raro',         requiresAttunement: false, description: '2d10 danni veleno immediati o 2d10 danni veleno per 24 ore (CD 15).' },
  { key: 'dancing_sword',          name: 'Spada Danzante',                     type: 'arma', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Bonus: lanci la spada nell\'aria e combatte da sola per 1 minuto.' },
  { key: 'defender',               name: 'Difensore',                          type: 'arma', rarity: 'leggendario',  requiresAttunement: true,  description: '+3 ai tiri; puoi trasferire parte del bonus (fino a 3) alla CA.' },
  { key: 'dragon_slayer',          name: 'Ammazza Draghi',                     type: 'arma', rarity: 'raro',         requiresAttunement: false, description: '+3d6 danni extra contro i draghi; vantaggio ai TS contro il loro Soffio.' },
  { key: 'dwarven_thrower',        name: 'Lanciatore Nanico',                  type: 'arma', rarity: 'molto_raro',   requiresAttunement: true,  attunementNote: 'nano', description: '+3 ai tiri; lancia il martello che poi ritorna (3d8 danni contro giganti).' },
  { key: 'flame_tongue',           name: 'Lingua di Fiamma',                   type: 'arma', rarity: 'raro',         requiresAttunement: true,  description: 'Bonus: avvolgi la lama di fuoco (+2d6 danni fuoco); illumina come torcia.' },
  { key: 'frost_brand',            name: 'Marchio del Gelo',                   type: 'arma', rarity: 'molto_raro',   requiresAttunement: true,  description: '+1d6 danni freddo; resistenza al fuoco; spegne le fiamme circostanti.' },
  { key: 'giant_slayer',           name: 'Ammazza Giganti',                    type: 'arma', rarity: 'raro',         requiresAttunement: false, description: '+2d6 danni contro i giganti; vantaggio ai TS contro i loro effetti.' },
  { key: 'hammer_thunderbolts',    name: 'Martello dei Tuoni',                 type: 'arma', rarity: 'leggendario',  requiresAttunement: false, description: '+1 ai tiri, +1 For e Cap massima; 5d6 tuoni e stordisce i giganti colpiti.' },
  { key: 'holy_avenger',           name: 'Avenger Sacro',                      type: 'arma', rarity: 'leggendario',  requiresAttunement: true,  attunementNote: 'paladino', description: '+3 ai tiri; 2d10 danni extra contro non morti e demoni; campo anti-magia 3 m.' },
  { key: 'javelin_lightning',      name: 'Giavellotto del Fulmine',            type: 'arma', rarity: 'non_comune',  requiresAttunement: false, description: 'Trasformalo in un fulmine (4d6 danni, CD 13 TS Des, poi torna a essere giavellotto).' },
  { key: 'luck_blade',             name: 'Lama della Fortuna',                 type: 'arma', rarity: 'leggendario',  requiresAttunement: true,  description: '+1 ai tiri e ai TS; rolla fortuna una volta al giorno; 1d4 cariche Desiderio.' },
  { key: 'mace_disruption',        name: 'Mazza del Turbamento',               type: 'arma', rarity: 'raro',         requiresAttunement: true,  description: '+2d6 danni radiosi ai non morti; abbattimento automatico se ridotti a 25 PF o meno.' },
  { key: 'mace_smiting',           name: 'Mazza del Colpo',                    type: 'arma', rarity: 'raro',         requiresAttunement: false, description: '+2 ai tiri; +2d6 danni ai costrutti; critico automatico a 0 PF dei costrutti.' },
  { key: 'mace_terror',            name: 'Mazza del Terrore',                  type: 'arma', rarity: 'raro',         requiresAttunement: true,  description: '3 cariche: Paura sulle creature entro 9 m (CD 15 TS Sag).' },
  { key: 'nine_lives_stealer',     name: 'Ammazza Nove Vite',                  type: 'arma', rarity: 'molto_raro',   requiresAttunement: true,  description: '+2 ai tiri; con un critico su creature con max 100 PF, TS Cos CD 15 o morte.' },
  { key: 'oathbow',                name: 'Arco del Giuramento',                type: 'arma', rarity: 'molto_raro',   requiresAttunement: true,  description: 'Puoi dichiarare un giuramento contro un nemico: 3d6 danni extra, vantaggio in attacco.' },
  { key: 'scimitar_speed',         name: 'Scimitarra della Velocità',          type: 'arma', rarity: 'molto_raro',   requiresAttunement: true,  description: '+2 ai tiri; bonus: un attacco in più con questa scimitarra ogni turno.' },
  { key: 'sun_blade',              name: 'Lama del Sole',                      type: 'arma', rarity: 'raro',         requiresAttunement: true,  description: '+2 ai tiri; +1d8 danni radiosi ai non morti; emette luce solare come torcia.' },
  { key: 'sword_life_stealing',    name: 'Spada del Furto di Vita',            type: 'arma', rarity: 'raro',         requiresAttunement: true,  description: 'Con un critico: +3d6 danni necrotici e recuperi i PF equivalenti (non non-morti).' },
  { key: 'sword_sharpness',        name: 'Spada dell\'Affilatura',             type: 'arma', rarity: 'molto_raro',   requiresAttunement: true,  description: '+3d6 danni taglienti extra; con un 20 naturale mozi un arto al bersaglio.' },
  { key: 'sword_wounding',         name: 'Spada del Ferimento',                type: 'arma', rarity: 'raro',         requiresAttunement: true,  description: 'Le ferite non si rimargina finché non viene lanciata una magia curativa (max 5 ferite).' },
  { key: 'trident_fish_command',   name: 'Tridente del Comando dei Pesci',     type: 'arma', rarity: 'non_comune',  requiresAttunement: true,  description: '3 cariche: Dominare Bestia (pesci e simili acquatici, CD 15 TS Sag, 1 ora).' },
  { key: 'vicious_weapon',         name: 'Arma Feroce',                        type: 'arma', rarity: 'raro',         requiresAttunement: false, description: '+7 danni extra quando ottieni un 20 naturale al tiro per colpire.' },
  { key: 'vorpal_sword',           name: 'Spada Vorpale',                      type: 'arma', rarity: 'leggendario',  requiresAttunement: true,  description: '+3 ai tiri; ignora la resistenza; con un 20 naturale decapita il bersaglio.' },
];

// ─── Armature Magiche ─────────────────────────────────────────────────────────

const MAGIC_ARMORS: SrdMagicItem[] = [
  { key: 'armor_plus_1',            name: 'Armatura +1',                       type: 'armatura', rarity: 'raro',        requiresAttunement: false, description: '+1 alla CA.' },
  { key: 'armor_plus_2',            name: 'Armatura +2',                       type: 'armatura', rarity: 'molto_raro',  requiresAttunement: false, description: '+2 alla CA.' },
  { key: 'armor_plus_3',            name: 'Armatura +3',                       type: 'armatura', rarity: 'leggendario', requiresAttunement: false, description: '+3 alla CA.' },
  { key: 'shield_plus_1',           name: 'Scudo +1',                          type: 'scudo',    rarity: 'non_comune',  requiresAttunement: false, description: '+1 alla CA (in aggiunta al normale bonus dello scudo).' },
  { key: 'shield_plus_2',           name: 'Scudo +2',                          type: 'scudo',    rarity: 'raro',        requiresAttunement: false, description: '+2 alla CA (in aggiunta al normale bonus dello scudo).' },
  { key: 'shield_plus_3',           name: 'Scudo +3',                          type: 'scudo',    rarity: 'molto_raro',  requiresAttunement: false, description: '+3 alla CA (in aggiunta al normale bonus dello scudo).' },
  { key: 'adamantine_armor',        name: 'Armatura di Adamantino',            type: 'armatura', rarity: 'non_comune',  requiresAttunement: false, description: 'Ogni colpo critico contro di te diventa un colpo normale.' },
  { key: 'armor_invulnerability',   name: 'Armatura dell\'Invulnerabilità',    type: 'armatura', rarity: 'leggendario', requiresAttunement: true,  description: 'Resistenza ai danni non magici; 10 minuti al giorno di immunità.' },
  { key: 'armor_resistance',        name: 'Armatura di Resistenza',            type: 'armatura', rarity: 'raro',        requiresAttunement: true,  description: 'Resistenza a un tipo di danno (acido, freddo, fuoco, ecc.).' },
  { key: 'armor_vulnerability',     name: 'Armatura della Vulnerabilità',      type: 'armatura', rarity: 'raro',        requiresAttunement: true,  description: 'Maledetta: resistenza al tagliante/contundente/perforante, ma vulnerabilità agli altri due.' },
  { key: 'arrow_catching_shield',   name: 'Scudo Acchiappafreccce',            type: 'scudo',    rarity: 'raro',        requiresAttunement: true,  description: '+2 CA contro attacchi a distanza; puoi deviare proiettili da alleati con la reazione.' },
  { key: 'demon_armor',             name: 'Armatura Demoniaca',                type: 'armatura', rarity: 'molto_raro',  requiresAttunement: true,  description: 'Maledetta: artigli che infliggono 1d8 + For danni, +1 al colpire; prigiona chi la indossa.' },
  { key: 'dragon_scale_mail',       name: 'Armatura di Scaglie Dragoniche',   type: 'armatura', rarity: 'molto_raro',  requiresAttunement: true,  description: 'CA 14 + Des (max 2); resistenza al tipo di danno del drago; Individuare i Draghi.' },
  { key: 'dwarven_plate',           name: 'Piastre Nanice',                    type: 'armatura', rarity: 'molto_raro',  requiresAttunement: false, description: '+2 alla CA; puoi ridurre fino a 10 m i movimenti forzati (reazione).' },
  { key: 'elven_chain',             name: 'Cotta degli Elfi',                  type: 'armatura', rarity: 'raro',        requiresAttunement: false, description: 'CA 13 + Des; puoi indossarla senza competenza; non dà svantaggio alla Furtività.' },
  { key: 'glamoured_studded_leather', name: 'Cuoio Borchiato Glamouroso',     type: 'armatura', rarity: 'raro',        requiresAttunement: false, description: 'Come il cuoio borchiato +1; puoi cambiarne l\'aspetto come azione bonus.' },
  { key: 'mariners_armor',          name: 'Armatura del Marinaio',             type: 'armatura', rarity: 'non_comune',  requiresAttunement: false, description: 'Velocità di nuoto 9 m e non affoghi se incosciente in acqua.' },
  { key: 'mithral_armor',           name: 'Armatura di Mithral',               type: 'armatura', rarity: 'non_comune',  requiresAttunement: false, description: 'Non richiede requisiti di Forza, non dà svantaggio alla Furtività e può essere indossata di notte.' },
  { key: 'plate_etherealness',      name: 'Armatura a Piastre dell\'Etereo',  type: 'armatura', rarity: 'leggendario', requiresAttunement: true,  description: 'Bonus: entra nel Piano Etereo per un massimo di 10 minuti al giorno.' },
  { key: 'sentinel_shield',         name: 'Scudo Sentinella',                  type: 'scudo',    rarity: 'non_comune',  requiresAttunement: false, description: 'Vantaggio alle prove di Percezione e ai tiri per l\'iniziativa.' },
  { key: 'shield_missile_attraction', name: 'Scudo dell\'Attrazione dei Proiettili', type: 'scudo', rarity: 'raro',    requiresAttunement: true,  description: 'Maledetta: +2 alla CA ma i proiettili ti prendono come bersaglio preferenziale.' },
];

// ─── Pozioni ──────────────────────────────────────────────────────────────────

const POTIONS: SrdMagicItem[] = [
  { key: 'potion_healing',              name: 'Pozione di Guarigione',               type: 'pozione', rarity: 'comune',      requiresAttunement: false, description: 'Recuperi 2d4+2 PF.' },
  { key: 'potion_greater_healing',      name: 'Pozione di Guarigione Maggiore',      type: 'pozione', rarity: 'non_comune',  requiresAttunement: false, description: 'Recuperi 4d4+4 PF.' },
  { key: 'potion_superior_healing',     name: 'Pozione di Guarigione Superiore',     type: 'pozione', rarity: 'raro',         requiresAttunement: false, description: 'Recuperi 8d4+8 PF.' },
  { key: 'potion_supreme_healing',      name: 'Pozione di Guarigione Suprema',       type: 'pozione', rarity: 'molto_raro',   requiresAttunement: false, description: 'Recuperi 10d4+20 PF.' },
  { key: 'potion_animal_friendship',    name: 'Pozione di Amicizia con gli Animali', type: 'pozione', rarity: 'non_comune',  requiresAttunement: false, description: 'Per 1 ora: Amicizia con gli Animali (CD 13).' },
  { key: 'potion_clairvoyance',         name: 'Pozione di Chiaroveggenza',           type: 'pozione', rarity: 'raro',         requiresAttunement: false, description: 'Per 1 ora: Chiaroveggenza (non richiede concentrazione).' },
  { key: 'potion_climbing',             name: 'Pozione di Arrampicata',              type: 'pozione', rarity: 'comune',      requiresAttunement: false, description: 'Per 1 ora: velocità di arrampicata uguale a quella a piedi, +5 alle relative prove.' },
  { key: 'potion_diminution',           name: 'Pozione di Riduzione',                type: 'pozione', rarity: 'raro',         requiresAttunement: false, description: 'Per 1d4 ore: rimpicciolisci come l\'incantesimo Ingrandire/Rimpicciolire (riduzione).' },
  { key: 'potion_flying',               name: 'Pozione del Volo',                    type: 'pozione', rarity: 'molto_raro',   requiresAttunement: false, description: 'Per 1 ora: velocità di volo 18 m (non richiede concentrazione).' },
  { key: 'potion_gaseous_form',         name: 'Pozione di Forma Gassosa',            type: 'pozione', rarity: 'raro',         requiresAttunement: false, description: 'Per 1 ora: come l\'incantesimo Forma Gassosa (non richiede concentrazione).' },
  { key: 'potion_growth',               name: 'Pozione di Crescita',                 type: 'pozione', rarity: 'non_comune',  requiresAttunement: false, description: 'Per 1d4 ore: ingrandisci come l\'incantesimo Ingrandire/Rimpicciolire (ingrandimento).' },
  { key: 'potion_heroism',              name: 'Pozione dell\'Eroismo',               type: 'pozione', rarity: 'raro',         requiresAttunement: false, description: 'Per 1 ora: 10 PF temporanei all\'inizio di ogni tuo turno + effetto Benedire.' },
  { key: 'potion_invisibility',         name: 'Pozione d\'Invisibilità',             type: 'pozione', rarity: 'molto_raro',   requiresAttunement: false, description: 'Per 1 ora: invisibilità (come l\'incantesimo, finché non attacchi o lanci incantesimi).' },
  { key: 'potion_mind_reading',         name: 'Pozione di Lettura del Pensiero',     type: 'pozione', rarity: 'raro',         requiresAttunement: false, description: 'Per 1 ora: Individuazione dei Pensieri (CD 13, non richiede concentrazione).' },
  { key: 'potion_poison',               name: 'Pozione del Veleno',                  type: 'pozione', rarity: 'non_comune',  requiresAttunement: false, description: 'Maledetta: infligge 3d6 danni veleno e avvelena per 1 ora (CD 13 TS Cos).' },
  { key: 'potion_resistance',           name: 'Pozione di Resistenza',               type: 'pozione', rarity: 'non_comune',  requiresAttunement: false, description: 'Per 1 ora: resistenza a un tipo di danno specifico.' },
  { key: 'potion_speed',                name: 'Pozione di Velocità',                 type: 'pozione', rarity: 'molto_raro',   requiresAttunement: false, description: 'Per 1 minuto: come l\'incantesimo Accelerare (azione extra, +2 CA, vantaggio ai TS Des, vel. raddoppiata).' },
  { key: 'potion_water_breathing',      name: 'Pozione di Respirazione Subacquea',   type: 'pozione', rarity: 'non_comune',  requiresAttunement: false, description: 'Per 1 ora: respiri sott\'acqua.' },
  { key: 'potion_hill_giant_strength',  name: 'Pozione di Forza del Gigante del Monte', type: 'pozione', rarity: 'non_comune', requiresAttunement: false, description: 'Per 1 ora: la tua Forza è 21.' },
  { key: 'potion_stone_giant_strength', name: 'Pozione di Forza del Gigante della Pietra', type: 'pozione', rarity: 'raro',  requiresAttunement: false, description: 'Per 1 ora: la tua Forza è 23.' },
  { key: 'potion_fire_giant_strength',  name: 'Pozione di Forza del Gigante del Fuoco', type: 'pozione', rarity: 'raro',     requiresAttunement: false, description: 'Per 1 ora: la tua Forza è 25.' },
  { key: 'potion_cloud_giant_strength', name: 'Pozione di Forza del Gigante delle Nubi', type: 'pozione', rarity: 'molto_raro', requiresAttunement: false, description: 'Per 1 ora: la tua Forza è 27.' },
  { key: 'potion_storm_giant_strength', name: 'Pozione di Forza del Gigante del Tuono', type: 'pozione', rarity: 'leggendario', requiresAttunement: false, description: 'Per 1 ora: la tua Forza è 29.' },
];

// ─── Export Principale ────────────────────────────────────────────────────────

export const MAGIC_ITEMS: SrdMagicItem[] = [
  ...WONDROUS,
  ...RINGS,
  ...RODS,
  ...STAFFS,
  ...WANDS,
  ...MAGIC_WEAPONS,
  ...MAGIC_ARMORS,
  ...POTIONS,
];

// ─── Helper ───────────────────────────────────────────────────────────────────

export function findMagicItem(key: string): SrdMagicItem | undefined {
  return MAGIC_ITEMS.find(i => i.key === key);
}

/** Cerca un oggetto magico per chiave SRD, poi per nome (case-insensitive). */
export function findMagicItemByKeyOrName(item: { srdKey?: string; name: string }): SrdMagicItem | undefined {
  return MAGIC_ITEMS.find(i => i.key === item.srdKey || i.name.toLowerCase() === item.name.toLowerCase());
}

export function getMagicItemsByType(type: MagicItemType): SrdMagicItem[] {
  return MAGIC_ITEMS.filter(i => i.type === type);
}

export function getMagicItemsByRarity(rarity: MagicItemRarity): SrdMagicItem[] {
  return MAGIC_ITEMS.filter(i => i.rarity === rarity);
}

export const RARITY_IT: Record<MagicItemRarity, string> = {
  comune:      'Comune',
  non_comune:  'Non Comune',
  raro:        'Raro',
  molto_raro:  'Molto Raro',
  leggendario: 'Leggendario',
  artefatto:   'Artefatto',
};

export const TYPE_IT: Record<MagicItemType, string> = {
  meraviglioso: 'Meraviglioso',
  arma:         'Arma Magica',
  armatura:     'Armatura Magica',
  scudo:        'Scudo Magico',
  anello:       'Anello',
  pozione:      'Pozione',
  bacchetta:    'Bacchetta',
  bastone:      'Bastone',
  verga:        'Verga',
  munizioni:    'Munizioni',
  strumento:    'Strumento',
};

export const TYPE_ICON: Record<MagicItemType, string> = {
  meraviglioso: '✨',
  arma:         '⚔️',
  armatura:     '🛡️',
  scudo:        '🛡️',
  anello:       '💍',
  pozione:      '⚗️',
  bacchetta:    '🪄',
  bastone:      '🪄',
  verga:        '🔱',
  munizioni:    '🏹',
  strumento:    '🎵',
};

// Icona @iconify-json/game-icons per tipo (un'icona davvero distinta per
// ognuno dei 301 oggetti magici non è ottenibile da una libreria generica:
// la maggior parte finirebbe comunque per coincidere con l'oggetto
// mondano sottostante — es. tutte le spade magiche = icona spada).
export const MAGIC_ITEM_ICON: Record<MagicItemType, string> = {
  meraviglioso: 'sparkles',
  arma:         'shining-sword',
  armatura:     'armor-upgrade',
  scudo:        'magic-shield',
  anello:       'ring',
  pozione:      'magic-potion',
  bacchetta:    'crystal-wand',
  bastone:      'wizard-staff',
  verga:        'rod-of-asclepius',
  munizioni:    'arrow-cluster',
  strumento:    'toolbox',
};
