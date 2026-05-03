import { eq, and } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { campaigns, characters } from '@/lib/db/schema';
import type { Character, CharacterSheet } from '@/lib/db/schema';
import { hpPercentage } from '@/lib/rules/calculations';
import { CLASSES } from '@/lib/srd/classes';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  pc: 'Personaggi Giocanti', npc_major: 'PNG Principali', npc_minor: 'PNG Secondari',
};

export default async function CampaignCharactersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
  if (!campaign) notFound();

  const all = await db.select().from(characters).where(eq(characters.campaignId, id));
  const grouped: Record<string, Character[]> = { pc: [], npc_major: [], npc_minor: [] };
  all.forEach(c => { grouped[c.type]?.push(c); });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-2" style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.06em' }}>
        <a href={`/campaigns/${id}`} style={{ color: '#5a4020', textDecoration: 'none' }}>← {campaign.name}</a>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1>Personaggi — {campaign.name}</h1>
        <a href={`/campaigns/${id}/characters/new`}
          style={{ border: '1px solid #5a4020', color: '#c8922a', backgroundColor: '#221c14', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', padding: '8px 16px', textDecoration: 'none' }}>
          + Nuovo
        </a>
      </div>

      {all.length === 0 && (
        <div className="text-center py-16" style={{ color: '#a08060' }}>
          <p style={{ fontFamily: 'IM Fell English, serif', fontSize: '1.1rem', marginBottom: 16 }}>Nessun personaggio in questa campagna.</p>
          <a href={`/campaigns/${id}/characters/new`}
            style={{ border: '1px solid #c8922a', color: '#c8922a', fontFamily: 'Cinzel, serif', padding: '10px 24px', textDecoration: 'none' }}>
            Crea il primo
          </a>
        </div>
      )}

      {(['pc', 'npc_major', 'npc_minor'] as const).map(type => {
        const list = grouped[type];
        if (!list || list.length === 0) return null;
        return (
          <div key={type} className="mb-8">
            <h2 className="mb-4">{TYPE_LABELS[type]}</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {list.map(char => <CharRow key={char.id} character={char} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CharRow({ character }: { character: Character }) {
  const sheet = character.sheet as CharacterSheet;
  const classLabel = sheet.classes?.map(c => {
    const found = CLASSES.find(cl => cl.key === c.classKey);
    return `${found?.name ?? c.classKey} ${c.level}`;
  }).join(' / ') ?? '';
  const hpPct = hpPercentage(character.hpCurrent, character.hpMax);
  const hpColor = hpPct > 60 ? '#4a7c4e' : hpPct > 30 ? '#8a7a2a' : '#7a2a2a';

  return (
    <a href={`/characters/${character.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="flex gap-3 items-center p-3 border"
        style={{ borderColor: '#5a4020', backgroundColor: '#221c14' }}>
        <div style={{ width: 44, height: 44, flexShrink: 0, border: '1px solid #5a4020', backgroundColor: '#2a2018', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {sheet.portraitUrl
            ? <img src={sheet.portraitUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#5a4020', fontSize: '1.2rem' }}>⚔</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1rem' }}>{character.name}</div>
          <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem' }}>
            {sheet.race && `${sheet.race} · `}{classLabel}
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <div className="text-center">
            <div style={{ fontSize: '0.5rem', color: '#a08060', fontFamily: 'Cinzel, serif' }}>PF</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem', color: '#e8d5a3' }}>{character.hpCurrent}/{character.hpMax}</div>
            <div style={{ height: 3, backgroundColor: '#1a1410', width: 40 }}>
              <div style={{ height: '100%', width: `${hpPct}%`, backgroundColor: hpColor }} />
            </div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: '0.5rem', color: '#a08060', fontFamily: 'Cinzel, serif' }}>LV</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.9rem', color: '#e8d5a3' }}>{character.level}</div>
          </div>
        </div>
      </div>
    </a>
  );
}
