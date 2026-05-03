import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { characters, characterConditions, characterSpellSlots, type CharacterSheet } from '@/lib/db/schema';
import { CLASSES } from '@/lib/srd/classes';
import { SKILLS, ABILITY_SHORT, ABILITY_NAMES, type Ability } from '@/lib/srd/skills';
import { CONDITIONS } from '@/lib/srd/conditions';
import { abilityModifier, proficiencyBonus, skillBonus, passivePerception, spellSaveDC, spellAttackBonus, formatModifier } from '@/lib/rules/calculations';

export const dynamic = 'force-dynamic';

export default async function MyCharacterPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/sign-in');
  const userEmail = session.user.email;

  const db = getDb();
  const [char] = await db.select().from(characters).where(eq(characters.userId, userEmail));

  if (!char) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1.5rem', marginBottom: 12 }}>
          Nessun personaggio assegnato
        </div>
        <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '1rem', fontStyle: 'italic' }}>
          Chiedi al tuo DM di assegnare la tua scheda personaggio.
        </p>
      </div>
    );
  }

  const sheet = char.sheet as CharacterSheet;
  const level = char.level;
  const prof = proficiencyBonus(level);
  const stats = sheet.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const savingThrows = sheet.savingThrowProficiencies ?? { str: false, dex: false, con: false, int: false, wis: false, cha: false };
  const skillMap = sheet.skills ?? {};
  const cls = CLASSES.find(c => c.key === sheet.classes?.[0]?.classKey);

  const [conditions, spellSlots] = await Promise.all([
    db.select().from(characterConditions).where(eq(characterConditions.characterId, char.id)),
    db.select().from(characterSpellSlots).where(eq(characterSpellSlots.characterId, char.id)),
  ]);

  const castingAbility = cls?.spellcastingAbility as Ability | undefined;
  const castingScore = castingAbility ? stats[castingAbility] : 0;
  const spellDC = castingAbility ? spellSaveDC(castingScore, level) : null;
  const spellAtk = castingAbility ? spellAttackBonus(castingScore, level) : null;

  const classLabel = sheet.classes?.map(c => {
    const found = CLASSES.find(cl => cl.key === c.classKey);
    return `${found?.name ?? c.classKey} ${c.level}`;
  }).join(' / ') ?? '';

  const hpPct = char.hpMax > 0 ? Math.round((char.hpCurrent / char.hpMax) * 100) : 0;
  const hpBarColor = hpPct > 60 ? '#4a7c4e' : hpPct > 30 ? '#8a7a2a' : '#7a2a2a';

  const statBox = (key: Ability) => {
    const val = stats[key];
    const mod = abilityModifier(val);
    return (
      <div key={key} className="text-center p-3 border" style={{ borderColor: '#5a4020', backgroundColor: '#2a2018' }}>
        <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em' }}>{ABILITY_SHORT[key]}</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: '#e8d5a3', lineHeight: 1.1 }}>{val}</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: mod >= 0 ? '#c8922a' : '#8b2020' }}>{formatModifier(mod)}</div>
        <div style={{ fontSize: '0.65rem', color: '#6a5040', fontFamily: 'Cinzel, serif' }}>{ABILITY_NAMES[key]}</div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="p-4 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
        <div style={{ fontFamily: 'Cinzel Decorative, serif', color: '#c8922a', fontSize: '1.8rem' }}>{char.name}</div>
        <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '1rem', fontStyle: 'italic' }}>
          {sheet.race}{sheet.subrace ? ` (${sheet.subrace})` : ''}{classLabel ? ` · ${classLabel}` : ''}{sheet.background ? ` · ${sheet.background}` : ''}
        </div>
        {sheet.alignment && (
          <div style={{ color: '#6a5040', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', marginTop: 4 }}>{sheet.alignment}</div>
        )}
      </div>

      {/* HP + CA + Speed */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 border text-center" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', marginBottom: 4 }}>PUNTI FERITA</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', color: hpBarColor }}>
            {char.hpCurrent}<span style={{ fontSize: '1rem', color: '#6a5040' }}>/{char.hpMax}</span>
          </div>
          {char.hpTemp > 0 && (
            <div style={{ fontSize: '0.75rem', color: '#6a8c6e', fontFamily: 'Cinzel, serif' }}>+{char.hpTemp} temp</div>
          )}
          <div style={{ height: 4, backgroundColor: '#3a2010', marginTop: 6, borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${hpPct}%`, backgroundColor: hpBarColor, borderRadius: 2, transition: 'width 0.3s' }} />
          </div>
        </div>
        <div className="p-4 border text-center" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', marginBottom: 4 }}>CLASSE ARMATURA</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', color: '#e8d5a3' }}>{sheet.armorClass ?? '—'}</div>
        </div>
        <div className="p-4 border text-center" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', marginBottom: 4 }}>VELOCITÀ</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', color: '#e8d5a3' }}>{sheet.speed ?? '—'}<span style={{ fontSize: '0.8rem', color: '#6a5040' }}> m</span></div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="mb-3 pb-1" style={{ borderBottom: '1px solid #5a4020' }}>Caratteristiche</h3>
        <div className="grid grid-cols-6 gap-2">
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(statBox)}
        </div>
      </div>

      {/* Saving throws + Combat */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', marginBottom: 8 }}>TIRI SALVEZZA</div>
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(ab => {
            const isProficient = savingThrows[ab];
            const mod = abilityModifier(stats[ab]) + (isProficient ? prof : 0);
            return (
              <div key={ab} className="flex items-center gap-2 mb-1">
                <span style={{ color: isProficient ? '#c8922a' : '#5a4020', fontSize: '0.7rem' }}>{isProficient ? '●' : '○'}</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.75rem', color: '#e8d5a3', flex: 1 }}>{ABILITY_NAMES[ab]}</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.85rem', color: mod >= 0 ? '#c8922a' : '#8b2020' }}>{formatModifier(mod)}</span>
              </div>
            );
          })}
        </div>
        <div className="p-3 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
          <div style={{ fontSize: '0.6rem', color: '#a08060', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em', marginBottom: 8 }}>COMBATTIMENTO</div>
          {[
            ['Bonus competenza', `+${prof}`],
            ['Percezione passiva', String(passivePerception(stats.wis, level, skillMap['perception']?.proficient ?? false, skillMap['perception']?.expertise ?? false))],
            ['Iniziativa', formatModifier(abilityModifier(stats.dex))],
            ...(spellDC ? [['CD Incantesimi', String(spellDC)], ['Attacco Incantesimi', formatModifier(spellAtk ?? 0)]] : []),
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between mb-1">
              <span style={{ fontFamily: 'Crimson Text, serif', color: '#a08060', fontSize: '0.85rem' }}>{label}</span>
              <span style={{ fontFamily: 'Cinzel, serif', color: '#e8d5a3', fontSize: '0.85rem' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="mb-3 pb-1" style={{ borderBottom: '1px solid #5a4020' }}>Abilità</h3>
        <div className="grid grid-cols-2 gap-1">
          {SKILLS.map(skill => {
            const entry = skillMap[skill.key];
            const isProficient = entry?.proficient ?? false;
            const isExpert = entry?.expertise ?? false;
            const bonus = skillBonus(stats[skill.ability], level, isProficient, isExpert);
            return (
              <div key={skill.key} className="flex items-center gap-2 px-2 py-1" style={{ backgroundColor: '#1e1810' }}>
                <span style={{ fontSize: '0.65rem', color: isExpert ? '#c8922a' : isProficient ? '#c8922a' : '#5a4020' }}>
                  {isExpert ? '◆' : isProficient ? '●' : '○'}
                </span>
                <span style={{ fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', color: '#a08060', flex: 1 }}>{skill.name}</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.8rem', color: bonus >= 0 ? '#c8922a' : '#8b2020' }}>{formatModifier(bonus)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Condizioni */}
      {conditions.length > 0 && (
        <div>
          <h3 className="mb-3 pb-1" style={{ borderBottom: '1px solid #5a4020' }}>Condizioni attive</h3>
          <div className="flex flex-wrap gap-2">
            {conditions.map(c => {
              const cond = CONDITIONS.find(x => x.key === c.conditionKey);
              return (
                <span key={c.id} style={{ border: '1px solid #8b2020', color: '#8b2020', fontFamily: 'Cinzel, serif', fontSize: '0.7rem', padding: '3px 8px' }}>
                  {cond?.name ?? c.conditionKey}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Slot incantesimo */}
      {spellSlots.length > 0 && (
        <div>
          <h3 className="mb-3 pb-1" style={{ borderBottom: '1px solid #5a4020' }}>Slot Incantesimo</h3>
          <div className="flex flex-wrap gap-3">
            {spellSlots.filter(s => s.total > 0).map(s => (
              <div key={s.slotLevel} className="text-center p-2 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14', minWidth: 60 }}>
                <div style={{ fontSize: '0.55rem', color: '#a08060', fontFamily: 'Cinzel, serif' }}>LIV {s.slotLevel}</div>
                <div className="flex gap-1 justify-center mt-1">
                  {Array.from({ length: s.total }).map((_, i) => (
                    <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: i < (s.total - s.used) ? '#c8922a' : '#3a3020', display: 'inline-block', border: '1px solid #5a4020' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incantesimi noti */}
      {(sheet.knownSpells?.length ?? 0) > 0 && (
        <div>
          <h3 className="mb-3 pb-1" style={{ borderBottom: '1px solid #5a4020' }}>Incantesimi</h3>
          <div className="space-y-1">
            {sheet.knownSpells!.map(sp => (
              <div key={sp.name} className="flex items-center gap-3 px-2 py-1" style={{ backgroundColor: '#1e1810' }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.6rem', color: '#5a4020', minWidth: 50 }}>
                  {sp.level === 0 ? 'Trucco' : `Liv. ${sp.level}`}
                </span>
                <span style={{ fontFamily: 'Crimson Text, serif', color: '#e8d5a3', fontSize: '0.9rem' }}>{sp.name}</span>
                {sp.prepared && <span style={{ fontSize: '0.6rem', color: '#c8922a', fontFamily: 'Cinzel, serif' }}>✦ preparato</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventario */}
      {(sheet.inventory?.length ?? 0) > 0 && (
        <div>
          <h3 className="mb-3 pb-1" style={{ borderBottom: '1px solid #5a4020' }}>Inventario</h3>
          <div className="space-y-1">
            {sheet.inventory!.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-2 py-1" style={{ backgroundColor: '#1e1810' }}>
                <span style={{ fontFamily: 'Crimson Text, serif', color: '#e8d5a3', fontSize: '0.9rem' }}>
                  {item.quantity > 1 && <span style={{ color: '#6a5040' }}>{item.quantity}× </span>}
                  {item.name}
                </span>
                {item.weight && <span style={{ color: '#6a5040', fontSize: '0.8rem' }}>{item.weight * item.quantity} kg</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Background narrativo */}
      {(sheet.backstory || sheet.personality || sheet.ideals || sheet.bonds || sheet.flaws) && (
        <div>
          <h3 className="mb-3 pb-1" style={{ borderBottom: '1px solid #5a4020' }}>Background</h3>
          <div className="space-y-3">
            {[
              { label: 'Storia', val: sheet.backstory },
              { label: 'Personalità', val: sheet.personality },
              { label: 'Ideali', val: sheet.ideals },
              { label: 'Legami', val: sheet.bonds },
              { label: 'Difetti', val: sheet.flaws },
            ].filter(x => x.val).map(({ label, val }) => (
              <div key={label}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.65rem', color: '#6a5040', letterSpacing: '0.06em', marginBottom: 4 }}>{label.toUpperCase()}</div>
                <p style={{ fontFamily: 'Crimson Text, serif', color: '#a08060', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6 }}>{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
