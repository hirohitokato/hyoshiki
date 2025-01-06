import md5 from "md5";
import xlsx from "xlsx";

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
    content_id: string;
    /** メディアの種類 */
    type: "image" | "sound" | "text";
    /** ファイルパス/URL/文字列(テキスト)のいずれか */
    path_url: string;
    /** 説明。文字列(テキスト) */
    description: string;

    constructor(json: any, contents: { [key: string]: Content }) {
        this.type = json["メディアタイプ"];
        this.path_url = json["URL,ファイルパス"];
        this.description = json["説明"] ?? "";
        this.id = md5(this.type + this.path_url + this.description);

        const content_ids = Object.values(contents).filter((content) =>
            content.content_name === json["コンテンツ名"]
        );
        this.content_id = (content_ids.length > 0)
            ? content_ids[0].id
            : "";
    }
}

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
            this._contents[content.id] = content;
        }

        const media_sheet = workbook.Sheets[ContentsRepository.MEDIA_SHEETNAME];
        const media_json = xlsx.utils.sheet_to_json(media_sheet);
        for (const x of media_json) {
            const medium = new Media(x, this._contents);

            this._media[medium.id] = medium;
            this._contents[medium.content_id].media.push(medium);
        }
    }
}
