import { requireAuth } from '@/lib/auth-helpers';
import { getMemberships, requestCharacterSwitch } from '@/lib/db/userActions';
import { getDb } from '@/lib/db/client';
import { characters, campaigns } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { CharacterSheet } from '@/lib/db/schema';
import { CLASSES } from '@/lib/srd/classes';
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
    <div className="max-w-3xl mx-auto">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#5a4020', fontSize: '0.65rem', letterSpacing: '0.08em', marginBottom: 4 }}>I MIEI</div>
        <h1>Personaggi</h1>
      </div>
      <MyCharactersClient data={data} userId={user.id} />
    </div>
  );
}
