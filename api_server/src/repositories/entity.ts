import { IContent, IMedia } from "../types/index.ts";
import hash from "object-hash";

/**
 * Contentクラス
 * - Excel行から生成される
 */
export class Content implements IContent {
  id: string = "";
  content_name: string;
  app_type?: string;
  memo?: string;
  media: Media[] = [];

  constructor(json: any) {
    this.content_name = json["コンテンツ名"];
    this.app_type = json["見せ方"];
    this.memo = json["備考"];
    // IDはあとから作成
    this.id = hash(this.content_name + (this.app_type ?? "")).slice(0, 10);
  }
}

/**
 * Mediaクラス
 * - Excel行から生成される
 */
export class Media implements IMedia {
  id: string = "";
  content_id: string;
  type: "image" | "sound" | "text";
  path_url: string;
  description?: string;

  constructor(json: any, contents: { [key: string]: Content }) {
    this.type = json["メディアタイプ"];
    this.path_url = json["URL,ファイルパス"];
    this.description = json["説明"] ?? "";

    // メディアが所属するcontent_idを特定
    const matched = Object.values(contents).find(
      (c) => c.content_name === json["コンテンツ名"],
    );
    this.content_id = matched ? matched.id : "";

    // IDは type + path_url + description からmd5で生成
    this.id = hash(this.type + this.path_url + this.description);
  }
}
