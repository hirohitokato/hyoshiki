/**
 * メディアタイプをURLパラメータで指定し、ランダムに１件取得
 * - /api/:media_type/random
 */
import { Context, Hono } from "hono";
import { validatorContentIdInQueryParam } from "../validators/contentValidators.ts";
import { fetchData } from "../services/mediaService.ts";
import { repository } from "../repositories/index.ts";

const router = new Hono();

router.get(
  "/:media_type/random",
  validatorContentIdInQueryParam,
  async (c: Context) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     res.status(404).json({ error: "content_id is not found" });
    //     return;
    // }

    const { media_type } = c.req.param();
    const media = repository.resolveMediaType(media_type);
    if (!media) {
      return c.json({
        error: `the specified media_type(${media_type}) is not supported`,
      }, 404);
    }

    const content_id = c.req.query().content_id as string | undefined;
    const elements = repository.getMediaList(media, content_id);
    if (elements.length === 0) {
      return c.json({
        error: `the specified media_type(${media_type}) does not exist.`,
      }, 404);
    }

    // ランダムに1件選択
    const randomIndex = Math.floor(Math.random() * elements.length);
    const picked = elements[randomIndex];

    // そのIDの実データを取得
    const data = await fetchData(media, picked.id);
    if (!data) {
      return c.json({
        error: `Failed to fetch media data for id=${picked.id}`,
      }, 404);
    }

    return c.json(data);
  },
);

export default router;
