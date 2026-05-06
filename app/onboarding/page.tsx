import { getSessionUser } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import OnboardingWizard from './OnboardingWizard';

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/sign-in');
  if (user.onboarded && user.role !== 'pending_dm') redirect('/');

  return <OnboardingWizard userId={user.id} userName={user.email.split('@')[0]} />;
}
