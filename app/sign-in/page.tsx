import { signIn } from '@/auth';

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="text-center p-8 border" style={{ borderColor: '#5a4020', backgroundColor: '#221c14', maxWidth: 360 }}>
        <div style={{ fontFamily: 'Cinzel Decorative, serif', color: '#c8922a', fontSize: '1.8rem', marginBottom: 8 }}>
          Aethon
        </div>
        <p style={{ fontFamily: 'Crimson Text, serif', color: '#a08060', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: 32 }}>
          Accedi per entrare nella campagna
        </p>
        <form action={async () => {
          'use server';
          await signIn('google', { redirectTo: '/' });
        }}>
          <button type="submit" style={{
            width: '100%', border: '1px solid #c8922a', color: '#1a1410',
            backgroundColor: '#c8922a', fontFamily: 'Cinzel, serif',
            fontSize: '0.85rem', padding: '12px 24px', cursor: 'pointer',
          }}>
            ✦ Accedi con Google
          </button>
        </form>
      </div>
    </div>
  );
}
