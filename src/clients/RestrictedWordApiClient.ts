import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import RestrictedWordDto from "./RestrictedWordDto";
import RestrictedWordFilterDto from "./RestrictedWordFilterDto";
import RestrictedWordQueryOptions from "./RestrictedWordQueryOptions";
import RestrictedWordViewModel from "./RestrictedWordViewModel";
import axiosInstance from "./axiosInstance";
import moment from "moment";
import { promisify } from "util";

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

    public getAllRestrictedWords(outerOptions: RestrictedWordQueryOptions) {

        const that = this;

        return promisify<RestrictedWordQueryOptions, RestrictedWordViewModel[]>(async function (options: RestrictedWordQueryOptions, done: Function) {

            const queryString: RestrictedWordFilterDto = {};

            if (options.startsWith) {
                queryString["starts_with"] = options.startsWith;
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

                return done(undefined, response.data.map(RestrictedWordApiClient.mapFromApi));

            } catch (error) {
                return that.handleErrors.bind(that)(error, done);
            }
        })(outerOptions);
    }

    public createRestrictedWord(outerWord: string) {

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
        })(outerWord);
    }

    public deleteRestrictedWord(outerId: string) {

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
        })(outerId);
    }
}

export = RestrictedWordApiClient;
