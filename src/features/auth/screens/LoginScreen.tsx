import { zodResolver } from '@hookform/resolvers/zod';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

import { emailAuthSchema, type EmailAuthFormValues } from '../schemas';
import {
  useAppleSignIn,
  useEmailSignIn,
  useEmailSignUp,
  useGoogleSignIn,
} from '../hooks/useAuthActions';

type Mode = 'signIn' | 'signUp';

export function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signIn');
  const googleSignIn = useGoogleSignIn();
  const appleSignIn = useAppleSignIn();
  const emailSignIn = useEmailSignIn();
  const emailSignUp = useEmailSignUp();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailAuthFormValues>({
    resolver: zodResolver(emailAuthSchema),
    defaultValues: { email: '', password: '' },
  });

  const emailMutation = mode === 'signIn' ? emailSignIn : emailSignUp;
  const onSubmitEmail = handleSubmit((values) => emailMutation.mutate(values));

  const anyError =
    googleSignIn.error || appleSignIn.error || emailSignIn.error || emailSignUp.error;

  return (
    <View className="flex-1 justify-center gap-8 bg-bg px-6 dark:bg-bg-dark">
      <View>
        <Text className="text-[32px] font-bold text-ink dark:text-ink-dark">Reflect</Text>
        <Text className="mt-2 text-[15px] text-ink-secondary dark:text-ink-secondary-dark">
          「できなかった」を「できる」に変える
        </Text>
      </View>

      <View className="gap-3">
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={999}
            style={{ width: '100%', height: 48 }}
            onPress={() => appleSignIn.mutate()}
          />
        )}
        <Button label="Googleで続ける" variant="secondary" onPress={() => googleSignIn.mutate()} />
      </View>

      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border dark:bg-border-dark" />
        <Text className="text-[12.5px] text-ink-tertiary dark:text-ink-tertiary-dark">または</Text>
        <View className="h-px flex-1 bg-border dark:bg-border-dark" />
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              label="メールアドレス"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input
              label="パスワード"
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              autoCapitalize="none"
              error={errors.password?.message}
            />
          )}
        />
        <Button
          label={mode === 'signIn' ? 'ログイン' : 'アカウントを作成'}
          onPress={onSubmitEmail}
          loading={emailMutation.isPending}
        />
        <Button
          label={
            mode === 'signIn'
              ? 'アカウントをお持ちでない方はこちら'
              : 'すでにアカウントをお持ちの方はこちら'
          }
          variant="ghost"
          onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
        />
      </View>

      {anyError ? (
        <Text className="text-center text-[13px] text-danger dark:text-danger-dark">
          {anyError instanceof Error
            ? anyError.message
            : 'ログインに失敗しました。もう一度お試しください。'}
        </Text>
      ) : null}
    </View>
  );
}
