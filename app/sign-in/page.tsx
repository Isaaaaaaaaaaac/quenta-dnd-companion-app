import { signIn } from '@/auth';

export default function SignInPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div style={{
        backgroundColor: 'var(--bg-deep)',
        border: '1px solid var(--border-leather)',
        padding: 48,
        maxWidth: 380,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'var(--gold-border)',
          opacity: 0.5,
        }} />

        {/* Logo */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '0.05em', lineHeight: 1.1 }}>
            Quenta
          </div>
          <div style={{ fontFamily: 'var(--font-label)', fontSize: '7px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: 6, opacity: 0.8 }}>
            D&amp;D Companion
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--border-leather)', margin: '28px 0' }} />

        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 32 }}>
          Accedi per entrare nella campagna
        </p>

        <form action={async () => {
          'use server';
          await signIn('google', { redirectTo: '/' });
        }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'block' }}>
            ✦ &nbsp;Accedi con Google
          </button>
        </form>
      </div>
    </div>
  );
}
