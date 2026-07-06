import { Pressable, Text, View } from 'react-native';

import { colors } from '@/constants/theme';

interface EmotionPickerProps {
  value: 1 | 2 | 3 | 4 | 5 | null;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
}

const EMOJI = ['😞', '🙁', '😐', '🙂', '😄'] as const;
const LABELS = ['とても悪い', '悪い', 'ふつう', '良い', 'とても良い'] as const;

export function EmotionPicker({ value, onChange }: EmotionPickerProps) {
  return (
    <View className="flex-row gap-2.5">
      {EMOJI.map((emoji, index) => {
        const level = (index + 1) as 1 | 2 | 3 | 4 | 5;
        const selected = value === level;
        return (
          <Pressable
            key={level}
            onPress={() => onChange(level)}
            accessibilityRole="radio"
            accessibilityLabel={LABELS[index]}
            accessibilityState={{ selected }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.emotion[index],
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: selected ? 2 : 0,
              borderColor: '#1c1f1a',
            }}
          >
            <Text style={{ fontSize: 18 }}>{emoji}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
