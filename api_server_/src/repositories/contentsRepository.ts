/**
 * Excelからコンテンツとメディアを読み込み、提供するリポジトリクラス
 * - 単純なデータ取得に特化させる
 */

import md5 from "md5";
import xlsx from "xlsx";
import { IContent, IMedia } from "../types/index.js";

/**
 * Contentクラス
 * - Excel行から生成される
 */
export class Content implements IContent {
    id: string;
    content_name: string;
    app_type?: string;
    memo?: string;
    media: Media[] = [];

    constructor(json: any) {
        this.content_name = json["コンテンツ名"];
        this.app_type = json["見せ方"];
        this.memo = json["備考"];
        // IDは名称 + 見せ方 から一意になるようにmd5で生成
        this.id = md5(this.content_name + (this.app_type ?? "")).slice(0, 5);
    }
}

/**
 * Mediaクラス
 * - Excel行から生成される
 */
export class Media implements IMedia {
    id: string;
    content_id: string;
    type: "image" | "sound" | "text";
    path_url: string;
    description?: string;

    constructor(json: any, contents: { [key: string]: Content }) {
        this.type = json["メディアタイプ"];
        this.path_url = json["URL,ファイルパス"];
        this.description = json["説明"] ?? "";
        // IDは type + path_url + description からmd5で生成
        this.id = md5(this.type + this.path_url + this.description);

        // メディアが所属するcontent_idを特定
        const matched = Object.values(contents).find(
            (c) => c.content_name === json["コンテンツ名"],
        );
        this.content_id = matched ? matched.id : "";
    }
}

/**
 * ContentsRepository
 * - コンテンツとメディアを Excel ファイルから読み込む
 */
export class ContentsRepository {
    private static CONTENTS_SHEETNAME = "コンテンツ";
    private static MEDIA_SHEETNAME = "メディア";

    private _contents: { [key: string]: Content } = {};
    public get contents(): { [key: string]: Content } {
        return this._contents;
    }

    private _media: { [key: string]: Media } = {};
    public get media(): { [key: string]: Media } {
        return this._media;
    }

    constructor(private filepath: string) {}

    /**
     * Excelファイルを読み込み、_contents と _mediaを初期化
     */
    load() {
        const workbook = xlsx.readFile(this.filepath);
        // コンテンツシート
        const contents_sheet =
            workbook.Sheets[ContentsRepository.CONTENTS_SHEETNAME];
        const contents_json = xlsx.utils.sheet_to_json(contents_sheet);

        for (const item of contents_json) {
            const content = new Content(item);
            this._contents[content.id] = content;
        }

        // メディアシート
        const media_sheet = workbook.Sheets[ContentsRepository.MEDIA_SHEETNAME];
        const media_json = xlsx.utils.sheet_to_json(media_sheet);

        for (const item of media_json) {
            const medium = new Media(item, this._contents);
            // リポジトリに格納
            this._media[medium.id] = medium;
            // コンテンツにも紐づける
            const targetContent = this._contents[medium.content_id];
            if (targetContent) {
                targetContent.media.push(medium);
            }
        }
    }
}
