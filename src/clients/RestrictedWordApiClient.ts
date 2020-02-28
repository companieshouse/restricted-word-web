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

    private handleErrors(error: any) {

        const handledError: any = {};

        if (error.response && error.response.data && error.response.data.errors) {

            handledError.messages = error.response.data.errors;

            throw handledError;
        }

        this._logger.error(error.message);
        handledError.messages = ["An unknown error has occurred."];

        throw handledError;
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
                "-",
            deleted: serverObject.deleted
        };
    }

    public async getAllRestrictedWords(options: RestrictedWordQueryOptions) {

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

            return response.data.map(RestrictedWordApiClient.mapFromApi);

        } catch (error) {
            this.handleErrors(error);
        }
    }

    public async createRestrictedWord(newWord: string) {

        try {

            await axiosInstance.post("/word", {
                "full_word": newWord,
                "created_by": this._username
            });

        } catch (error) {
            this.handleErrors(error);
        }
    }

    public async deleteRestrictedWord(wordId: string) {

        try {

            await axiosInstance.delete(`/word/${wordId}`, {
                data: {
                    "deleted_by": this._username
                }
            });

        } catch (error) {
            this.handleErrors(error);
        }
    }
}

export = RestrictedWordApiClient;
