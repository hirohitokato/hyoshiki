import { Request, Response, Router } from "express";
import { validationResult } from "express-validator";
import { validateContentIdInParam } from "../validators/contentValidators.js";
import { repository } from "../repositories/index.js";

const router = Router();

/**
 * GET /api/contents
 * - コンテンツのダイジェスト一覧を返す
 */
router.get("/", (req: Request, res: Response) => {
    // 内容をすべてダイジェスト化し返す
    const contentsDigest = Object.entries(repository.contents).map((
        [_, c],
    ) => ({
        id: c.id,
        content_name: c.content_name,
        app_type: c.app_type,
        memo: c.memo,
    }));
    res.json(contentsDigest);
});

/**
 * GET /api/contents/:content_id
 * - 指定したIDのコンテンツ詳細情報を返す
 */
router.get(
    "/:content_id",
    validateContentIdInParam(),
    (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // バリデーションエラー（content_idが無効）
            res.status(404).json({
                error: "content_id is invalid or not found",
            });
            return;
        }
        const { content_id } = req.params;
        const content = repository.contents[content_id];
        if (!content) {
            res.status(404).json({ error: "Content not found" });
            return;
        }
        res.json(content);
        return;
    },
);

export default router;
