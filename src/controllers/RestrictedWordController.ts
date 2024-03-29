import { Request, Response } from "express";

import AuditEntryViewModel from "../clients/AuditEntryViewModel";
import Pager from "../pagination/Pager";
import RestrictedWordApiClient from "../clients/RestrictedWordApiClient";
import RestrictedWordQueryOptions from "../clients/RestrictedWordQueryOptions";
import RestrictedWordViewModel from "../clients/RestrictedWordViewModel";
import config from "../config";
import { createLogger } from "@companieshouse/structured-logging-node";
import RestrictedWordError from "../error/RestrictedWordError";
import { getCategoriesList, getCategoriesListHtml } from "../helpers/word";
import { UpdateFields } from "../enums";

const logger = createLogger(config.applicationNamespace);

class RestrictedWordController {

    private static getAndLogErrorList(request: Request, message: any, error: any) {

        let errorMessages = error.messages;

        if (error instanceof RestrictedWordError) {

            errorMessages = error.errors;
            for (const errorMessage of errorMessages) {
                logger.errorRequest(request, errorMessage);
            }

        } else if (errorMessages === undefined) {

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

        // If it's a singular category, it's a string. If it's multiple, it's an array
        const categorySelection = request.query.categorySelection;
        if (typeof categorySelection === "string") {
            queryOptions.categories = [categorySelection];
        } else {
            queryOptions.categories = categorySelection as string[];
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

        if (categorySelection) {
            for (const category of queryOptions.categories) {
                urlParams.push(`categorySelection=${category}`);
            }
        }

        if (filterWord) {
            urlParams.push(`filterWord=${encodeURIComponent(filterWord)}`);
        }

        return response.render("all", {
            filterUrl: `?${urlParams.join("&")}`,
            words: pager.pageResults(),
            deletedWord: request.query.deletedWord,
            addedWord: request.query.addedWord,
            categories: request.query.categories,
            filterParams: {
                word: filterWord,
                superRestricted: superRestrictedStatus,
                status: deletedStatus,
                categories: queryOptions.categories
            },
            pagination: pager.getPaginationOptions()
        });
    }

    private static safeRedirect(url: string, response: Response) {
        if (url?.startsWith(config.baseUrl)) {
            return response.redirect(url);
        }
        throw Error(`Provided url: (${url}) is not valid.`);
    }

    private static isValidId(id:string) {
        // Returns true if the 'id' is valid
        return /^[a-zA-Z0-9-]+$/.test(id);
    }

    public static async postUpdateWord(request: Request, response: Response) {

        const restrictedWordApiClient = new RestrictedWordApiClient(request.body.loggedInUserEmail);

        const id = request.body.id;
        const superRestricted = request.body.superRestricted === "true";
        const categories = getCategoriesList(request?.body?.categories);
        const categoryChangeReason = request.body.changedReason;

        let redirectToUrl = `${config.baseUrl}/${config.urlPrefix}/word/${id}`;

        try {
            if (!(RestrictedWordController.isValidId(id))) {
                throw Error(`Provided id: (${id}) is not valid. Must be alpha numeric.`);
            }

            let whichFieldUpdate;

            const originalWord = await restrictedWordApiClient.getSingleRestrictedWord(id);

            if (categories.length === 0) {
                throw new RestrictedWordError("Validation error",
                    ["No data to update provided in the request, a new super restricted value and/or categories is required."]
                );
            } else if (superRestricted !== originalWord.superRestricted &&
                !RestrictedWordController.haveCategoriesChanged(categories, originalWord.categories)) {
                whichFieldUpdate = UpdateFields.SUPER_RESTRICTED;
                redirectToUrl += `?setSuperRestricted=${superRestricted}`;
            } else if (superRestricted === originalWord.superRestricted &&
                RestrictedWordController.haveCategoriesChanged(categories, originalWord.categories)) {
                whichFieldUpdate = UpdateFields.CATEGORIES;

                if (!categoryChangeReason) {
                    throw new RestrictedWordError("Validation error",
                        ["A changed reason is required when updating categories."]
                    );
                }

                redirectToUrl += "?setCategories=true";
            } else if (superRestricted !== originalWord.superRestricted &&
                RestrictedWordController.haveCategoriesChanged(categories, originalWord.categories)) {

                if (!categoryChangeReason) {
                    throw new RestrictedWordError("Validation error",
                        ["A changed reason is required when updating categories."]
                    );
                }

                whichFieldUpdate = UpdateFields.BOTH;
                redirectToUrl += "?setSuperRestricted=true&setCategories=true";
            } else {
                throw new RestrictedWordError("Validation error",
                    ["No changes have been made."]
                );
            }

            await restrictedWordApiClient.patchSuperRestrictedStatus(
                {
                    id: id,
                    superRestricted: superRestricted,
                    categories: categories,
                    categoryChangeReason: categoryChangeReason,
                    patchedBy: request.body.loggedInUserEmail
                },
                whichFieldUpdate
            );

            return RestrictedWordController.safeRedirect(redirectToUrl, response);

        } catch (unknownError) {

            const errorMessages = RestrictedWordController.getAndLogErrorList(request, "Error retrieving word list", unknownError);
            const word = await restrictedWordApiClient.getSingleRestrictedWord(id);

            return response.render("word", {
                word: word,
                getCategoriesListHtml: getCategoriesListHtml,
                wordHistory: RestrictedWordController.mapWordHistory(word.superRestrictedAuditLog).slice().reverse(),
                wordCategoryHistory: word.categoriesAuditLog.slice().reverse(),
                errors: RestrictedWordController.mapErrors(errorMessages)
            });
        }
    }

    private static haveCategoriesChanged(categories: string[], originalCategories: string[]) {
        return categories.length !== originalCategories.length ||
            categories.find(element => {
                if (!originalCategories.includes(element)) {
                    return true;
                }
                return false;
            });
    }

    public static async getWord(request: Request, response: Response) {
        const restrictedWordApiClient = new RestrictedWordApiClient(request.body.loggedInUserEmail);

        try {

            const word = await restrictedWordApiClient.getSingleRestrictedWord(request.params.wordId);

            return response.render("word", {
                word: word,
                getCategoriesListHtml: getCategoriesListHtml,
                setSuperRestricted: request.query.setSuperRestricted,
                setCategories: request.query.setCategories,
                wordHistory: RestrictedWordController.mapWordHistory(word.superRestrictedAuditLog).slice().reverse(),
                wordCategoryHistory: word.categoriesAuditLog.slice().reverse()
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
        const createdReason = request.body.createdReason;
        const superRestricted = request.body.superRestricted === "true";
        const deleteConflicting = request.body.deleteConflicting === "true";
        // If the POST request comes from the excluded word conflict page, the categories will be a comma delimited string
        if (request.body.postFromConflictPage) {
            request.body.categories = request.body.categories.split(",");
        } else if (typeof request.body.categories === "string") {
            request.body.categories = [request.body.categories];
        }
        const categories = request.body.categories;

        logger.infoRequest(request, `Attempting to create new word "${newWord}" with super restricted "${superRestricted}".`);

        const restrictedWordApiClient = new RestrictedWordApiClient(request.body.loggedInUserEmail);

        try {

            const errorMessages = [];

            if (!newWord) {
                errorMessages.push("A word is required to create a new word");
            }

            if (!createdReason) {
                errorMessages.push("A reason for creating the word is required");
            }

            if (!categories) {
                errorMessages.push("A category for the new word is required");
            }

            if (errorMessages.length > 0) {
                throw new RestrictedWordError("Validation error when creating a word", errorMessages);
            }

            await restrictedWordApiClient.createRestrictedWord(newWord, createdReason, categories, superRestricted, deleteConflicting);

        } catch (unknownError: any) {
            if (unknownError.conflictingWords) {
                return response.render("add-new-word", {
                    word: newWord.toUpperCase(),
                    createdReason: createdReason,
                    categories: categories,
                    superRestricted: superRestricted,
                    hasConflicting: true,
                    conflictingWords: unknownError.conflictingWords
                });
            }

            const errorMessages = RestrictedWordController.getAndLogErrorList(request, `Error creating new word "${newWord}"`, unknownError);

            return response.render("add-new-word", {
                word: newWord,
                createdReason: createdReason,
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
        const deletedReason = request.body.deletedReason;

        logger.infoRequest(request, `Attempting to delete "${word}" with id "${wordId}"`);

        const restrictedWordApiClient = new RestrictedWordApiClient(request.body.loggedInUserEmail);

        try {

            if (!wordId) {
                throw new Error("Id required to delete word");
            }

            if (!word) {
                throw new Error("Word required to delete word");
            }

            if (!deletedReason) {
                throw new Error("A reason for deleting the word is required");
            }

            await restrictedWordApiClient.deleteRestrictedWord(wordId, deletedReason);

        } catch (unknownError) {

            const errorMessages = RestrictedWordController.getAndLogErrorList(request, `Error deleting "${word}" with id "${wordId}"`, unknownError);

            return response.render("delete-word", {
                id: wordId,
                word: word,
                deletedReason: deletedReason,
                errors: RestrictedWordController.mapErrors(errorMessages)
            });
        }

        logger.infoRequest(request, `Successfully deleted "${word}" with id "${wordId}"`);

        return response.redirect(`/${config.urlPrefix}/?deletedWord=${encodeURIComponent(word)}`);
    }
}

export default RestrictedWordController;
