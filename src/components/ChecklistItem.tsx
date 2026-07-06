import { Pressable, Text, View } from 'react-native';

interface ChecklistItemProps {
  text: string;
  done: boolean;
  onToggle: () => void;
}

export function ChecklistItem({ text, done, onToggle }: ChecklistItemProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={text}
      className="flex-row items-center gap-2.5 py-1.5"
      style={{ minHeight: 44 }}
    >
      <View
        className={`h-[18px] w-[18px] rounded-[5px] border-[1.5px] ${
          done
            ? 'border-accent bg-accent dark:border-accent-dark dark:bg-accent-dark'
            : 'border-ink-tertiary dark:border-ink-tertiary-dark'
        }`}
      />
      <Text
        className={`text-[14px] ${
          done
            ? 'text-ink-tertiary line-through dark:text-ink-tertiary-dark'
            : 'text-ink dark:text-ink-dark'
        }`}
      >
        {text}
      </Text>
    </Pressable>
  );
}
