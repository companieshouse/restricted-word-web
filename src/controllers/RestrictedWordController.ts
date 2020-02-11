"use strict";

import chSdk from "ch-sdk";
const restrictedWordApiClient = chSdk.restrictedWord;
import Pager from "../Pager";
import { Request, Response } from "express";
import QueryOptions from "../QueryOptions";

class RestrictedWordController {

    async getAllWords(request: Request, response: Response) {

        const filterWord = request.query.filterWord;

        const queryOptions: QueryOptions = {
            startsWith: undefined,
            contains: filterWord || undefined
        };

        const filterStatus = request.query.filterStatus;

        if (filterStatus === "Active") {
            queryOptions.deleted = false;
        } else if (filterStatus === "Deleted") {
            queryOptions.deleted = true;
        }

        let results;

        try {

            results = await restrictedWordApiClient.getAllRestrictedWords({
                data: queryOptions
            });

        } catch (error) {

            return response.render("all", {
                errors: error.messages.map(message => ({ text: message }))
            });
        }

        const pager = new Pager(request.query.page, results);
        const urlParams = [];

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

    createNewWord = function (_request: Request, response: Response) {
        return response.render("add-new-word");
    }

    async handleCreateNewWord(request: Request, response: Response) {

        request.logger.info(`Attempting to create new word "${request.body.word}".`);

        try {

            await restrictedWordApiClient.createRestrictedWord({
                data: {
                    word: request.body.word,
                    createdBy: "Word Creator"
                }
            });

        } catch (error) {

            if (error && error.messages.length) {

                request.logger.error(`Error creating new word "${request.body.word}": ${error.messages.join(", ")}`);

                return response.render("add-new-word", {
                    errors: error.messages.map(message => ({ text: message }))
                });
            }
        }

        request.logger.info(`Successfully created new word "${request.body.word}".`);

        return response.redirect(`/?addedWord=${encodeURIComponent(request.body.word)}`);
    }

    deleteWord(request: Request, response: Response) {
        return response.render("delete-word", {
            id: request.query.id,
            word: request.query.word
        });
    }

    async handleDeleteWord(request: Request, response: Response) {

        request.logger.info(`Attempting to delete "${request.body.word}" with id "${request.body.id}"`);

        try {

            await restrictedWordApiClient.deleteRestrictedWord({
                id: request.body.id,
                data: {
                    deletedBy: "sorry for delete"
                }
            });

        } catch (error) {

            if (error.messages.length) {

                request.logger.error(`Error deleting "${request.body.word}" with id "${request.body.id}": ${error.messages.join(", ")}`);

                return response.render("delete-word", {
                    id: request.body.id,
                    word: request.body.word,
                    errors: error.messages.map(message => ({ text: message }))
                });
            }
        }

        request.logger.info(`Successfully deleted "${request.body.word}" with id "${request.body.id}"`);

        return response.redirect(`/?deletedWord=${encodeURIComponent(request.body.word)}`);
    }
}

export = RestrictedWordController;
