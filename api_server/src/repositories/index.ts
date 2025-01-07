/**
 * リポジトリのインスタンスを生成し、アプリ全体で共有するためのモジュール
 */

import { ContentsRepository } from "./contentsRepository.js";
import dotenv from "dotenv";

dotenv.config();

// ContentsRepository を初期化
export const repository = new ContentsRepository(
    process.env.CONTENTS_FILEPATH || "",
);

// アプリ起動時にロードを実行
repository.load();
