import { useLocalSearchParams } from 'expo-router';

import { DetailScreen } from '@/features/reflections/screens/DetailScreen';

export default function ReflectionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DetailScreen id={id} />;
}
