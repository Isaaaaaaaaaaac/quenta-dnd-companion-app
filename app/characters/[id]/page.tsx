import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { auth } from '@/auth';
import {
  characters, characterConditions, characterSpellSlots, characterResources,
  campaigns, userCampaignMemberships, type CharacterSheet,
} from '@/lib/db/schema';
import { abilityModifier } from '@/lib/rules/calculations';

import PendingRestBanner from '@/components/character/rest/PendingRestBanner';
import MobileSheet from '@/components/character/mobile/MobileSheet';
import { buildSheetViewModel } from '@/lib/character-sheet/buildSheetViewModel';
import CharacterSheetView from '@/components/character/sheet/v2/CharacterSheetView';

export const dynamic = 'force-dynamic';

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const isDm = session?.user?.email === process.env.NEXT_PUBLIC_DM_EMAIL;
  const db = getDb();

  const [char] = await db.select().from(characters).where(eq(characters.id, id));
  if (!char) notFound();

  const campaign = char.campaignId
    ? (await db.select().from(campaigns).where(eq(campaigns.id, char.campaignId)))[0]
    : null;

  const [conditions, spellSlots, resources] = await Promise.all([
    db.select().from(characterConditions).where(eq(characterConditions.characterId, id)),
    db.select().from(characterSpellSlots).where(eq(characterSpellSlots.characterId, id)),
    db.select().from(characterResources).where(eq(characterResources.characterId, id)),
  ]);

  // ── Membership: personaggio attivo + pending rest ──────────────────────────
  const membership = (char.userId && char.campaignId)
    ? (await db.select().from(userCampaignMemberships).where(
        and(
          eq(userCampaignMemberships.userId, char.userId),
          eq(userCampaignMemberships.campaignId, char.campaignId)
        )
      ))[0]
    : null;

  const isActiveCharacter = membership?.activeCharacterId === char.id;

  // Nome del PG attualmente attivo (per dialog di conferma)
  let currentActiveName: string | null = null;
  if (membership?.activeCharacterId && membership.activeCharacterId !== char.id) {
    const [activeChar] = await db.select({ name: characters.name })
      .from(characters).where(eq(characters.id, membership.activeCharacterId));
    currentActiveName = activeChar?.name ?? null;
  }

  const sheet = char.sheet as CharacterSheet;
  const model = buildSheetViewModel(char, sheet, spellSlots);

  const isDmOrOwner = isDm || isActiveCharacter;

  return (
    <>
    {/* ── DESKTOP (≥ 768px) ────────────────────────────────── */}
    <div className="desktop-layout" style={{ minWidth: 1100, padding: '16px 24px 48px' }}>

      {/* Banner pending rest — visibile al giocatore, non al DM */}
      {!isDm && sheet.pendingRest && (
        <PendingRestBanner
          characterId={char.id}
          pendingRest={sheet.pendingRest}
          classes={sheet.classes ?? []}
          conModifier={abilityModifier(model.stats.con)}
          hitDiceUsed={sheet.hitDiceUsed ?? 0}
          hpCurrent={char.hpCurrent}
          hpMax={char.hpMax}
          isPreparedCaster={['cleric','druid','paladin','wizard'].some(k => model.casterClassKeys.includes(k))}
          currentSpells={model.knownSpells}
          casterClassKeys={model.casterClassKeys}
          characterStats={model.stats}
        />
      )}

      {/* Breadcrumb */}
      {campaign && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: '11px', color: 'var(--fg-3)', marginBottom: 'var(--s-2)' }}>
          <a href="/campaigns" style={{ color: 'var(--fg-2)' }}>Campagne</a>
          <span>/</span>
          <a href={`/campaigns/${campaign.id}`} style={{ color: 'var(--fg-2)' }}>{campaign.name}</a>
          <span>/</span>
          <span style={{ color: 'var(--fg-1)' }}>{char.name}</span>
        </div>
      )}

      <CharacterSheetView
        character={char}
        sheet={sheet}
        model={model}
        conditions={conditions}
        resources={resources}
        campaign={campaign ? { id: campaign.id, name: campaign.name } : null}
        isActiveCharacter={isActiveCharacter}
        currentActiveName={currentActiveName}
        viewerRole={isDm ? 'dm' : 'player'}
        currentUserId={char.userId ?? null}
        isOwner={isDmOrOwner}
      />

    </div>
    {/* ── MOBILE (< 768px) ─────────────────────────────────── */}
    <div className="mobile-layout">
      <MobileSheet
        characterId={char.id}
        charName={char.name}
        classLabel={model.classLabel}
        hpCurrent={char.hpCurrent}
        hpMax={char.hpMax}
        hpTemp={char.hpTemp}
        hpPct={model.hpPct}
        hpColor={model.hpColor}
        level={model.level}
        xp={char.xp}
        xpPct={model.xpPct}
        canLevelUp={model.canLevelUp}
        prof={model.prof}
        hitDie={model.hitDie}
        passPerc={model.passPerc}
        spellDC={model.spellDC}
        spellAtk={model.spellAtk}
        carriedKg={model.carriedKg}
        carryMax={model.carryMax}
        carryPct={model.carryPct}
        carryOverloaded={model.carryOverloaded}
        canCast={model.canCast}
        sheet={sheet}
        conditions={conditions}
        resources={resources}
        knownSpells={model.knownSpells}
        activeSpellSlots={model.activeSpellSlots}
        pinnedPassive={model.pinnedPassive}
        pinnedActive={model.pinnedActive}
        casterClassKeys={model.casterClassKeys}
        isDm={isDm}
        isActiveCharacter={isActiveCharacter}
      />
    </div>
    </>
  );
}
