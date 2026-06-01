import { requireAuth } from '@/lib/auth-helpers';
import { getMemberships } from '@/lib/db/userActions';
import { getDb } from '@/lib/db/client';
import { characters, campaigns } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import MyCharactersClient from './MyCharactersClient';

export const dynamic = 'force-dynamic';

export default async function MyCharactersPage() {
  const user = await requireAuth();
  const db = getDb();
  const memberships = await getMemberships(user.id);

  const data = await Promise.all(memberships.map(async m => {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, m.campaignId));
    const chars = await db.select().from(characters)
      .where(and(eq(characters.userId, user.id), eq(characters.campaignId, m.campaignId)));
    return { membership: m, campaign: campaign ?? null, characters: chars };
  }));

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Giocatore</div>
        <h1>I miei Personaggi</h1>
      </div>
      <MyCharactersClient data={data} userId={user.id} />
    </div>
  );
}
