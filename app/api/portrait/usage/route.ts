import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { apiUsageLogs } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { auth } from '@/auth';

const BUDGET_EUR = 10;

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const [result] = await db
    .select({
      totalCost: sql<number>`coalesce(sum(cost_eur), 0)`,
      totalCount: sql<number>`count(*)`,
    })
    .from(apiUsageLogs);

  const used = result?.totalCost ?? 0;
  const remaining = Math.max(0, BUDGET_EUR - used);
  const pct = Math.min(100, (used / BUDGET_EUR) * 100);

  return NextResponse.json({ used, remaining, pct, budget: BUDGET_EUR, count: result?.totalCount ?? 0 });
}
