import RestrictedWordController from "../controllers/RestrictedWordController";
import express from "express";

class RestrictedWordRouter {

    public static create() {

        // eslint-disable-next-line new-cap
        const router = express.Router();

        router.get("/", RestrictedWordController.getAllWords);
        router.get("/add-new-word", RestrictedWordController.getCreateNewWord);
        router.post("/add-new-word", RestrictedWordController.postCreateNewWord);
        router.get("/delete", RestrictedWordController.getDeleteWord);
        router.post("/delete", RestrictedWordController.postDeleteWord);

        return router;
    }
}

export default RestrictedWordRouter;
