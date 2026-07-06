import { useLocalSearchParams } from 'expo-router';

import { EffectScreen } from '@/features/reflections/screens/EffectScreen';

export default function EffectRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EffectScreen id={id} />;
}
