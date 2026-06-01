import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { auth } from '@/auth';
import {
  characters, characterConditions, characterSpellSlots, characterResources,
  campaigns, userCampaignMemberships, type CharacterSheet,
} from '@/lib/db/schema';
import {
  abilityModifier, proficiencyBonus, skillBonus,
  passivePerception, spellSaveDC, spellAttackBonus,
  totalCarriedWeight, carryStatus, formatModifier, hpPercentage,
} from '@/lib/rules/calculations';
import { SKILLS, ABILITY_SHORT, ABILITY_NAMES, type Ability } from '@/lib/srd/skills';
import { CLASSES, SPELLCASTING_SUBCLASSES } from '@/lib/srd/classes';
import { XP_THRESHOLDS, getXpForNextLevel } from '@/lib/srd/constants';

import LevelUpButton from '@/components/character/sheet/LevelUpButton';
import AsiRetroactiveButton from '@/components/character/sheet/AsiRetroactiveButton';
import AssignPlayerButton from '@/components/character/sheet/AssignPlayerButton';
import ActiveCharacterButton from '@/components/character/sheet/ActiveCharacterButton';
import XpControls from '@/components/dashboard/XpControls';
import InventoryCard from '@/components/character/sheet/InventoryCard';
import AddSpellButton from '@/components/character/sheet/AddSpellButton';
import PortraitButton from '@/components/character/portrait/PortraitButton';
import PendingRestBanner from '@/components/character/rest/PendingRestBanner';
import SpellSectionTabs from '@/components/character/spell/SpellSectionTabs';
import FeatureButton from '@/components/character/features/FeatureButton';
import PinnedPassiveSection from '@/components/character/features/PinnedPassiveSection';
import PinnedActiveResources from '@/components/character/features/PinnedActiveResources';
import BackstoryCard from '@/components/character/sheet/BackstoryCard';
import MobileSheet from '@/components/character/mobile/MobileSheet';
import type { Character } from '@/lib/db/schema';
import SheetTabBar from '@/components/character/sheet/SheetTabBar';
import HpStrip from '@/components/character/sheet/HpStrip';

export const dynamic = 'force-dynamic';

// ─── DS inline constants ───────────────────────────────────────────────────
const CARD: React.CSSProperties = {
  background: 'var(--bg-deep)',
  border: '1px solid var(--border-leather-dim)',
  borderRadius: 'var(--r-lg)',
  padding: 'var(--s-2)',
};
const DV: React.CSSProperties = {
  height: '1px',
  background: 'var(--border-leather-dim)',
  margin: 'var(--s-1) 0',
};
const IR: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
  padding: '4px 0', borderBottom: '.5px solid var(--bg-elevated)', fontSize: '12px',
};

function SectionTitle({ children, mb = true }: { children: React.ReactNode; mb?: boolean }) {
  return (
    <div style={{
      fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600,
      letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase',
      display: 'flex', alignItems: 'center', gap: 'var(--s-1)',
      marginBottom: mb ? 'var(--s-1)' : 0,
    }}>
      {children}
      <span style={{ flex: 1, height: '.5px', background: 'var(--border-leather-dim)' }} />
    </div>
  );
}

function Divider() { return <div style={DV} />; }

