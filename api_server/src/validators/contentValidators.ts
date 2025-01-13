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

/**
 * URLパスパラメータの中に正しいコンテンツIDが含まれているかどうか
 */
export const validatorForContentIdInParam = zValidator(
  "param",
  contentIdSchema,
  (result, c: Context) => {
    if (!result.success) {
      // エラー処理をカスタマイズ
      return c.json({ error: "Invalid エラー request." }, 404);
    }
  },
);

/**
 * URLクエリパラメータの中に正しいコンテンツIDが含まれているかどうか
 */
export const validatorContentIdInQueryParam = zValidator(
  "query",
  contentIdSchema,
  (result, c: Context) => {
    if (!result.success) {
      return c.text("Content ID in query parameter is not found.", 404);
    }
  },
);
