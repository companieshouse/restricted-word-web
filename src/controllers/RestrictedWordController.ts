import { Request, Response } from "express";

import Pager from "../pagination/Pager";
import RestrictedWordApiClient from "../clients/RestrictedWordApiClient";
import RestrictedWordQueryOptions from "../clients/RestrictedWordQueryOptions";
import RestrictedWordViewModel from "../clients/RestrictedWordViewModel";

class RestrictedWordController {

    private static mapErrors(error: any) {
        return error.messages.map((message: string) => ({ text: message }));
    }

    public static async getAllWords(request: Request, response: Response) {

        const filterWord = request.query.filterWord;

        const queryOptions: RestrictedWordQueryOptions = {
            startsWith: undefined,
            contains: filterWord || undefined
        };

        const filterStatus = request.query.filterStatus;

        if (filterStatus === "Active") {
            queryOptions.deleted = false;
        } else if (filterStatus === "Deleted") {
            queryOptions.deleted = true;
        }

        /**
         * This will be session.signInData.userProfile.email - bit long winded perhaps.
         * Maybe the client should just take in the request.
         */
        const restrictedWordApiClient = new RestrictedWordApiClient(request.logger, "change me");

        let results: RestrictedWordViewModel[];

        try {

            results = await restrictedWordApiClient.getAllRestrictedWords(queryOptions);

        } catch (error) {

            return response.render("all", {
                errors: RestrictedWordController.mapErrors(error)
            });
        }

        const pager = new Pager(request.query.page, results);
        const urlParams: string[] = [];

        if (filterStatus) {
            urlParams.push(`filterStatus=${filterStatus}`);
        }

        if (filterWord) {
            urlParams.push(`filterWord=${encodeURIComponent(filterWord)}`);
        }

        return response.render("all", {
            filterUrl: `?${urlParams.join("&")}`,
            words: pager.pageResults(),
            deletedWord: request.query.deletedWord,
            addedWord: request.query.addedWord,
            filterParams: {
                word: filterWord,
                status: filterStatus
            },
            pagination: pager.getPaginationOptions()
        });
    }

    public static createNewWord(_request: Request, response: Response) {
        return response.render("add-new-word");
    }

    public static async handleCreateNewWord(request: Request, response: Response) {

        request.logger.info(`Attempting to create new word "${request.body.word}".`);

        const restrictedWordApiClient = new RestrictedWordApiClient(request.logger, "change me");

        try {

            await restrictedWordApiClient.createRestrictedWord(request.body.word);

        } catch (error) {

            if (error && error.messages.length) {

                request.logger.error(`Error creating new word "${request.body.word}": ${error.messages.join(", ")}`);

                return response.render("add-new-word", {
                    errors: error.messages.map((message: string) => ({ text: message }))
                });
            }
        }

        request.logger.info(`Successfully created new word "${request.body.word}".`);

        return response.redirect(`/?addedWord=${encodeURIComponent(request.body.word)}`);
    }

    public static deleteWord(request: Request, response: Response) {
        return response.render("delete-word", {
            id: request.query.id,
            word: request.query.word
        });
    }

    public static async handleDeleteWord(request: Request, response: Response) {

        request.logger.info(`Attempting to delete "${request.body.word}" with id "${request.body.id}"`);

        const restrictedWordApiClient = new RestrictedWordApiClient(request.logger, "change me");

        try {

            await restrictedWordApiClient.deleteRestrictedWord(request.body.id);

        } catch (error) {

            if (error.messages && error.messages.length) {

                request.logger.error(`Error deleting "${request.body.word}" with id "${request.body.id}": ${error.messages.join(", ")}`);

                return response.render("delete-word", {
                    id: request.body.id,
                    word: request.body.word,
                    errors: error.messages.map((message: string) => ({ text: message }))
                });
            }
        }

        request.logger.info(`Successfully deleted "${request.body.word}" with id "${request.body.id}"`);

        return response.redirect(`/?deletedWord=${encodeURIComponent(request.body.word)}`);
    }
}

export = RestrictedWordController;
