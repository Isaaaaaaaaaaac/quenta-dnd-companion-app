import { getSessionUser } from '@/lib/auth-helpers';
import { getInvitationByToken, joinCampaign } from '@/lib/db/userActions';
import { getDb } from '@/lib/db/client';
import { campaigns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await getSessionUser();
  if (!user) redirect('/sign-in');

  const invitation = await getInvitationByToken(token.toUpperCase());

  if (!invitation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div style={{
          backgroundColor: 'var(--bg-deep)',
          border: '1px solid var(--danger)',
          padding: 48,
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'var(--danger-border)',
            opacity: 0.6,
          }} />
          <div style={{ fontFamily: 'var(--font-label)', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--fg-1)', marginBottom: 16 }}>
            Link non valido
          </div>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.7 }}>
            Questo link di invito non è valido o è stato disattivato dal DM. Chiedi un nuovo link.
          </p>
        </div>
      </div>
    );
  }

  const db = getDb();
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, invitation.campaignId));

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
          background: 'var(--gold-border)',
          opacity: 0.5,
        }} />

        <div style={{ fontFamily: 'var(--font-label)', fontSize: '9px', letterSpacing: '0.45em', textTransform: 'uppercase', color: 'var(--gold)', opacity: 0.8, marginBottom: 24 }}>
          Invito alla campagna
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '0.02em', lineHeight: 1.1, marginBottom: 8 }}>
          {campaign?.name ?? 'Campagna'}
        </div>

        {campaign?.setting && (
          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--gold)', fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.8, marginBottom: 8 }}>
            {campaign.setting}
          </div>
        )}

        {campaign?.description && (
          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 8 }}>
            {campaign.description}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-leather)', margin: '32px 0' }} />

        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--fg-2)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: 32 }}>
          Stai per unirti a questa campagna. Dopo l'accesso potrai creare il tuo personaggio.
        </p>

        <form action={async () => {
          'use server';
          await joinCampaign(user.id, invitation.campaignId);
          redirect(`/campaigns/${invitation.campaignId}/characters/new`);
        }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            ✦ &nbsp;Entra nella campagna
          </button>
        </form>
      </div>
    </div>
  );
}
