import '../src/styles/global.css';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="reflection/[id]" options={{ headerShown: true, title: '詳細' }} />
              <Stack.Screen
                name="practice/[id]"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen
                name="effect/[id]"
                options={{ presentation: 'modal', headerShown: false }}
              />
              <Stack.Screen name="wizard" options={{ presentation: 'modal', headerShown: false }} />
            </Stack>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
