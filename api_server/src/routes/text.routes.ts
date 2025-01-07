import { Request, Response, Router } from "express";
import { validationResult } from "express-validator";
import { validateContentIdInQueryParam } from "../validators/contentValidators.js";
import { fetchData, getMediaList } from "../services/mediaService.js";

const router = Router();

/**
 * GET /api/text
 * - テキストリストを返す（content_id がクエリにあれば、そのコンテンツに紐づくものだけ）
 */
router.get(
    "/",
    validateContentIdInQueryParam(),
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(404).json({ error: "content_id is not found" });
            return;
        }

        const { content_id } = req.query as { content_id?: string };
        const elements = getMediaList("text", content_id);
        res.json(elements);
    },
);

/**
 * GET /api/text/:text_id
 * - 個別のテキストデータを Base64化して返す
 */
router.get("/:text_id", async (req: Request, res: Response) => {
    const { text_id } = req.params;
    const data = await fetchData(text_id);
    if (!data) {
        res.status(404).json({ error: "Text not found" });
        return;
    }
    res.json(data);
});

export default router;
