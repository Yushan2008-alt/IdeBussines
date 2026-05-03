import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { getOnboardingStatus } from '@/lib/actions/onboarding';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const { completed } = await getOnboardingStatus();
  if (completed) redirect('/dashboard');

  return <OnboardingWizard />;
}
