import express, { Request, Response } from "express";
import { param, query, validationResult } from "express-validator";
import dotenv from "dotenv";
import { Content, ContentsRepository } from "./contents_repository";
import fs from "fs";

// アプリケーションで動作するようにdotenvを設定する
dotenv.config();
const app = express();

const PORT = process.env.PORT;

const repository = new ContentsRepository(process.env.CONTENTS_FILEPATH as string);
repository.load();

function validateContentIdInParam() {
  return [
    param("content_id")
      .isString()
      .withMessage("content id must be a string")
      .custom((id) => {
        if (!(id in repository.contents)) {
          throw new Error("content id does not exist in repository");
        }
        return true;
      }),
  ];
}

function validateContentIdInQueryParam() {
  return [
    query("content_id")
      .optional()
      .isString()
      .withMessage("content_id must be a string")
      .custom((id) => {
        if (!(id in repository.contents)) {
          throw new Error("content_id does not exist in repository");
        }
        return true;
      }),
  ];
}

function sendFile(request: Request, response: Response, media_id: string) {
  const medium = repository.media[media_id];
  if (medium) {
    const filepath = medium.path_url;
    fs.access(filepath, fs.constants.F_OK, (err) => {
      if (err) {
        return response.status(404).json({ error: "File not found" });
      }

      // ファイルを読み込んで返す
      response.sendFile(filepath, (err) => {
        if (err) {
          response.status(500).json({ error: "Error sending the file" });
        }
      });
    });
  } else {
    response.status(404).json({ error: "Image not found" });
  }
}

function getMediaList(
  request: Request,
  response: Response,
  type: string,
  content_id: string | undefined,
): Object {
  const elements = Object.entries(repository.media)
    .filter(([key, value]) => value.type === type)
    .filter(([key, value]) => {
      return content_id
        ? repository.contents[content_id].media.some((x) => x.id === value.id)
        : true;
    })
    .map(([key, value]) => {
      return {
        id: value.id,
        content_id: value.content_id,
        type: value.type,
        description: value.description,
      };
    });
  return elements;
}

// Routes
app.get(
  "/api/contents",
  (request: Request, response: Response) => {
    // データそのままではなくダイジェストで送る
    const contents_digest = Object.entries(repository.contents)
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

app.get(
  "/api/contents/:content_id",
  validateContentIdInParam(),
  (request: Request, response: Response) => {
    const { content_id } = request.params;

    const content = repository.contents[content_id];
    if (content) {
      response.json(content);
    } else {
      response.status(404).json({ error: "Content not found" });
    }
  },
);

app.get(
  "/api/images/",
  validateContentIdInQueryParam(),
  (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(404).json({ error: "content_id is not found" });
      // response.status(400).json({ errors: errors.array() });
      return;
    }
    const { content_id } = request.query as { content_id: string }; // optional
    const elements = getMediaList(request, response, "image", content_id);
    response.json(elements);
  },
);


app.get(
  "/api/text/",
  validateContentIdInQueryParam(),
  (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(404).json({ error: "content_id is not found" });
      // response.status(400).json({ errors: errors.array() });
      return;
    }
    const { content_id } = request.query as { content_id: string }; // optional
    const elements = getMediaList(request, response, "text", content_id);
    response.json(elements);
  },
);

app.get(
  "/api/sound/",
  validateContentIdInQueryParam(),
  (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(404).json({ error: "content_id is not found" });
      // response.status(400).json({ errors: errors.array() });
      return;
    }
    const { content_id } = request.query as { content_id: string }; // optional
    const elements = getMediaList(request, response, "sound", content_id);
    response.json(elements);
  },
);

// 個別のファイルを返す
app.get("/api/images/:image_id", (request: Request, response: Response) => {
  const { image_id } = request.params;
  sendFile(request, response, image_id);
});

app.get("/api/text/:text_id", (request: Request, response: Response) => {
  const { text_id } = request.params;
  const medium = repository.media[text_id];
  if (!medium) {
    response.status(404).json({ error: "Text not found" });
    return;
  }
  response.send(medium.description);
});

app.get("/api/sound/:sound_id", (request: Request, response: Response) => {
  const { sound_id } = request.params;
  sendFile(request, response, sound_id);
});

app.listen(PORT, () => {
  console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
  // エラーの処理
  throw new Error(error.message);
});
