/**
 * メディア情報の取得や加工を行うビジネスロジック層
 * - repository(データアクセス)を呼び出す
 * - fsを用いた実ファイルの読み込みなどを担当
 */

import { fileTypeFromBuffer } from "file-type";
import { repository } from "../repositories/index.ts"; // シングルトン的に使う
import { IServerResponse, MediaData, MediaType } from "../types/index.ts";
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
      console.error(error);
      return null;
    }
  }

  return responseData;
}
