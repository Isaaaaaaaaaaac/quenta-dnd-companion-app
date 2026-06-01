import NewCampaignForm from '@/components/campaign/NewCampaignForm';
import { requireDm } from '@/lib/auth-helpers';

export default async function NewCampaignPage() {
  await requireDm();
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Dungeon Master</div>
      <h1 style={{ marginBottom: 40 }}>Nuova Campagna</h1>
      <NewCampaignForm />
    </div>
  );
}
