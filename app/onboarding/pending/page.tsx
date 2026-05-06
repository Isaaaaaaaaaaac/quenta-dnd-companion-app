import { getSessionUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function PendingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/sign-in');
  if (user.role === 'dm' || user.role === 'superadmin') redirect('/');
  if (user.role === 'rejected') redirect('/onboarding/rejected');
  if (user.role === 'player') redirect('/my-character');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: 480, textAlign: 'center', border: '1px solid #5a4020', backgroundColor: '#221c14', padding: 40 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>⏳</div>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1.2rem', marginBottom: 12 }}>
          Richiesta in attesa
        </div>
        <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6 }}>
          La tua richiesta di accesso come Dungeon Master è stata inviata al Super Admin.
          Ricarica questa pagina dopo l'approvazione per accedere all'app.
        </p>
        <form action={async () => { 'use server'; redirect('/onboarding/pending'); }}>
          <button type="submit" style={{ marginTop: 24, border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '8px 20px', cursor: 'pointer' }}>
            🔄 Controlla stato
          </button>
        </form>
      </div>
    </div>
  );
}
