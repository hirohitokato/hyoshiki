import md5 from "md5";
import * as xlsx from "xlsx";

export class Content {
    /** ID */
    id: string;
    content_name: string;
    app_type: string;
    memo: string;
    media: Media[] = [];

    constructor(json: any) {
        this.content_name = json["コンテンツ名"];
        this.app_type = json["見せ方"];
        this.memo = json["備考"];
        this.id = md5(this.content_name + this.app_type).slice(0, 5);
    }
}

export class Media {
    /** ID */
    id: string;
    content_name: string;
    /** メディアの種類 */
    media_type: "image" | "sound" | "text";
    /** ファイルパス/URL/文字列(テキスト)のいずれか */
    path_url: string;
    /** 説明。文字列(テキスト) */
    description: string;

    constructor(json: any) {
        this.media_type = json["メディアタイプ"];
        this.content_name = json["コンテンツ名"];
        this.path_url = json["URL,パス"];
        this.description = json["説明"] ?? "";
        this.id = md5(this.media_type + this.path_url + this.description);
    }
}

export class ContentsRepository {
    private static CONTENTS_SHEETNAME = "コンテンツ";
    private static MEDIA_SHEETNAME = "メディア";

    private _contents: { [key: string]: Content } = {};
    public get contents(): { [key: string]: Content } {
        return this._contents;
    }

    /**
     * コンストラクタ。
     * @param filepath コンテンツファイルを格納したCSVファイルのファイルパス
     */
    constructor(private filepath: string) {
    }

    load() {
        const workbook = xlsx.readFile(this.filepath);
        const contents_sheet =
            workbook.Sheets[ContentsRepository.CONTENTS_SHEETNAME];
        const contents_json = xlsx.utils.sheet_to_json(contents_sheet);
        for (const x of contents_json) {
            const content = new Content(x);
            this._contents[content.content_name] = content;
        }

        const media_sheet = workbook.Sheets[ContentsRepository.MEDIA_SHEETNAME];
        const media_json = xlsx.utils.sheet_to_json(media_sheet);
        for (const x of media_json) {
            const medium = new Media(x);
            this._contents[medium.content_name].media.push(medium);
        }
    }
}
