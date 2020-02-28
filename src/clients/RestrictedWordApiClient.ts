import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import RestrictedWordDto from "./RestrictedWordDto";
import RestrictedWordFilterDto from "./RestrictedWordFilterDto";
import RestrictedWordQueryOptions from "./RestrictedWordQueryOptions";
import RestrictedWordViewModel from "./RestrictedWordViewModel";
import axiosInstance from "./axiosInstance";
import config from "../config";
import { createLogger } from "ch-structured-logging";
import moment from "moment";
import { promisify } from "util";

class RestrictedWordApiClient {

    private _logger: ApplicationLogger = createLogger(config.applicationNamespace);

    private _username: string;

    public constructor(username: string) {
        this._username = username;
    }

    private handleErrors(error: any, done: Function) {

        const handledError: any = {};

        if (error.response && error.response.data && error.response.data.errors) {

            handledError.messages = error.response.data.errors;

            return done(handledError);
        }

        this._logger.error(error.message);
        handledError.messages = ["An unknown error has occurred."];

        return done(handledError);
    }

    private static mapFromApi(serverObject: RestrictedWordDto): RestrictedWordViewModel {

        return {
            id: serverObject.id,
            word: serverObject.full_word,
            createdBy: serverObject.created_by,
            deletedBy: serverObject.deleted_by,
            createdAt: moment(serverObject.created_at).format("DD MMM YY"),
            deletedAt: serverObject.deleted_at ?
                moment(serverObject.deleted_at).format("DD MMM YY") :
                "-"
        };
    }

    public getAllRestrictedWords(options: RestrictedWordQueryOptions) {

        const that = this;

        return promisify<RestrictedWordQueryOptions, RestrictedWordViewModel[]>(async function (innerOptions: RestrictedWordQueryOptions, done: Function) {

            const queryString: RestrictedWordFilterDto = {};

            if (innerOptions.startsWith) {
                queryString["starts_with"] = innerOptions.startsWith;
            }

            if (innerOptions.contains) {
                queryString.contains = innerOptions.contains;
            }

            if (innerOptions.deleted !== undefined) {
                queryString.deleted = innerOptions.deleted;
            }

            try {

                const response = await axiosInstance.get("/word", {
                    params: queryString
                });

                return done(undefined, response.data.map(RestrictedWordApiClient.mapFromApi));

            } catch (error) {
                return that.handleErrors.bind(that)(error, done);
            }
        })(options);
    }

    public createRestrictedWord(newWord: string) {

        const that = this;

        return promisify<string, void>(async function (word: string, done: Function) {

            try {

                await axiosInstance.post("/word", {
                    "full_word": word,
                    "created_by": that._username
                });

                return done();

            } catch (error) {
                return that.handleErrors.bind(that)(error, done);
            }
        })(newWord);
    }

    public deleteRestrictedWord(wordId: string) {

        const that = this;

        return promisify<string, void>(async function (id: string, done: Function) {

            try {

                await axiosInstance.delete(`/word/${id}`, {
                    data: {
                        "deleted_by": that._username
                    }
                });

                return done();

            } catch (error) {
                return that.handleErrors.bind(that)(error, done);
            }
        })(wordId);
    }
}

export = RestrictedWordApiClient;
