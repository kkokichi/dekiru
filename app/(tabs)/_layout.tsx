import { Tabs, useRouter } from 'expo-router';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2f6f4e',
          tabBarStyle: { height: tabBarHeight },
        }}
      >
        <Tabs.Screen name="home" options={{ title: 'ホーム' }} />
        <Tabs.Screen name="list" options={{ title: '一覧' }} />
        <Tabs.Screen name="settings" options={{ title: '設定' }} />
      </Tabs>

      <Pressable
        onPress={() => router.push('/wizard')}
        accessibilityRole="button"
        accessibilityLabel="振り返りを登録する"
        style={{
          position: 'absolute',
          alignSelf: 'center',
          bottom: tabBarHeight - (Platform.OS === 'ios' ? 14 : 10),
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: '#2f6f4e',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 4,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 26, lineHeight: 28 }}>+</Text>
      </Pressable>
    </View>
  );
}
