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
