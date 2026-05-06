import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// ─── CAMPAGNE ──────────────────────────────────────────────────────────────

export const campaigns = sqliteTable('campaigns', {
  id:          text('id').primaryKey(),
  name:        text('name').notNull(),
  setting:     text('setting'),
  description: text('description'),
  dmNotes:     text('dm_notes'),
  coverUrl:    text('cover_url'),
  status:      text('status', { enum: ['active', 'archived'] }).notNull().default('active'),
  combatState: text('combat_state', { mode: 'json' }).$type<CombatState | null>(),
  createdAt:   text('created_at').notNull(),
  updatedAt:   text('updated_at').notNull(),
});

export type Campaign    = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

// ─── UTENTI ────────────────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  id:          text('id').primaryKey(),         // Google sub
  email:       text('email').notNull().unique(),
  name:        text('name').notNull().default(''),
  role:        text('role', { enum: ['superadmin', 'dm', 'player', 'pending_dm', 'rejected', 'pending'] }).notNull().default('pending'),
  onboarded:   integer('onboarded', { mode: 'boolean' }).notNull().default(false),
  dmNote:      text('dm_note'),
  createdAt:   text('created_at').notNull(),
  updatedAt:   text('updated_at').notNull(),
});

export type User    = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ─── MEMBERSHIP GIOCATORE ↔ CAMPAGNA ──────────────────────────────────────

export const userCampaignMemberships = sqliteTable('user_campaign_memberships', {
  userId:            text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  campaignId:        text('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  activeCharacterId: text('active_character_id'),
  joinedAt:          text('joined_at').notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.userId, t.campaignId] }) }));

export type UserCampaignMembership = typeof userCampaignMemberships.$inferSelect;

// ─── INVITI CAMPAGNA ───────────────────────────────────────────────────────

export const campaignInvitations = sqliteTable('campaign_invitations', {
  id:         text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  token:      text('token').notNull().unique(),
  active:     integer('active', { mode: 'boolean' }).notNull().default(true),
  createdBy:  text('created_by').notNull(),
  createdAt:  text('created_at').notNull(),
});

export type CampaignInvitation = typeof campaignInvitations.$inferSelect;

// ─── RICHIESTE CAMBIO PERSONAGGIO ─────────────────────────────────────────

export const characterSwitchRequests = sqliteTable('character_switch_requests', {
  id:          text('id').primaryKey(),
  userId:      text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  campaignId:  text('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  fromCharId:  text('from_char_id'),
  toCharId:    text('to_char_id').notNull(),
  status:      text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  createdAt:   text('created_at').notNull(),
});

export type CharacterSwitchRequest = typeof characterSwitchRequests.$inferSelect;

// ─── COMBAT ────────────────────────────────────────────────────────────────

export interface CombatParticipant {
  characterId: string;
  initiative: number;
  actionsUsed: { action: boolean; bonusAction: boolean; movement: boolean; reaction: boolean };
  concentrating: string | null;
  hpCurrent: number;
  hpMax: number;
  hpTemp: number;
  conditions: string[];
}

export interface CombatState {
  active: boolean;
  round: number;
  currentTurnIndex: number;
  participants: CombatParticipant[]; // ordered by display (rotates on turn end)
}

// ─── PERSONAGGI ────────────────────────────────────────────────────────────

export const characters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['pc', 'npc_major', 'npc_minor'] }).notNull().default('pc'),

  // Campi indicizzati per il dashboard (denormalizzati per velocità)
  hpCurrent: integer('hp_current').notNull().default(0),
  hpMax:     integer('hp_max').notNull().default(0),
  hpTemp:    integer('hp_temp').notNull().default(0),
  level:     integer('level').notNull().default(1),
  xp:        integer('xp').notNull().default(0),

  // JSON blob — tutto il resto della scheda
  sheet: text('sheet', { mode: 'json' }).notNull().$type<CharacterSheet>().default({} as CharacterSheet),

  campaignId: text('campaign_id'),
  userId:     text('user_id'),
  createdAt:  text('created_at').notNull(),
  updatedAt:  text('updated_at').notNull(),
});

