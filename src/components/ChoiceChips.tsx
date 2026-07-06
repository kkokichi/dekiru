import { Pressable, Text, View } from 'react-native';

interface ChoiceChipsProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}

export function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: ChoiceChipsProps<T>) {
  return (
    <View className="gap-1.5">
      <Text className="text-[12.5px] font-semibold text-ink-secondary dark:text-ink-secondary-dark">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              className={`rounded-full border px-3.5 py-2 ${
                active
                  ? 'border-accent bg-accent-soft dark:border-accent-dark dark:bg-accent-soft-dark'
                  : 'border-border bg-surface dark:border-border-dark dark:bg-surface-dark'
              }`}
              style={{ minHeight: 44, justifyContent: 'center' }}
            >
              <Text
                className={`text-[13px] font-medium ${
                  active
                    ? 'text-accent-strong dark:text-accent-strong-dark'
                    : 'text-ink-secondary dark:text-ink-secondary-dark'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
