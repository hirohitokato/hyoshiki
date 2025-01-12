/**
 * リポジトリのインスタンスを生成し、アプリ全体で共有するためのモジュール
 */

import { load } from "https://deno.land/std/dotenv/mod.ts";
import { ContentsRepository } from "./contentsRepository.ts";

await load({ export: true });

// ContentsRepository を初期化
export const repository = new ContentsRepository(
  Deno.env.get("CONTENTS_FILEPATH") || "",
);

// アプリ起動時にロードを実行
await repository.load();
