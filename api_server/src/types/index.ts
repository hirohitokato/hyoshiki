/**
 * プロジェクト全体で用いる型定義
 */

/**
 * コンテンツを表すインターフェース
 */
export interface IContent {
    id: string;
    content_name: string;
    app_type?: string;
    memo?: string;
    media: IMedia[];
}

/**
 * メディア（画像・テキスト・サウンド等）を表すインターフェース
 */
export interface IMedia {
    id: string;
    content_id: string;
    type: MediaType;
    path_url: string;
    description?: string;
}

/**
 * fetchDataで返すサーバレスポンス用インターフェース
 */
export interface IServerResponse {
    id: string;
    media_type: string;
    mime_type: string;
    date_time: number;
    data: string;
    description: string;
}

export type MediaType = "image" | "text" | "sound";