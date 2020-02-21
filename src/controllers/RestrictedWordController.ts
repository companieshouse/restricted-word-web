import { Request, Response } from "express";

import Pager from "../pagination/Pager";
import RestrictedWordApiClient from "../clients/RestrictedWordApiClient";
import RestrictedWordQueryOptions from "../clients/RestrictedWordQueryOptions";
import RestrictedWordViewModel from "../clients/RestrictedWordViewModel";
import config from "../config";

class RestrictedWordController {

    private static getAndLogErrorList(request: Request, message: any, error: any) {

        let errorMessages = error.messages;

        if (errorMessages === undefined) {

            errorMessages = [error.message];
            request.logger.error(error.message);

        } else {

            request.logger.error(`${message}: ${errorMessages.join(", ")}`);
        }

        return errorMessages;
    }

    private static mapErrors(errorMessages: any) {
        return errorMessages.map((message: string) => ({ text: message }));
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

        } catch (unknownError) {

            const errorMessages = RestrictedWordController.getAndLogErrorList(request, "Error retrieving word list", unknownError);

            return response.render("all", {
                errors: RestrictedWordController.mapErrors(errorMessages)
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

        const newWord = request.body.word;

        request.logger.info(`Attempting to create new word "${newWord}".`);

        const restrictedWordApiClient = new RestrictedWordApiClient(request.logger, "change me");

        try {

            if (!newWord) {
                throw new Error("A word is required to create a new word");
            }

            await restrictedWordApiClient.createRestrictedWord(newWord);

        } catch (unknownError) {

            const errorMessages = RestrictedWordController.getAndLogErrorList(request, `Error creating new word "${newWord}"`, unknownError);

            return response.render("add-new-word", {
                word: newWord,
                errors: RestrictedWordController.mapErrors(errorMessages)
            });
        }

        request.logger.info(`Successfully created new word "${newWord}".`);

        return response.redirect(`/${config.urlPrefix}/?addedWord=${encodeURIComponent(newWord)}`);
    }

    public static deleteWord(request: Request, response: Response) {

        const wordId = request.query.id;
        const word = request.query.word;

        const errorMessages = wordId === undefined ?
            undefined :
            RestrictedWordController.getAndLogErrorList(request, "", new Error("Id required to delete word"));

        return response.render("delete-word", {
            id: wordId,
            word: word,
            errors: RestrictedWordController.mapErrors(errorMessages)
        });
    }

    public static async handleDeleteWord(request: Request, response: Response) {

        const wordId = request.body.id;
        const word = request.body.word;

        request.logger.info(`Attempting to delete "${word}" with id "${wordId}"`);

        const restrictedWordApiClient = new RestrictedWordApiClient(request.logger, "change me");

        try {

            if (wordId === undefined) {
                throw new Error("Id required to delete word");
            }

            await restrictedWordApiClient.deleteRestrictedWord(wordId);

        } catch (unknownError) {

            const errorMessages = RestrictedWordController.getAndLogErrorList(request, `Error deleting "${word}" with id "${wordId}"`, unknownError);

            return response.render("delete-word", {
                id: wordId,
                word: word,
                errors: RestrictedWordController.mapErrors(errorMessages)
            });
        }

        request.logger.info(`Successfully deleted "${word}" with id "${wordId}"`);

        return response.redirect(`/${config.urlPrefix}/?deletedWord=${encodeURIComponent(word)}`);
    }
}

export = RestrictedWordController;
