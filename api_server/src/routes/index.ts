/**
 * すべてのルーティングを集約して、/api/ 配下に紐づける
 */
import { Hono } from "hono";
import contentsRouter from "./contents.routes.ts";
// import randomRouter from "./random.routes.ts";
// import imagesRouter from "./images.routes.ts";
// import textRouter from "./text.routes.ts";
// import soundsRouter from "./sounds.routes.ts";

export function registerRoutes(app: Hono) {
  //   app.use("/api", randomRouter);
  app.route("/api/contents", contentsRouter);
  //   app.use("/api/images", imagesRouter);
  //   app.use("/api/text", textRouter);
  //   app.use("/api/sounds", soundsRouter);
}
