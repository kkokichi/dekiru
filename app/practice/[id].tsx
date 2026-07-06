import { useLocalSearchParams } from 'expo-router';

import { PracticeScreen } from '@/features/reflections/screens/PracticeScreen';

export default function Practice() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PracticeScreen id={id} />;
}
