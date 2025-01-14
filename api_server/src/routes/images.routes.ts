import { Context, Hono } from "hono";
import { validatorContentIdInQueryParam } from "../validators/contentValidators.ts";
import { fetchData, getMediaList } from "../services/mediaService.ts";

const router = new Hono();

/**
 * GET /api/images
 * - 画像リストを返す（content_id がクエリにあれば、そのコンテンツに紐づくものだけ）
 */
router.get(
  "/",
  validatorContentIdInQueryParam,
  (c: Context) => {
    const { content_id } = c.req.query() as { content_id?: string };
    const elements = getMediaList("image", content_id);
    return c.json(elements);
  },
);

// /**
//  * GET /api/images/:image_id
//  * - 個別の画像データを Base64化して返す
//  */
// router.get("/:image_id", async (req: Request, res: Response) => {
//   const { image_id } = req.params;
//   const data = await fetchData(image_id);
//   if (!data) {
//     res.status(404).json({ error: `Image aaaa not found` });
//     return;
//   }
//   res.json(data);
// });

export default router;
