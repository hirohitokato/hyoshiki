/**
 * リポジトリのインスタンスを生成し、アプリ全体で共有するためのモジュール
 */

import { ContentsRepository } from "./contentsRepository.ts";

// ContentsRepository をインスタンス化してシングルトンのように公開。
// 注意： このあと、IDataReaderのインスタンスと共に initialize(reader)を呼んで初期化すること！
export const repository = new ContentsRepository();
