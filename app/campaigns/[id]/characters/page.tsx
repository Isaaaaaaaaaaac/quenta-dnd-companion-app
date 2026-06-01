import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { campaigns, characters } from '@/lib/db/schema';
import type { Character, CharacterSheet } from '@/lib/db/schema';
import { hpPercentage } from '@/lib/rules/calculations';
import { CLASSES } from '@/lib/srd/classes';
import { requireDm } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  pc: 'Personaggi Giocanti', npc_major: 'PNG Principali', npc_minor: 'PNG Secondari',
};

export default async function CampaignCharactersPage({ params }: { params: Promise<{ id: string }> }) {
  await requireDm();
  const { id } = await params;
  const db = getDb();

  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
  if (!campaign) notFound();

  const all = await db.select().from(characters).where(eq(characters.campaignId, id));
  const grouped: Record<string, Character[]> = { pc: [], npc_major: [], npc_minor: [] };
  all.forEach(c => { grouped[c.type]?.push(c); });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <a href={`/campaigns/${id}`} style={{ fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--fg-3)', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
        ← {campaign.name}
      </a>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>{campaign.name}</div>
          <h1>Personaggi</h1>
        </div>
        <a href={`/campaigns/${id}/characters/new`} className="btn btn-secondary">+ Nuovo</a>
      </div>

      {all.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1.1rem', fontStyle: 'italic', marginBottom: 28 }}>
            Nessun personaggio in questa campagna.
          </p>
          <a href={`/campaigns/${id}/characters/new`} className="btn btn-primary">Crea il primo</a>
        </div>
      )}

      {(['pc', 'npc_major', 'npc_minor'] as const).map(type => {
        const list = grouped[type];
        if (!list || list.length === 0) return null;
        return (
          <div key={type} style={{ marginBottom: 40 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>{TYPE_LABELS[type]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {list.map(char => <CharCard key={char.id} character={char} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CharCard({ character }: { character: Character }) {
  const sheet = character.sheet as CharacterSheet;
  const classLabel = sheet.classes?.map(c => {
    const found = CLASSES.find(cl => cl.key === c.classKey);
    return `${found?.name ?? c.classKey} ${c.level}`;
  }).join(' / ') ?? '';
  const hpPct = hpPercentage(character.hpCurrent, character.hpMax);
  const hpColor = hpPct > 60 ? 'var(--info)' : hpPct > 30 ? 'var(--gold)' : 'var(--danger)';

  return (
    <a href={`/characters/${character.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--gold-border)', opacity: 0.4 }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '0.02em', lineHeight: 1.2, marginBottom: 6 }}>
              {character.name}
            </div>
            <div className="eyebrow" style={{ opacity: 0.75 }}>{classLabel}</div>
          </div>
          <div style={{ width: 44, height: 44, flexShrink: 0, border: '1px solid var(--border-leather)', backgroundColor: 'var(--bg-card)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {sheet.portraitUrl
              ? <img src={sheet.portraitUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: 'var(--fg-3)', fontSize: '1rem' }}>⚔</span>}
          </div>
        </div>

        {sheet.race && (
          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.82rem', fontStyle: 'italic', marginBottom: 16, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {sheet.race}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-leather)', marginBottom: 16 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="label" style={{ marginBottom: 4 }}>PF</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.3rem', fontWeight: 700, color: hpColor, lineHeight: 1 }}>{character.hpCurrent}</div>
            <div style={{ fontFamily: 'var(--font-label)', fontSize: '7px', color: 'var(--fg-3)', letterSpacing: '0.2em' }}>/{character.hpMax}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="label" style={{ marginBottom: 4 }}>CA</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>{sheet.armorClass ?? '—'}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="label" style={{ marginBottom: 4 }}>Lv</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--fg-1)', lineHeight: 1 }}>{character.level}</div>
          </div>
        </div>

        <div className="hp-bar-track">
          <div className="hp-bar-fill" style={{ width: `${hpPct}%`, background: hpColor, boxShadow: 'none' }} />
        </div>
      </div>
    </a>
  );
}
