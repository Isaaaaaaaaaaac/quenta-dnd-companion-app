'use server';

import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getDb } from './client';
import { users, userCampaignMemberships, campaignInvitations, characterSwitchRequests, characters } from './schema';
import type { User } from './schema';
import { generateId, now } from '@/lib/utils';

// ─── Utenti ────────────────────────────────────────────────────────────────

export async function getOrCreateUser(id: string, email: string, name: string): Promise<User> {
  const db = getDb();
  const [existing] = await db.select().from(users).where(eq(users.id, id));
  if (existing) return existing;

  const isSuperAdmin = email === process.env.SUPERADMIN_EMAIL;
  const ts = now();
  const newUser = {
    id, email, name,
    role: (isSuperAdmin ? 'superadmin' : 'pending') as User['role'],
    onboarded: isSuperAdmin,
    dmNote: null,
    createdAt: ts,
    updatedAt: ts,
  };
  await db.insert(users).values(newUser);
  return newUser;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user ?? null;
}

export async function getAllUsers(): Promise<User[]> {
  const db = getDb();
  return db.select().from(users);
}

export async function submitDmRequest(userId: string, dmNote: string) {
  const db = getDb();
  await db.update(users).set({ role: 'pending_dm', dmNote, onboarded: true, updatedAt: now() }).where(eq(users.id, userId));
  revalidatePath('/onboarding');
}

export async function approveDm(userId: string) {
  const db = getDb();
  await db.update(users).set({ role: 'dm', updatedAt: now() }).where(eq(users.id, userId));
  revalidatePath('/admin');
}

export async function rejectDm(userId: string) {
  const db = getDb();
  await db.update(users).set({ role: 'rejected', updatedAt: now() }).where(eq(users.id, userId));
  revalidatePath('/admin');
}

export async function updateUserRole(userId: string, role: User['role']) {
  const db = getDb();
  await db.update(users).set({ role, updatedAt: now() }).where(eq(users.id, userId));
  revalidatePath('/admin');
}

export async function deleteUser(userId: string) {
  const db = getDb();
  await db.delete(userCampaignMemberships).where(eq(userCampaignMemberships.userId, userId));
  await db.delete(characterSwitchRequests).where(eq(characterSwitchRequests.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath('/admin');
}

// ─── Inviti ────────────────────────────────────────────────────────────────

function randomToken() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function getOrCreateInvitation(campaignId: string, createdBy: string) {
  const db = getDb();
  const [existing] = await db.select().from(campaignInvitations)
    .where(and(eq(campaignInvitations.campaignId, campaignId), eq(campaignInvitations.active, true)));
  if (existing) return existing;

  const inv = { id: generateId(), campaignId, token: randomToken(), active: true, createdBy, createdAt: now() };
  await db.insert(campaignInvitations).values(inv);
  return inv;
}

export async function regenerateInvitation(campaignId: string, createdBy: string) {
  const db = getDb();
  await db.update(campaignInvitations).set({ active: false }).where(eq(campaignInvitations.campaignId, campaignId));
  const inv = { id: generateId(), campaignId, token: randomToken(), active: true, createdBy, createdAt: now() };
  await db.insert(campaignInvitations).values(inv);
  revalidatePath(`/campaigns/${campaignId}`);
  return inv;
}

export async function getInvitationByToken(token: string) {
  const db = getDb();
  const [inv] = await db.select().from(campaignInvitations)
    .where(and(eq(campaignInvitations.token, token), eq(campaignInvitations.active, true)));
  return inv ?? null;
}

// ─── Membership ────────────────────────────────────────────────────────────

export async function joinCampaign(userId: string, campaignId: string) {
  const db = getDb();
  const [existing] = await db.select().from(userCampaignMemberships)
    .where(and(eq(userCampaignMemberships.userId, userId), eq(userCampaignMemberships.campaignId, campaignId)));
  if (!existing) {
    await db.insert(userCampaignMemberships).values({ userId, campaignId, activeCharacterId: null, joinedAt: now() });
  }
  await db.update(users).set({ role: 'player', onboarded: true, updatedAt: now() }).where(eq(users.id, userId));
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function getMemberships(userId: string) {
  const db = getDb();
  return db.select().from(userCampaignMemberships).where(eq(userCampaignMemberships.userId, userId));
}

export async function getCampaignMembers(campaignId: string) {
  const db = getDb();
  const memberships = await db.select().from(userCampaignMemberships).where(eq(userCampaignMemberships.campaignId, campaignId));
  const memberUsers = await Promise.all(memberships.map(m => getUserById(m.userId)));
  return memberships.map((m, i) => ({ ...m, user: memberUsers[i]! })).filter(m => m.user);
}

export async function removeMember(userId: string, campaignId: string) {
  const db = getDb();
  await db.delete(userCampaignMemberships).where(and(eq(userCampaignMemberships.userId, userId), eq(userCampaignMemberships.campaignId, campaignId)));
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function getActiveCharacter(userId: string, campaignId: string) {
  const db = getDb();
  const [m] = await db.select().from(userCampaignMemberships)
    .where(and(eq(userCampaignMemberships.userId, userId), eq(userCampaignMemberships.campaignId, campaignId)));
  if (!m?.activeCharacterId) return null;
  const [char] = await db.select().from(characters).where(eq(characters.id, m.activeCharacterId));
  return char ?? null;
}

// ─── Richieste cambio personaggio ──────────────────────────────────────────

export async function requestCharacterSwitch(userId: string, campaignId: string, toCharId: string, fromCharId?: string) {
  const db = getDb();
  // Cancella eventuali richieste pendenti precedenti
  await db.delete(characterSwitchRequests).where(
    and(eq(characterSwitchRequests.userId, userId), eq(characterSwitchRequests.campaignId, campaignId), eq(characterSwitchRequests.status, 'pending'))
  );
  await db.insert(characterSwitchRequests).values({
    id: generateId(), userId, campaignId,
    fromCharId: fromCharId ?? null,
    toCharId, status: 'pending', createdAt: now(),
  });
  revalidatePath('/my-characters');
}

export async function getPendingSwitchRequests(campaignId: string) {
  const db = getDb();
  return db.select().from(characterSwitchRequests)
    .where(and(eq(characterSwitchRequests.campaignId, campaignId), eq(characterSwitchRequests.status, 'pending')));
}

export async function approveSwitchRequest(requestId: string, userId: string, campaignId: string, toCharId: string) {
  const db = getDb();
  await db.update(characterSwitchRequests).set({ status: 'approved' }).where(eq(characterSwitchRequests.id, requestId));
  await db.update(userCampaignMemberships).set({ activeCharacterId: toCharId })
    .where(and(eq(userCampaignMemberships.userId, userId), eq(userCampaignMemberships.campaignId, campaignId)));
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function rejectSwitchRequest(requestId: string) {
  const db = getDb();
  await db.update(characterSwitchRequests).set({ status: 'rejected' }).where(eq(characterSwitchRequests.id, requestId));
}
