// Sottoclassi SRD 2014 — livello di sblocco e opzioni per classe

export interface Subclass {
  key: string;
  name: string;
  description: string;
}

export interface SubclassEntry {
  unlockLevel: number;
  subclasses: Subclass[];
}

export const SUBCLASSES: Record<string, SubclassEntry> = {
  barbarian: {
    unlockLevel: 3,
    subclasses: [
      { key: 'berserker', name: 'Via del Berserkr', description: 'Combatti con furia sfrenata, oltre ogni limite fisico.' },
      { key: 'totem_warrior', name: 'Via del Guerriero Totem', description: 'Stringi un legame spirituale con un animale totem.' },
    ],
  },
  bard: {
    unlockLevel: 3,
    subclasses: [
      { key: 'lore', name: 'Collegio del Sapere', description: 'Conosci qualcosa di tutto. Le tue parole tagliano quanto le spade.' },
      { key: 'valor', name: 'Collegio del Valore', description: 'Ispiri gli alleati in battaglia con gesta eroiche.' },
    ],
  },
  cleric: {
    unlockLevel: 1,
    subclasses: [
      { key: 'life', name: 'Dominio della Vita', description: 'Canalizza la forza vitale divina per guarire e proteggere.' },
      { key: 'light', name: 'Dominio della Luce', description: 'Wieldi il fuoco sacro per disperdere le tenebre.' },
      { key: 'trickery', name: 'Dominio dell\'Inganno', description: 'Sei l\'agente del tuo dio tra le ombre e gli inganni.' },
      { key: 'knowledge', name: 'Dominio della Conoscenza', description: 'La conoscenza è potere: padroneggi segreti e saperi.' },
      { key: 'nature', name: 'Dominio della Natura', description: 'La natura risponde alla tua voce e al tuo volere.' },
      { key: 'tempest', name: 'Dominio della Tempesta', description: 'Scateni il potere dei fulmini e della furia del cielo.' },
      { key: 'war', name: 'Dominio della Guerra', description: 'Sei un campione divino sul campo di battaglia.' },
    ],
  },
  druid: {
    unlockLevel: 2,
    subclasses: [
      { key: 'land', name: 'Circolo della Terra', description: 'Attingi alla magia ancestrale di luoghi specifici del mondo.' },
      { key: 'moon', name: 'Circolo della Luna', description: 'Puoi assumere forme bestiali di grande potere.' },
    ],
  },
  fighter: {
    unlockLevel: 3,
    subclasses: [
      { key: 'champion', name: 'Campione', description: 'Sei il guerriero perfetto: corpo e tecnica affinati oltre il limite.' },
      { key: 'battle_master', name: 'Maestro di Battaglia', description: 'Conosci manovre tattiche che ti danno vantaggio in ogni scontro.' },
      { key: 'eldritch_knight', name: 'Cavaliere Occulto', description: 'Combini la magia arcana con il combattimento fisico.' },
    ],
  },
  monk: {
    unlockLevel: 3,
    subclasses: [
      { key: 'open_hand', name: 'Via della Mano Aperta', description: 'Maestro delle arti marziali, manipoli il Ki con precisione assoluta.' },
      { key: 'shadow', name: 'Via dell\'Ombra', description: 'Ti muovi come un fantasma nell\'oscurità, ombra tra le ombre.' },
      { key: 'four_elements', name: 'Via dei Quattro Elementi', description: 'Disciplini il Ki per manipolare fuoco, acqua, aria e terra.' },
    ],
  },
  paladin: {
    unlockLevel: 3,
    subclasses: [
      { key: 'devotion', name: 'Giuramento di Devozione', description: 'L\'ideale classico del cavaliere sacro: onore, coraggio, compassione.' },
      { key: 'ancients', name: 'Giuramento degli Antichi', description: 'Proteggi la luce nel mondo contro le forze del male eterno.' },
      { key: 'vengeance', name: 'Giuramento di Vendetta', description: 'Sei uno strumento di giustizia implacabile contro il malvagio.' },
    ],
  },
  ranger: {
    unlockLevel: 3,
    subclasses: [
      { key: 'hunter', name: 'Cacciatore', description: 'Sei specializzato nell\'abbattere nemici specifici con efficienza letale.' },
      { key: 'beast_master', name: 'Maestro delle Bestie', description: 'Stringi un legame magico con un compagno animale fedele.' },
    ],
  },
  rogue: {
    unlockLevel: 3,
    subclasses: [
      { key: 'thief', name: 'Ladro', description: 'Maestro del furto, dell\'infiltrazione e del movimento silenzioso.' },
      { key: 'assassin', name: 'Assassino', description: 'Sei letale in modo sproporzionato contro chi non ti aspetta.' },
      { key: 'arcane_trickster', name: 'Imbroglione Arcano', description: 'Combini magia illusoria e di ammaliamento con la tua abilità furtiva.' },
    ],
  },
  sorcerer: {
    unlockLevel: 1,
    subclasses: [
      { key: 'draconic', name: 'Stirpe Draconica', description: 'Il sangue di un drago scorre nelle tue vene, plasmando la tua magia.' },
      { key: 'wild_magic', name: 'Magia Selvaggia', description: 'La tua magia è caotica e imprevedibile, con effetti sorprendenti.' },
    ],
  },
  warlock: {
    unlockLevel: 1,
    subclasses: [
      { key: 'archfey', name: 'Il Grande Folletto', description: 'Hai stretto un patto con un potente essere del Piano Fatato.' },
      { key: 'fiend', name: 'Il Diavolo', description: 'Hai venduto parte della tua anima a un potente essere infernale.' },
      { key: 'great_old_one', name: 'Il Grande Antico', description: 'Servi un\'entità cosmica il cui pensiero è incomprensibile ai mortali.' },
    ],
  },
  wizard: {
    unlockLevel: 2,
    subclasses: [
      { key: 'abjuration', name: 'Scuola di Abiurazione', description: 'Maestro degli incantesimi protettivi e di interdizione.' },
      { key: 'conjuration', name: 'Scuola di Evocazione', description: 'Convochi creature e oggetti da altri piani.' },
      { key: 'divination', name: 'Scuola di Divinazione', description: 'Percepisci il futuro e gli eventi nascosti con chiarezza soprannaturale.' },
      { key: 'enchantment', name: 'Scuola di Ammaliamento', description: 'Controlli menti e comportamenti con la tua magia.' },
      { key: 'evocation', name: 'Scuola di Evocazione Elementale', description: 'Scateni energia pura e distruttiva sul campo di battaglia.' },
      { key: 'illusion', name: 'Scuola di Illusione', description: 'Crei immagini e percezioni false che ingannano i sensi.' },
      { key: 'necromancy', name: 'Scuola di Necromanzia', description: 'Manipoli le forze della vita, della morte e dei non-morti.' },
      { key: 'transmutation', name: 'Scuola di Trasmutazione', description: 'Trasformi la materia e le creature secondo la tua volontà.' },
    ],
  },
};