const SCHOOL_ABBR: Record<string, string> = {
  abjuration: 'Abj.', conjuration: 'Con.', divination: 'Div.',
  enchantment: 'Inc.', evocation: 'Evo.', illusion: 'Ill.',
  necromancy: 'Nec.', transmutation: 'Tra.',
};

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
  const level = char.level;
  const prof = proficiencyBonus(level);
  const stats = sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const savingThrows = sheet.savingThrowProficiencies ?? { str: false, dex: false, con: false, int: false, wis: false, cha: false };
  const skillMap = sheet.skills ?? {};
  const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);

  const hpPct = hpPercentage(char.hpCurrent, char.hpMax);
  const hpColor = hpPct > 60 ? 'var(--hp-healthy)' : hpPct > 30 ? 'var(--hp-wounded)' : 'var(--danger)';

  const perceptionSkill = skillMap['perception'];
  const passPerc = passivePerception(stats.wis, level, perceptionSkill?.proficient ?? false, perceptionSkill?.expertise ?? false);

  const castingAbility = cls?.spellcastingAbility as Ability | undefined;
  const castingScore = castingAbility ? stats[castingAbility] : 0;
  const spellDC = castingAbility ? spellSaveDC(castingScore, level) : null;
  const spellAtk = castingAbility ? spellAttackBonus(castingScore, level) : null;

  const carriedKg = totalCarriedWeight(sheet.inventory ?? []);
  const carryMax = Math.floor(stats.str * 7.5);
  const carryPct = Math.min(100, carryMax > 0 ? (carriedKg / carryMax) * 100 : 0);
  const carryOverloaded = carryStatus(stats.str, carriedKg) !== 'normal';

  const nextXp = getXpForNextLevel(level);
  const currentLevelXp = XP_THRESHOLDS[level] ?? 0;
  const xpPct = nextXp ? Math.min(100, Math.round(((char.xp - currentLevelXp) / (nextXp - currentLevelXp)) * 100)) : 100;
  const canLevelUp = nextXp !== null && char.xp >= nextXp;

  const classLabel = sheet.classes?.map(c => {
    const found = CLASSES.find(cl => cl.key === c.classKey);
    return `${found?.name ?? c.classKey} ${c.level}`;
  }).join(' / ') ?? '';

  const hitDie = cls?.hitDie ?? 8;

  // ── Caster detection ─────────────────────────────────────────────────────
  // Raccoglie i classKey a cui il personaggio ha accesso per gli incantesimi.
  // Include classi melee con archetipi che conferiscono magia (es. Mistificatore Arcano).
  const casterClassKeys: string[] = [];
  for (const c of sheet.classes ?? []) {
    const classDef = CLASSES.find(cl => cl.key === c.classKey);
    if (classDef && classDef.spellcastingType !== 'none') {
      if (!casterClassKeys.includes(c.classKey)) casterClassKeys.push(c.classKey);
    }
    // Controlla archetipo incantatore su classi melee
    const subclassSpells = SPELLCASTING_SUBCLASSES[c.classKey];
    if (subclassSpells && c.subclass) {
      const match = subclassSpells.find(s => s.subclassName === c.subclass);
      if (match && !casterClassKeys.includes(match.spellList)) {
        casterClassKeys.push(match.spellList);
      }
    }
  }
  const canCast = casterClassKeys.length > 0;

  // Feature pinnate: passive (Col 1) vs attive con risorsa (Col 2)
  const pinnedAll = sheet.pinnedFeatures ?? [];
  const pinnedPassive = pinnedAll.filter(f => !f.resourceKey);
  const pinnedActive  = pinnedAll.filter(f => !!f.resourceKey);

  // Archetipi con subclass valorizzata (per display sidebar)
  const classesWithSubclass = (sheet.classes ?? []).filter(c => c.subclass);

  const activeSpellSlots = spellSlots.filter(s => s.total > 0).sort((a, b) => a.slotLevel - b.slotLevel);
  const knownSpells = sheet.knownSpells ?? [];

  // Skills: left col = str+dex+int, right col = wis+cha
  const leftAbilities: Ability[] = ['str', 'dex', 'int'];
  const rightAbilities: Ability[] = ['wis', 'cha'];

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
          conModifier={abilityModifier(stats.con)}
          hitDiceUsed={sheet.hitDiceUsed ?? 0}
          hpCurrent={char.hpCurrent}
          hpMax={char.hpMax}
          isPreparedCaster={['cleric','druid','paladin','wizard'].some(k => casterClassKeys.includes(k))}
          currentSpells={knownSpells}
          casterClassKeys={casterClassKeys}
          characterStats={stats}
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

      {/* Layout: sidebar sinistra + pannello destro (3 col + backstory) */}
      <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'start' }}>

        {/* ════ COL 1: Identity (sidebar fissa 232px) ════ */}
        <div style={{ width: 232, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          <div style={CARD}>

            {/* Portrait + Name */}
            <div style={{ display: 'flex', gap: 'var(--s-1)', alignItems: 'flex-start', marginBottom: 'var(--s-2)' }}>
              <PortraitButton
                characterId={char.id}
                characterName={char.name}
                classLabel={classLabel}
                portraitUrl={sheet.portraitUrl}
              />
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: 'var(--gold)', letterSpacing: '.06em', lineHeight: 1.1, marginBottom: 4 }}>
                  {char.name.toUpperCase()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--fg-2)', lineHeight: 1.5 }}>{classLabel}</div>
                {sheet.alignment && (
                  <span style={{ display: 'inline-block', marginTop: 'var(--s-1)', fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.09em', color: 'var(--fg-2)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: '2px var(--s-1)' }}>
                    {sheet.alignment}
                  </span>
                )}
              </div>
            </div>

            {/* XP bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--fg-2)', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.07em' }}>Livello {level}</span>
              <span>{char.xp.toLocaleString('it-IT')}{nextXp ? ` / ${nextXp.toLocaleString('it-IT')}` : ''} XP</span>
            </div>
            <div style={{ height: 4, backgroundColor: 'var(--bg-card)', borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--border-leather)' }}>
              <div style={{ height: '100%', width: `${xpPct}%`, background: 'var(--gold)', borderRadius: 'var(--r-sm)' }} />
            </div>
            <XpControls characterId={char.id} />
            <LevelUpButton character={char as Character} canLevelUp={canLevelUp} />

            <Divider />

            {/* Personaggio attivo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s-1)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-2)' }}>Stato nel party</span>
              {char.campaignId && (
                <ActiveCharacterButton
                  characterId={char.id}
                  isActive={isActiveCharacter}
                  currentActiveName={currentActiveName}
                />
              )}
            </div>

            <Divider />

            {/* Identità */}
            <SectionTitle>Identità</SectionTitle>
            {[
              ['Bonus Competenza', `+${prof}`],
              ['Percezione Passiva', String(passPerc)],
              ...(sheet.speed ? [['Velocità', `${sheet.speed}m`]] : []),
            ].map(([l, v], idx, arr) => (
              <div key={l} style={{ ...IR, ...(idx === arr.length - 1 ? { borderBottom: 'none' } : {}) }}>
                <span style={{ color: 'var(--fg-2)', fontSize: '10px' }}>{l}</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', fontWeight: 600, color: 'var(--gold)' }}>{v}</span>
              </div>
            ))}

            <Divider />

            {/* Archetipi (se presenti) */}
            {classesWithSubclass.map(c => {
              const cls = CLASSES.find(cl => cl.key === c.classKey);
              return (
                <div key={c.classKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--s-1)', height: 32, border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', marginBottom: 4, cursor: 'default' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', letterSpacing: '.06em', color: 'var(--fg-2)' }}>
                    {cls?.name ?? c.classKey}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--gold)', textAlign: 'right', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.subclass}
                  </span>
                </div>
              );
            })}

            {/* Feature links — traducti e interattivi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <FeatureButton
                mode="class"
                label="Caratteristiche di Classe"
                count={null}
                characterClasses={sheet.classes ?? []}
                resources={resources}
                characterId={char.id}
                pinnedFeatures={pinnedAll}
              />
              {sheet.race && (
                <FeatureButton
                  mode="racial"
                  label="Tratti Razziali"
                  count={null}
                  characterId={char.id}
                  raceKey={sheet.race}
                  raceName={sheet.race}
                  subraceKey={sheet.subrace}
                  racialChoices={sheet.racialChoices ?? []}
                  pinnedFeatures={pinnedAll}
                />
              )}
              <FeatureButton
                mode="feats"
                label="Talenti"
                count={sheet.feats?.length ?? 0}
                characterId={char.id}
                currentFeats={sheet.feats ?? []}
                asiHistory={sheet.asiHistory ?? []}
                stats={stats}
                characterClasses={sheet.classes ?? []}
                pinnedFeatures={pinnedAll}
              />
            </div>

            <Divider />

            {/* Feature pinnate passive */}
            {pinnedPassive.length > 0 && (
              <>
                <Divider />
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 'var(--s-1)', marginBottom: 4 }}>
                  📌 Pinnate
                  <span style={{ flex: 1, height: '.5px', background: 'var(--border-leather-dim)' }} />
                </div>
                <PinnedPassiveSection features={pinnedPassive} />
              </>
            )}

            <Divider />

            {/* Player row — solo DM */}
            {isDm && <AssignPlayerButton characterId={char.id} currentUserId={char.userId ?? null} />}

            {isDm && <Divider />}

            {/* DM actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <AsiRetroactiveButton character={char as Character} />
            </div>
          </div>

        </div>
        {/* Fine sidebar ════════════════════════════════════════════════ */}

        {/* ════ Pannello destro: HpStrip + SheetTabBar ════ */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>

        {/* HP Strip — sempre visibile */}
        <HpStrip
          characterId={char.id}
          hpCurrent={char.hpCurrent}
          hpMax={char.hpMax}
          hpTemp={char.hpTemp}
          hpPct={hpPct}
          hpColor={hpColor}
          hitDie={hitDie}
          level={level}
          conditions={conditions}
          sheet={sheet}
        />

        {/* Tab navigation */}
        <SheetTabBar
          combat={
            <div style={{ padding: 'var(--s-2)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--s-2)', alignItems: 'start' }}>

              {/* Col A: Caratteristiche + Tiri Salvezza */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                <div style={CARD}>
                  <SectionTitle>Caratteristiche</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-1)' }}>
                    {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(key => {
                      const val = stats[key];
                      const mod = abilityModifier(val);
                      const isNeg = mod < 0;
                      const isZero = mod === 0;
                      return (
                        <div key={key} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1)', textAlign: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--fg-2)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{ABILITY_NAMES[key]}</span>
                          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 700, color: isNeg ? 'var(--danger)' : isZero ? 'var(--fg-2)' : 'var(--gold)', lineHeight: 1, display: 'block' }}>
                            {formatModifier(mod)}
                          </span>
                          <span style={{ display: 'inline-block', marginTop: 4, backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--fg-2)', padding: '1px var(--s-1)', minWidth: 24 }}>{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={CARD}>
                  <SectionTitle>Tiri Salvezza</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(key => {
                      const proficient = (savingThrows as Record<string, boolean>)[key] ?? false;
                      const bonus = abilityModifier(stats[key]) + (proficient ? prof : 0);
                      return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-1)' }}>
                            <div style={{ width: 8, height: 8, borderRadius: 'var(--r-sm)', border: `1.5px solid ${proficient ? 'var(--gold)' : 'var(--fg-3)'}`, backgroundColor: proficient ? 'var(--gold)' : 'transparent', flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', color: 'var(--fg-1)' }}>{ABILITY_NAMES[key]}</span>
                          </div>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: bonus > 0 ? 'var(--gold)' : bonus < 0 ? 'var(--danger)' : 'var(--fg-2)' }}>
                            {formatModifier(bonus)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Col B: Stats combattimento + Attacchi + Risorse pinnate attive */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
                <div style={CARD}>
                  <SectionTitle>Statistiche di Combattimento</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-1)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--s-1)' }}>
                      {[
                        ['C.A.', sheet.armorClass ?? (10 + abilityModifier(stats.dex))],
                        ['Iniziativa', formatModifier(abilityModifier(stats.dex) + (sheet.initiativeBonus ?? 0))],
                        ['Velocità', `${sheet.speed ?? 9}m`],
                      ].map(([l, v]) => (
                        <div key={String(l)} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1)', textAlign: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--fg-2)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{l}</span>
                          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, color: 'var(--fg-1)', display: 'block' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-1)' }}>
                      {[
                        ['Bonus Comp.', `+${prof}`],
                        ['Perc. Passiva', passPerc],
                        ...(spellDC !== null ? [['CD Incant.', spellDC], ['Att. Incant.', formatModifier(spellAtk!)]] : []),
                      ].map(([l, v]) => (
                        <div key={String(l)} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1)', textAlign: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.07em', color: 'var(--fg-2)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{l}</span>
                          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 600, color: 'var(--fg-1)', display: 'block' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={CARD}>
                  <SectionTitle>Attacchi</SectionTitle>
                  {(sheet.weapons?.length ?? 0) === 0 ? (
                    <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)' }}>
                      Nessuna arma — aggiungi equipaggiamento nella scheda
                    </p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          {['Arma', 'Car.', 'Danno', 'Acc.'].map(h => (
                            <th key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', letterSpacing: '.09em', color: 'var(--fg-2)', textAlign: 'left', paddingBottom: 'var(--s-1)', borderBottom: '1px solid var(--border-leather)', fontWeight: 400, textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(sheet.weapons ?? []).map(w => {
                          const atkMod = abilityModifier(stats[w.attackStat]) + prof + (w.magicBonus ?? 0);
                          const dmgMod = abilityModifier(stats[w.attackStat]) + (w.magicBonus ?? 0);
                          return (
                            <tr key={w.id}>
                              <td style={{ padding: '5px 0', borderBottom: '.5px solid var(--bg-elevated)', color: 'var(--fg-1)' }}>{w.name}{w.magic && w.magicBonus ? ` +${w.magicBonus}` : ''}</td>
                              <td style={{ padding: '5px 0', borderBottom: '.5px solid var(--bg-elevated)', color: 'var(--fg-2)', fontSize: '10px' }}>{w.attackStat.toUpperCase()}</td>
                              <td style={{ padding: '5px 0', borderBottom: '.5px solid var(--bg-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--gold)', fontSize: '11px', fontWeight: 500 }}>
                                {w.damageDice}{dmgMod !== 0 ? formatModifier(dmgMod) : ''}
                              </td>
                              <td style={{ padding: '5px 0', borderBottom: '.5px solid var(--bg-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--hp-healthy)', fontSize: '11px' }}>
                                {formatModifier(atkMod)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {pinnedActive.length > 0 && (
                  <PinnedActiveResources
                    characterId={char.id}
                    features={pinnedActive}
                    resources={resources}
                  />
                )}
              </div>

              {/* Col C: Abilità */}
              <div style={CARD}>
                <SectionTitle>Abilità</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 var(--s-1)' }}>
                  <div>
                    {leftAbilities.map((ability, abilityIdx) => {
                      const abilitySkills = SKILLS.filter(s => s.ability === ability);
                      if (!abilitySkills.length) return null;
                      return (
                        <div key={ability}>
                          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 2, paddingLeft: 'var(--s-2)', marginTop: abilityIdx === 0 ? 0 : 'var(--s-1)' }}>
                            {ABILITY_SHORT[ability]}
                          </div>
                          {abilitySkills.map(skill => {
                            const sk = skillMap[skill.key] ?? { proficient: false, expertise: false };
                            const bonus = skillBonus(stats[skill.ability], level, sk.proficient, sk.expertise);
                            return (
                              <div key={skill.key} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px var(--s-1)', borderRadius: 'var(--r-sm)' }}>
                                <div style={{ width: 6, height: 6, borderRadius: 'var(--r-sm)', border: `1.5px solid ${sk.expertise ? 'var(--arcane)' : sk.proficient ? 'var(--gold)' : 'var(--fg-3)'}`, backgroundColor: sk.proficient ? (sk.expertise ? 'var(--arcane)' : 'var(--gold)') : 'transparent', flexShrink: 0 }} />
                                <span style={{ flex: 1, color: 'var(--fg-2)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill.name}</span>
                                <span style={{ fontSize: '8px', color: 'var(--fg-3)', flexShrink: 0 }}>{ABILITY_SHORT[ability]}</span>
                                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, color: bonus > 0 ? 'var(--gold)' : bonus < 0 ? 'var(--danger)' : 'var(--fg-2)', minWidth: 22, textAlign: 'right', flexShrink: 0 }}>
                                  {formatModifier(bonus)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    {rightAbilities.map((ability, abilityIdx) => {
                      const abilitySkills = SKILLS.filter(s => s.ability === ability);
                      if (!abilitySkills.length) return null;
                      return (
                        <div key={ability}>
                          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 2, paddingLeft: 'var(--s-2)', marginTop: abilityIdx === 0 ? 0 : 'var(--s-1)' }}>
                            {ABILITY_SHORT[ability]}
                          </div>
                          {abilitySkills.map(skill => {
                            const sk = skillMap[skill.key] ?? { proficient: false, expertise: false };
                            const bonus = skillBonus(stats[skill.ability], level, sk.proficient, sk.expertise);
                            return (
                              <div key={skill.key} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px var(--s-1)', borderRadius: 'var(--r-sm)' }}>
                                <div style={{ width: 6, height: 6, borderRadius: 'var(--r-sm)', border: `1.5px solid ${sk.expertise ? 'var(--arcane)' : sk.proficient ? 'var(--gold)' : 'var(--fg-3)'}`, backgroundColor: sk.proficient ? (sk.expertise ? 'var(--arcane)' : 'var(--gold)') : 'transparent', flexShrink: 0 }} />
                                <span style={{ flex: 1, color: 'var(--fg-2)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill.name}</span>
                                <span style={{ fontSize: '8px', color: 'var(--fg-3)', flexShrink: 0 }}>{ABILITY_SHORT[ability]}</span>
                                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, color: bonus > 0 ? 'var(--gold)' : bonus < 0 ? 'var(--danger)' : 'var(--fg-2)', minWidth: 22, textAlign: 'right', flexShrink: 0 }}>
                                  {formatModifier(bonus)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          }
          equipment={
            <div style={{ padding: 'var(--s-2)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              <InventoryCard
                characterId={char.id}
                inventory={sheet.inventory ?? []}
                money={sheet.money ?? { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }}
              />
              <div style={CARD}>
                <SectionTitle>Capacità di Trasporto</SectionTitle>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--fg-2)', marginBottom: 'var(--s-1)' }}>
                  <span>Peso trasportato</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: carryOverloaded ? 'var(--danger)' : 'var(--fg-1)' }}>
                    {carriedKg.toFixed(1)} / {carryMax} kg
                  </span>
                </div>
                <div style={{ height: 4, backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${carryPct}%`, backgroundColor: carryOverloaded ? 'var(--danger)' : 'var(--gold)', borderRadius: 'var(--r-sm)', opacity: 0.7 }} />
                </div>
              </div>
              {sheet.money && (
                <div style={CARD}>
                  <SectionTitle>Denaro</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 'var(--s-1)', marginBottom: 'var(--s-1)' }}>
                    {([
                      ['PP', 'var(--fg-1)', sheet.money.pp],
                      ['PO', 'var(--gold)', sheet.money.gp],
                      ['PE', '#a0a0c8',    sheet.money.ep],
                      ['PA', '#a8a8a8',    sheet.money.sp],
                      ['PR', '#b06030',    sheet.money.cp],
                    ] as [string, string, number][]).map(([label, color, val]) => (
                      <div key={label} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-leather)', borderRadius: 'var(--r-sm)', padding: 'var(--s-1) 4px', textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '8px', fontWeight: 600, letterSpacing: '.08em', color, display: 'block', marginBottom: 2, textTransform: 'uppercase' }}>{label}</span>
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 600, color: 'var(--fg-1)', display: 'block' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-1)' }}>
                    <button style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em', height: 32, borderRadius: 'var(--r-sm)', border: '1px solid var(--border-leather)', background: 'var(--bg-card)', color: 'var(--fg-2)', cursor: 'pointer', transition: 'all .2s' }}>+ Aggiungi</button>
                    <button style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '.05em', height: 32, borderRadius: 'var(--r-sm)', border: '1px solid var(--border-leather)', background: 'var(--bg-card)', color: 'var(--fg-2)', cursor: 'pointer', transition: 'all .2s' }}>Assegna Denaro</button>
                  </div>
                </div>
              )}
              {sheet.dmNotes && isDm && (
                <div style={{ ...CARD, border: '1px solid var(--danger-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s-1)' }}>
                    <div style={{ width: 2, height: 14, backgroundColor: 'var(--danger)', opacity: 0.7, borderRadius: 'var(--r-sm)' }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fg-1)' }}>Note DM</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{sheet.dmNotes}</p>
                </div>
              )}
            </div>
          }
          spells={
            <div style={{ padding: 'var(--s-2)', opacity: canCast ? 1 : 0.55 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-1)' }}>
                <SectionTitle mb={false}>Incantesimi</SectionTitle>
                {canCast && (
                  <AddSpellButton
                    characterId={char.id}
                    currentSpells={knownSpells}
                    casterClassKeys={casterClassKeys}
                    characterClasses={sheet.classes ?? []}
                    characterStats={stats}
                  />
                )}
              </div>
              {!canCast && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--fg-2)', lineHeight: 1.6 }}>
                  Il tuo personaggio non possiede le capacità per lanciare incantesimi. Per iniziare a usare la magia, scegli una classe o un archetipo che conferisce questa capacità.
                </p>
              )}
              {knownSpells.length === 0 && activeSpellSlots.length === 0 && canCast && (
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--fg-3)', padding: '4px 0' }}>
                  Nessun incantesimo — usa + Aggiungi per iniziare.
                </p>
              )}
              <SpellSectionTabs
                knownSpells={knownSpells}
                activeSpellSlots={activeSpellSlots}
                isPreparedCaster={['cleric','druid','paladin','wizard'].some(k => casterClassKeys.includes(k))}
                schoolAbbr={SCHOOL_ABBR}
              />
            </div>
          }
          bio={
            <div style={{ padding: 'var(--s-2)' }}>
              <BackstoryCard
                characterId={char.id}
                charName={char.name}
                initialBackstory={sheet.backstory ?? ''}
                personality={sheet.personality}
                ideals={sheet.ideals}
                bonds={sheet.bonds}
                flaws={sheet.flaws}
                isOwner={!isDm}
              />
            </div>
          }
        />

        </div>
        {/* Fine pannello destro ════════════════════════════════════ */}

      </div>
    </div>
    {/* ── MOBILE (< 768px) ─────────────────────────────────── */}
    <div className="mobile-layout">
      <MobileSheet
        characterId={char.id}
        charName={char.name}
        classLabel={classLabel}
        hpCurrent={char.hpCurrent}
        hpMax={char.hpMax}
        hpTemp={char.hpTemp}
        hpPct={hpPct}
        hpColor={hpColor}
        level={level}
        xp={char.xp}
        xpPct={xpPct}
        canLevelUp={canLevelUp}
        prof={prof}
        hitDie={hitDie}
        passPerc={passPerc}
        spellDC={spellDC}
        spellAtk={spellAtk}
        carriedKg={carriedKg}
        carryMax={carryMax}
        carryPct={carryPct}
        carryOverloaded={carryOverloaded}
        canCast={canCast}
        sheet={sheet}
        conditions={conditions}
        resources={resources}
        knownSpells={knownSpells}
        activeSpellSlots={activeSpellSlots}
        pinnedPassive={pinnedPassive}
        pinnedActive={pinnedActive}
        casterClassKeys={casterClassKeys}
        isDm={isDm}
        isActiveCharacter={isActiveCharacter}
      />
    </div>
    </>
  );
}
