import * as healthcheck from "../controllers/healthcheckController";
import RestrictedWordController from "../controllers/RestrictedWordController";
import express from "express";

class RestrictedWordRouter {

    public static create() {

        // eslint-disable-next-line new-cap
        const router = express.Router();

        router.get("/", RestrictedWordController.getAllWords);
        router.get("/word/:wordId", RestrictedWordController.getWord);
        router.post("/set-super-restricted", RestrictedWordController.postSuperRestrictedWord);
        router.get("/add-new-word", RestrictedWordController.getCreateNewWord);
        router.post("/add-new-word", RestrictedWordController.postCreateNewWord);
        router.get("/delete", RestrictedWordController.getDeleteWord);
        router.post("/delete", RestrictedWordController.postDeleteWord);
        router.get("/healthcheck", healthcheck.get);

        return router;
    }
}

export default RestrictedWordRouter;
