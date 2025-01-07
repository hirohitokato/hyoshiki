/**
 * express-validatorを使ったバリデーションロジック集
 * - repositoryを参照し、実在するIDかチェックするなど
 */

import { param, query } from "express-validator";
import { repository } from "../repositories/index.js";

export function validateContentIdInParam() {
    return [
        param("content_id")
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

export function validateContentIdInQueryParam() {
    return [
        query("content_id")
            .optional()
            .isString()
            .withMessage("content_id must be a string")
            .custom((id) => {
                // content_id が指定されている場合のみチェック
                if (id && !(id in repository.contents)) {
                    throw new Error("content_id does not exist in repository");
                }
                return true;
            }),
    ];
}
