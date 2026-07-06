import { Pressable, Text, View } from 'react-native';

import { Input } from '@/components/Input';
import type { Cause } from '@/types/reflection';

const CAUSE_LABELS: Record<Cause, string> = {
  time: '時間不足',
  preparation: '準備不足',
  knowledge: '知識不足',
  judgement: '判断ミス',
  communication: 'コミュニケーション不足',
  other: 'その他',
};

const CAUSE_ORDER: Cause[] = [
  'time',
  'preparation',
  'knowledge',
  'judgement',
  'communication',
  'other',
];

interface CauseSelectorProps {
  selected: Cause[];
  onChange: (causes: Cause[]) => void;
  otherNote: string;
  onOtherNoteChange: (note: string) => void;
}

export function CauseSelector({
  selected,
  onChange,
  otherNote,
  onOtherNoteChange,
}: CauseSelectorProps) {
  const toggle = (cause: Cause) => {
    if (selected.includes(cause)) {
      onChange(selected.filter((c) => c !== cause));
    } else {
      onChange([...selected, cause]);
    }
  };

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-2">
        {CAUSE_ORDER.map((cause) => {
          const active = selected.includes(cause);
          return (
            <Pressable
              key={cause}
              onPress={() => toggle(cause)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
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
                {CAUSE_LABELS[cause]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {selected.includes('other') && (
        <Input
          label="その他の内容"
          value={otherNote}
          onChangeText={onOtherNoteChange}
          placeholder="具体的な原因を入力してください"
        />
      )}
    </View>
  );
}

export { CAUSE_LABELS };
