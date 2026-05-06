import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { campaigns, characters, characterConditions, characterSpellSlots } from '@/lib/db/schema';
import type { Character, CharacterCondition, CharacterSpellSlot, CharacterSheet, CombatState } from '@/lib/db/schema';
import { getCondition } from '@/lib/srd/conditions';
import { XP_THRESHOLDS, getXpForNextLevel } from '@/lib/srd/constants';
import { abilityModifier, proficiencyBonus, hpPercentage, formatModifier, initiative } from '@/lib/rules/calculations';
import { CLASSES } from '@/lib/srd/classes';
import { ABILITY_SHORT, type Ability } from '@/lib/srd/skills';
import HpControls from '@/components/dashboard/HpControls';
import ConditionBadge from '@/components/dashboard/ConditionBadge';
import AddConditionButton from '@/components/dashboard/AddConditionButton';
import XpControls from '@/components/dashboard/XpControls';
import CampaignSettingsButton from '@/components/campaign/CampaignSettingsButton';
import CombatStartButton from '@/components/combat/CombatStartButton';
import CombatView from '@/components/combat/CombatView';
import CampaignMembersButton from '@/components/campaign/CampaignMembersButton';
import { getSessionUser } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

interface CharacterWithRelations extends Character {
  conditions: CharacterCondition[];
  spellSlots: CharacterSpellSlot[];
}

