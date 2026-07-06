import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface DateFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'datetime';
}

function formatDate(date: Date, mode: 'date' | 'datetime') {
  const datePart = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  if (mode === 'date') return datePart;
  const timePart = date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} ${timePart}`;
}

export function DateField({ label, value, onChange, mode = 'date' }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="text-[12.5px] font-semibold text-ink-secondary dark:text-ink-secondary-dark">
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatDate(value, mode)}`}
        className="rounded-control border border-border bg-surface-sunken px-3.5 py-3 dark:border-border-dark dark:bg-surface-sunken-dark"
        style={{ minHeight: 44, justifyContent: 'center' }}
      >
        <Text className="text-[14.5px] text-ink dark:text-ink-dark">{formatDate(value, mode)}</Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={value}
          mode={mode}
          onChange={(_event, selected) => {
            setOpen(false);
            if (selected) onChange(selected);
          }}
        />
      )}
    </View>
  );
}
