import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { campaigns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const db = getDb();
  const active = await db.select().from(campaigns).where(eq(campaigns.status, 'active'));

  // Una sola campagna attiva → vai diretto alla dashboard
  if (active.length === 1) redirect(`/campaigns/${active[0].id}`);

  // Altrimenti → lista campagne
  redirect('/campaigns');
}
