import { z } from 'zod';

export const emailAuthSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('メールアドレスの形式が正しくありません'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});

export type EmailAuthFormValues = z.infer<typeof emailAuthSchema>;
