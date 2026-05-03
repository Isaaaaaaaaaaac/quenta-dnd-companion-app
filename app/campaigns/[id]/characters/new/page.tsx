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
    <div className="max-w-2xl mx-auto">
      <div className="mb-2" style={{ color: '#5a4020', fontFamily: 'Cinzel, serif', fontSize: '0.65rem', letterSpacing: '0.08em' }}>
        <a href={`/campaigns/${id}`} style={{ color: '#5a4020', textDecoration: 'none' }}>
          ← {campaign.name}
        </a>
      </div>
      <h1 className="mb-8">Nuovo Personaggio</h1>
      <CharacterCreationChoice campaignId={id} />
    </div>
  );
}
