'use server';

import { eq, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from './client';
import { characters, characterConditions, characterResources, characterSpellSlots, campaigns } from './schema';
import { generateId, now } from '@/lib/utils';
import { getClass } from '@/lib/srd/classes';
import { SPELL_SLOTS_FULL, SPELL_SLOTS_HALF, SPELL_SLOTS_PACT, SPELL_SLOTS_THIRD } from '@/lib/srd/constants';
import type { NewCharacter, CharacterSheet, CharacterWeapon, MagicItem, KnownSpell, AsiHistoryEntry, CharacterFeat, NewCampaign } from './schema';
import { calcAC } from '@/lib/srd/equipment';
import { abilityModifier } from '@/lib/rules/calculations';

// ─── HP ────────────────────────────────────────────────────────────────────

export async function applyDamage(characterId: string, amount: number) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  let remaining = amount;
  let temp = char.hpTemp;

  if (temp > 0) {
    const absorbed = Math.min(temp, remaining);
    temp -= absorbed;
    remaining -= absorbed;
  }

  const newHp = Math.max(0, char.hpCurrent - remaining);
  await db.update(characters)
    .set({ hpCurrent: newHp, hpTemp: temp, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

export async function applyHealing(characterId: string, amount: number) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const newHp = Math.min(char.hpMax, char.hpCurrent + amount);
  await db.update(characters)
    .set({ hpCurrent: newHp, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

export async function setTempHp(characterId: string, amount: number) {
  const db = getDb();
  await db.update(characters)
    .set({ hpTemp: Math.max(0, amount), updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

export async function setHpMax(characterId: string, newMax: number) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const clampedCurrent = Math.min(char.hpCurrent, newMax);
  await db.update(characters)
    .set({ hpMax: newMax, hpCurrent: clampedCurrent, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

// ─── CONDIZIONI ────────────────────────────────────────────────────────────

export async function addCondition(characterId: string, conditionKey: string, source?: string) {
  const db = getDb();
  await db.insert(characterConditions).values({
    id: generateId(),
    characterId,
    conditionKey,
    source: source ?? null,
    appliedAt: now(),
  });

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

export async function removeCondition(conditionId: string, characterId: string) {
  const db = getDb();
  await db.delete(characterConditions).where(eq(characterConditions.id, conditionId));

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

// ─── XP ────────────────────────────────────────────────────────────────────

export async function addXp(characterId: string, amount: number) {
  const db = getDb();
  await db.update(characters)
    .set({ xp: sql`${characters.xp} + ${amount}`, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

export async function addXpToAll(amount: number) {
  const db = getDb();
  await db.update(characters)
    .set({ xp: sql`${characters.xp} + ${amount}`, updatedAt: now() })
    .where(eq(characters.type, 'pc'));

  revalidatePath('/');
}

// ─── RISORSE DI CLASSE ─────────────────────────────────────────────────────

export async function useResource(characterId: string, resourceKey: string, amount = 1) {
  const db = getDb();
  const [res] = await db.select().from(characterResources)
    .where(eq(characterResources.characterId, characterId));

  await db.update(characterResources)
    .set({ current: sql`MAX(0, ${characterResources.current} - ${amount})` })
    .where(and(
      eq(characterResources.characterId, characterId),
      eq(characterResources.resourceKey, resourceKey)
    ));

  revalidatePath(`/characters/${characterId}`);
}

export async function restoreResource(characterId: string, resourceKey: string) {
  const db = getDb();
  await db.update(characterResources)
    .set({ current: characterResources.maximum })
    .where(and(
      eq(characterResources.characterId, characterId),
      eq(characterResources.resourceKey, resourceKey)
    ));

  revalidatePath(`/characters/${characterId}`);
}

// ─── SLOT INCANTESIMO ──────────────────────────────────────────────────────

export async function useSpellSlot(characterId: string, slotLevel: number) {
  const db = getDb();
  await db.update(characterSpellSlots)
    .set({ used: sql`MIN(${characterSpellSlots.total}, ${characterSpellSlots.used} + 1)` })
    .where(and(
      eq(characterSpellSlots.characterId, characterId),
      eq(characterSpellSlots.slotLevel, slotLevel)
    ));

  revalidatePath(`/characters/${characterId}`);
}

export async function restoreSpellSlot(characterId: string, slotLevel: number) {
  const db = getDb();
  await db.update(characterSpellSlots)
    .set({ used: sql`MAX(0, ${characterSpellSlots.used} - 1)` })
    .where(and(
      eq(characterSpellSlots.characterId, characterId),
      eq(characterSpellSlots.slotLevel, slotLevel)
    ));

  revalidatePath(`/characters/${characterId}`);
}

// ─── RIPOSO ────────────────────────────────────────────────────────────────

export async function shortRest(characterId: string) {
  const db = getDb();

  // Reset risorse che si recuperano con riposo breve
  await db.update(characterResources)
    .set({ current: characterResources.maximum })
    .where(
      eq(characterResources.characterId, characterId) &&
      eq(characterResources.resetType, 'short')
    );

  // I Warlock recuperano tutti gli slot con riposo breve
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (char) {
    const sheet = char.sheet as CharacterSheet;
    const isWarlock = sheet.classes?.some(c => c.classKey === 'warlock');
    if (isWarlock) {
      await db.update(characterSpellSlots)
        .set({ used: 0 })
        .where(eq(characterSpellSlots.characterId, characterId));
    }
  }

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

export async function longRest(characterId: string) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  // Recupera tutti gli HP
  await db.update(characters)
    .set({ hpCurrent: char.hpMax, hpTemp: 0, updatedAt: now() })
    .where(eq(characters.id, characterId));

  // Reset tutte le risorse
  await db.update(characterResources)
    .set({ current: characterResources.maximum })
    .where(eq(characterResources.characterId, characterId));

  // Reset tutti gli slot incantesimo
  await db.update(characterSpellSlots)
    .set({ used: 0 })
    .where(eq(characterSpellSlots.characterId, characterId));

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

// ─── CRUD PERSONAGGI ───────────────────────────────────────────────────────

export async function createCharacter(data: Omit<NewCharacter, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = getDb();
  const id = generateId();
  const timestamp = now();

  await db.insert(characters).values({
    ...data,
    id,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  // Inizializza slot incantesimo in base alla classe
  const sheet = data.sheet as CharacterSheet;
  if (sheet.classes?.length > 0) {
    const primaryClass = getClass(sheet.classes[0].classKey);
    if (primaryClass) {
      await initSpellSlots(id, primaryClass.spellcastingType, data.level ?? 1);
    }
  }

  revalidatePath('/');
  revalidatePath('/characters');
  if (data.campaignId) revalidatePath(`/campaigns/${data.campaignId}`);
  return id;
}

async function initSpellSlots(characterId: string, spellcastingType: string, level: number) {
  const db = getDb();
  let slots: number[] = [];

  if (spellcastingType === 'full') slots = SPELL_SLOTS_FULL[level] ?? [];
  else if (spellcastingType === 'half') slots = SPELL_SLOTS_HALF[level] ?? [];
  else if (spellcastingType === 'third') slots = SPELL_SLOTS_THIRD[level] ?? [];
  else if (spellcastingType === 'pact') {
    const pact = SPELL_SLOTS_PACT[level];
    if (pact) {
      await db.insert(characterSpellSlots).values({
        characterId,
        slotLevel: pact.slotLevel,
        total: pact.slots,
        used: 0,
      });
    }
    return;
  }

  for (let i = 0; i < slots.length; i++) {
    if (slots[i] > 0) {
      await db.insert(characterSpellSlots).values({
        characterId,
        slotLevel: i + 1,
        total: slots[i],
        used: 0,
      });
    }
  }
}

export async function updateCharacterSheet(characterId: string, updates: Partial<CharacterSheet>) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const updatedSheet = { ...(char.sheet as CharacterSheet), ...updates };
  await db.update(characters)
    .set({ sheet: updatedSheet, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath(`/characters/${characterId}`);
}

export async function levelUpCharacter(
  characterId: string,
  newLevel: number,
  hpGain: number,
  sheetUpdates: Partial<CharacterSheet>,
  asiEntry?: AsiHistoryEntry,
  feat?: CharacterFeat,
) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const currentSheet = char.sheet as CharacterSheet;
  const updatedSheet: CharacterSheet = { ...currentSheet, ...sheetUpdates };

  // Aggiungi al storico ASI
  if (asiEntry) {
    updatedSheet.asiHistory = [...(currentSheet.asiHistory ?? []), asiEntry];
  }

  // Aggiungi talento se scelto
  if (feat) {
    updatedSheet.feats = [...(currentSheet.feats ?? []), feat];
  }

  const newHpMax = char.hpMax + Math.max(1, hpGain);

  await db.update(characters)
    .set({
      level: newLevel,
      hpMax: newHpMax,
      hpCurrent: Math.min(char.hpCurrent, newHpMax),
      sheet: updatedSheet,
      updatedAt: now(),
    })
    .where(eq(characters.id, characterId));

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

// Applica un ASI retroattivo (per personaggi creati ad alto livello)
export async function applyRetroactiveAsi(
  characterId: string,
  asiEntry: AsiHistoryEntry,
  feat?: CharacterFeat,
) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const currentSheet = char.sheet as CharacterSheet;
  const updatedSheet: CharacterSheet = { ...currentSheet };

  // Applica bonus alle stat
  if (asiEntry.type === 'single' && asiEntry.statA) {
    updatedSheet.stats = {
      ...currentSheet.stats,
      [asiEntry.statA]: Math.min(20, currentSheet.stats[asiEntry.statA as keyof typeof currentSheet.stats] + 2),
    };
  } else if (asiEntry.type === 'split') {
    const newStats = { ...currentSheet.stats };
    if (asiEntry.statA) newStats[asiEntry.statA as keyof typeof newStats] = Math.min(20, newStats[asiEntry.statA as keyof typeof newStats] + 1);
    if (asiEntry.statB) newStats[asiEntry.statB as keyof typeof newStats] = Math.min(20, newStats[asiEntry.statB as keyof typeof newStats] + 1);
    updatedSheet.stats = newStats;
  }

  updatedSheet.asiHistory = [...(currentSheet.asiHistory ?? []), asiEntry];
  if (feat) updatedSheet.feats = [...(currentSheet.feats ?? []), feat];

  await db.update(characters)
    .set({ sheet: updatedSheet, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

// ─── EQUIPAGGIAMENTO ───────────────────────────────────────────────────────

export async function saveEquipment(
  characterId: string,
  weapons: CharacterWeapon[],
  equippedArmorKey: string | null,
  equippedArmorName: string,
  hasShield: boolean,
  magicItems: MagicItem[],
) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const sheet = char.sheet as CharacterSheet;
  const dexMod = abilityModifier(sheet.stats?.dex ?? 10);
  const newAC = calcAC(equippedArmorKey, hasShield, dexMod, sheet.classes?.[0]?.classKey);

  const updatedSheet: CharacterSheet = {
    ...sheet,
    weapons,
    equippedArmorKey,
    equippedArmorName,
    hasShield,
    magicItems,
    armorClass: newAC,
  };

  await db.update(characters)
    .set({ sheet: updatedSheet, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath('/');
  revalidatePath(`/characters/${characterId}`);
}

// ─── INCANTESIMI ───────────────────────────────────────────────────────────

export async function saveKnownSpells(characterId: string, knownSpells: KnownSpell[]) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const updatedSheet = { ...(char.sheet as CharacterSheet), knownSpells };
  await db.update(characters)
    .set({ sheet: updatedSheet, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath(`/characters/${characterId}`);
}

// ─── INVENTARIO ────────────────────────────────────────────────────────────

export async function saveInventory(
  characterId: string,
  inventory: CharacterSheet['inventory'],
  money: CharacterSheet['money'],
) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const updatedSheet = { ...(char.sheet as CharacterSheet), inventory, money };
  await db.update(characters)
    .set({ sheet: updatedSheet, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath(`/characters/${characterId}`);
}

export async function deleteCharacter(characterId: string, campaignId?: string) {
  const db = getDb();
  await db.delete(characters).where(eq(characters.id, characterId));

  revalidatePath('/');
  revalidatePath('/campaigns');
  if (campaignId) revalidatePath(`/campaigns/${campaignId}`);
}

// ─── CAMPAGNE ──────────────────────────────────────────────────────────────

export async function createCampaign(data: Omit<NewCampaign, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = getDb();
  const id = generateId();
  const ts = now();
  await db.insert(campaigns).values({ ...data, id, createdAt: ts, updatedAt: ts });
  revalidatePath('/campaigns');
  return id;
}

export async function updateCampaign(id: string, data: Partial<Omit<NewCampaign, 'id' | 'createdAt' | 'updatedAt'>>) {
  const db = getDb();
  await db.update(campaigns).set({ ...data, updatedAt: now() }).where(eq(campaigns.id, id));
  revalidatePath('/campaigns');
  revalidatePath(`/campaigns/${id}`);
}

export async function archiveCampaign(id: string) {
  const db = getDb();
  await db.update(campaigns).set({ status: 'archived', updatedAt: now() }).where(eq(campaigns.id, id));
  revalidatePath('/campaigns');
}

export async function deleteCampaign(id: string) {
  const db = getDb();
  // Prima sposta i personaggi a NULL (o potresti eliminarli — scelta DM)
  await db.update(characters).set({ campaignId: null }).where(eq(characters.campaignId, id));
  await db.delete(campaigns).where(eq(campaigns.id, id));
  revalidatePath('/campaigns');
}

// ─── ASSEGNAZIONE GIOCATORE ────────────────────────────────────────────────

export async function assignUserToCharacter(characterId: string, clerkUserId: string) {
  const db = getDb();
  await db.update(characters).set({ userId: clerkUserId || null, updatedAt: now() }).where(eq(characters.id, characterId));
  revalidatePath(`/characters/${characterId}`);
}

export async function removeUserFromCharacter(characterId: string) {
  const db = getDb();
  await db.update(characters).set({ userId: null, updatedAt: now() }).where(eq(characters.id, characterId));
  revalidatePath(`/characters/${characterId}`);
}
