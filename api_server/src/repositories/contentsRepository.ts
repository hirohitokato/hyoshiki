/**
 * Excelからコンテンツとメディアを読み込み、提供するリポジトリクラス
 * - 単純なデータ取得に特化させる
 */

import { Content, Media } from "./entity.ts";
import { IDataReader } from "./readers/dataReaderInterface.ts";

/**
 * ContentsRepository
 * - コンテンツとメディアを Excel ファイルから読み込む
 */
export class ContentsRepository {
  private _isInitialized = false;
  private _dataReader: IDataReader | undefined;

  private _contents: { [key: string]: Content } = {};
  public get contents(): { [key: string]: Content } {
    if (!this._isInitialized) {
      throw new Error(
        "contents is not initialized. call initialize() before using.",
      );
    }
    return this._contents;
  }

  private _media: { [key: string]: Media } = {};
  public get media(): { [key: string]: Media } {
    if (!this._isInitialized) {
      throw new Error(
        "media is not initialized. call initialize() before using.",
      );
    }
    return this._media;
  }

  constructor() {}

  /**
   * データを読み込み、_contents と _mediaを初期化
   */
  async initialize(dataReader: IDataReader) {
    const { contents, media } = await dataReader.readData();
    this._contents = contents;
    this._media = media;
    this._isInitialized = true;
  }
}
