import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import RestrictedWordDto from "./RestrictedWordDto";
import RestrictedWordFilterDto from "./RestrictedWordFilterDto";
import RestrictedWordPatchSuperRestrictedRequest from "./RestrictedWordPatchSuperRestrictedRequest";
import RestrictedWordQueryOptions from "./RestrictedWordQueryOptions";
import RestrictedWordViewModel from "./RestrictedWordViewModel";
import axiosInstance from "./axiosInstance";
import config from "../config";
import { createLogger } from "@companieshouse/structured-logging-node";
import moment from "moment";
import { UpdateFields } from "../enums";
import { log } from "console";
const otel = require('@opentelemetry/api');
import { context, propagation, trace } from '@opentelemetry/api';

class RestrictedWordApiClient {


    private _logger: ApplicationLogger = createLogger(config.applicationNamespace);

    private _username: string;

    private tracer = trace.getTracer('my-restricted-word-web-app');


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
            categories: serverObject.categories,
            createdBy: RestrictedWordApiClient.getUsernameFromEmail(serverObject.created_by),
            deletedBy: serverObject.deleted_by ?
                RestrictedWordApiClient.getUsernameFromEmail(serverObject.deleted_by) :
                undefined,
            deletedReason: serverObject.deleted_reason ? serverObject.deleted_reason : undefined,
            createdAt: moment(serverObject.created_at).format("DD MMM YY"),
            createdReason: serverObject.created_reason,
            deletedAt: serverObject.deleted_at ?
                moment(serverObject.deleted_at).format("DD MMM YY") :
                "-",
            superRestricted: serverObject.super_restricted,
            deleted: serverObject.deleted,
            superRestrictedAuditLog: serverObject.super_restricted_audit_log.map(function (auditEntry) {
                return {
                    changedAt: moment(auditEntry.changed_at).format("DD MMM YY"),
                    changedBy: RestrictedWordApiClient.getUsernameFromEmail(auditEntry.changed_by),
                    newValue: auditEntry.new_value
                };
            }),
            categoriesAuditLog: serverObject.categories_audit_log.map(function (auditEntry) {
                return {
                    changedAt: moment(auditEntry.changed_at).format("DD MMM YY"),
                    changedBy: RestrictedWordApiClient.getUsernameFromEmail(auditEntry.changed_by),
                    changedReason: auditEntry.changed_reason,
                    categories: auditEntry.categories
                };
            })
        };
    }

    public async patchSuperRestrictedStatus(options: RestrictedWordPatchSuperRestrictedRequest, fieldsToUpdate: string | undefined) {

        try {
            if (fieldsToUpdate === UpdateFields.SUPER_RESTRICTED) {
                await axiosInstance.patch(`/word/${options.id}`, {
                    patched_by: options.patchedBy,
                    super_restricted: options.superRestricted
                });
            } else if (fieldsToUpdate === UpdateFields.CATEGORIES) {
                await axiosInstance.patch(`/word/${options.id}`, {
                    patched_by: options.patchedBy,
                    categories: options.categories,
                    changed_reason: options.categoryChangeReason
                });
            } else if (fieldsToUpdate === UpdateFields.BOTH) {
                await axiosInstance.patch(`/word/${options.id}`, {
                    patched_by: options.patchedBy,
                    super_restricted: options.superRestricted,
                    categories: options.categories,
                    changed_reason: options.categoryChangeReason
                });
            }
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
        const activeSpan = otel.trace.getActiveSpan();

        const baggage = propagation.createBaggage({
            'correlation_id': { value: 'abc12345667890' },
            'feature.flag': { value: 'beta' }
        });

        // const baggage = propagation.getActiveBaggage() || propagation.createBaggage();
        // baggage.setEntry('correlation_id', { value: 'abc12345667890' });

        const ctxWithBaggage = propagation.setBaggage(context.active(), baggage);

        // console.log('propagation.getBaggage()', propagation.getBaggage(ctxWithBaggage));

        this._logger.info("Baggage set in the context ....");
        // context.with(ctxWithBaggage, () => {


        // const currentBaggage = propagation.getBaggage(context.active());
        // const correlationId = currentBaggage?.getEntry('correlation_id')?.value;

        // console.log(`correlation_id: ${correlationId}`);

        // console.log('propagation.getActiveBaggage()', propagation.getActiveBaggage());

        // });

        if (activeSpan) {
            activeSpan.setAttribute("correlation_id", "abc12345667890")
        }
        // console.log('Active span is : ', activeSpan);


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

        if (options.categories !== undefined) {
            queryString.categories = options.categories.join(",");
        }

        return context.with(ctxWithBaggage, async () => {
            const span = this.tracer.startSpan('process-request');


            // console.log("Inside the context with baggage", propagation.getActiveBaggage());

            this._logger.info("Calling the API with the buggage....");

            try {

                const response = await axiosInstance.get("/word", {
                    params: queryString
                });

                this._logger.info("API returned response ....");

                return response.data.map(RestrictedWordApiClient.mapFromApi);

            } catch (error) {
                throw this.handleErrors(error);
            }
            span.end();

        });

    }

    public async createRestrictedWord(word: string, createdReason: string, categories: Array<string>, superRestricted: boolean, deleteConflicting: boolean) {

        try {

            await axiosInstance.post("/word", {
                full_word: word,
                created_reason: createdReason,
                categories: categories,
                super_restricted: superRestricted,
                delete_conflicting: deleteConflicting,
                created_by: this._username
            });

        } catch (error) {
            throw this.handleErrors(error);
        }
    }

    public async deleteRestrictedWord(id: string, deletedReason: string) {

        try {

            await axiosInstance.delete(`/word/${id}`, {
                data: {
                    deleted_by: this._username,
                    deleted_reason: deletedReason
                }
            });

        } catch (error) {
            throw this.handleErrors(error);
        }
    }
}

export default RestrictedWordApiClient;
