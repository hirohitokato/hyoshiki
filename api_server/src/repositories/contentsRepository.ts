/**
 * Excelからコンテンツとメディアを読み込み、提供するリポジトリクラス
 * - 単純なデータ取得に特化させる
 */

import { MediaData, MediaType } from "../types/index.ts";
import { Content, Media } from "./entity.ts";
import { ContentReader } from "./readers/contentReader.ts";

/**
 * ContentsRepository
 * - コンテンツとメディアを Excel ファイルから読み込む
 */
export class ContentsRepository {
  private _isInitialized = false;
  private _dataReader: ContentReader | undefined;

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
  async initialize(dataReader: ContentReader) {
    const { contents, media } = await dataReader.readData();
    this._contents = contents;
    this._media = media;
    this._isInitialized = true;
  }

  /**
   * メディア一覧を取得
   * - type で絞り込み
   * - content_id が指定されていれば、そのコンテンツに紐づくメディアのみを返す
   */
  getMediaList(
    type: MediaType,
    content_id?: string,
  ): MediaData[] {
    return Object.entries(this._media)
      .filter(([_, media]) => media.type === type)
      .filter(([_, media]) => {
        // content_id が指定されていれば、そのコンテンツのメディアに限定
        if (!content_id) {
          return true;
        } else {
          return media.content_id === content_id;
        }
      })
      .map(([_, media]) => {
        return {
          id: media.id,
          content_id: media.content_id,
          type: media.type,
          description: media.description || "",
        };
      });
  }

  /**
   * URLのパラメータ "/api/:media_type" に応じて、内部で扱うメディアタイプを判定
   */
  resolveMediaType(
    urlParam: string,
  ): "image" | "text" | "sound" | undefined {
    switch (urlParam) {
      case "images":
        return "image";
      case "text":
        return "text";
      case "sounds":
        return "sound";
      default:
        return undefined;
    }
  }
}
