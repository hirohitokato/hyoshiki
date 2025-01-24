import { Content, Media } from "../entity.ts";

export interface ContentReader {
  readData(): Promise<{
    media: { [key: string]: Media };
    contents: { [key: string]: Content };
  }>;
}
