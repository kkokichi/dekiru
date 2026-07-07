import { colorScheme } from 'nativewind';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { signOutFromGoogle } from '@/features/auth/services/googleAuth';
import { firebaseAuth } from '@/firebase/auth';
import { useAuth } from '@/providers/AuthProvider';
import { usersRepository } from '@/repositories/usersRepository';

type ThemeChoice = 'system' | 'light' | 'dark';

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: '端末の設定に合わせる' },
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
];

export function SettingsScreen() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ThemeChoice>('system');
  const [deleting, setDeleting] = useState(false);

  const changeTheme = async (value: ThemeChoice) => {
    setTheme(value);
    colorScheme.set(value);
    if (user) await usersRepository.updateTheme(user.uid, value);
  };

  const signOut = async () => {
    await signOutFromGoogle();
    await firebaseAuth.signOut();
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'アカウントを削除しますか？',
      'すべての振り返りデータが完全に削除され、元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除する', style: 'destructive', onPress: deleteAccount },
      ],
    );
  };

  const deleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await usersRepository.deleteAllData(user.uid);
      await user.delete();
    } catch {
      Alert.alert(
        'アカウントを削除できませんでした',
        '再度ログインしてからもう一度お試しください（セキュリティ上、最近ログインした状態でのみ削除できます）。',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-bg dark:bg-bg-dark"
      contentContainerStyle={{ padding: 16, gap: 28 }}
    >
      <View>
        <Text className="text-[19px] font-bold text-ink dark:text-ink-dark">設定</Text>
      </View>

      <View className="gap-1">
        <Text className="text-[12px] font-bold uppercase tracking-wide text-ink-tertiary dark:text-ink-tertiary-dark">
          アカウント
        </Text>
        <Text className="text-[14.5px] text-ink dark:text-ink-dark">
          {user?.displayName || user?.email || 'ユーザー'}
        </Text>
        {user?.email ? (
          <Text className="text-[12.5px] text-ink-secondary dark:text-ink-secondary-dark">
            {user.email}
          </Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Text className="text-[12px] font-bold uppercase tracking-wide text-ink-tertiary dark:text-ink-tertiary-dark">
          表示テーマ
        </Text>
        {THEME_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => changeTheme(option.value)}
            className="flex-row items-center justify-between rounded-control border border-border bg-surface px-3.5 py-3 dark:border-border-dark dark:bg-surface-dark"
            style={{ minHeight: 44 }}
          >
            <Text className="text-[14px] text-ink dark:text-ink-dark">{option.label}</Text>
            {theme === option.value ? (
              <Text className="text-[14px] font-bold text-accent dark:text-accent-dark">✓</Text>
            ) : null}
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={signOut}
        className="items-center rounded-full border border-border bg-surface py-3 dark:border-border-dark dark:bg-surface-dark"
        style={{ minHeight: 44, justifyContent: 'center' }}
      >
        <Text className="text-[14px] font-semibold text-ink dark:text-ink-dark">ログアウト</Text>
      </Pressable>

      <Pressable
        onPress={confirmDeleteAccount}
        disabled={deleting}
        className="items-center rounded-full py-3"
        style={{ minHeight: 44, justifyContent: 'center', opacity: deleting ? 0.5 : 1 }}
      >
        <Text className="text-[13px] font-semibold text-danger dark:text-danger-dark">
          アカウントを削除する
        </Text>
      </Pressable>
    </ScrollView>
  );
}
