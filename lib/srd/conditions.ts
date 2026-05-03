export interface Condition {
  key: string;
  name: string;
  icon: string;
  description: string;
  effects: string[];
}

export const CONDITIONS: Condition[] = [
  {
    key: 'blinded',
    name: 'Accecato',
    icon: '👁️',
    description: 'Non riesci a vedere.',
    effects: [
      'Fallisci automaticamente i tiri che richiedono la vista.',
      'I tiri per colpire sono svantaggio.',
      'I tiri per colpire contro di te sono vantaggio.',
    ],
  },
  {
    key: 'charmed',
    name: 'Affascinato',
    icon: '💜',
    description: 'Sei affascinato da una creatura.',
    effects: [
      'Non puoi attaccare il tuo affascinatore né usare effetti magici dannosi contro di lui.',
      'L\'affascinatore ha vantaggio ai tiri di Carisma contro di te.',
    ],
  },
  {
    key: 'deafened',
    name: 'Assordato',
    icon: '🔇',
    description: 'Non riesci a sentire.',
    effects: [
      'Fallisci automaticamente i tiri che richiedono l\'udito.',
    ],
  },
  {
    key: 'exhaustion_1',
    name: 'Esausto (1)',
    icon: '😓',
    description: 'Esaurimento livello 1.',
    effects: ['Svantaggio ai tiri caratteristica.'],
  },
  {
    key: 'exhaustion_2',
    name: 'Esausto (2)',
    icon: '😓',
    description: 'Esaurimento livello 2.',
    effects: ['Svantaggio ai tiri caratteristica.', 'Velocità dimezzata.'],
  },
  {
    key: 'exhaustion_3',
    name: 'Esausto (3)',
    icon: '😓',
    description: 'Esaurimento livello 3.',
    effects: ['Svantaggio ai tiri caratteristica e ai tiri per colpire.', 'Velocità dimezzata.'],
  },
  {
    key: 'exhaustion_4',
    name: 'Esausto (4)',
    icon: '😓',
    description: 'Esaurimento livello 4.',
    effects: ['Svantaggio ai tiri caratteristica e ai tiri per colpire.', 'Velocità dimezzata.', 'Max HP dimezzati.'],
  },
  {
    key: 'exhaustion_5',
    name: 'Esausto (5)',
    icon: '😓',
    description: 'Esaurimento livello 5.',
    effects: ['Svantaggio ai tiri caratteristica e ai tiri per colpire.', 'Velocità 0.', 'Max HP dimezzati.'],
  },
  {
    key: 'exhaustion_6',
    name: 'Esausto (6)',
    icon: '💀',
    description: 'Esaurimento livello 6.',
    effects: ['Morte.'],
  },
  {
    key: 'frightened',
    name: 'Spaventato',
    icon: '😱',
    description: 'Sei in preda alla paura.',
    effects: [
      'Svantaggio ai tiri caratteristica e ai tiri per colpire mentre la fonte della paura è in vista.',
      'Non puoi avvicinarti volontariamente alla fonte della paura.',
    ],
  },
  {
    key: 'grappled',
    name: 'Afferrato',
    icon: '✊',
    description: 'Sei bloccato nella presa di una creatura.',
    effects: [
      'Velocità 0, non può essere aumentata.',
      'La condizione termina se l\'afferratore è incapacitato o se vieni allontanato.',
    ],
  },
  {
    key: 'incapacitated',
    name: 'Incapacitato',
    icon: '⚡',
    description: 'Non puoi compiere azioni o reazioni.',
    effects: ['Nessuna azione.', 'Nessuna reazione.'],
  },
  {
    key: 'invisible',
    name: 'Invisibile',
    icon: '🌫️',
    description: 'Sei invisibile alle creature che non usano magia.',
    effects: [
      'Impossibile vederti senza magia o sensi speciali.',
      'Vantaggio ai tiri per colpire.',
      'Svantaggio ai tiri per colpire contro di te.',
    ],
  },
  {
    key: 'paralyzed',
    name: 'Paralizzato',
    icon: '🔒',
    description: 'Sei completamente paralizzato.',
    effects: [
      'Sei incapacitato e non puoi muoverti né parlare.',
      'Fallisci automaticamente TS di FOR e DES.',
      'Vantaggio ai tiri per colpire contro di te.',
      'Ogni colpo a meno di 1,5 m è un critico.',
    ],
  },
  {
    key: 'petrified',
    name: 'Pietrificato',
    icon: '🪨',
    description: 'Sei trasformato in una sostanza non organica.',
    effects: [
      'Sei incapacitato, non puoi muoverti né parlare.',
      'Ignori tutto il danno.',
      'Resistenza a tutti i danni.',
      'Fallisci automaticamente TS di FOR e DES.',
      'Vantaggio ai tiri per colpire contro di te.',
      'Immune a veleni e malattie (sospesi, non curati).',
    ],
  },
  {
    key: 'poisoned',
    name: 'Avvelenato',
    icon: '🟢',
    description: 'Sei avvelenato.',
    effects: [
      'Svantaggio ai tiri per colpire e ai tiri caratteristica.',
    ],
  },
  {
    key: 'prone',
    name: 'Prono',
    icon: '⬇️',
    description: 'Sei a terra.',
    effects: [
      'Puoi solo strisciare (costo: 1,5 m di movimento per ogni 1,5 m).',
      'Svantaggio ai tiri per colpire.',
      'Tiri per colpire a meno di 1,5 m: vantaggio. Oltre: svantaggio.',
    ],
  },
  {
    key: 'restrained',
    name: 'Trattenuto',
    icon: '⛓️',
    description: 'I tuoi movimenti sono impediti.',
    effects: [
      'Velocità 0, non può essere aumentata.',
      'Svantaggio ai tiri per colpire.',
      'Vantaggio ai tiri per colpire contro di te.',
      'Svantaggio ai TS di DES.',
    ],
  },
  {
    key: 'stunned',
    name: 'Stordito',
    icon: '💫',
    description: 'Sei stordito.',
    effects: [
      'Sei incapacitato e non puoi muoverti.',
      'Puoi solo parlare in modo balbettante.',
      'Fallisci automaticamente TS di FOR e DES.',
      'Vantaggio ai tiri per colpire contro di te.',
    ],
  },
  {
    key: 'unconscious',
    name: 'Privo di sensi',
    icon: '💤',
    description: 'Sei privo di sensi.',
    effects: [
      'Sei incapacitato e non puoi muoverti né parlare.',
      'Lasci cadere tutto quello che tieni.',
      'Sei prono.',
      'Fallisci automaticamente TS di FOR e DES.',
      'Vantaggio ai tiri per colpire contro di te.',
      'Ogni colpo a meno di 1,5 m è un critico.',
    ],
  },
  {
    key: 'concentration',
    name: 'In Concentrazione',
    icon: '🎯',
    description: 'Stai mantenendo la concentrazione su un incantesimo.',
    effects: [
      'Prendere danni richiede TS di COS (CD 10 o metà del danno, il più alto).',
      'Una sola magia da concentrazione attiva alla volta.',
    ],
  },
];

export function getCondition(key: string): Condition | undefined {
  return CONDITIONS.find(c => c.key === key);
}
