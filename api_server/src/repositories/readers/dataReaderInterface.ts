import { Content, Media } from "../entity.ts";

export interface IDataReader {
  readData(): Promise<{
    media: { [key: string]: Media };
    contents: { [key: string]: Content };
  }>;
}
