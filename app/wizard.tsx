import { useLocalSearchParams } from 'expo-router';

import { WizardScreen } from '@/features/reflections/screens/WizardScreen';

export default function Wizard() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <WizardScreen resumeId={id} />;
}
