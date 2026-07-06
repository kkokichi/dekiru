import { Text, TextInput, type TextInputProps, View } from 'react-native';

interface InputProps extends Pick<
  TextInputProps,
  'placeholder' | 'multiline' | 'maxLength' | 'secureTextEntry' | 'keyboardType' | 'autoCapitalize'
> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export function Input({ label, value, onChangeText, error, ...rest }: InputProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-[12.5px] font-semibold text-ink-secondary dark:text-ink-secondary-dark">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={label}
        placeholderTextColor="#9a9f92"
        className="rounded-control border border-border bg-surface-sunken px-3.5 py-3 text-[14.5px] text-ink dark:border-border-dark dark:bg-surface-sunken-dark dark:text-ink-dark"
        {...rest}
      />
      {error ? (
        <Text className="text-[12px] text-danger dark:text-danger-dark">{error}</Text>
      ) : null}
    </View>
  );
}
