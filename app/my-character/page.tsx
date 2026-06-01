import { requireAuth } from '@/lib/auth-helpers';
import { getMemberships } from '@/lib/db/userActions';
import { getDb } from '@/lib/db/client';
import { characters, characterConditions, characterSpellSlots, campaigns, type CharacterSheet } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { CLASSES } from '@/lib/srd/classes';
import { SKILLS, ABILITY_SHORT, ABILITY_NAMES, type Ability } from '@/lib/srd/skills';
import { CONDITIONS } from '@/lib/srd/conditions';
import { abilityModifier, proficiencyBonus, skillBonus, passivePerception, spellSaveDC, spellAttackBonus, formatModifier } from '@/lib/rules/calculations';

export const dynamic = 'force-dynamic';

export default async function MyCharacterPage() {
  const user = await requireAuth();
  const db = getDb();
  const memberships = await getMemberships(user.id);

  if (memberships.length === 0) {
    return (
      <CenteredCard>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Giocatore</div>
        <h2 style={{ marginBottom: 16 }}>Nessuna campagna</h2>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontStyle: 'italic', lineHeight: 1.7 }}>
          Chiedi al tuo DM il link di invito per unirti a una campagna.
        </p>
      </CenteredCard>
    );
  }

  if (memberships.length > 1) redirect('/my-characters');

  const membership = memberships[0];
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, membership.campaignId));

  if (!membership.activeCharacterId) {
    const myChars = await db.select().from(characters)
      .where(and(eq(characters.userId, user.id), eq(characters.campaignId, membership.campaignId)));

    return (
      <CenteredCard>
        <div className="eyebrow" style={{ marginBottom: 16 }}>{campaign?.name ?? 'Campagna'}</div>
        {myChars.length === 0 ? (
          <>
            <h2 style={{ marginBottom: 16 }}>Nessun personaggio</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 32 }}>
              Non hai ancora un personaggio in questa campagna.
            </p>
            <a href={`/campaigns/${membership.campaignId}/characters/new`} className="btn btn-primary">
              + Crea il tuo personaggio
            </a>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: 16 }}>Personaggio non attivo</h2>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 32 }}>
              Hai {myChars.length} personaggio{myChars.length > 1 ? 'i' : ''} ma nessuno è attivo. Richiedi al DM di assegnarne uno.
            </p>
            <a href="/my-characters" className="btn btn-secondary">Vedi i miei personaggi</a>
          </>
        )}
      </CenteredCard>
    );
  }

  const [char] = await db.select().from(characters).where(eq(characters.id, membership.activeCharacterId));

  if (!char) {
    return (
      <CenteredCard>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontStyle: 'italic' }}>
          Personaggio non trovato. Chiedi al DM di riassegnarlo.
        </p>
      </CenteredCard>
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
  const hpColor = hpPct > 60 ? 'var(--info)' : hpPct > 30 ? 'var(--gold)' : 'var(--danger)';

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Breadcrumb */}
      <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-3)', fontSize: '0.85rem', fontStyle: 'italic' }}>
        {campaign?.name ?? 'Campagna'} ·{' '}
        <a href="/my-characters" style={{ color: 'var(--fg-3)', textDecoration: 'none' }}>I miei personaggi</a>
      </div>

      {/* Header card */}
      <div className="card" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.5 }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>{classLabel}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: 8 }}>
              {char.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1rem', fontStyle: 'italic' }}>
              {sheet.race}{sheet.subrace ? ` (${sheet.subrace})` : ''}
              {sheet.background ? ` · ${sheet.background}` : ''}
              {sheet.alignment ? ` · ${sheet.alignment}` : ''}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--fg-3)', border: '1px solid var(--border-leather)', padding: '4px 12px', fontStyle: 'italic', letterSpacing: '0.2em', flexShrink: 0 }}>
            Lv. {level}
          </div>
        </div>
      </div>

      {/* HP · CA · Speed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <StatPanel label="Punti Ferita" accent="var(--danger)">
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '2.2rem', fontWeight: 700, color: hpColor, lineHeight: 1 }}>
            {char.hpCurrent}<span style={{ fontSize: '1rem', color: 'var(--fg-3)' }}>/{char.hpMax}</span>
          </div>
          {char.hpTemp > 0 && (
            <div style={{ fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.3em', color: 'var(--info)', marginTop: 6 }}>
              +{char.hpTemp} TEMP
            </div>
          )}
          <div className="hp-bar-track" style={{ marginTop: 8 }}>
            <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor, boxShadow: 'none' }} />
          </div>
        </StatPanel>
        <StatPanel label="Classe Armatura" accent="var(--gold)">
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
            {sheet.armorClass ?? '—'}
          </div>
        </StatPanel>
        <StatPanel label="Velocità" accent="var(--fg-2)">
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--fg-1)', lineHeight: 1 }}>
            {sheet.speed ?? '—'}<span style={{ fontSize: '0.9rem', color: 'var(--fg-3)' }}> m</span>
          </div>
        </StatPanel>
      </div>

      {/* Caratteristiche */}
      <Section label="Caratteristiche">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(ab => {
            const val = stats[ab];
            const mod = abilityModifier(val);
            return (
              <div key={ab} className="card" style={{ padding: '16px 8px', textAlign: 'center' }}>
                <div className="label" style={{ marginBottom: 6 }}>{ABILITY_SHORT[ab]}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '2rem', fontWeight: 700, color: 'var(--fg-1)', lineHeight: 1 }}>{val}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontWeight: 700, color: mod >= 0 ? 'var(--gold)' : 'var(--danger)', marginTop: 2 }}>
                  {formatModifier(mod)}
                </div>
                <div style={{ fontFamily: 'var(--font-label)', fontSize: '6.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-3)', marginTop: 4 }}>
                  {ABILITY_NAMES[ab]}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Tiri salvezza + Combattimento */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 32 }}>
          <div className="label" style={{ marginBottom: 16 }}>Tiri Salvezza</div>
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as Ability[]).map(ab => {
            const isProficient = savingThrows[ab];
            const mod = abilityModifier(stats[ab]) + (isProficient ? prof : 0);
            return (
              <div key={ab} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: isProficient ? 'var(--gold)' : 'var(--fg-3)', fontSize: '0.7rem' }}>{isProficient ? '●' : '○'}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--fg-1)', flex: 1 }}>{ABILITY_NAMES[ab]}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700, color: mod >= 0 ? 'var(--gold)' : 'var(--danger)' }}>
                  {formatModifier(mod)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="card" style={{ padding: 32 }}>
          <div className="label" style={{ marginBottom: 16 }}>Combattimento</div>
          {[
            ['Bonus Competenza', `+${prof}`],
            ['Percezione Passiva', String(passivePerception(stats.wis, level, skillMap['perception']?.proficient ?? false, skillMap['perception']?.expertise ?? false))],
            ['Iniziativa', formatModifier(abilityModifier(stats.dex))],
            ...(spellDC ? [['CD Incantesimi', String(spellDC)], ['Attacco Incantesimi', formatModifier(spellAtk ?? 0)]] : []),
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.9rem', fontStyle: 'italic' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: 'var(--fg-1)', fontSize: '1rem' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Abilità */}
      <Section label="Abilità">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {SKILLS.map(skill => {
            const entry = skillMap[skill.key];
            const isProficient = entry?.proficient ?? false;
            const isExpert = entry?.expertise ?? false;
            const bonus = skillBonus(stats[skill.ability], level, isProficient, isExpert);
            return (
              <div key={skill.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', backgroundColor: 'var(--bg-card)' }}>
                <span style={{ fontSize: '0.65rem', color: isExpert ? 'var(--fg-1)' : isProficient ? 'var(--gold)' : 'var(--fg-3)' }}>
                  {isExpert ? '◆' : isProficient ? '●' : '○'}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--fg-2)', flex: 1, fontStyle: 'italic' }}>{skill.name}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700, color: bonus >= 0 ? 'var(--gold)' : 'var(--danger)' }}>
                  {formatModifier(bonus)}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Condizioni */}
      {conditions.length > 0 && (
        <Section label="Condizioni Attive">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {conditions.map(c => {
              const cond = CONDITIONS.find(x => x.key === c.conditionKey);
              return <span key={c.id} className="badge badge-danger">{cond?.name ?? c.conditionKey}</span>;
            })}
          </div>
        </Section>
      )}

      {/* Slot incantesimo */}
      {spellSlots.filter(s => s.total > 0).length > 0 && (
        <Section label="Slot Incantesimo">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {spellSlots.filter(s => s.total > 0).map(s => (
              <div key={s.slotLevel} className="card" style={{ padding: '16px 20px', textAlign: 'center', minWidth: 72 }}>
                <div className="label" style={{ marginBottom: 10 }}>Liv {s.slotLevel}</div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                  {Array.from({ length: s.total }).map((_, i) => (
                    <span key={i} style={{
                      width: 10, height: 10, borderRadius: '50%', display: 'inline-block',
                      border: '1px solid var(--border-leather)',
                      backgroundColor: i < (s.total - s.used) ? 'var(--arcane)' : 'var(--bg-elevated)',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Incantesimi */}
      {(sheet.knownSpells?.length ?? 0) > 0 && (
        <Section label="Incantesimi">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sheet.knownSpells!.map(sp => (
              <div key={sp.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', backgroundColor: 'var(--bg-card)' }}>
                <span className="badge badge-arcane" style={{ minWidth: 56, textAlign: 'center' }}>
                  {sp.level === 0 ? 'Trucco' : `Liv. ${sp.level}`}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-1)', fontSize: '0.95rem', flex: 1 }}>{sp.name}</span>
                {sp.prepared && <span className="badge badge-gold">Preparato</span>}
                {sp.concentration && <span className="badge badge-arcane">Conc.</span>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Inventario */}
      {(sheet.inventory?.length ?? 0) > 0 && (
        <Section label="Inventario">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sheet.inventory!.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: 'var(--bg-card)' }}>
                <span style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-1)', fontSize: '0.95rem' }}>
                  {item.quantity > 1 && <span style={{ color: 'var(--fg-3)' }}>{item.quantity}× </span>}
                  {item.name}
                </span>
                {item.weight > 0 && (
                  <span style={{ fontFamily: 'var(--font-label)', fontSize: '7.5px', letterSpacing: '0.3em', color: 'var(--fg-3)' }}>
                    {(item.weight * item.quantity).toFixed(1)} kg
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Background narrativo */}
      {(sheet.backstory || sheet.personality || sheet.ideals || sheet.bonds || sheet.flaws) && (
        <Section label="Background">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { label: 'Storia', val: sheet.backstory },
              { label: 'Personalità', val: sheet.personality },
              { label: 'Ideali', val: sheet.ideals },
              { label: 'Legami', val: sheet.bonds },
              { label: 'Difetti', val: sheet.flaws },
            ].filter(x => x.val).map(({ label, val }) => (
              <div key={label}>
                <div className="label" style={{ marginBottom: 8 }}>{label}</div>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.7 }}>{val}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

    </div>
  );
}

/* ── Componenti locali ── */

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ padding: 48, maxWidth: 480, width: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.4 }} />
        {children}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 32 }}>
      <div className="label" style={{ marginBottom: 20 }}>{label}</div>
      {children}
    </div>
  );
}

function StatPanel({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 32, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.4 }} />
      <div className="label" style={{ marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  );
}
