// import { Context, Hono } from "hono";
// import { validationResult } from "express-validator";
// import { validateContentIdInQueryParam } from "../validators/contentValidators.js";
// import { fetchData, getMediaList } from "../services/mediaService.js";

// const router = Router();

// /**
//  * GET /api/images
//  * - 画像リストを返す（content_id がクエリにあれば、そのコンテンツに紐づくものだけ）
//  */
// router.get(
//   "/",
//   validateContentIdInQueryParam(),
//   (req: Request, res: Response, next: NextFunction) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       res.status(404).json({ error: "content_id is not found" });
//       return;
//     }

//     const { content_id } = req.query as { content_id?: string };
//     const elements = getMediaList("image", content_id);
//     res.json(elements);
//   },
// );

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

// export default router;
