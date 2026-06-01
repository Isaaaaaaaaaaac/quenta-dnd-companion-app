import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { campaigns, characters, characterConditions, characterSpellSlots } from '@/lib/db/schema';
import type { Character, CharacterCondition, CharacterSpellSlot, CharacterSheet, CombatState } from '@/lib/db/schema';
import { getCondition } from '@/lib/srd/conditions';
import { XP_THRESHOLDS, getXpForNextLevel } from '@/lib/srd/constants';
import { abilityModifier, proficiencyBonus, hpPercentage, formatModifier } from '@/lib/rules/calculations';
import { CLASSES } from '@/lib/srd/classes';
import { ABILITY_SHORT, type Ability } from '@/lib/srd/skills';
import HpControls from '@/components/dashboard/HpControls';
import ConditionBadge from '@/components/dashboard/ConditionBadge';
import AddConditionButton from '@/components/dashboard/AddConditionButton';
import XpControls from '@/components/dashboard/XpControls';
import PartyRestButtons from '@/components/campaign/PartyRestButtons';
import CampaignSettingsButton from '@/components/campaign/CampaignSettingsButton';
import CombatStartButton from '@/components/combat/CombatStartButton';
import CombatView from '@/components/combat/CombatView';
import CampaignMembersButton from '@/components/campaign/CampaignMembersButton';
import CampaignFab from '@/components/campaign/CampaignFab';
import CampaignHeaderActions from '@/components/campaign/CampaignHeaderActions';
import { getSessionUser } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

interface CharacterWithRelations extends Character {
  conditions: CharacterCondition[];
  spellSlots: CharacterSpellSlot[];
}

export default async function CampaignDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionUser = await getSessionUser();
  if (!sessionUser) { const { redirect } = await import('next/navigation'); redirect('/sign-in'); }
  if (sessionUser?.role === 'player') { const { redirect } = await import('next/navigation'); redirect('/my-character'); }
  if (sessionUser && !sessionUser.onboarded) { const { redirect } = await import('next/navigation'); redirect('/onboarding'); }

  const db = getDb();
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
  if (!campaign) notFound();

  const allChars = await db.select().from(characters).where(eq(characters.campaignId, id));
  const pcs = allChars.filter(c => c.type === 'pc');

  const allSpellSlots = await Promise.all(
    allChars.map(c => db.select().from(characterSpellSlots).where(eq(characterSpellSlots.characterId, c.id)))
  );
  const spellSlotsByChar: Record<string, CharacterSpellSlot[]> = {};
  allChars.forEach((c, i) => { spellSlotsByChar[c.id] = allSpellSlots[i]; });

  const party: CharacterWithRelations[] = await Promise.all(pcs.map(async pc => {
    const [conditions, spellSlots] = await Promise.all([
      db.select().from(characterConditions).where(eq(characterConditions.characterId, pc.id)),
      db.select().from(characterSpellSlots).where(eq(characterSpellSlots.characterId, pc.id)),
    ]);
    return { ...pc, conditions, spellSlots };
  }));

  const combatState = campaign.combatState as CombatState | null;
  if (combatState?.active) {
    return <CombatView campaignId={id} initialState={combatState} characters={allChars} spellSlotsByChar={spellSlotsByChar} />;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', overflowX: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 48, gap: 24 }}>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Campagna</div>
          <h1 style={{ marginBottom: 6 }}>{campaign.name}</h1>
          {campaign.setting && (
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--gold)', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.85 }}>
              {campaign.setting}
            </div>
          )}
        </div>
        {/* Azioni header — visibili solo su desktop (nascosto su mobile via client component) */}
        <CampaignHeaderActions>
          <a href={`/campaigns/${id}/characters/new`} className="btn btn-secondary" style={{ padding: '7px 14px' }}>+ Personaggio</a>
          <a href={`/campaigns/${id}/characters`} className="btn btn-ghost" style={{ padding: '7px 14px' }}>Tutti</a>
          <CampaignSettingsButton campaign={campaign} />
          {sessionUser && <CampaignMembersButton campaignId={id} dmUserId={sessionUser.id} />}
          <CombatStartButton campaignId={id} characters={allChars} />
        </CampaignHeaderActions>
      </div>

      {/* FAB mobile — solo DM */}
      {sessionUser && (
        <CampaignFab
          campaignId={id}
          campaign={campaign}
          dmUserId={sessionUser.id}
          characters={allChars}
        />
      )}

      {/* Party vuoto */}
      {party.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1.1rem', fontStyle: 'italic', marginBottom: 28 }}>
            Nessun personaggio giocante ancora.
          </p>
          <a href={`/campaigns/${id}/characters/new`} className="btn btn-primary">Crea il primo PG</a>
        </div>
      ) : (
        <>
          {/* Character cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(480px, 100%), 1fr))', gap: 16, marginBottom: 24 }}>
            {party.map(pc => <CharacterCard key={pc.id} character={pc} campaignId={id} />)}
          </div>

          {/* Azioni di gruppo — solo DM */}
          <div style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-leather-dim)', borderRadius: 'var(--r-lg)', padding: 'var(--s-2)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase' }}>
              Azioni di Gruppo
            </div>
            <XpControls characterId="all" label="Assegna XP a tutto il gruppo" />
            <PartyRestButtons campaignId={id} />
          </div>
        </>
      )}
    </div>
  );
}

