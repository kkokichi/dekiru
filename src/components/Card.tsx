import type { PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';

interface CardProps extends PropsWithChildren {
  onPress?: () => void;
  padding?: 'sm' | 'base' | 'lg';
}

const PADDING_CLASSES = { sm: 'p-sm', base: 'p-base', lg: 'p-lg' } as const;

export function Card({ children, onPress, padding = 'base' }: CardProps) {
  const className = `rounded-card border border-border bg-surface shadow-sm dark:border-border-dark dark:bg-surface-dark ${PADDING_CLASSES[padding]}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" className={className}>
        {children}
      </Pressable>
    );
  }

  return <View className={className}>{children}</View>;
}
