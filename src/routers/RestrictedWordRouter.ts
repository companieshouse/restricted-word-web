"use strict";

import express from "express";
import RestrictedWordController from "../controllers/RestrictedWordController";

class RestrictedWordRouter {

    public static create() {

        const router = express.Router();

        const restrictedWordController = new RestrictedWordController();

        router.get("/", restrictedWordController.getAllWords);
        router.get("/add-new-word", restrictedWordController.createNewWord);
        router.post("/add-new-word", restrictedWordController.handleCreateNewWord);
        router.get("/delete", restrictedWordController.deleteWord);
        router.post("/delete", restrictedWordController.handleDeleteWord);

        return router;
    }
}

export = RestrictedWordRouter;
