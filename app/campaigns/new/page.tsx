import NewCampaignForm from '@/components/campaign/NewCampaignForm';
import { requireDm } from '@/lib/auth-helpers';

export default async function NewCampaignPage() {
  await requireDm();
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="mb-6">Nuova Campagna</h1>
      <NewCampaignForm />
    </div>
  );
}
