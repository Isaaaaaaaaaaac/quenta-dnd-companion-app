'use server';

import { eq, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from './client';
import { characters, characterConditions, characterResources, characterSpellSlots, campaigns, userCampaignMemberships } from './schema';
import { generateId, now } from '@/lib/utils';
import { getClass } from '@/lib/srd/classes';
import { SPELL_SLOTS_FULL, SPELL_SLOTS_HALF, SPELL_SLOTS_PACT, SPELL_SLOTS_THIRD } from '@/lib/srd/constants';
import type { NewCharacter, CharacterSheet, CharacterWeapon, MagicItem, KnownSpell, AsiHistoryEntry, CharacterFeat, NewCampaign } from './schema';
import { calcAC, WEAPONS, ARMORS } from '@/lib/srd/equipment';
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

export async function saveCombatState(campaignId: string, state: import('./schema').CombatState | null) {
  const db = getDb();
  await db.update(campaigns).set({ combatState: state, updatedAt: now() }).where(eq(campaigns.id, campaignId));
  revalidatePath(`/campaigns/${campaignId}`);
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

// ─── PERSONAGGIO ATTIVO ────────────────────────────────────────────────────
// Imposta il personaggio attivo per un giocatore in una campagna.
// Disattiva automaticamente qualsiasi altro personaggio attivo dello stesso player.
// ─── EQUIPAGGIAMENTO ──────────────────────────────────────────────────────────
export async function equipInventoryItem(
  characterId: string,
  itemId: string,
  action: 'equip' | 'unequip' | 'attune' | 'unattune',
): Promise<{ error?: string }> {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return { error: 'Personaggio non trovato' };

  const sheet = { ...(char.sheet as CharacterSheet) };
  let inventory = (sheet.inventory ?? []).map(i => ({ ...i }));
  const item = inventory.find(i => i.id === itemId);
  if (!item) return { error: 'Oggetto non trovato' };

  const equipping = action === 'equip';
  const attuning  = action === 'attune';

  // ── Attunement ──────────────────────────────────────────────────────────────
  if (action === 'attune' || action === 'unattune') {
    if (attuning) {
      const currentlyAttuned = inventory.filter(i => i.attuned && i.id !== itemId).length;
      if (currentlyAttuned >= 3) return { error: 'Puoi sintonizzarti con al massimo 3 oggetti magici' };
    }
    inventory = inventory.map(i => i.id === itemId ? { ...i, attuned: attuning } : i);
    sheet.inventory = inventory;
    await db.update(characters).set({ sheet, updatedAt: now() }).where(eq(characters.id, characterId));
    revalidatePath(`/characters/${characterId}`);
    return {};
  }

  // ── Mappa legacy: ID italiano del modal → chiave SRD inglese ────────────────
  // Necessaria per item salvati prima che il modal fosse allineato ai key SRD.
  const MODAL_TO_SRD: Record<string, string> = {
    // Armi — nomi italiani diversi dalla traduzione SRD
    'daga':       'dagger',      // Daga → Pugnale
    'randello':   'club',        // Randello → Clava
    'lancia':     'javelin',     // Lancia → Giavellotto
    'spadone':    'greatsword',  // Spadone → Spada a Due Mani
    'alabarda':   'glaive',      // Alabarda → Glaive (halberd in SRD è separato)
    'balestra-l': 'crossbow_light',
    'balestra-m': 'hand_crossbow',
    // Armature
    'cuoio':      'leather',     // Cuoio → Di Cuoio
    'cuoio-b':    'studded_leather', // Cuoio Borchiato → Di Cuoio Borchiato
    'pettorale':  'breastplate', // Corazza Pettorale → Pettorale
    'arm-piastre':'plate',       // Armatura di Piastre → A Piastre
    'giaco':      'chain_mail',  // Giaco di Maglia → Cotta di Piastre (CA 16, pesante)
    'arm-anelli': 'ring_mail',
  };

  // ── Helper: cerca in SRD per chiave SRD, poi ID legacy, poi nome italiano ───
  const resolveSrdKey = (srdKey?: string): string | undefined =>
    MODAL_TO_SRD[srdKey ?? ''] ?? srdKey;

  const findWeapon = (i: typeof item) => {
    const key = resolveSrdKey(i.srdKey);
    return WEAPONS.find(w => w.key === key || w.name.toLowerCase() === i.name.toLowerCase());
  };
  const findArmor = (i: typeof item) => {
    const key = resolveSrdKey(i.srdKey);
    return ARMORS.find(a => a.key === key || a.name.toLowerCase() === i.name.toLowerCase());
  };

  // ── Inferisci categoria se mancante (item aggiunti prima dell'aggiornamento) ──
  let cat = item.category;
  if (!cat) {
    if (findWeapon(item))                                         cat = 'Arma';
    else if (findArmor(item)?.type === 'scudo')                   cat = 'Scudo';
    else if (findArmor(item))                                     cat = 'Armatura';
  }
  // Aggiorna il record in inventory con la categoria inferita
  if (cat && !item.category) {
    inventory = inventory.map(i => i.id === itemId ? { ...i, category: cat } : i);
  }

  // ── Equip / Unequip ─────────────────────────────────────────────────────────
  if (equipping) {
    if (cat === 'Armatura') {
      // Solo un'armatura alla volta
      inventory = inventory.map(i =>
        (i.category === 'Armatura' || findArmor(i)?.type !== 'scudo' && findArmor(i) != null) && i.id !== itemId
          ? { ...i, equipped: false }
          : i
      );
    }

    if (cat === 'Scudo') {
      // Arma a due mani → no scudo
      const hasTwo = inventory.some(i => {
        if (!i.equipped || i.id === itemId) return false;
        const w = findWeapon(i);
        return w?.properties.includes('a_due_mani') ?? false;
      });
      if (hasTwo) return { error: 'Non puoi equipaggiare uno scudo mentre impugni un\'arma a due mani' };
    }

    if (cat === 'Arma') {
      const weapon = findWeapon(item);
      if (weapon?.properties.includes('a_due_mani')) {
        inventory = inventory.map(i =>
          (i.category === 'Scudo' || findArmor(i)?.type === 'scudo') && i.equipped
            ? { ...i, equipped: false }
            : i
        );
        sheet.hasShield = false;
      }
    }
  }

  // Aggiorna equipped
  inventory = inventory.map(i => i.id === itemId ? { ...i, equipped: equipping } : i);

  // ── Ricalcola CA se armatura o scudo ────────────────────────────────────────
  if (cat === 'Armatura' || cat === 'Scudo') {
    const equippedArmorItem = inventory.find(i =>
      i.equipped && (i.category === 'Armatura' || (findArmor(i) && findArmor(i)?.type !== 'scudo'))
    );
    const hasShield = inventory.some(i =>
      i.equipped && (i.category === 'Scudo' || findArmor(i)?.type === 'scudo')
    );
    // Trova la chiave SRD reale dell'armatura (anche se l'item usa chiave italiana)
    const equippedSrdArmor = equippedArmorItem ? findArmor(equippedArmorItem) : null;
    const armorKey = equippedSrdArmor?.key ?? null;

    const dexMod = abilityModifier(sheet.stats?.dex ?? 10);
    const cls = sheet.classes?.[0]?.classKey;
    sheet.armorClass = calcAC(armorKey, hasShield, dexMod, cls);
    sheet.hasShield = hasShield;
    if (cat === 'Armatura') {
      sheet.equippedArmorKey  = equipping ? (armorKey ?? undefined) : undefined;
      sheet.equippedArmorName = equipping ? item.name : undefined;
    }
  }

  // ── Sincronizza arma con la tabella Attacchi ─────────────────────────────────
  if (cat === 'Arma') {
    const srdWeapon = findWeapon(item);
    if (srdWeapon) {
      const str = sheet.stats?.str ?? 10;
      const dex = sheet.stats?.dex ?? 10;
      const isFinesse = srdWeapon.properties.includes('accurata');
      const isRanged  = srdWeapon.category.includes('distanza');
      const attackStat: 'str' | 'dex' = isFinesse
        ? (abilityModifier(str) >= abilityModifier(dex) ? 'str' : 'dex')
        : isRanged ? 'dex' : 'str';

      const currentWeapons = sheet.weapons ?? [];
      if (equipping) {
        // Usa la chiave SRD reale, non quella italiana del modal
        const alreadyInList = currentWeapons.some(w => w.srdKey === srdWeapon.key || w.name === srdWeapon.name);
        if (!alreadyInList) {
          const newWeapon: CharacterWeapon = {
            id: generateId(),
            name: srdWeapon.name,
            srdKey: srdWeapon.key,
            damageDice: srdWeapon.damageDice,
            damageDice2h: srdWeapon.damageDice2h,
            damageType: srdWeapon.damageType,
            properties: srdWeapon.properties,
            range: srdWeapon.range,
            attackStat,
            magic: item.category === 'Magico',
            weight: srdWeapon.weight,
          };
          sheet.weapons = [...currentWeapons, newWeapon];
        }
      } else {
        const stillEquipped = inventory.some(i =>
          i.id !== itemId && i.equipped &&
          (findWeapon(i)?.key === srdWeapon.key)
        );
        if (!stillEquipped) {
          sheet.weapons = currentWeapons.filter(w => w.srdKey !== srdWeapon.key && w.name !== srdWeapon.name);
        }
      }
    }
  }

  sheet.inventory = inventory;
  await db.update(characters).set({ sheet, updatedAt: now() }).where(eq(characters.id, characterId));
  revalidatePath(`/characters/${characterId}`);
  return {};
}

// ─── PERSONAGGIO ATTIVO ────────────────────────────────────────────────────
export async function setActiveCharacter(characterId: string) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char || !char.userId || !char.campaignId) return;

  await db.update(userCampaignMemberships)
    .set({ activeCharacterId: characterId })
    .where(
      and(
        eq(userCampaignMemberships.userId, char.userId),
        eq(userCampaignMemberships.campaignId, char.campaignId)
      )
    );

  revalidatePath('/characters');
  revalidatePath(`/characters/${characterId}`);
  revalidatePath(`/campaigns/${char.campaignId}`);
}

