import { Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import type { Reflection } from '@/types/reflection';

import { Card } from './Card';
import { CategoryTag, PriorityPill, StatusPill } from './pills';

interface ReflectionListCardProps {
  reflection: Reflection;
  categoryName: string;
  onPress: (id: string) => void;
}

export function ReflectionListCard({ reflection, categoryName, onPress }: ReflectionListCardProps) {
  return (
    <Card onPress={() => onPress(reflection.id)}>
      <View className="flex-row items-start gap-2.5">
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.emotion[reflection.emotion - 1],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 13 }}>
            {['😞', '🙁', '😐', '🙂', '😄'][reflection.emotion - 1]}
          </Text>
        </View>
        <View className="flex-1 gap-1">
          <Text
            className="text-[13.5px] font-semibold text-ink dark:text-ink-dark"
            numberOfLines={1}
          >
            {reflection.title}
          </Text>
          <View className="flex-row flex-wrap items-center gap-1.5">
            <CategoryTag name={categoryName} />
            <StatusPill status={reflection.status} />
            {reflection.improvement ? (
              <PriorityPill priority={reflection.improvement.priority} />
            ) : null}
          </View>
        </View>
      </View>
    </Card>
  );
}
