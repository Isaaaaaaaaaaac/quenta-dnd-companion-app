import { requireSuperAdmin } from '@/lib/auth-helpers';
import { getAllUsers } from '@/lib/db/userActions';
import { getDb } from '@/lib/db/client';
import { apiUsageLogs } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import AdminPanel from './AdminPanel';
import ApiUsageWidget from './ApiUsageWidget';

export const dynamic = 'force-dynamic';

const BUDGET_EUR = 10; // budget totale ricaricabile
const WARN_THRESHOLD = 0.8; // warning all'80%

export default async function AdminPage() {
  await requireSuperAdmin();
  const allUsers = await getAllUsers();

  // Stats utilizzo API
  const db = getDb();
  const usageRows = await db
    .select({
      month:      sql<string>`strftime('%Y-%m', created_at)`,
      count:      sql<number>`count(*)`,
      totalCost:  sql<number>`sum(cost_eur)`,
    })
    .from(apiUsageLogs)
    .groupBy(sql`strftime('%Y-%m', created_at)`)
    .orderBy(sql`strftime('%Y-%m', created_at) desc`)
    .limit(6);

  const totalAllTime = usageRows.reduce((s, r) => s + (r.totalCost ?? 0), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonth    = usageRows.find(r => r.month === currentMonth);
  const thisMonthCost = thisMonth?.totalCost ?? 0;
  const isWarning    = totalAllTime / BUDGET_EUR >= WARN_THRESHOLD;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 48 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Pannello</div>
        <h1>Super Admin</h1>
      </div>

      <ApiUsageWidget
        totalAllTime={totalAllTime}
        thisMonthCost={thisMonthCost}
        thisMonthCount={thisMonth?.count ?? 0}
        budgetEur={BUDGET_EUR}
        isWarning={isWarning}
        rows={usageRows.map(r => ({ month: r.month, count: r.count, cost: r.totalCost ?? 0 }))}
      />

      <AdminPanel users={allUsers} />
    </div>
  );
}
