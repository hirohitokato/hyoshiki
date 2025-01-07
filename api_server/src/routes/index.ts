/**
 * すべてのルーティングを集約して、/api/ 配下に紐づける
 */
import { Express } from "express";
import contentsRouter from "./contents.routes.js";
import randomRouter from "./random.routes.js";
import imagesRouter from "./images.routes.js";
import textRouter from "./text.routes.js";
import soundsRouter from "./sounds.routes.js";

export function registerRoutes(app: Express) {
    app.use("/api", randomRouter);
    app.use("/api/contents", contentsRouter);
    app.use("/api/images", imagesRouter);
    app.use("/api/text", textRouter);
    app.use("/api/sounds", soundsRouter);
}
