import { Context, Hono } from "hono";
import { validatorContentIdInQueryParam } from "../validators/contentValidators.ts";
import { fetchData, getMediaList } from "../services/mediaService.ts";

const router = new Hono();

/**
 * GET /api/sounds
 * - サウンドリストを返す（content_id がクエリにあれば、そのコンテンツに紐づくものだけ）
 */
router.get(
  "/",
  validatorContentIdInQueryParam,
  (c: Context) => {
    const { content_id } = c.req.query() as { content_id?: string };
    const elements = getMediaList("sound", content_id);
    return c.json(elements);
  },
);

/**
 * GET /api/sounds/:sound_id
 * - 個別のサウンドデータを Base64化して返す
 */
router.get("/:sound_id", async (c: Context) => {
  const { sound_id } = c.req.param();
  const data = await fetchData("sound", sound_id);
  if (!data) {
    return c.json({ error: `Sound not found` }, 404);
  }
  return c.json(data);
});
export default router;