// ─── RIPOSO PARTY-WIDE ────────────────────────────────────────────────────
// Recupera i personaggi attivi nella campagna e imposta pendingRest.

async function getActiveCharacterIds(campaignId: string): Promise<string[]> {
  const db = getDb();
  const memberships = await db
    .select({ activeCharacterId: userCampaignMemberships.activeCharacterId })
    .from(userCampaignMemberships)
    .where(
      and(
        eq(userCampaignMemberships.campaignId, campaignId),
        sql`${userCampaignMemberships.activeCharacterId} IS NOT NULL`
      )
    );
  return memberships.map(m => m.activeCharacterId).filter(Boolean) as string[];
}

export async function shortRestParty(campaignId: string) {
  const db = getDb();
  const activeIds = await getActiveCharacterIds(campaignId);
  if (!activeIds.length) return;

  for (const charId of activeIds) {
    // Reset risorse riposo breve
    await db.update(characterResources)
      .set({ current: characterResources.maximum })
      .where(and(eq(characterResources.characterId, charId), eq(characterResources.resetType, 'short')));

    // Warlock: recupera tutti gli slot
    const [char] = await db.select().from(characters).where(eq(characters.id, charId));
    if (char) {
      const sheet = char.sheet as CharacterSheet;
      const isWarlock = sheet.classes?.some(c => c.classKey === 'warlock');
      if (isWarlock) {
        await db.update(characterSpellSlots).set({ used: 0 }).where(eq(characterSpellSlots.characterId, charId));
      }
      // Imposta pendingRest
      await db.update(characters)
        .set({ sheet: { ...sheet, pendingRest: 'short' }, updatedAt: now() })
        .where(eq(characters.id, charId));
    }
  }

  revalidatePath('/');
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function longRestParty(campaignId: string) {
  const db = getDb();
  const activeIds = await getActiveCharacterIds(campaignId);
  if (!activeIds.length) return;

  for (const charId of activeIds) {
    const [char] = await db.select().from(characters).where(eq(characters.id, charId));
    if (!char) continue;

    const sheet = char.sheet as CharacterSheet;

    // Recupera PF al massimo
    await db.update(characters)
      .set({ hpCurrent: char.hpMax, hpTemp: 0, updatedAt: now() })
      .where(eq(characters.id, charId));

    // Reset tutte le risorse
    await db.update(characterResources)
      .set({ current: characterResources.maximum })
      .where(eq(characterResources.characterId, charId));

    // Reset tutti gli slot incantesimo
    await db.update(characterSpellSlots).set({ used: 0 }).where(eq(characterSpellSlots.characterId, charId));

    // Recupera Dadi Vita: floor(livello_totale / 2)
    const totalLevel = sheet.classes?.reduce((s, c) => s + c.level, 0) ?? 1;
    const hdUsed = sheet.hitDiceUsed ?? 0;
    const hdRecovered = Math.floor(totalLevel / 2);
    const newHdUsed = Math.max(0, hdUsed - hdRecovered);

    // Imposta pendingRest e aggiorna HD usati
    await db.update(characters)
      .set({ sheet: { ...sheet, pendingRest: 'long', hitDiceUsed: newHdUsed }, updatedAt: now() })
      .where(eq(characters.id, charId));
  }

  revalidatePath('/');
  revalidatePath(`/campaigns/${campaignId}`);
}

// ─── DADI VITA + COMPLETAMENTO RIPOSO ────────────────────────────────────
export async function spendHitDice(characterId: string, diceSpent: number, hpGained: number) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const sheet = char.sheet as CharacterSheet;
  const newUsed = (sheet.hitDiceUsed ?? 0) + diceSpent;
  const newHp = Math.min(char.hpMax, char.hpCurrent + hpGained);

  await db.update(characters)
    .set({
      hpCurrent: newHp,
      sheet: { ...sheet, hitDiceUsed: newUsed, pendingRest: null },
      updatedAt: now(),
    })
    .where(eq(characters.id, characterId));

  revalidatePath(`/characters/${characterId}`);
}

