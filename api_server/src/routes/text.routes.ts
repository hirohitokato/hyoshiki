import { Context, Hono } from "hono";
import { validatorContentIdInQueryParam } from "../validators/contentValidators.ts";
import { fetchData } from "../services/mediaService.ts";
import { repository } from "../repositories/index.ts";

const router = new Hono();

/**
 * GET /api/text
 * - テキストリストを返す（content_id がクエリにあれば、そのコンテンツに紐づくものだけ）
 */
router.get(
  "/",
  validatorContentIdInQueryParam,
  (c: Context) => {
    const { content_id } = c.req.query() as { content_id?: string };
    const elements = repository.getMediaList("text", content_id);
    return c.json(elements);
  },
);

/**
 * GET /api/text/:text_id
 * - 個別のテキストデータを Base64化して返す
 */
router.get("/:text_id", async (c: Context) => {
  const { text_id } = c.req.param();
  const data = await fetchData("text", text_id);
  if (!data) {
    return c.json({ error: `Text not found` }, 404);
  }
  return c.json(data);
});

export default router;
