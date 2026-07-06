import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent dark:bg-accent-dark',
  secondary: 'bg-surface-sunken dark:bg-surface-sunken-dark',
  ghost: 'bg-transparent',
  danger: 'bg-danger dark:bg-danger-dark',
};

const VARIANT_TEXT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-ink dark:text-ink-dark',
  ghost: 'text-accent dark:text-accent-dark',
  danger: 'text-white',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
      className={`items-center justify-center rounded-full px-6 py-3.5 ${VARIANT_CLASSES[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${isDisabled ? 'opacity-50' : ''}`}
      style={{ minHeight: 44 }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#2f6f4e'}
        />
      ) : (
        <Text className={`text-[14.5px] font-semibold ${VARIANT_TEXT_CLASSES[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
