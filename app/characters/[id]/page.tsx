import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { auth } from '@/auth';
import {
  characters, characterConditions, characterSpellSlots, characterResources,
  campaigns, type CharacterSheet,
} from '@/lib/db/schema';
import {
  abilityModifier, proficiencyBonus, skillBonus,
  passivePerception, spellSaveDC, spellAttackBonus,
  totalCarriedWeight, carryStatus, initiative, formatModifier, hpPercentage,
} from '@/lib/rules/calculations';
import { SKILLS, ABILITY_SHORT, ABILITY_NAMES, type Ability } from '@/lib/srd/skills';
import { CONDITIONS } from '@/lib/srd/conditions';
import { CLASSES } from '@/lib/srd/classes';
import { XP_THRESHOLDS, getXpForNextLevel } from '@/lib/srd/constants';

import HpControls from '@/components/dashboard/HpControls';
import ConditionBadge from '@/components/dashboard/ConditionBadge';
import AddConditionButton from '@/components/dashboard/AddConditionButton';
import SheetRestButtons from '@/components/character/sheet/SheetRestButtons';
import LevelUpButton from '@/components/character/sheet/LevelUpButton';
import SetupButton from '@/components/character/sheet/SetupButton';
import AsiRetroactiveButton from '@/components/character/sheet/AsiRetroactiveButton';
import AssignPlayerButton from '@/components/character/sheet/AssignPlayerButton';
import type { Character } from '@/lib/db/schema';
import XpControls from '@/components/dashboard/XpControls';
import DeathSavesTracker from '@/components/character/sheet/DeathSavesTracker';

export const dynamic = 'force-dynamic';

type Params = { id: string };

