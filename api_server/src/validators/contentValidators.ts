/**
 * express-validatorを使ったバリデーションロジック集
 * - repositoryを参照し、実在するIDかチェックするなど
 */
import { Context } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { repository } from "../repositories/index.ts";

export const contentIdSchema = z.object({
  content_id: z.string().refine(
    (id) => id in repository.contents,
  ),
});

export const validatorForContentIdInParam = () => {
  const validator = zValidator("param", contentIdSchema);
  return async (c: Context, next: () => Promise<void>) => {
    let error: Error | null = null;
    const result = await validator(c);
    // zValidator を実行
    if (result && !result.ok) {
      // エラー処理をカスタマイズ
      return c.text("Invalid request.", 404);
    }
    return next(); // 次のミドルウェアに進む
  };
};
// export const validatorForContentIdInParam = zValidator(
//   "param",
//   contentIdSchema,
//   (result, c) => {
//     if (!result.success) {
//       return c.text("Content ID is not found.", 404);
//     }
//   },
// );

export const validatorContentIdInQueryParam = zValidator(
  "query",
  contentIdSchema,
  (result, c) => {
    if (!result.success) {
      return c.text("Content ID in query parameter is not found.", 404);
    }
  },
);
