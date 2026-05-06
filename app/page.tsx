import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { campaigns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const user = await requireAuth();

  // Giocatori → la loro scheda
  if (user.role === 'player') redirect('/my-character');

  // DM / SuperAdmin → dashboard campagna
  const db = getDb();
  const active = await db.select().from(campaigns).where(eq(campaigns.status, 'active'));
  if (active.length === 1) redirect(`/campaigns/${active[0].id}`);
  redirect('/campaigns');
}
