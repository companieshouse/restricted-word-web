import { promisify } from "util";
import axiosInstance from "./axiosInstance";
import ApplicationLogger from "ch-logger/lib/ApplicationLogger";
import moment from "moment";
import RestrictedWordDto from "./RestrictedWordDto";
import RestrictedWordViewModel from "./RestrictedWordViewModel";
import RestrictedWordQueryOptions from "./RestrictedWordQueryOptions";
import RestrictedWordFilterDto from "./RestrictedWordFilterDto";

class RestrictedWordApiClient {

    private _logger: ApplicationLogger;
    private _username: string;

    public constructor(logger: ApplicationLogger, username: string) {
        this._logger = logger;
        this._username = username;
    }

    private handleErrors(error: any, done: Function) {

        const handledError: any = {};

        if (error.response && error.response.data && error.response.data.errors) {
            handledError.messages = error.response.data.errors;
            return done(handledError);
        }

        this._logger.error(error.message);
        handledError.messages = ["An unknown error has occured."];

        return done(handledError);
    }

    private mapFromApi(serverObject: RestrictedWordDto): RestrictedWordViewModel {
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

        return promisify<RestrictedWordQueryOptions, RestrictedWordViewModel[]>(async function (options: RestrictedWordQueryOptions, done: Function) {

            const queryString: RestrictedWordFilterDto = {};

            if (options.startsWith) {
                queryString.starts_with = options.startsWith;
            }

            if (options.contains) {
                queryString.contains = options.contains;
            }

            if (options.deleted !== undefined) {
                queryString.deleted = options.deleted;
            }

            try {

                const response = await axiosInstance.get("/word", {
                    params: queryString
                });

                return done(undefined, response.data.map(that.mapFromApi));

            } catch (error) {
                return that.handleErrors.bind(that)(error, done);
            }
        })(options);
    }

    public createRestrictedWord(word: string) {

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
        })(word);
    }

    public deleteRestrictedWord(id: string) {

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
        })(id);
    }
}

export = RestrictedWordApiClient;
