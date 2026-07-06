import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/Button';
import { CauseSelector } from '@/features/reflections/components/CauseSelector';
import type { Cause } from '@/types/reflection';

interface Step2Props {
  defaultCauses: Cause[];
  defaultNote: string;
  onSubmit: (causes: Cause[], note: string) => void;
  submitting: boolean;
}

export function Step2Causes({ defaultCauses, defaultNote, onSubmit, submitting }: Step2Props) {
  const [causes, setCauses] = useState<Cause[]>(defaultCauses);
  const [note, setNote] = useState(defaultNote);
  const canSubmit = causes.length > 0;

  return (
    <ScrollView
      contentContainerStyle={{ gap: 20, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-[13.5px] text-ink-secondary dark:text-ink-secondary-dark">
        あてはまる原因を選んでください（複数選択可）
      </Text>
      <CauseSelector
        selected={causes}
        onChange={setCauses}
        otherNote={note}
        onOtherNoteChange={setNote}
      />
      <Button
        label="次へ（AIに相談する）"
        onPress={() => onSubmit(causes, note)}
        disabled={!canSubmit}
        loading={submitting}
      />
    </ScrollView>
  );
}
