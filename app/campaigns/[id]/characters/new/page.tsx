import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { campaigns } from '@/lib/db/schema';
import CharacterCreationChoice from '@/components/character/CharacterCreationChoice';

export default async function NewCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
  if (!campaign) notFound();

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      {/* Breadcrumb */}
      <a href={`/campaigns/${id}`} style={{
        fontFamily: 'var(--font-label)', fontSize: '8px', letterSpacing: '0.4em',
        textTransform: 'uppercase', color: 'var(--fg-3)', textDecoration: 'none',
        display: 'inline-block', marginBottom: 16,
      }}>
        ← {campaign.name}
      </a>

      <div className="eyebrow" style={{ marginBottom: 10 }}>Nuovo Personaggio</div>
      <h1 style={{ marginBottom: 40 }}>{campaign.name}</h1>

      <CharacterCreationChoice campaignId={id} />
    </div>
  );
}
