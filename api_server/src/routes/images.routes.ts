import { Context, Hono } from "hono";
import { every } from "hono/combine";
import { cache } from "hono/cache";
import { validatorContentIdInQueryParam } from "../validators/contentValidators.ts";
import { fetchData } from "../services/mediaService.ts";
import { repository } from "../repositories/index.ts";

const router = new Hono();

/**
 * GET /api/images
 * - 画像リストを返す（content_id がクエリにあれば、そのコンテンツに紐づくものだけ）
 */
router.get(
  "/",
  every(
    validatorContentIdInQueryParam,
  ),
  (c: Context) => {
    const { content_id } = c.req.query() as { content_id?: string };
    const elements = repository.getMediaList("image", content_id);
    return c.json(elements);
  },
);

/**
 * GET /api/images/:image_id
 * - 個別の画像データを Base64化して返す
 */
router.get(
  "/:image_id",
  cache(
    {
      cacheName: "hyoshiki",
      cacheControl: "max-age=3600",
      wait: true,
    },
  ),
  async (c: Context) => {
    const { image_id } = c.req.param();
    const data = await fetchData("image", image_id);
    if (!data) {
      return c.json({ error: `Image not found` }, 404);
    }
    return c.json(data);
  },
);

export default router;