export function getSubclassEntry(classKey: string): SubclassEntry | null {
  return SUBCLASSES[classKey] ?? null;
}

export function needsSubclass(classKey: string, level: number): boolean {
  const entry = getSubclassEntry(classKey);
  return entry !== null && level >= entry.unlockLevel;
}

// ─── DOMAIN / OATH SPELLS ────────────────────────────────────────────────────
// Incantesimi sempre preparati (non contano verso il limite) per Chierico e Paladino.
// SRD 5.1 ufficiale — si sbloccano a livelli 1, 3, 5, 7, 9 del personaggio.

export interface DomainSpellEntry {
  id: string;   // corrisponde a SrdSpell.id se presente nel DB, altrimenti ID descrittivo
  name: string; // nome italiano
}

export interface DomainSpellTier {
  minLevel: number; // livello minimo del personaggio per sbloccare (1 | 3 | 5 | 7 | 9)
  spells: DomainSpellEntry[];
}

// Chierico — 7 domini SRD
export const CLERIC_DOMAIN_SPELLS: Record<string, DomainSpellTier[]> = {
  life: [
    { minLevel: 1, spells: [{ id: 'benedizione', name: 'Benedizione' }, { id: 'cura-ferite', name: 'Cura Ferite' }] },
    { minLevel: 3, spells: [{ id: 'restaurazione-minore', name: 'Restaurazione Minore' }, { id: 'arma-spirituale', name: 'Arma Spirituale' }] },
    { minLevel: 5, spells: [{ id: 'faro-di-speranza', name: 'Faro di Speranza' }, { id: 'ravvivare', name: 'Ravvivare' }] },
    { minLevel: 7, spells: [{ id: 'protezione-dalla-morte', name: 'Protezione dalla Morte' }, { id: 'guardiano-della-fede', name: 'Guardiano della Fede' }] },
    { minLevel: 9, spells: [{ id: 'cura-ferite-di-massa', name: 'Cura Ferite di Massa' }, { id: 'resuscitare-i-morti', name: 'Resuscitare i Morti' }] },
  ],
  light: [
    { minLevel: 1, spells: [{ id: 'mani-brucianti', name: 'Mani Brucianti' }, { id: 'fuoco-fatuo', name: 'Fuoco Fatuo' }] },
    { minLevel: 3, spells: [{ id: 'sfera-di-fuoco-fiammeggiante', name: 'Sfera Fiammeggiante' }, { id: 'raggio-rovente', name: 'Raggio Rovente' }] },
    { minLevel: 5, spells: [{ id: 'luce-del-giorno', name: 'Luce del Giorno' }, { id: 'palla-di-fuoco', name: 'Palla di Fuoco' }] },
    { minLevel: 7, spells: [{ id: 'guardiano-della-fede', name: 'Guardiano della Fede' }, { id: 'muro-di-fuoco', name: 'Muro di Fuoco' }] },
    { minLevel: 9, spells: [{ id: 'colpo-di-fiamma', name: 'Colpo di Fiamma' }, { id: 'scrutare', name: 'Scrutare' }] },
  ],
  trickery: [
    { minLevel: 1, spells: [{ id: 'ammaliare-persone', name: 'Ammaliare Persone' }, { id: 'travestimento', name: 'Travestimento' }] },
    { minLevel: 3, spells: [{ id: 'immagine-speculare', name: 'Immagine Speculare' }, { id: 'passare-senza-tracce', name: 'Passare Senza Tracce' }] },
    { minLevel: 5, spells: [{ id: 'occhio-di-blink', name: 'Occhio di Blink' }, { id: 'dissolvere-magie', name: 'Dissolvere Magie' }] },
    { minLevel: 7, spells: [{ id: 'porta-dimensionale', name: 'Porta Dimensionale' }, { id: 'polimorfismo', name: 'Polimorfismo' }] },
    { minLevel: 9, spells: [{ id: 'dominare-persone', name: 'Dominare Persone' }, { id: 'modificare-ricordi', name: 'Modificare i Ricordi' }] },
  ],
  knowledge: [
    { minLevel: 1, spells: [{ id: 'parola-di-comando', name: 'Parola di Comando' }, { id: 'identificare', name: 'Identificare' }] },
    { minLevel: 3, spells: [{ id: 'augurio', name: 'Augurio' }, { id: 'suggestione', name: 'Suggestione' }] },
    { minLevel: 5, spells: [{ id: 'non-rilevare', name: 'Non Rilevare' }, { id: 'parlare-con-i-morti', name: 'Parlare con i Morti' }] },
    { minLevel: 7, spells: [{ id: 'occhio-arcano', name: 'Occhio Arcano' }, { id: 'confusione', name: 'Confusione' }] },
    { minLevel: 9, spells: [{ id: 'leggende', name: 'Leggende' }, { id: 'scrutare', name: 'Scrutare' }] },
  ],
  nature: [
    { minLevel: 1, spells: [{ id: 'amicizia-animali', name: 'Amicizia con gli Animali' }, { id: 'parlare-animali', name: 'Parlare con gli Animali' }] },
    { minLevel: 3, spells: [{ id: 'scorza', name: 'Scorza' }, { id: 'crescita-spine', name: 'Crescita di Spine' }] },
    { minLevel: 5, spells: [{ id: 'crescita-piante', name: 'Crescita delle Piante' }, { id: 'muro-di-vento', name: 'Muro di Vento' }] },
    { minLevel: 7, spells: [{ id: 'dominare-bestie', name: 'Dominare le Bestie' }, { id: 'rovo-avvinghiante', name: 'Rovo Avvinghiante' }] },
    { minLevel: 9, spells: [{ id: 'piaga-insetti', name: 'Piaga di Insetti' }, { id: 'camminare-alberi', name: 'Camminare tra gli Alberi' }] },
  ],
  tempest: [
    { minLevel: 1, spells: [{ id: 'nube-di-nebbia', name: 'Nube di Nebbia' }, { id: 'onda-tonante', name: 'Onda Tonante' }] },
    { minLevel: 3, spells: [{ id: 'raffica-di-vento', name: 'Raffica di Vento' }, { id: 'frantumare', name: 'Frantumare' }] },
    { minLevel: 5, spells: [{ id: 'invocare-fulmini', name: 'Invocare Fulmini' }, { id: 'bufera-di-grandine', name: 'Bufera di Grandine' }] },
    { minLevel: 7, spells: [{ id: 'controllo-acqua', name: 'Controllo dell\'Acqua' }, { id: 'tempesta-di-ghiaccio', name: 'Tempesta di Ghiaccio' }] },
    { minLevel: 9, spells: [{ id: 'onda-distruttiva', name: 'Onda Distruttiva' }, { id: 'piaga-insetti', name: 'Piaga di Insetti' }] },
  ],
  war: [
    { minLevel: 1, spells: [{ id: 'favore-divino', name: 'Favore Divino' }, { id: 'scudo-della-fede', name: 'Scudo della Fede' }] },
    { minLevel: 3, spells: [{ id: 'arma-magica', name: 'Arma Magica' }, { id: 'arma-spirituale', name: 'Arma Spirituale' }] },
    { minLevel: 5, spells: [{ id: 'mantello-del-crociato', name: 'Mantello del Crociato' }, { id: 'guardiani-spirituali', name: 'Guardiani Spirituali' }] },
    { minLevel: 7, spells: [{ id: 'liberta-di-movimento', name: 'Libertà di Movimento' }, { id: 'pelle-sassosa', name: 'Pelle Sassosa' }] },
    { minLevel: 9, spells: [{ id: 'colpo-di-fiamma', name: 'Colpo di Fiamma' }, { id: 'bloccare-mostro', name: 'Bloccare Mostro' }] },
  ],
};

