/**
 * アプリケーションのエントリーポイント
 * - ポート設定やCORS、各種ルーティング設定などを行う
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { registerRoutes } from "./routes/index.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";
import { repository } from "./repositories/index.ts";

// Honoアプリを生成
const app = new Hono({ strict: false });

await load({ export: true });

// CORS設定（必要に応じて調整）
app.use(cors({
  origin: "http://localhost:5173",
  allowMethods: ["GET", "POST"],
  credentials: true,
}));

// ルーティングを登録
registerRoutes(app);

// ポート設定
const PORT = Deno.env.get("PORT") || 8080;

// サーバー起動
Deno.serve(app.fetch, {
  hostname: "localhost",
  port: PORT,
});
