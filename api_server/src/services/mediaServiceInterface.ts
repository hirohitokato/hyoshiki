import { IServerResponse, MediaData, MediaType } from "../types/index.ts";

export interface MediaService {
  /**
   * メディアIDをもとに、ファイルを読み込み、Base64化したデータを返す
   */
  fetchData(
    media_type: string,
    media_id: string,
  ): Promise<IServerResponse | null>;

  /**
   * メディア一覧を取得
   * - type で絞り込み
   * - content_id が指定されていれば、そのコンテンツに紐づくメディアのみを返す
   */
  getMediaList(
    type: MediaType,
    content_id?: string,
  ): MediaData[];
}

/**
 * URLのパラメータ "/api/:media_type" に応じて、内部で扱うメディアタイプを判定
 */
export function resolveMediaType(
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
