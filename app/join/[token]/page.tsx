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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ maxWidth: 440, textAlign: 'center', border: '1px solid #8b2020', backgroundColor: '#1a0808', padding: 40 }}>
          <div style={{ fontFamily: 'Cinzel, serif', color: '#8b2020', fontSize: '1.1rem', marginBottom: 12 }}>Link non valido</div>
          <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.9rem', fontStyle: 'italic' }}>
            Questo link di invito non è valido o è stato disattivato dal DM. Chiedi un nuovo link.
          </p>
        </div>
      </div>
    );
  }

  const db = getDb();
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, invitation.campaignId));

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: 480, textAlign: 'center', border: '1px solid #5a4020', backgroundColor: '#221c14', padding: 40 }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚔</div>
        <div style={{ fontFamily: 'Cinzel, serif', color: '#c8922a', fontSize: '1.2rem', marginBottom: 8 }}>
          Sei invitato!
        </div>
        <p style={{ color: '#a08060', fontFamily: 'Crimson Text, serif', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: 24 }}>
          Stai per unirti alla campagna
        </p>
        <div style={{ fontFamily: 'Cinzel Decorative, serif', color: '#e8d5a3', fontSize: '1.4rem', marginBottom: 8 }}>
          {campaign?.name ?? 'Campagna'}
        </div>
        {campaign?.setting && (
          <div style={{ color: '#6a5040', fontFamily: 'Crimson Text, serif', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: 24 }}>
            {campaign.setting}
          </div>
        )}
        <form action={async () => {
          'use server';
          await joinCampaign(user.id, invitation.campaignId);
          redirect(`/campaigns/${invitation.campaignId}/characters/new`);
        }}>
          <button type="submit" style={{ width: '100%', border: '1px solid #c8922a', backgroundColor: '#c8922a', color: '#1a1410', fontFamily: 'Cinzel, serif', fontSize: '0.9rem', padding: '14px', cursor: 'pointer' }}>
            ✦ Entra nella campagna
          </button>
        </form>
      </div>
    </div>
  );
}
