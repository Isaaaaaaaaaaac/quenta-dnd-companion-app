import { signOut } from '@/auth';

export default function RejectedPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: 480, textAlign: 'center', border: '1px solid #8b2020', backgroundColor: '#1a0808', padding: 40 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✕</div>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#8b2020', fontSize: '1.2rem', marginBottom: 12 }}>
          Richiesta non approvata
        </div>
        <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6 }}>
          La tua richiesta di accesso come Dungeon Master non è stata approvata.
          Contatta l'amministratore per maggiori informazioni.
        </p>
        <form action={async () => { 'use server'; await signOut({ redirectTo: '/sign-in' }); }}>
          <button type="submit" style={{ marginTop: 24, border: '1px solid #5a4020', color: '#a08060', backgroundColor: 'transparent', fontFamily: 'Cinzel, serif', fontSize: '0.75rem', padding: '8px 20px', cursor: 'pointer' }}>
            Esci
          </button>
        </form>
      </div>
    </div>
  );
}
