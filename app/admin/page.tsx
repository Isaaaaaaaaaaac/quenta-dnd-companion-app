import { requireSuperAdmin } from '@/lib/auth-helpers';
import { getAllUsers, approveDm, rejectDm, updateUserRole } from '@/lib/db/userActions';
import AdminPanel from './AdminPanel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireSuperAdmin();
  const allUsers = await getAllUsers();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', color: '#5a4020', fontSize: '0.65rem', letterSpacing: '0.08em', marginBottom: 4 }}>PANNELLO</div>
          <h1>Super Admin</h1>
        </div>
      </div>
      <AdminPanel users={allUsers} />
    </div>
  );
}
