import { Text, View } from 'react-native';

export function EmptyState({ message }: { message: string }) {
  return (
    <View className="items-center justify-center py-8">
      <Text className="text-center text-[13.5px] text-ink-tertiary dark:text-ink-tertiary-dark">
        {message}
      </Text>
    </View>
  );
}
