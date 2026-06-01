import { signOut } from '@/auth';

export default function RejectedPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div style={{
        backgroundColor: 'var(--bg-deep)',
        border: '1px solid var(--danger)',
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
          background: 'var(--danger-border)',
          opacity: 0.6,
        }} />

        <div style={{ fontSize: '2rem', marginBottom: 24, color: 'var(--danger)', opacity: 0.7 }}>✕</div>

        <div style={{ fontFamily: 'var(--font-label)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--fg-1)', marginBottom: 16 }}>
          Richiesta non approvata
        </div>

        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 32 }}>
          La tua richiesta di accesso come Dungeon Master non è stata approvata.
          Contatta l'amministratore per maggiori informazioni.
        </p>

        <div style={{ borderTop: '1px solid var(--danger-border)', marginBottom: 32 }} />

        <form action={async () => { 'use server'; await signOut({ redirectTo: '/sign-in' }); }}>
          <button type="submit" className="btn btn-ghost" style={{ width: '100%' }}>
            Esci
          </button>
        </form>
      </div>
    </div>
  );
}
