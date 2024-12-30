import express, { Request, Response } from "express";
import dotenv from "dotenv";

const contents: {
  [key: string]: { id: number; title: string; description: string };
} = {
  "1": { id: 1, title: "Content 1", description: "Description of Content 1" },
  "2": { id: 2, title: "Content 2", description: "Description of Content 2" },
};
const images: {
  [key: string]: string;
} = {
  "1": "Image 1 for Content 1",
  "2": "Image 2 for Content 1",
  "3": "Image 1 for Content 2",
};

const texts: {
  [key: string]: string;
} = {
  "1": "Text 1 for Content 1",
  "2": "Text 2 for Content 1",
  "3": "Text 1 for Content 2",
};
const bgms = {
  "1": { 1: "BGM 1 for Content 1" },
  "2": { 1: "BGM 1 for Content 2" },
};

// アプリケーションで動作するようにdotenvを設定する
dotenv.config();
const app = express();

const PORT = process.env.PORT;

// Routes
app.get("/api/contents/:content_id", (request: Request, response: Response) => {
  const { content_id } = request.params;
  const content = contents[content_id];
  if (content) {
    response.json(content);
  } else {
    response.status(404).json({ error: "Content not found" });
  }
});
app.get("/api/images/:image_id", (request: Request, response: Response) => {
  const { image_id } = request.params;
  response.json(images[image_id]);
});
app.get("/api/text/:text_id", (request: Request, response: Response) => {
  const { text_id } = request.params;
});
app.get("/", (request: Request, response: Response) => {
});

app.listen(PORT, () => {
  console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
  // エラーの処理
  throw new Error(error.message);
});