// Paladino — 3 giuramenti SRD
export const PALADIN_OATH_SPELLS: Record<string, DomainSpellTier[]> = {
  devotion: [
    { minLevel: 3, spells: [{ id: 'protezione-bene-male', name: 'Protezione dal Bene e dal Male' }, { id: 'santuario', name: 'Santuario' }] },
    { minLevel: 5, spells: [{ id: 'restaurazione-minore', name: 'Restaurazione Minore' }, { id: 'zona-della-verita', name: 'Zona della Verità' }] },
    { minLevel: 9, spells: [{ id: 'faro-di-speranza', name: 'Faro di Speranza' }, { id: 'dissolvere-magie', name: 'Dissolvere Magie' }] },
    { minLevel: 13, spells: [{ id: 'liberta-di-movimento', name: 'Libertà di Movimento' }, { id: 'guardiano-della-fede', name: 'Guardiano della Fede' }] },
    { minLevel: 17, spells: [{ id: 'comunione', name: 'Comunione' }, { id: 'colpo-di-fiamma', name: 'Colpo di Fiamma' }] },
  ],
  ancients: [
    { minLevel: 3, spells: [{ id: 'colpo-avvinghiante', name: 'Colpo Avvinghiante' }, { id: 'parlare-animali', name: 'Parlare con gli Animali' }] },
    { minLevel: 5, spells: [{ id: 'raggio-di-luna', name: 'Raggio di Luna' }, { id: 'passo-fatato', name: 'Passo Fatato' }] },
    { minLevel: 9, spells: [{ id: 'crescita-piante', name: 'Crescita delle Piante' }, { id: 'protezione-energia', name: 'Protezione dall\'Energia' }] },
    { minLevel: 13, spells: [{ id: 'tempesta-di-ghiaccio', name: 'Tempesta di Ghiaccio' }, { id: 'pelle-sassosa', name: 'Pelle Sassosa' }] },
    { minLevel: 17, spells: [{ id: 'comunione-natura', name: 'Comunione con la Natura' }, { id: 'camminare-alberi', name: 'Camminare tra gli Alberi' }] },
  ],
  vengeance: [
    { minLevel: 3, spells: [{ id: 'anatema', name: 'Anatema' }, { id: 'segno-del-cacciatore', name: 'Segno del Cacciatore' }] },
    { minLevel: 5, spells: [{ id: 'bloccare-persone', name: 'Bloccare Persone' }, { id: 'passo-fatato', name: 'Passo Fatato' }] },
    { minLevel: 9, spells: [{ id: 'accelerare', name: 'Accelerare' }, { id: 'protezione-energia', name: 'Protezione dall\'Energia' }] },
    { minLevel: 13, spells: [{ id: 'bando', name: 'Bando' }, { id: 'porta-dimensionale', name: 'Porta Dimensionale' }] },
    { minLevel: 17, spells: [{ id: 'bloccare-mostro', name: 'Bloccare Mostro' }, { id: 'scrutare', name: 'Scrutare' }] },
  ],
};

/**
 * Restituisce gli incantesimi di dominio/giuramento accessibili al livello attuale.
 * Questi incantesimi sono sempre preparati e non contano verso il limite.
 */
export function getDomainSpells(
  classKey: string,
  subclassKey: string | undefined,
  charLevel: number,
): DomainSpellEntry[] {
  if (!subclassKey) return [];
  const source =
    classKey === 'cleric'  ? CLERIC_DOMAIN_SPELLS  :
    classKey === 'paladin' ? PALADIN_OATH_SPELLS    : null;
  if (!source) return [];
  const tiers = source[subclassKey] ?? [];
  return tiers
    .filter(t => charLevel >= t.minLevel)
    .flatMap(t => t.spells);
}

/** Verifica se un incantesimo è di dominio per un personaggio */
export function isDomainSpell(
  spellId: string,
  classKey: string,
  subclassKey: string | undefined,
  charLevel: number,
): boolean {
  return getDomainSpells(classKey, subclassKey, charLevel).some(s => s.id === spellId);
}
