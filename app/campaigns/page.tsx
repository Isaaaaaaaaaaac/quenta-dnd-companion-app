import { getDb } from '@/lib/db/client';
import { campaigns, characters } from '@/lib/db/schema';
import type { Campaign } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const db = getDb();
  const allCampaigns = await db.select().from(campaigns).orderBy(campaigns.createdAt);

  // Conta personaggi per campagna
  const counts = await db
    .select({ campaignId: characters.campaignId, count: sql<number>`count(*)` })
    .from(characters)
    .groupBy(characters.campaignId);
  const countMap = Object.fromEntries(counts.map(r => [r.campaignId, r.count]));

  const active   = allCampaigns.filter(c => c.status === 'active');
  const archived = allCampaigns.filter(c => c.status === 'archived');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1>Le tue Campagne</h1>
        <a href="/campaigns/new"
          style={{ border: '1px solid #c8922a', color: '#c8922a', backgroundColor: '#221c14', fontFamily: 'Cinzel, serif', fontSize: '0.8rem', padding: '8px 18px', textDecoration: 'none' }}>
          + Nuova Campagna
        </a>
      </div>

      {allCampaigns.length === 0 && (
        <div className="text-center py-20">
          <p style={{ fontFamily: 'IM Fell English, serif', color: '#a08060', fontSize: '1.2rem', marginBottom: 20 }}>
            Nessuna campagna ancora. Comincia creandone una.
          </p>
          <a href="/campaigns/new"
            style={{ border: '1px solid #c8922a', color: '#c8922a', fontFamily: 'Cinzel, serif', padding: '10px 28px', textDecoration: 'none' }}>
            Crea la prima campagna
          </a>
        </div>
      )}

      {active.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4">Attive</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {active.map(c => <CampaignCard key={c.id} campaign={c} charCount={countMap[c.id] ?? 0} />)}
          </div>
        </div>
      )}

      {archived.length > 0 && (
        <div>
          <h2 className="mb-4" style={{ color: '#5a4020' }}>Archiviate</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {archived.map(c => <CampaignCard key={c.id} campaign={c} charCount={countMap[c.id] ?? 0} archived />)}
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign, charCount, archived }: { campaign: Campaign; charCount: number; archived?: boolean }) {
  return (
    <a href={`/campaigns/${campaign.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="border p-5 transition-colors"
        style={{ borderColor: archived ? '#3a3020' : '#5a4020', backgroundColor: '#221c14', opacity: archived ? 0.7 : 1 }}>

        {/* Cover placeholder o immagine */}
        {campaign.coverUrl ? (
          <img src={campaign.coverUrl} alt={campaign.name}
            style={{ width: '100%', height: '120px', objectFit: 'cover', marginBottom: 16, border: '1px solid #5a4020' }} />
        ) : (
          <div style={{ width: '100%', height: '80px', backgroundColor: '#2a2018', border: '1px solid #5a4020', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#5a4020', fontFamily: 'Cinzel Decorative, serif', fontSize: '1.1rem' }}>
              {campaign.name}
            </span>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div>
            <h2 style={{ marginBottom: 4, fontSize: '1.2rem', color: archived ? '#5a4020' : '#c8922a' }}>
              {campaign.name}
            </h2>
            {campaign.setting && (
              <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic' }}>
                {campaign.setting}
              </div>
            )}
            {campaign.description && (
              <div style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', marginTop: 4 }}>
                {campaign.description.slice(0, 80)}{campaign.description.length > 80 ? '…' : ''}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', color: '#e8d5a3', lineHeight: 1 }}>{charCount}</div>
            <div style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.05em' }}>PERSONAGGI</div>
          </div>
        </div>
      </div>
    </a>
  );
}
