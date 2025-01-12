// /**
//  * メディアタイプをURLパラメータで指定し、ランダムに１件取得
//  * - /api/:media_type/random
//  */
// import { Request, Response, Router } from "express";
// import { validationResult } from "express-validator";
// import { validateContentIdInQueryParam } from "../validators/contentValidators.js";
// import {
//     fetchData,
//     getMediaList,
//     resolveMediaType,
// } from "../services/mediaService.js";

// const router = Router();

// router.get(
//     "/:media_type/random/",
//     // validateContentIdInQueryParam(),
//     async (req: Request, res: Response) => {
//         // const errors = validationResult(req);
//         // if (!errors.isEmpty()) {
//         //     res.status(404).json({ error: "content_id is not found" });
//         //     return;
//         // }

//         const { media_type } = req.params;
//         const media = resolveMediaType(media_type);
//         if (!media) {
//             res.status(404).json({
//                 error:
//                     `the specified media_type(${media_type}) is not supported`,
//             });
//             return;
//         }

//         const content_id = req.query.content_id as string | undefined;
//         const elements = getMediaList(media, content_id);
//         if (elements.length === 0) {
//             res.status(404).json({
//                 error:
//                     `the specified media_type(${media_type}) does not exist.`,
//             });
//             return;
//         }

//         // ランダムに1件選択
//         const randomIndex = Math.floor(Math.random() * elements.length);
//         const picked = elements[randomIndex] as any; // { id, content_id, ... }

//         // そのIDの実データを取得
//         const data = await fetchData(picked.id);
//         if (!data) {
//             res.status(404).json({
//                 error: `Failed to fetch media data for id=${picked.id}`,
//             });
//             return;
//         }

//         res.json(data);
//     },
// );

// export default router;
