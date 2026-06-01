import { getSessionUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';

export default async function PendingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/sign-in');
  if (user.role === 'dm' || user.role === 'superadmin') redirect('/');
  if (user.role === 'rejected') redirect('/onboarding/rejected');
  if (user.role === 'player') redirect('/my-character');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div style={{
        backgroundColor: 'var(--bg-deep)',
        border: '1px solid var(--border-leather)',
        padding: 48,
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, var(--info), transparent)',
          opacity: 0.5,
        }} />

        <div style={{ fontSize: '2rem', marginBottom: 24, opacity: 0.6 }}>◈</div>

        <div style={{ fontFamily: 'var(--font-label)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--fg-1)', marginBottom: 16 }}>
          Richiesta in attesa
        </div>

        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 32 }}>
          La tua richiesta di accesso come Dungeon Master è stata inviata al Super Admin.
          Ricarica questa pagina dopo l'approvazione per accedere all'app.
        </p>

        <div style={{ borderTop: '1px solid var(--border-leather)', marginBottom: 32 }} />

        <form action={async () => { 'use server'; redirect('/onboarding/pending'); }}>
          <button type="submit" className="btn btn-ghost" style={{ width: '100%' }}>
            Controlla stato
          </button>
        </form>
      </div>
    </div>
  );
}