export const characterConditions = sqliteTable('character_conditions', {
  id:          text('id').primaryKey(),
  characterId: text('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  conditionKey: text('condition_key').notNull(),
  source:       text('source'),
  appliedAt:    text('applied_at').notNull(),
});

export const characterResources = sqliteTable('character_resources', {
  characterId: text('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  resourceKey: text('resource_key').notNull(),
  current:     integer('current').notNull().default(0),
  maximum:     integer('maximum').notNull().default(0),
  resetType:   text('reset_type', { enum: ['short', 'long', 'dawn'] }).notNull().default('long'),
}, (t) => ({
  pk: primaryKey({ columns: [t.characterId, t.resourceKey] }),
}));

// Slot incantesimo separati dalle risorse generali (struttura diversa)
export const characterSpellSlots = sqliteTable('character_spell_slots', {
  characterId: text('character_id').notNull().references(() => characters.id, { onDelete: 'cascade' }),
  slotLevel:   integer('slot_level').notNull(), // 1-9
  total:       integer('total').notNull().default(0),
  used:        integer('used').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.characterId, t.slotLevel] }),
}));

// TypeScript types per il JSON blob della scheda

export interface CharacterStats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface CharacterClass {
  classKey: string;
  level: number;
  subclass?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  notes?: string;
  equipped?: boolean;
  equippedSlot?: string;
}

export interface CharacterWeapon {
  id: string;
  name: string;
  srdKey?: string;           // riferimento alla SrdWeapon
  damageDice: string;
  damageDice2h?: string;
  damageType: string;
  properties: string[];
  range?: string;
  attackStat: 'str' | 'dex'; // quale stat per colpire
  magic: boolean;
  magicBonus?: number;       // es. +1, +2, +3
  notes?: string;
  weight: number;
}

export interface CharacterArmor {
  srdKey: string;            // riferimento alla SrdArmor
  name: string;
  baseAC: number;
  type: 'leggera' | 'media' | 'pesante';
}

export interface MagicItem {
  id: string;
  name: string;
  rarity: string;
  attunement: boolean;
  attuned: boolean;
  description: string;
  weight?: number;
}

export interface AsiHistoryEntry {
  level: number;
  classKey: string;
  type: 'single' | 'split' | 'feat';
  statA?: string;        // stat aumentata (+2 o +1)
  statB?: string;        // seconda stat (+1, solo split)
  featKey?: string;      // chiave SRD del talento
  featName?: string;     // nome del talento
}

export interface CharacterFeat {
  key: string;
  name: string;
  level: number;          // livello a cui è stato acquisito
  description?: string;
  prerequisite?: string;
}

export interface KnownSpell {
  id: string;                // index SRD (es. "fireball")
  name: string;
  level: number;             // 0 = cantrip
  prepared: boolean;
  ritual?: boolean;
  concentration?: boolean;
  school?: string;
}

export interface SkillProficiency {
  proficient: boolean;
  expertise: boolean;
}

export interface CharacterSheet {
  // Identità
  race?: string;
  subrace?: string;
  classes: CharacterClass[];
  background?: string;
  alignment?: string;
  age?: string;
  portraitUrl?: string;

  // Statistiche base
  stats: CharacterStats;

  // Combattimento
  armorClass?: number;
  speed?: number;
  initiativeBonus?: number;

  // Dadi vita
  hitDice: { die: string; total: number; used: number }[];

  // Tiri salvezza con competenza
  savingThrowProficiencies: {
    str: boolean; dex: boolean; con: boolean;
    int: boolean; wis: boolean; cha: boolean;
  };

  // Abilità
  skills: Record<string, SkillProficiency>;

  // Inventario
  inventory: InventoryItem[];

  // Denaro
  money: { pp: number; gp: number; ep: number; sp: number; cp: number };

  // Equipaggiamento combattimento
  weapons?: CharacterWeapon[];
  equippedArmorKey?: string | null;
  equippedArmorName?: string;
  hasShield?: boolean;
  magicItems?: MagicItem[];

  // Magia
  spellcastingAbility?: string;
  spellSaveDC?: number;
  spellAttackBonus?: number;
  knownSpells?: KnownSpell[];
  spellsKnown?: string[];    // legacy
  spellsPrepared?: string[]; // legacy
  ritualCaster?: boolean;

  // Tiri di morte (quando a 0 HP)
  deathSaves?: { successes: number; failures: number };

  // Storico ASI e talenti
  asiHistory?: AsiHistoryEntry[];
  feats?: CharacterFeat[];

  // Narrativa
  personality?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  backstory?: string;

  // Note DM private
  dmNotes?: string;
}

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
export type CharacterCondition = typeof characterConditions.$inferSelect;
export type CharacterResource = typeof characterResources.$inferSelect;
export type CharacterSpellSlot = typeof characterSpellSlots.$inferSelect;
