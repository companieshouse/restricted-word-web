import RestrictedWordController from "../controllers/RestrictedWordController";
import express from "express";

class RestrictedWordRouter {

    public static create() {

        // eslint-disable-next-line new-cap
        const router = express.Router();

        router.get("/", RestrictedWordController.getAllWords);
        router.get("/add-new-word", RestrictedWordController.createNewWord);
        router.post("/add-new-word", RestrictedWordController.handleCreateNewWord);
        router.get("/delete", RestrictedWordController.deleteWord);
        router.post("/delete", RestrictedWordController.handleDeleteWord);

        return router;
    }
}

export = RestrictedWordRouter;
