import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-bg dark:bg-bg-dark">
        <ActivityIndicator color="#2f6f4e" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)/home' : '/(auth)/login'} />;
}
