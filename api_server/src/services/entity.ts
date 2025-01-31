import { MediaType } from "../types/index.ts";

/**
 * getMediaList()が返すデータ型
 */
export interface MediaData {
  id: string;
  content_id: string;
  type: MediaType;
  description?: string;
}
