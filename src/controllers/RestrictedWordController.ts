import { Request, Response } from "express";

import AuditEntryViewModel from "../clients/AuditEntryViewModel";
import Pager from "../pagination/Pager";
import RestrictedWordApiClient from "../clients/RestrictedWordApiClient";
import RestrictedWordQueryOptions from "../clients/RestrictedWordQueryOptions";
import RestrictedWordViewModel from "../clients/RestrictedWordViewModel";
import config from "../config";
import { createLogger } from "ch-structured-logging";

const logger = createLogger(config.applicationNamespace);

class RestrictedWordController {

    private static getAndLogErrorList(request: Request, message: any, error: any) {

        let errorMessages = error.messages;

        if (errorMessages === undefined) {

            errorMessages = [error.message];
            logger.errorRequest(request, error.message);

        } else {

            logger.errorRequest(request, `${message}: ${errorMessages.join(", ")}`);
        }

        return errorMessages;
    }

    private static mapErrors(errorMessages: any) {
        return errorMessages.map((message: string) => ({ text: message }));
    }

    public static async getAllWords(request: Request, response: Response) {

        const filterWord = request.query.filterWord as string;

        const queryOptions: RestrictedWordQueryOptions = {
            startsWith: undefined,
            contains: filterWord || undefined
        };

        const superRestrictedStatus = request.query.filterSuperRestricted;

        if (superRestrictedStatus === "Normal") {
            queryOptions.superRestricted = false;
        } else if (superRestrictedStatus === "Super") {
            queryOptions.superRestricted = true;
        }

        const deletedStatus = request.query.deletedStatus;

        if (deletedStatus === "Active") {
            queryOptions.deleted = false;
        } else if (deletedStatus === "Deleted") {
            queryOptions.deleted = true;
        }

        const restrictedWordApiClient = new RestrictedWordApiClient(request.body.loggedInUserEmail);

        let results: RestrictedWordViewModel[];

        try {

            results = await restrictedWordApiClient.getAllRestrictedWords(queryOptions);

        } catch (unknownError) {

            const errorMessages = RestrictedWordController.getAndLogErrorList(request, "Error retrieving word list", unknownError);

            return response.render("all", {
                errors: RestrictedWordController.mapErrors(errorMessages)
            });
        }

        const pager = new Pager(request.query.page as string, results);
        const urlParams: string[] = [];

        if (superRestrictedStatus) {
            urlParams.push(`filterSuperRestricted=${superRestrictedStatus}`);
        }

        if (deletedStatus) {
            urlParams.push(`deletedStatus=${deletedStatus}`);
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
                superRestricted: superRestrictedStatus,
                status: deletedStatus
            },
            pagination: pager.getPaginationOptions()
        });
    }

    public static async postSuperRestrictedWord(request: Request, response: Response) {

        const restrictedWordApiClient = new RestrictedWordApiClient(request.body.loggedInUserEmail);

        const id = request.body.id;
        const superRestricted = request.body.superRestricted === "true";

        try {
            await restrictedWordApiClient.patchSuperRestrictedStatus({
                id: id,
                superRestricted: superRestricted,
                patchedBy: request.body.loggedInUserEmail
            });

            return response.redirect(`/${config.urlPrefix}/word/${id}?setSuperRestricted=true`);

        } catch (unknownError) {

            const errorMessages = RestrictedWordController.getAndLogErrorList(request, "Error retrieving word list", unknownError);
            const word = await restrictedWordApiClient.getSingleRestrictedWord(id);

            return response.render("word", {
                word: word,
                wordHistory: RestrictedWordController.mapWordHistory(word.superRestrictedAuditLog),
                errors: RestrictedWordController.mapErrors(errorMessages)
            });
        }
    }

    public static async getWord(request: Request, response: Response) {

        const restrictedWordApiClient = new RestrictedWordApiClient(request.body.loggedInUserEmail);

        try {

            const word = await restrictedWordApiClient.getSingleRestrictedWord(request.params.wordId);

            return response.render("word", {
                word: word,
                setSuperRestricted: request.query.setSuperRestricted,
                wordHistory: RestrictedWordController.mapWordHistory(word.superRestrictedAuditLog)
            });

        } catch (unknownError) {
            const errorMessages = RestrictedWordController.getAndLogErrorList(request, "Error retrieving word list", unknownError);

            return response.render("word", {
                errors: RestrictedWordController.mapErrors(errorMessages)
            });
        }
    }

    private static mapWordHistory(auditLog: AuditEntryViewModel[]) {
        return auditLog.map(auditEntry => [{
            text: auditEntry.changedAt
        }, {
            text: auditEntry.changedBy
        }, {
            text: auditEntry.newValue ? "Yes" : "No"
        }]);
    }

    public static getCreateNewWord(_request: Request, response: Response) {
        return response.render("add-new-word");
    }

    public static async postCreateNewWord(request: Request, response: Response) {

        const newWord = request.body.word;
        const superRestricted = request.body.superRestricted === "true";
        const deleteConflicting = request.body.deleteConflicting === "true";

        logger.infoRequest(request, `Attempting to create new word "${newWord}" with super restricted "${superRestricted}".`);

        const restrictedWordApiClient = new RestrictedWordApiClient(request.body.loggedInUserEmail);

        try {

            if (!newWord) {
                throw new Error("A word is required to create a new word");
            }

            await restrictedWordApiClient.createRestrictedWord(newWord, superRestricted, deleteConflicting);

        } catch (unknownError) {

            if (unknownError.conflictingWords) {
                return response.render("add-new-word", {
                    word: newWord.toUpperCase(),
                    superRestricted: superRestricted,
                    hasConflicting: true,
                    conflictingWords: unknownError.conflictingWords
                });
            }

            const errorMessages = RestrictedWordController.getAndLogErrorList(request, `Error creating new word "${newWord}"`, unknownError);

            return response.render("add-new-word", {
                word: newWord,
                superRestricted: superRestricted,
                errors: RestrictedWordController.mapErrors(errorMessages)
            });
        }

        logger.infoRequest(request, `Successfully created new word "${newWord}".`);

        return response.redirect(`/${config.urlPrefix}/?addedWord=${encodeURIComponent(newWord)}`);
    }

    public static getDeleteWord(request: Request, response: Response) {

        const wordId = request.query.id;
        const word = request.query.word;

        let errorMessages: any[] = [];

        if (wordId === undefined) {
            errorMessages = errorMessages
                .concat(RestrictedWordController.getAndLogErrorList(request, "", new Error("Id required to delete word")));
        }

        if (word === undefined) {
            errorMessages = errorMessages.concat(RestrictedWordController.getAndLogErrorList(request, "", new Error("Word required to delete word")));
        }

        return response.render("delete-word", {
            id: wordId,
            word: word,
            errors: RestrictedWordController.mapErrors(errorMessages)
        });
    }

    public static async postDeleteWord(request: Request, response: Response) {

        const wordId = request.body.id;
        const word = request.body.word;

        logger.infoRequest(request, `Attempting to delete "${word}" with id "${wordId}"`);

        const restrictedWordApiClient = new RestrictedWordApiClient(request.body.loggedInUserEmail);

        try {

            if (!wordId) {
                throw new Error("Id required to delete word");
            }

            if (!word) {
                throw new Error("Word required to delete word");
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

        logger.infoRequest(request, `Successfully deleted "${word}" with id "${wordId}"`);

        return response.redirect(`/${config.urlPrefix}/?deletedWord=${encodeURIComponent(word)}`);
    }
}

export default RestrictedWordController;
