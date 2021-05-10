import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import RestrictedWordDto from "./RestrictedWordDto";
import RestrictedWordFilterDto from "./RestrictedWordFilterDto";
import RestrictedWordPatchSuperRestrictedRequest from "./RestrictedWordPatchSuperRestrictedRequest";
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

        if (error.response && error.response.data && (error.response.data.errors || error.response.data.conflicting_words)) {

            handledError.messages = error.response.data.errors;
            handledError.conflictingWords = error.response.data.conflicting_words;

            return handledError;
        }

        this._logger.error(error.message);
        handledError.messages = ["An unknown error has occurred."];

        return handledError;
    }

    private static getUsernameFromEmail(email: string): string {
        return email.split("@")[0];
    }

    private static mapFromApi(serverObject: RestrictedWordDto): RestrictedWordViewModel {

        return {
            id: serverObject.id,
            word: serverObject.full_word,
            createdBy: RestrictedWordApiClient.getUsernameFromEmail(serverObject.created_by),
            deletedBy: serverObject.deleted_by ?
                RestrictedWordApiClient.getUsernameFromEmail(serverObject.deleted_by) :
                undefined,
            createdAt: moment(serverObject.created_at).format("DD MMM YY"),
            deletedAt: serverObject.deleted_at ?
                moment(serverObject.deleted_at).format("DD MMM YY") :
                "-",
            superRestricted: serverObject.super_restricted,
            deleted: serverObject.deleted,
            superRestrictedAuditLog: serverObject.super_restricted_audit_log.map(function (auditEntry) {
                return {
                    changedAt: moment(auditEntry.changed_at).format("DD MMM YY"),
                    changedBy: auditEntry.changed_by,
                    newValue: auditEntry.new_value
                }
            })
        };
    }

    public async patchSuperRestrictedStatus(options: RestrictedWordPatchSuperRestrictedRequest) {

        try {
            await axiosInstance.patch(`/word/${options.id}`, {
                patched_by: options.patchedBy,
                super_restricted: options.superRestricted
            });
        } catch (error) {
            throw this.handleErrors(error);
        }
    }

    public async getSingleRestrictedWord(id: string) {

        try {
            const response = await axiosInstance.get(`/word/${id}`);

            return RestrictedWordApiClient.mapFromApi(response.data);

        } catch (error) {
            throw this.handleErrors(error);
        }
    }

    public async getAllRestrictedWords(options: RestrictedWordQueryOptions) {

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

        if (options.superRestricted !== undefined) {
            queryString.super_restricted = options.superRestricted;
        }

        console.dir(queryString);

        try {

            const response = await axiosInstance.get("/word", {
                params: queryString
            });

            return response.data.map(RestrictedWordApiClient.mapFromApi);

        } catch (error) {
            throw this.handleErrors(error);
        }
    }

    public async createRestrictedWord(word: string, superRestricted: boolean, deleteConflicting: boolean) {

        try {

            await axiosInstance.post("/word", {
                full_word: word,
                super_restricted: superRestricted,
                delete_conflicting: deleteConflicting,
                created_by: this._username
            });

        } catch (error) {
            throw this.handleErrors(error);
        }
    }

    public async deleteRestrictedWord(id: string) {

        try {

            await axiosInstance.delete(`/word/${id}`, {
                data: {
                    deleted_by: this._username
                }
            });

        } catch (error) {
            throw this.handleErrors(error);
        }
    }
}

export default RestrictedWordApiClient;
