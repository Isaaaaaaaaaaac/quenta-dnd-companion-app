import { getDb } from '@/lib/db/client';
import { campaigns, characters } from '@/lib/db/schema';
import type { Campaign } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireDm } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  await requireDm();
  const db = getDb();
  const allCampaigns = await db.select().from(campaigns).orderBy(campaigns.createdAt);

  const counts = await db
    .select({ campaignId: characters.campaignId, count: sql<number>`count(*)` })
    .from(characters)
    .groupBy(characters.campaignId);
  const countMap = Object.fromEntries(counts.map(r => [r.campaignId, r.count]));

  const active   = allCampaigns.filter(c => c.status === 'active');
  const archived = allCampaigns.filter(c => c.status === 'archived');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Dungeon Master</div>
          <h1>Le tue Campagne</h1>
        </div>
        <a href="/campaigns/new" className="btn btn-secondary">
          + Nuova Campagna
        </a>
      </div>

      {allCampaigns.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1.1rem', fontStyle: 'italic', marginBottom: 28 }}>
            Nessuna campagna ancora. Comincia creandone una.
          </p>
          <a href="/campaigns/new" className="btn btn-primary">
            Crea la prima campagna
          </a>
        </div>
      )}

      {active.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Attive</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {active.map(c => <CampaignCard key={c.id} campaign={c} charCount={countMap[c.id] ?? 0} />)}
          </div>
        </div>
      )}

      {archived.length > 0 && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 16, opacity: 0.5 }}>Archiviate</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
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
      <div className="card" style={{
        opacity: archived ? 0.6 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top accent line */}
        {!archived && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            opacity: 0.4,
          }} />
        )}

        {/* Cover */}
        {campaign.coverUrl ? (
          <img src={campaign.coverUrl} alt={campaign.name}
            style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block', borderBottom: '1px solid var(--border-leather)' }} />
        ) : (
          <div style={{
            width: '100%', height: 120,
            backgroundColor: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-leather)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 32,
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--fg-3)', letterSpacing: '0.05em', textAlign: 'center' }}>
              {campaign.name}
            </span>
          </div>
        )}

        {/* Body — padding: 32px dal DS (.component-card) */}
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 700,
                color: archived ? 'var(--fg-3)' : 'var(--fg-1)',
                letterSpacing: '0.02em',
                marginBottom: 8,
                lineHeight: 1.2,
              }}>
                {campaign.name}
              </div>
              {campaign.setting && (
                <div style={{ fontFamily: 'var(--font-body)', color: 'var(--gold)', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.8, marginBottom: 8 }}>
                  {campaign.setting}
                </div>
              )}
              {campaign.description && (
                <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.875rem', lineHeight: 1.65, fontStyle: 'italic' }}>
                  {campaign.description.slice(0, 90)}{campaign.description.length > 90 ? '…' : ''}
                </div>
              )}
            </div>

            {/* Char count */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '2rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
                {charCount}
              </div>
              <div className="label" style={{ marginTop: 6 }}>Personaggi</div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