export async function completePendingRest(characterId: string) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const sheet = char.sheet as CharacterSheet;
  await db.update(characters)
    .set({ sheet: { ...sheet, pendingRest: null }, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath(`/characters/${characterId}`);
}

// ─── PIN FEATURE ────────────────────────────────────────────────────────────
export async function togglePinFeature(
  characterId: string,
  feature: import('./schema').PinnedFeature,
  pin: boolean,
) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const sheet = char.sheet as CharacterSheet;
  const current = sheet.pinnedFeatures ?? [];
  const updated = pin
    ? current.some(f => f.key === feature.key && f.type === feature.type)
      ? current
      : [...current, feature]
    : current.filter(f => !(f.key === feature.key && f.type === feature.type));

  await db.update(characters)
    .set({ sheet: { ...sheet, pinnedFeatures: updated }, updatedAt: now() })
    .where(eq(characters.id, characterId));

  // Auto-inizializza la risorsa nel DB se non esiste ancora
  // Usa maxByLevel dalla definizione SRD della classe
  if (pin && feature.resourceKey && feature.type === 'class') {
    const charClass = sheet.classes?.find(c => {
      const cls = getClass(c.classKey);
      return cls?.resources.some(r => r.key === feature.resourceKey);
    });

    if (charClass) {
      const cls = getClass(charClass.classKey);
      const resDef = cls?.resources.find(r => r.key === feature.resourceKey);
      if (resDef) {
        const maxValue = resDef.maxByLevel[charClass.level] ?? 0;
        if (maxValue > 0) {
          const existing = await db.select()
            .from(characterResources)
            .where(and(
              eq(characterResources.characterId, characterId),
              eq(characterResources.resourceKey, feature.resourceKey)
            ));
          if (!existing.length) {
            await db.insert(characterResources).values({
              characterId,
              resourceKey: feature.resourceKey,
              current: maxValue,
              maximum: maxValue,
              resetType: resDef.resetType,
            });
          }
        }
      }
    }
  }

  revalidatePath(`/characters/${characterId}`);
}

