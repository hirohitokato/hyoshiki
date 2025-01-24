import { Content, Media } from "../entity.ts";
import { ContentReader } from "./dataReaderInterface.ts";
import { readFileSync, utils } from "xlsx";

export class ExcelReader implements ContentReader {
  private static CONTENTS_SHEETNAME = "コンテンツ";
  private static MEDIA_SHEETNAME = "メディア";

  constructor(private filepath: string) {}

  async readData(): Promise<{
    media: { [key: string]: Media };
    contents: { [key: string]: Content };
  }> {
    const workbook = readFileSync(this.filepath);
    // コンテンツシート
    const contents_sheet = workbook.Sheets[ExcelReader.CONTENTS_SHEETNAME];
    const contents_json = utils.sheet_to_json(contents_sheet);

    const contents: { [key: string]: Content } = {};
    const media: { [key: string]: Media } = {};

    for (const item of contents_json) {
      const content = new Content(item);
      contents[content.id] = content;
    }

    // メディアシート
    const media_sheet = workbook.Sheets[ExcelReader.MEDIA_SHEETNAME];
    const media_json = utils.sheet_to_json(media_sheet);

    for (const item of media_json) {
      const medium = new Media(item, contents);
      // リポジトリに格納
      media[medium.id] = medium;
      // コンテンツにも紐づける
      const targetContent = contents[medium.content_id];
      if (targetContent) {
        targetContent.media.push(medium);
      }
    }

    return { contents, media };
  }
}