function CharacterCard({ character, campaignId }: { character: CharacterWithRelations; campaignId: string }) {
  const sheet = character.sheet as CharacterSheet;
  const level = character.level;
  const prof = proficiencyBonus(level);
  const stats = sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);

  const hpPct = hpPercentage(character.hpCurrent, character.hpMax);
  const hpColor = hpPct > 60 ? 'var(--info)' : hpPct > 30 ? 'var(--gold)' : 'var(--danger)';

  const nextXp = getXpForNextLevel(level);
  const currentLevelXp = XP_THRESHOLDS[level] ?? 0;
  const xpPct = nextXp ? Math.min(100, Math.round(((character.xp - currentLevelXp) / (nextXp - currentLevelXp)) * 100)) : 100;
  const canLevelUp = nextXp !== null && character.xp >= nextXp;

  const classLabel = sheet.classes?.map(c => {
    const found = CLASSES.find(cl => cl.key === c.classKey);
    return `${found?.name ?? c.classKey} ${c.level}`;
  }).join(' / ') ?? '';

  const ac = sheet.armorClass ?? (10 + abilityModifier(stats.dex));
  const init = formatModifier(abilityModifier(stats.dex) + (sheet.initiativeBonus ?? 0));
  const hitDie = cls?.hitDie ?? 8;

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--gold-border)', opacity: 0.4 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '24px 24px 16px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, flexShrink: 0, border: '1px solid var(--border-leather)', backgroundColor: 'var(--bg-card)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {sheet.portraitUrl
              ? <img src={sheet.portraitUrl} alt={character.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'var(--fg-3)', fontSize: '1.3rem' }}>⚔</span>}
          </div>
          <div>
            <a href={`/characters/${character.id}`} style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '0.02em', textDecoration: 'none', display: 'block', marginBottom: 4 }}>
              {character.name}
            </a>
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              {sheet.race && `${sheet.race} · `}{classLabel}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--fg-1)', lineHeight: 1 }}>
            Lv {level}
          </div>
          {canLevelUp && (
            <div style={{ fontFamily: 'var(--font-label)', fontSize: '7px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '2px 6px', marginTop: 4 }}>
              ⬆ Level Up
            </div>
          )}
        </div>
      </div>

      {/* HP */}
      <div style={{ padding: '0 24px 16px', borderBottom: '1px solid var(--border-leather)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div className="label">Punti Ferita</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700, color: hpColor }}>
            {character.hpCurrent}<span style={{ color: 'var(--fg-3)', fontSize: '0.8rem', fontWeight: 400 }}>/{character.hpMax}</span>
            {character.hpTemp > 0 && <span style={{ color: 'var(--arcane)', fontSize: '0.8rem' }}> +{character.hpTemp}</span>}
          </div>
        </div>
        <div className="hp-bar-track" style={{ marginBottom: 8 }}>
          <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor, boxShadow: `0 0 8px ${hpColor}66` }} />
        </div>
        <HpControls characterId={character.id} hpCurrent={character.hpCurrent} hpMax={character.hpMax} />
      </div>

      {/* Combat stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, backgroundColor: 'var(--border-leather)', borderBottom: '1px solid var(--border-leather)' }}>
        {[{ l: 'CA', v: String(ac) }, { l: 'Init', v: init }, { l: `d${hitDie}`, v: 'VD' }, { l: 'Comp', v: `+${prof}` }].map(({ l, v }) => (
          <div key={l} style={{ textAlign: 'center', padding: '10px 8px', backgroundColor: 'var(--bg-deep)' }}>
            <div className="label" style={{ marginBottom: 4 }}>{l}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 700, color: 'var(--fg-1)' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Ability scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, backgroundColor: 'var(--border-leather)', borderBottom: '1px solid var(--border-leather)' }}>
        {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(key => {
          const val = stats[key];
          const mod = abilityModifier(val);
          return (
            <div key={key} style={{ textAlign: 'center', padding: '8px 4px', backgroundColor: 'var(--bg-card)' }}>
              <div className="label" style={{ marginBottom: 2, fontSize: '7px' }}>{ABILITY_SHORT[key]}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--fg-1)', lineHeight: 1 }}>{val}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: mod >= 0 ? 'var(--gold)' : 'var(--danger)', marginTop: 1 }}>{formatModifier(mod)}</div>
            </div>
          );
        })}
      </div>

      {/* Conditions */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-leather)', minHeight: 44, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {character.conditions.map(c => {
          const def = getCondition(c.conditionKey);
          return def ? <ConditionBadge key={c.id} conditionId={c.id} characterId={character.id} name={def.name} icon={def.icon} /> : null;
        })}
        <AddConditionButton characterId={character.id} />
      </div>

      {/* XP */}
      <div style={{ padding: '12px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <div className="label">XP</div>
          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.8rem' }}>
            {character.xp.toLocaleString('it-IT')}{nextXp ? ` / ${nextXp.toLocaleString('it-IT')}` : ''}
          </div>
        </div>
        <div style={{ height: 2, backgroundColor: 'var(--bg-elevated)', marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${Math.min(100, xpPct)}%`, backgroundColor: 'var(--gold)', opacity: 0.6 }} />
        </div>
        <XpControls characterId={character.id} />
      </div>
    </div>
  );
}
