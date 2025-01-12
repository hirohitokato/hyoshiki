import { Context, Hono } from "hono";
import { appendTrailingSlash } from "hono/trailing-slash";
import { validatorForContentIdInParam } from "../validators/contentValidators.ts";
import { repository } from "../repositories/index.ts";

const router = new Hono();
router.use(appendTrailingSlash());
/**
 * GET /api/contents
 * - コンテンツのダイジェスト一覧を返す
 */
router.get("/", (c: Context) => {
  // 内容をすべてダイジェスト化し返す
  const contentsDigest = Object.entries(repository.contents).map((
    [_, content],
  ) => ({
    id: content.id,
    content_name: content.content_name,
    app_type: content.app_type,
    memo: content.memo,
  }));
  return c.json(contentsDigest);
});

/**
 * GET /api/contents/:content_id
 * - 指定したIDのコンテンツ詳細情報を返す
 */
router.get(
  "/:content_id",
  // validatorForContentIdInParam(),
  (c: Context) => {
    const { content_id } = c.req.param();
    const content = repository.contents[content_id];
    return c.json(content, 200, {
      "Content-Type": "application/json",
    });
  },
);

export default router;