export default async function CampaignDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionUser = await getSessionUser();
  const db = getDb();

  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
  if (!campaign) notFound();

  const allChars = await db.select().from(characters).where(eq(characters.campaignId, id));
  const pcs = allChars.filter(c => c.type === 'pc');

  // Fetch spell slots for all characters (needed for combat view)
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

  // Combat mode
  const combatState = campaign.combatState as CombatState | null;
  if (combatState?.active) {
    return (
      <CombatView
        campaignId={id}
        initialState={combatState}
        characters={allChars}
        spellSlotsByChar={spellSlotsByChar}
      />
    );
  }

  return (
    <div>
      {/* Header campagna */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.08em', marginBottom: 4 }}>
            CAMPAGNA
          </div>
          <h1 style={{ marginBottom: 2 }}>{campaign.name}</h1>
          {campaign.setting && (
            <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', fontStyle: 'italic' }}>
              {campaign.setting}
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <a href={`/campaigns/${id}/characters/new`}
            style={{ border: '1px solid #5a4020', color: '#c8922a', backgroundColor: '#221c14', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '7px 14px', textDecoration: 'none' }}>
            + Personaggio
          </a>
          <a href={`/campaigns/${id}/characters`}
            style={{ border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '7px 14px', textDecoration: 'none' }}>
            Tutti i personaggi
          </a>
          <CampaignSettingsButton campaign={campaign} />
          {sessionUser && <CampaignMembersButton campaignId={id} dmUserId={sessionUser.id} />}
          <CombatStartButton campaignId={id} characters={allChars} />
        </div>
      </div>

      {/* Gruppo (PG) */}
      {party.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#a08060' }}>
          <p style={{ fontFamily: 'IM Fell English, serif', fontSize: '1.1rem', marginBottom: 16 }}>
            Nessun personaggio giocante ancora.
          </p>
          <a href={`/campaigns/${id}/characters/new`}
            style={{ border: '1px solid #c8922a', color: '#c8922a', fontFamily: 'Cinzel, serif', padding: '10px 24px', textDecoration: 'none' }}>
            Crea il primo PG
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
          {party.map(pc => <CharacterCard key={pc.id} character={pc} campaignId={id} />)}
        </div>
      )}

      {/* Azioni di gruppo */}
      {party.length > 0 && (
        <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          <h2 className="mb-3">Azioni di Gruppo</h2>
          <XpControls characterId="all" label="Assegna XP a tutto il gruppo" />
        </div>
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
  const hpBarColor = hpPct > 60 ? '#4a7c4e' : hpPct > 30 ? '#8a7a2a' : '#7a2a2a';

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
  const savingThrows = sheet.savingThrowProficiencies ?? {};

  return (
    <div className="border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex gap-3 items-center">
          <div style={{ width: 48, height: 48, flexShrink: 0, border: '1px solid #5a4020', backgroundColor: '#2a2018', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {sheet.portraitUrl ? (
              <img src={sheet.portraitUrl} alt={character.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#5a4020', fontSize: '1.4rem' }}>⚔</span>
            )}
          </div>
          <div>
            <a href={`/characters/${character.id}`}
              style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1.05rem', display: 'block', textDecoration: 'none' }}>
              {character.name}
            </a>
            <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
              {sheet.race && `${sheet.race} · `}{classLabel}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3', fontSize: '1.4rem', lineHeight: 1 }}>Lv {level}</div>
          {canLevelUp && <div style={{ color: '#c8922a', border: '1px solid #c8922a', fontSize: '0.6rem', padding: '1px 4px', marginTop: 2, fontFamily: 'Cinzel, serif' }}>⬆ LEVEL UP</div>}
        </div>
      </div>

      {/* HP */}
      <div className="px-4 pb-2">
        <div className="flex justify-between text-sm mb-1" style={{ color: '#a08060' }}>
          <span>PF</span>
          <span style={{ color: '#e8d5a3', fontFamily: 'Cinzel, serif' }}>
            {character.hpCurrent}/{character.hpMax}
            {character.hpTemp > 0 && <span style={{ color: '#c8922a' }}> +{character.hpTemp}</span>}
          </span>
        </div>
        <div className="w-full h-3 border" style={{ borderColor: '#5a4020', backgroundColor: '#1a1410' }}>
          <div style={{ width: `${hpPct}%`, height: '100%', backgroundColor: hpBarColor, transition: 'width 0.3s' }} />
        </div>
        <HpControls characterId={character.id} hpCurrent={character.hpCurrent} hpMax={character.hpMax} />
      </div>

      {/* Combat mini-stats */}
      <div className="grid grid-cols-4 gap-1 px-4 pb-2">
        {[{ l: 'CA', v: ac }, { l: 'INIT', v: init }, { l: `d${hitDie}`, v: 'VD' }, { l: 'COMP', v: `+${prof}` }].map(({ l, v }) => (
          <div key={l} className="text-center p-1.5 border" style={{ borderColor: '#3a3020', backgroundColor: '#2a2018' }}>
            <div style={{ fontSize: '0.5rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.04em' }}>{l}</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: '#e8d5a3' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Stat compatte */}
      <div className="grid grid-cols-6 gap-1 px-4 pb-2">
        {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(key => {
          const val = stats[key];
          const mod = abilityModifier(val);
          return (
            <div key={key} className="text-center p-1 border" style={{ borderColor: '#2a2018', backgroundColor: '#1e1810' }}>
              <div style={{ fontSize: '0.5rem', color: '#a08060', fontFamily: 'Cinzel, serif' }}>{ABILITY_SHORT[key]}</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: '#e8d5a3' }}>{val}</div>
              <div style={{ fontSize: '0.7rem', color: mod >= 0 ? '#c8922a' : '#8b2020' }}>{formatModifier(mod)}</div>
            </div>
          );
        })}
      </div>

      {/* Condizioni */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1 items-center min-h-5">
          {character.conditions.map(c => {
            const def = getCondition(c.conditionKey);
            return def ? <ConditionBadge key={c.id} conditionId={c.id} characterId={character.id} name={def.name} icon={def.icon} /> : null;
          })}
          <AddConditionButton characterId={character.id} />
        </div>
      </div>

      {/* XP */}
      <div className="px-4 pb-3">
        <div className="flex justify-between text-xs mb-0.5" style={{ color: '#a08060' }}>
          <span>XP</span>
          <span>{character.xp.toLocaleString('it-IT')}{nextXp && ` / ${nextXp.toLocaleString('it-IT')}`}</span>
        </div>
        <div className="w-full h-1 mb-2" style={{ backgroundColor: '#1a1410' }}>
          <div style={{ width: `${Math.min(100, xpPct)}%`, height: '100%', backgroundColor: '#c8922a' }} />
        </div>
        <XpControls characterId={character.id} />
      </div>
    </div>
  );
}
