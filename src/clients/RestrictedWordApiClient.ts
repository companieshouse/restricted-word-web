import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import RestrictedWordDto from "./RestrictedWordDto";
import RestrictedWordFilterDto from "./RestrictedWordFilterDto";
import RestrictedWordQueryOptions from "./RestrictedWordQueryOptions";
import RestrictedWordViewModel from "./RestrictedWordViewModel";
import axiosInstance from "./axiosInstance";
import config from "../config";
import { createLogger } from "ch-structured-logging";
import moment from "moment";

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

            return handledError;
        }

        this._logger.error(error.message);
        handledError.messages = ["An unknown error has occurred."];

        return handledError;
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
            deleted: serverObject.deleted ? serverObject.deleted : false
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
            throw this.handleErrors(error);
        }
    }

    public async createRestrictedWord(word: string) {

        try {

            await axiosInstance.post("/word", {
                "full_word": word,
                "created_by": this._username
            });

        } catch (error) {
            throw this.handleErrors(error);
        }
    }

    public async deleteRestrictedWord(id: string) {

        try {

            await axiosInstance.delete(`/word/${id}`, {
                data: {
                    "deleted_by": this._username
                }
            });

        } catch (error) {
            throw this.handleErrors(error);
        }
    }
}

export = RestrictedWordApiClient;
