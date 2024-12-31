import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { Content, ContentsRepository } from "./file_loader";

// アプリケーションで動作するようにdotenvを設定する
dotenv.config();
const app = express();

const PORT = process.env.PORT;

const loader = new ContentsRepository(process.env.CONTENTS_FILEPATH as string);
loader.load();

// Routes
app.get(
  "/api/contents/:content_id",
  (request: Request, response: Response) => {
    const { content_id } = request.params;

    const content = loader.contents[content_id];
    if (content) {
      response.json(content);
    } else {
      response.status(404).json({ error: "Content not found" });
    }
  },
);

app.get(
  "/api/contents",
  (request: Request, response: Response) => {
    const contents_digest = Object.entries(loader.contents)
      .map(([key, value]) => {
        return {
          id: value.id,
          content_name: value.content_name,
          app_type: value.app_type,
          memo: value.memo,
        };
      });
    response.json(contents_digest);
  },
);

app.get("/api/images/:image_id", (request: Request, response: Response) => {
  const { image_id } = request.params;
  const { content_id } = request.query; // optional
  console.log(`content_id::: ${content_id}`);
  // response.json(images[image_id]);
});

app.get("/api/text/:text_id", (request: Request, response: Response) => {
  const { text_id } = request.params;
  const { content_id } = request.query; // optional
});

app.get("/api/sound/:sound_id", (request: Request, response: Response) => {
  const { sound_id } = request.params;
  const { content_id } = request.query; // optional
});

app.listen(PORT, () => {
  console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
  // エラーの処理
  throw new Error(error.message);
});
