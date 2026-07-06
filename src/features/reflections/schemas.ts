import { z } from 'zod';

export const basicInfoSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルを入力してください')
    .max(80, 'タイトルは80文字以内で入力してください'),
  detail: z.string().max(1000, '詳細は1000文字以内で入力してください'),
  categoryId: z.string().min(1, 'カテゴリを選択してください'),
  emotion: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  importance: z.enum(['low', 'medium', 'high']),
  occurredAt: z.date(),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

export const improvementSchema = z.object({
  action: z
    .string()
    .min(1, '次回やることを入力してください')
    .max(200, '200文字以内で入力してください'),
  dueDate: z.date(),
  priority: z.enum(['low', 'medium', 'high']),
  checklist: z.array(z.object({ text: z.string().min(1), done: z.boolean() })),
});

export type ImprovementFormValues = z.infer<typeof improvementSchema>;