// ─── TALENTI ─────────────────────────────────────────────────────────────────
export async function updateCharacterFeats(characterId: string, feats: import('./schema').CharacterFeat[]) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;
  const sheet = { ...(char.sheet as CharacterSheet), feats };
  await db.update(characters).set({ sheet, updatedAt: now() }).where(eq(characters.id, characterId));
  revalidatePath(`/characters/${characterId}`);
}

// ─── SCELTE RAZZIALI ──────────────────────────────────────────────────────────
export async function saveRacialChoices(
  characterId: string,
  choices: { traitKey: string; value: string | string[] }[],
) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;
  const sheet = { ...(char.sheet as CharacterSheet), racialChoices: choices };
  await db.update(characters).set({ sheet, updatedAt: now() }).where(eq(characters.id, characterId));
  revalidatePath(`/characters/${characterId}`);
}

// ─── USA RISORSA DI CLASSE ────────────────────────────────────────────────────
export async function useClassResource(characterId: string, resourceKey: string, delta: number) {
  const db = getDb();
  const rows = await db.select().from(characterResources)
    .where(and(eq(characterResources.characterId, characterId), eq(characterResources.resourceKey, resourceKey)));
  if (!rows.length) return;
  const { current, maximum } = rows[0];
  const newCurrent = Math.max(0, Math.min(maximum, current + delta));
  await db.update(characterResources)
    .set({ current: newCurrent })
    .where(and(eq(characterResources.characterId, characterId), eq(characterResources.resourceKey, resourceKey)));
  revalidatePath(`/characters/${characterId}`);
}

// ─── RITRATTO ────────────────────────────────────────────────────────────────
export async function updatePortrait(characterId: string, portraitUrl: string) {
  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.id, characterId));
  if (!char) return;

  const sheet = { ...(char.sheet as CharacterSheet), portraitUrl };
  await db.update(characters)
    .set({ sheet, updatedAt: now() })
    .where(eq(characters.id, characterId));

  revalidatePath(`/characters/${characterId}`);
  revalidatePath('/characters');
}
