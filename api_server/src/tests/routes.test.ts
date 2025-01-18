// tests/routes.test.ts
import { Hono } from "hono";
import {
  assertEquals,
  assertExists,
  assertNotEquals,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";

// メインの registerRoutes 関数をインポート
import { registerRoutes } from "../routes/index.ts";

// 必要に応じてモックしたいサービスやリポジトリをインポート(ここでは例示のみ)
import * as mediaService from "../services/mediaService.ts";
import { repository } from "../repositories/index.ts";
import { IDataReader } from "../repositories/readers/dataReaderInterface.ts";
import { Content, Media } from "../repositories/entity.ts";

/**
 * Hono アプリケーションを毎回作成しなおすテストセットアップ関数
 */
function createTestApp() {
  const app = new Hono();
  registerRoutes(app);
  return app;
}

class DummyReader implements IDataReader {
  async readData(): Promise<
    { media: { [key: string]: Media }; contents: { [key: string]: Content } }
  > {
    const contents = {
      "content_1": new Content({
        "コンテンツ名": "content_1",
        "見せ方": "app",
        "備考": "memo 1",
      }),
      "content_2": new Content({
        "コンテンツ名": "content_2",
        "見せ方": "app",
        "備考": "memo 2",
      }),
    };
    Object.entries(contents).forEach(([key, content]) => {
      content.id = key;
    });
    const media = {
      "media_1": new Media({
        "メディアタイプ": "image",
        "コンテンツ名": "content_1",
        "URL,ファイルパス": "file://foo",
        "説明": "abcde",
      }, contents),
      "media_2": new Media({
        "メディアタイプ": "image",
        "コンテンツ名": "content_2",
        "URL,ファイルパス": "file://bar",
        "説明": "abcdef",
      }, contents),
      "media_3": new Media({
        "メディアタイプ": "text",
        "コンテンツ名": "content_1",
        "URL,ファイルパス": "file://foo",
        "説明": "hello,hello",
      }, contents),
      "media_4": new Media({
        "メディアタイプ": "image",
        "コンテンツ名": "content_1",
        "URL,ファイルパス": "file://foobar",
        "説明": "",
      }, contents),
    };
    return { media, contents };
  }
}

/**
 * Repository や Service のモック設定例
 * - 実際はテストケースごとに書き換えることが多い
 * - ここでは「常に固定のデータを返す」などの設定をしています
 */
async function setupMock() {
  // repository のモック例
  const reader = new DummyReader();
  await repository.initialize(reader);
}

Deno.test("GET /api/contents - コンテンツのダイジェスト一覧取得", async () => {
  await setupMock();
  const app = createTestApp();

  // テスト用リクエストを発行
  const req = new Request("http://localhost/api/contents", {
    method: "GET",
  });
  const res = await app.request(req);
  const json = await res.json();

  // アサーション
  assertEquals(res.status, 200);
  // モックに設定した2つのコンテンツが返ってくる想定
  assertEquals(json.length, 2);
  assertEquals(json[0].content_name, "content_1");
  assertEquals(json[1].content_name, "content_2");
});

Deno.test("GET /api/contents/:content_id - 存在しない content_id (異常系)", async () => {
  await setupMock();
  const app = createTestApp();

  const req = new Request("http://localhost/api/contents/not_found_id", {
    method: "GET",
  });
  const res = await app.request(req);

  const json = await res.json();
  assertEquals(res.status, 404);
  assertNotEquals(json, undefined); // 実際には 404 を期待するなら書き換えが必要
});

Deno.test("GET /api/images - 画像リスト取得（content_id クエリパラメータ無し）", async () => {
  await setupMock();
  const app = createTestApp();

  const req = new Request(
    "http://localhost/api/images",
    {
      method: "GET",
    },
  );
  const res = await app.request(req);
  const json = await res.json();

  assertEquals(res.status, 200);
  // モックでは2つの画像を返す想定(テキストを含まないので4-1=3)
  assertEquals(json.length, 3);
});

Deno.test("GET /api/images?content_id=content_1 - 画像リスト取得（content_id 有り）", async () => {
  await setupMock();
  const app = createTestApp();

  const req = new Request("http://localhost/api/images?content_id=content_1", {
    method: "GET",
  });
  const res = await app.request(req);
  const json = await res.json();

  assertEquals(res.status, 200);
  // モックでは content_1 に紐づく 2つの画像を返す想定
  assertEquals(json.length, 2);
  assertExists(json[0].id);
});

Deno.test("GET /api/images/:image_id - 画像の個別データ取得 (正常系)", async () => {
  await setupMock();
  const app = createTestApp();

  const req = new Request("http://localhost/api/images/test_image_id", {
    method: "GET",
  });
  const res = await app.request(req);
  const json = await res.json();

  assertEquals(res.status, 200);
  assertEquals(json.id, "test_image_id");
  assertEquals(json.data, "BASE64_ENCODED_DUMMY_DATA");
});

Deno.test("GET /api/images/:image_id - 存在しない画像ID (異常系)", async () => {
  await setupMock();
  //   // fetchData を変更して「データが存在しない場合は null を返す」ようにする
  //   (mediaService.fetchData as any) = async (mediaType: string, id: string) => {
  //     // 何も返さない => null
  //     return null;
  //   };

  const app = createTestApp();

  const req = new Request("http://localhost/api/images/not_found_id", {
    method: "GET",
  });
  const res = await app.request(req);
  const json = await res.json();

  assertEquals(res.status, 404);
  assertEquals(json.error, "Image not found");
});
