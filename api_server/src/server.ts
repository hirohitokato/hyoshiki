/**
 * アプリケーションのエントリーポイント
 * - ポート設定やCORS、各種ルーティング設定などを行う
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./routes/index.js";

// 環境変数の読み込み
dotenv.config();

// Expressアプリを生成
const app = express();

// CORS設定（必要に応じて調整）
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));

// ルーティングを登録
registerRoutes(app);

// ポート設定
const PORT = process.env.PORT || 8080;

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}).on("error", (error: any) => {
    throw new Error(error.message);
});