export default async function CharacterPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const session = await auth();
  const isDm = session?.user?.email === process.env.NEXT_PUBLIC_DM_EMAIL;
  const db = getDb();

  const [char] = await db.select().from(characters).where(eq(characters.id, id));
  if (!char) notFound();

  // Campagna di appartenenza (per breadcrumb)
  const campaign = char.campaignId
    ? (await db.select().from(campaigns).where(eq(campaigns.id, char.campaignId)))[0]
    : null;

  const [conditions, spellSlots, resources] = await Promise.all([
    db.select().from(characterConditions).where(eq(characterConditions.characterId, id)),
    db.select().from(characterSpellSlots).where(eq(characterSpellSlots.characterId, id)),
    db.select().from(characterResources).where(eq(characterResources.characterId, id)),
  ]);

  const sheet = char.sheet as CharacterSheet;
  const level = char.level;
  const prof = proficiencyBonus(level);
  const stats = sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const savingThrows = sheet.savingThrowProficiencies ?? { str: false, dex: false, con: false, int: false, wis: false, cha: false };
  const skillMap = sheet.skills ?? {};
  const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);

  const hpPct = hpPercentage(char.hpCurrent, char.hpMax);
  const hpBarColor = hpPct > 60 ? '#4a7c4e' : hpPct > 30 ? '#8a7a2a' : '#7a2a2a';

  const perceptionSkill = skillMap['perception'];
  const passPerc = passivePerception(
    stats.wis, level,
    perceptionSkill?.proficient ?? false,
    perceptionSkill?.expertise ?? false,
  );

  const castingAbility = cls?.spellcastingAbility as Ability | undefined;
  const castingScore = castingAbility ? stats[castingAbility] : 0;
  const spellDC = castingAbility ? spellSaveDC(castingScore, level) : null;
  const spellAtk = castingAbility ? spellAttackBonus(castingScore, level) : null;

  const carriedKg = totalCarriedWeight(sheet.inventory ?? []);
  const carryMax = Math.floor(stats.str * 7.5);
  const carryStatus_ = carryStatus(stats.str, carriedKg);

  const nextXp = getXpForNextLevel(level);
  const currentLevelXp = XP_THRESHOLDS[level] ?? 0;
  const xpPct = nextXp
    ? Math.min(100, Math.round(((char.xp - currentLevelXp) / (nextXp - currentLevelXp)) * 100))
    : 100;
  const canLevelUp = nextXp !== null && char.xp >= nextXp;

  const classLabel = sheet.classes?.map(c => {
    const found = CLASSES.find(cl => cl.key === c.classKey);
    return `${found?.name ?? c.classKey} ${c.level}`;
  }).join(' / ') ?? '';

  const hitDie = cls?.hitDie ?? 8;

  // ─── UI helpers ────────────────────────────────────────────────────────────

  const sectionTitle = (text: string) => (
    <h3 className="mb-3 pb-1" style={{ borderBottom: '1px solid #5a4020' }}>{text}</h3>
  );

  const statBox = (key: Ability) => {
    const val = stats[key];
    const mod = abilityModifier(val);
    return (
      <div key={key} className="text-center p-3 border" style={{ borderColor: '#5a4020', backgroundColor: '#2a2018' }}>
        <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em' }}>
          {ABILITY_SHORT[key]}
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#e8d5a3', lineHeight: 1.1 }}>{val}</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: mod >= 0 ? '#c8922a' : '#8b2020' }}>
          {formatModifier(mod)}
        </div>
        <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Crimson Text, serif', marginTop: '2px' }}>
          {ABILITY_NAMES[key]}
        </div>
      </div>
    );
  };

  const combatStat = (label: string, value: string | number) => (
    <div className="text-center p-3 border" style={{ borderColor: '#5a4020', backgroundColor: '#2a2018' }}>
      <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', marginBottom: '4px' }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', color: '#e8d5a3', lineHeight: 1 }}>{value}</div>
    </div>
  );

  const savingThrowRow = (key: Ability) => {
    const proficient = (savingThrows as Record<string, boolean>)[key] ?? false;
    const bonus = abilityModifier(stats[key]) + (proficient ? prof : 0);
    return (
      <div key={key} className="flex items-center justify-between py-1"
        style={{ borderBottom: '1px solid #2a2018', fontSize: '0.9rem' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: proficient ? '#c8922a' : '#3a3020', fontSize: '0.7rem' }}>
            {proficient ? '◆' : '◇'}
          </span>
          <span style={{ color: '#e8d5a3', fontFamily: 'Crimson Text, serif' }}>{ABILITY_NAMES[key]}</span>
        </div>
        <span style={{ fontFamily: 'Cinzel, serif', color: bonus >= 0 ? '#c8922a' : '#8b2020', fontSize: '0.9rem' }}>
          {formatModifier(bonus)}
        </span>
      </div>
    );
  };

  const skillRow = (skill: typeof SKILLS[number]) => {
    const sk = skillMap[skill.key] ?? { proficient: false, expertise: false };
    const bonus = skillBonus(stats[skill.ability], level, sk.proficient, sk.expertise);
    return (
      <div key={skill.key} className="flex items-center justify-between py-0.5"
        style={{ borderBottom: '1px solid #221c14', fontSize: '0.85rem' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: sk.expertise ? '#c8922a' : sk.proficient ? '#8a6010' : '#3a3020', fontSize: '0.65rem' }}>
            {sk.expertise ? '◆◆' : sk.proficient ? '◆' : '◇'}
          </span>
          <span style={{ color: '#e8d5a3', fontFamily: 'Crimson Text, serif' }}>{skill.name}</span>
          <span style={{ color: '#5a4020', fontSize: '0.7rem' }}>({ABILITY_SHORT[skill.ability]})</span>
        </div>
        <span style={{ fontFamily: 'Cinzel, serif', color: bonus >= 0 ? '#c8922a' : '#8b2020', minWidth: '28px', textAlign: 'right' }}>
          {formatModifier(bonus)}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Breadcrumb ── */}
      {campaign && (
        <div className="mb-4" style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.06em' }}>
          <a href="/campaigns" style={{ color: '#5a4020', textDecoration: 'none' }}>Campagne</a>
          {' / '}
          <a href={`/campaigns/${campaign.id}`} style={{ color: '#5a4020', textDecoration: 'none' }}>{campaign.name}</a>
          {' / '}
          <span style={{ color: '#a08060' }}>{char.name}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border"
        style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>

        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {sheet.portraitUrl ? (
            <img src={sheet.portraitUrl} alt={char.name}
              className="w-24 h-24 object-cover"
              style={{ border: '2px solid #5a4020' }} />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center"
              style={{ border: '2px solid #5a4020', backgroundColor: '#2a2018' }}>
              <span style={{ color: '#5a4020', fontSize: '2.5rem' }}>⚔</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 style={{ marginBottom: '2px' }}>{char.name}</h1>
              <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '1rem' }}>
                {sheet.race && `${sheet.race} · `}{classLabel}
                {sheet.background && ` · ${sheet.background}`}
              </div>
              {sheet.alignment && (
                <div style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>{sheet.alignment}</div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {isDm && <AssignPlayerButton characterId={char.id} currentUserId={char.userId ?? null} />}
              <AsiRetroactiveButton character={char as Character} />
              <LevelUpButton character={char as Character} canLevelUp={canLevelUp} />
              <SheetRestButtons characterId={char.id} />
              <SetupButton character={char as Character} />
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1" style={{ color: '#a08060' }}>
              <span style={{ fontFamily: 'Cinzel, serif' }}>Livello {level}</span>
              <span>{char.xp.toLocaleString('it-IT')} XP {nextXp && `/ ${nextXp.toLocaleString('it-IT')}`}</span>
            </div>
            <div className="w-full h-1.5 border" style={{ borderColor: '#5a4020', backgroundColor: '#1a1410' }}>
              <div className="h-full" style={{ width: `${xpPct}%`, backgroundColor: '#c8922a' }} />
            </div>
            <div className="mt-2"><XpControls characterId={char.id} /></div>
          </div>
        </div>
      </div>

      {/* ── HP + Combat Stats ── */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">

        {/* HP */}
        <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Punti Ferita')}
          <div className="flex justify-between items-baseline mb-1">
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '2.5rem', color: '#c8922a', lineHeight: 1 }}>
              {char.hpCurrent}
            </span>
            <span style={{ color: '#a08060', fontFamily: 'Crimson Text, serif' }}>
              / {char.hpMax} max
              {char.hpTemp > 0 && <span style={{ color: '#c8922a' }}> (+{char.hpTemp} temp)</span>}
            </span>
          </div>
          <div className="w-full h-4 border mb-3" style={{ borderColor: '#5a4020', backgroundColor: '#1a1410' }}>
            <div className="h-full" style={{ width: `${hpPct}%`, backgroundColor: hpBarColor, transition: 'width 0.3s' }} />
          </div>
          <HpControls characterId={char.id} hpCurrent={char.hpCurrent} hpMax={char.hpMax} />

          {/* Dado vita */}
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #3a3020' }}>
            <div className="flex items-center gap-2">
              <span style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em' }}>DADO VITA</span>
              <span style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3' }}>d{hitDie} × {level}</span>
            </div>
          </div>

          {/* Death saves — visibili solo a 0 HP */}
          {char.hpCurrent === 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #8b2020' }}>
              <DeathSavesTracker characterId={char.id} sheet={sheet} />
            </div>
          )}
        </div>

        {/* Combat stats */}
        <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Statistiche di Combattimento')}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {combatStat('CA', sheet.armorClass ?? (10 + abilityModifier(stats.dex)))}
            {combatStat('Iniziativa', formatModifier(initiative(sheet)))}
            {combatStat('Velocità', `${sheet.speed ?? cls?.key === 'monk' ? 9 : 9}m`)}
            {combatStat('Bonus Comp.', formatModifier(prof))}
            {combatStat('Perc. Passiva', passPerc)}
            {combatStat('Ispirazione', sheet.dmNotes ? '·' : '—')}
          </div>

          {/* Bonus attacco base */}
          <div className="text-sm" style={{ borderTop: '1px solid #3a3020', paddingTop: '8px' }}>
            <div className="flex justify-between">
              <span style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em' }}>ATK MISCHIA</span>
              <span style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3' }}>
                {formatModifier(abilityModifier(stats.str) + prof)}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em' }}>ATK A DISTANZA</span>
              <span style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3' }}>
                {formatModifier(abilityModifier(stats.dex) + prof)}
              </span>
            </div>
          </div>

          {/* Incantesimi */}
          {spellDC !== null && (
            <div className="mt-3 pt-3 text-sm" style={{ borderTop: '1px solid #3a3020' }}>
              <div className="flex justify-between">
                <span style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em' }}>CD INCANTESIMI</span>
                <span style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3' }}>{spellDC}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em' }}>ATK INCANTESIMI</span>
                <span style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3' }}>{formatModifier(spellAtk!)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Condizioni ── */}
      <div className="p-4 border mb-4" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
        {sectionTitle('Condizioni Attive')}
        <div className="flex flex-wrap gap-2 items-center min-h-8">
          {conditions.length === 0 && (
            <span style={{ color: '#5a4020', fontFamily: 'Crimson Text, serif', fontStyle: 'italic', fontSize: '0.9rem' }}>Nessuna condizione</span>
          )}
          {conditions.map(c => {
            const def = CONDITIONS.find(d => d.key === c.conditionKey);
            return def ? (
              <ConditionBadge key={c.id} conditionId={c.id} characterId={char.id} name={def.name} icon={def.icon} />
            ) : null;
          })}
          <AddConditionButton characterId={char.id} />
        </div>
      </div>

      {/* ── Caratteristiche + TS + Abilità ── */}
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">

        {/* Caratteristiche */}
        <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Caratteristiche')}
          <div className="grid grid-cols-3 gap-2 md:grid-cols-2">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(statBox)}
          </div>
        </div>

        {/* Tiri Salvezza */}
        <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Tiri Salvezza')}
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(savingThrowRow)}
        </div>

        {/* Abilità */}
        <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Abilità')}
          <div className="max-h-80 overflow-y-auto">
            {SKILLS.map(skillRow)}
          </div>
        </div>
      </div>

      {/* ── Slot incantesimo ── */}
      {spellSlots.length > 0 && (
        <div className="p-4 border mb-4" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Slot Incantesimo')}
          <div className="flex flex-wrap gap-3">
            {spellSlots.sort((a, b) => a.slotLevel - b.slotLevel).map(slot => {
              const available = slot.total - slot.used;
              return (
                <div key={slot.slotLevel} className="text-center p-2 border"
                  style={{ borderColor: '#5a4020', backgroundColor: '#2a2018', minWidth: '64px' }}>
                  <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
                    LV {slot.slotLevel}
                  </div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.3rem', color: available > 0 ? '#e8d5a3' : '#3a3020' }}>
                    {available}/{slot.total}
                  </div>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {Array.from({ length: slot.total }, (_, i) => (
                      <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: i < available ? '#c8922a' : '#3a3020',
                        border: '1px solid #5a4020',
                      }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Ricchezza + Inventario + Capacità ── */}
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">

        {/* Denaro */}
        <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Denaro')}
          <div className="grid grid-cols-5 gap-1 text-center">
            {(['pp', 'gp', 'ep', 'sp', 'cp'] as const).map(coin => {
              const val = sheet.money?.[coin] ?? 0;
              const colors: Record<string, string> = { pp: '#e8d5a3', gp: '#c8922a', ep: '#a0a0c0', sp: '#a0a0a0', cp: '#a06030' };
              return (
                <div key={coin} className="p-2 border" style={{ borderColor: '#5a4020', backgroundColor: '#2a2018' }}>
                  <div style={{ fontSize: '0.6rem', color: colors[coin], fontFamily: 'Cinzel, serif', letterSpacing: '0.04em' }}>{coin.toUpperCase()}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: '#e8d5a3' }}>{val}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacità di trasporto */}
        <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Capacità di Trasporto')}
          <div className="flex justify-between text-sm mb-2" style={{ color: '#a08060' }}>
            <span>Peso trasportato</span>
            <span style={{ color: '#e8d5a3', fontFamily: 'Cinzel, serif' }}>
              {carriedKg.toFixed(1)} / {carryMax} kg
            </span>
          </div>
          <div className="w-full h-3 border" style={{ borderColor: '#5a4020', backgroundColor: '#1a1410' }}>
            <div className="h-full" style={{
              width: `${Math.min(100, (carriedKg / carryMax) * 100)}%`,
              backgroundColor: carryStatus_ === 'normal' ? '#4a7c4e' : carryStatus_ === 'encumbered' ? '#8a7a2a' : '#8b2020',
              transition: 'width 0.3s',
            }} />
          </div>
          {carryStatus_ !== 'normal' && (
            <div className="text-xs mt-1" style={{ color: '#8b2020', fontFamily: 'Crimson Text, serif' }}>
              {carryStatus_ === 'encumbered' ? 'Sovraccarico — Velocità -3m' : 'Gravemente sovraccarico — Velocità -6m, svantaggio'}
            </div>
          )}
        </div>
      </div>

      {/* ── Inventario ── */}
      {(sheet.inventory?.length ?? 0) > 0 && (
        <div className="p-4 border mb-4" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Inventario')}
          <div className="space-y-1">
            {sheet.inventory!.map(item => (
              <div key={item.id} className="flex justify-between text-sm py-1"
                style={{ borderBottom: '1px solid #2a2018' }}>
                <div>
                  <span style={{ color: '#e8d5a3', fontFamily: 'Crimson Text, serif' }}>{item.name}</span>
                  {item.quantity > 1 && <span style={{ color: '#a08060' }}> ×{item.quantity}</span>}
                  {item.notes && <span style={{ color: '#5a4020', marginLeft: '8px', fontStyle: 'italic' }}>{item.notes}</span>}
                </div>
                <span style={{ color: '#a08060', fontFamily: 'Crimson Text, serif' }}>
                  {(item.weight * item.quantity).toFixed(1)} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Storico ASI e Talenti ── */}
      {((sheet.asiHistory?.length ?? 0) > 0 || (sheet.feats?.length ?? 0) > 0) && (
        <div className="p-4 border mb-4" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Aumenti di Caratteristica & Talenti')}
          <div className="space-y-2">
            {sheet.asiHistory?.sort((a, b) => a.level - b.level).map((entry, i) => {
              const STAT_SHORT: Record<string, string> = { str: 'FOR', dex: 'DES', con: 'COS', int: 'INT', wis: 'SAG', cha: 'CAR' };
              const desc = entry.type === 'single' && entry.statA
                ? `+2 ${STAT_SHORT[entry.statA] ?? entry.statA}`
                : entry.type === 'split' && entry.statA && entry.statB
                ? `+1 ${STAT_SHORT[entry.statA] ?? entry.statA} / +1 ${STAT_SHORT[entry.statB] ?? entry.statB}`
                : entry.type === 'feat'
                ? `Talento: ${entry.featName ?? '—'}`
                : '—';
              return (
                <div key={i} className="flex justify-between items-center py-1"
                  style={{ borderBottom: '1px solid #2a2018' }}>
                  <span style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                    LV {entry.level} · {entry.classKey}
                  </span>
                  <span style={{ color: entry.type === 'feat' ? '#c8922a' : '#e8d5a3', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem' }}>
                    {desc}
                  </span>
                </div>
              );
            })}
            {sheet.feats?.map(feat => (
              <div key={feat.key} className="p-2 mt-2" style={{ border: '1px solid #5a4020', backgroundColor: '#1e1810' }}>
                <div className="flex justify-between">
                  <span style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '0.85rem' }}>⚑ {feat.name}</span>
                  <span style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem' }}>Lv {feat.level}</span>
                </div>
                {feat.description && (
                  <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.8rem', fontStyle: 'italic', marginTop: 4 }}>
                    {feat.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Background narrativo ── */}
      {(sheet.backstory || sheet.personality || sheet.ideals || sheet.bonds || sheet.flaws) && (
        <div className="p-4 border mb-4" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          {sectionTitle('Narrativa')}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {sheet.personality && (
              <div>
                <div style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: '4px' }}>TRATTO</div>
                <p style={{ color: '#e8d5a3', fontFamily: 'IM Fell English, serif', fontStyle: 'italic' }}>{sheet.personality}</p>
              </div>
            )}
            {sheet.ideals && (
              <div>
                <div style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: '4px' }}>IDEALE</div>
                <p style={{ color: '#e8d5a3', fontFamily: 'IM Fell English, serif', fontStyle: 'italic' }}>{sheet.ideals}</p>
              </div>
            )}
            {sheet.bonds && (
              <div>
                <div style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: '4px' }}>LEGAME</div>
                <p style={{ color: '#e8d5a3', fontFamily: 'IM Fell English, serif', fontStyle: 'italic' }}>{sheet.bonds}</p>
              </div>
            )}
            {sheet.flaws && (
              <div>
                <div style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: '4px' }}>DIFETTO</div>
                <p style={{ color: '#e8d5a3', fontFamily: 'IM Fell English, serif', fontStyle: 'italic' }}>{sheet.flaws}</p>
              </div>
            )}
            {sheet.backstory && (
              <div className="md:col-span-2">
                <div style={{ color: '#a08060', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: '4px' }}>STORIA</div>
                <p style={{ color: '#e8d5a3', fontFamily: 'IM Fell English, serif', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{sheet.backstory}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Note DM ── */}
      {sheet.dmNotes && (
        <div className="p-4 border mb-4" style={{ borderColor: '#8b2020', backgroundColor: '#1a0a0a' }}>
          {sectionTitle('Note DM (private)')}
          <p style={{ color: '#e8d5a3', fontFamily: 'IM Fell English, serif', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
            {sheet.dmNotes}
          </p>
        </div>
      )}

    </div>
  );
}
