// import { Request, Response, Router } from "express";
// import { validationResult } from "express-validator";
// import { validateContentIdInQueryParam } from "../validators/contentValidators.js";
// import { fetchData, getMediaList } from "../services/mediaService.js";

// const router = Router();

// /**
//  * GET /api/sounds
//  * - サウンドリストを返す（content_id がクエリにあれば、そのコンテンツに紐づくものだけ）
//  */
// router.get(
//     "/",
//     validateContentIdInQueryParam(),
//     (req: Request, res: Response) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             res.status(404).json({ error: "content_id is not found" });
//             return;
//         }

//         const { content_id } = req.query as { content_id?: string };
//         const elements = getMediaList("sound", content_id);
//         res.json(elements);
//     },
// );

// /**
//  * GET /api/sounds/:sound_id
//  * - 個別のサウンドデータを Base64化して返す
//  */
// router.get("/:sound_id", async (req: Request, res: Response) => {
//     const { sound_id } = req.params;
//     const data = await fetchData(sound_id);
//     if (!data) {
//         res.status(404).json({ error: "Sound not found" });
//         return;
//     }
//     res.json(data);
// });

// export default router;
