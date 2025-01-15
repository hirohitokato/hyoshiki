/**
 * メディア情報の取得や加工を行うビジネスロジック層
 * - repository(データアクセス)を呼び出す
 * - fsを用いた実ファイルの読み込みなどを担当
 */

import { fileTypeFromBuffer } from "file-type";
import { repository } from "../repositories/index.ts"; // シングルトン的に使う
import { IServerResponse, MediaType } from "../types/index.ts";
import * as base64 from "base64";

/**
 * メディアIDをもとに、ファイルを読み込み、Base64化したデータを返す
 */
export async function fetchData(
  media_type: string,
  media_id: string,
): Promise<IServerResponse | null> {
  const medium = repository.media[media_id];
  if (!medium || medium.type !== media_type) {
    return null;
  }

  const responseData: IServerResponse = {
    id: medium.id,
    media_type: medium.type, // "image" | "text" | "sound"
    mime_type: "unknown",
    date_time: Date.now(),
    description: medium.description || "",
    data: "",
  };

  if (medium.path_url) {
    try {
      const fileBuffer = await Deno.readFile(medium.path_url);
      const filetype = await fileTypeFromBuffer(fileBuffer);
      // MIMEタイプを特定
      responseData.mime_type = filetype ? filetype.mime : "unknown";
      // Base64に変換
      responseData.data = base64.fromUint8Array(fileBuffer) ?? null;
    } catch (error) {
      // ファイルが読めなかった場合は null を返す
      return null;
    }
  }

  return responseData;
}

/**
 * メディア一覧を取得
 * - type で絞り込み
 * - content_id が指定されていれば、そのコンテンツに紐づくメディアのみを返す
 */
export function getMediaList(
  type: MediaType,
  content_id?: string,
): object[] {
  return Object.entries(repository.media)
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
