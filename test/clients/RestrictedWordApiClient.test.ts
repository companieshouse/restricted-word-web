import chai, { expect } from "chai";
import sinon, { SinonStubbedInstance } from "sinon";

import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import { AxiosInstance } from "axios";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
import RestrictedWordDto from "../../src/clients/RestrictedWordDto";
import RestrictedWordFilterDto from "../../src/clients/RestrictedWordFilterDto";
import RestrictedWordQueryOptions from "../../src/clients/RestrictedWordQueryOptions";
import RestrictedWordViewModel from "../../src/clients/RestrictedWordViewModel";
import axiosInstance from "../../src/clients/axiosInstance";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";

chai.use(sinonChai);
chai.use(chaiAsPromised);

const proxyquire = require("proxyquire").noCallThru();

describe("RestrictedWordApiClient", function () {

    const mockAxiosInstance: SinonStubbedInstance<AxiosInstance> = sinon.stub(axiosInstance);
    const mockApplicationLogger: SinonStubbedInstance<ApplicationLogger> = sinon.createStubInstance(ApplicationLogger);

    let apiClient: RestrictedWordApiClient;

    const requireApiClient = function () {

        const client = proxyquire("../../src/clients/RestrictedWordApiClient", {
            "./axiosInstance": mockAxiosInstance,
            "../config": {
                applicationNamespace: "testNamespace"
            },
            "ch-structured-logging": {
                createLogger: function () {
                    return mockApplicationLogger;
                }
            }
        }).default;

        return client;
    };

    const testErrorResponse = {
        response: {
            data: {
                errors: ["Test error"]
            }
        }
    };

    const testForceRequiredResponse = {
        response: {
            data: {
                conflicting_words: [
                    "DOG",
                    "CAT",
                    "MONKEY",
                    "SEALION"
                ]
            }
        }
    };

    const testUser = "test@user.com";
    const testWord = "Test word";
    const testId = "abc123";

    beforeEach(function () {

        mockAxiosInstance.post = sinon.stub();
        mockAxiosInstance.delete = sinon.stub();
        mockAxiosInstance.get = sinon.stub();

        apiClient = new (requireApiClient())(testUser);
    });

    describe("#getSingleRestrictedWord", function () {

        const data: RestrictedWordDto = {
            id: testId,
            full_word: "FIRST",
            created_by: "FredJones@domain.other.tld",
            created_at: "2020-01-23T12:05:08.096",
            super_restricted: false,
            deleted: false,
            deleted_by: "",
            deleted_at: "",
            super_restricted_audit_log: [{
                changed_at: "2020-04-16T16:23:30",
                changed_by: "testname",
                new_value: true
            }, {
                changed_at: "2021-01-26T15:16:30",
                changed_by: "testnom",
                new_value: false
            }]
        };

        const testResult = {
            data: data
        };

        it("successfully maps result", async function () {

            mockAxiosInstance.get.resolves(testResult);

            const results = await apiClient.getSingleRestrictedWord(testId);

            expect(mockAxiosInstance.get).to.have.been.calledWithExactly(`/word/${testId}`);

            const mappedResult: RestrictedWordViewModel = {
                id: testId,
                word: "FIRST",
                createdBy: "FredJones",
                deletedBy: undefined,
                createdAt: "23 Jan 20",
                superRestricted: false,
                deletedAt: "-",
                deleted: false,
                superRestrictedAuditLog: [{
                    changedAt: "16 Apr 20",
                    changedBy: "testname",
                    newValue: true
                }, {
                    changedAt: "26 Jan 21",
                    changedBy: "testnom",
                    newValue: false
                }]
            };

            expect(mappedResult).to.deep.equal(results)
        });
    });

    describe("#patchSuperRestrictedStatus", function () {

        const testOptions = {
            id: testId,
            patchedBy: testUser,
            superRestricted: true
        };

        it("successfully calls the patch url", async function () {

            const expectedCallingObject = {
                patched_by: testUser,
                super_restricted: true
            };

            await apiClient.patchSuperRestrictedStatus(testOptions);

            expect(mockAxiosInstance.patch).to.have.been.calledWithExactly(`/word/${testId}`, expectedCallingObject);

        });
    });

    describe("#getAllRestrictedWords", function () {

        const testResults = {
            data: [
                {
                    id: "1",
                    full_word: "FIRST",
                    created_by: "FredJones@domain.other.tld",
                    created_at: "2020-01-23T12:05:08.096",
                    super_restricted: false,
                    deleted: false,
                    super_restricted_audit_log: []
                },
                {
                    id: "2",
                    full_word: "Second",
                    created_by: "Jill+Jones@email",
                    created_at: "2020-01-24T12:05:08.096",
                    super_restricted: true,
                    deleted_by: "Ben.Gun@anotheremail.net",
                    deleted_at: "2020-02-21T11:03:04.019",
                    deleted: true,
                    super_restricted_audit_log: []
                }
            ]
        };

        it("successfully maps results with words", async function () {

            mockAxiosInstance.get.resolves(testResults);

            const options: RestrictedWordQueryOptions = {};
            const queryString: RestrictedWordFilterDto = {};

            const results = await apiClient.getAllRestrictedWords(options);

            expect(mockAxiosInstance.get).to.have.been.calledWithExactly("/word", {
                params: queryString
            });

            const mappedResults = [
                {
                    id: "1",
                    word: "FIRST",
                    createdBy: "FredJones",
                    deletedBy: undefined,
                    createdAt: "23 Jan 20",
                    superRestricted: false,
                    deletedAt: "-",
                    deleted: false,
                    superRestrictedAuditLog: []
                },
                {
                    id: "2",
                    word: "Second",
                    createdBy: "Jill+Jones",
                    deletedBy: "Ben.Gun",
                    createdAt: "24 Jan 20",
                    superRestricted: true,
                    deletedAt: "21 Feb 20",
                    deleted: true,
                    superRestrictedAuditLog: []
                }
            ];

            expect(mappedResults).to.deep.equal(results);
        });

        it("successfully maps results with NO words", async function () {

            const emptyResults = {
                data: []
            };

            mockAxiosInstance.get.resolves(emptyResults);

            const options: RestrictedWordQueryOptions = {};
            const queryString: RestrictedWordFilterDto = {};

            const results = await apiClient.getAllRestrictedWords(options);

            expect(mockAxiosInstance.get).to.have.been.calledWithExactly("/word", {
                params: queryString
            });

            const mappedResults: RestrictedWordViewModel[] = [];

            expect(mappedResults).to.deep.equal(results);

        });

        it("passes filter options starts_with", async function () {

            mockAxiosInstance.get.resolves(testResults);

            const options: RestrictedWordQueryOptions = {};
            const queryString: RestrictedWordFilterDto = {};

            await apiClient.getAllRestrictedWords(options);

            expect(mockAxiosInstance.get).to.have.been.calledWithExactly("/word", {
                params: queryString
            });

        });

        it("passes filter options contains", async function () {

            mockAxiosInstance.get.resolves(testResults);

            const options: RestrictedWordQueryOptions = {
                contains: "Flower"
            };

            const queryString: RestrictedWordFilterDto = {
                contains: "Flower"
            };

            await apiClient.getAllRestrictedWords(options);

            expect(mockAxiosInstance.get).to.have.been.calledWithExactly("/word", {
                params: queryString
            });

        });

        it("passes filter options deleted words", async function () {

            mockAxiosInstance.get.resolves(testResults);

            const options: RestrictedWordQueryOptions = {
                deleted: true
            };

            const queryString: RestrictedWordFilterDto = {
                deleted: true
            };

            await apiClient.getAllRestrictedWords(options);

            expect(mockAxiosInstance.get).to.have.been.calledWithExactly("/word", {
                params: queryString
            });

        });

        it("handles errors from the API");

    });

    describe("#createRestrictedWord", function () {

        it("creates a word successfully", async function () {

            await apiClient.createRestrictedWord(testWord, true, false);

            expect(mockAxiosInstance.post).to.have.been.calledWithExactly("/word", {
                created_by: testUser,
                full_word: testWord,
                super_restricted: true,
                delete_conflicting: false
            });
        });

        it("returns an error when we can NOT create a word", async function () {

            mockAxiosInstance.post.rejects(testErrorResponse);

            await expect(apiClient.createRestrictedWord(testWord, false, false))
                .to.eventually.be.rejected
                .and.have.property("messages")
                .with.lengthOf(1);
        });

        it("returns an error with conflictingWords when conflicting_words is in the response", async function () {

            mockAxiosInstance.post.rejects(testForceRequiredResponse);

            await expect(apiClient.createRestrictedWord(testWord, false, false))
                .to.eventually.be.rejectedWith()
                .and.have.property("conflictingWords")
                .which.deep.equals([
                    "DOG",
                    "CAT",
                    "MONKEY",
                    "SEALION"
                ]);
        });

    });

    describe("#deleteRestrictedWord", function () {

        it("deletes a word successfully", async function () {

            await apiClient.deleteRestrictedWord(testId);

            expect(mockAxiosInstance.delete).to.have.been.calledWithExactly(`/word/${testId}`, {
                data: {
                    deleted_by: "test@user.com"
                }
            });
        });

        it("returns an error when we can NOT delete a word", async function () {

            mockAxiosInstance.delete.rejects(testErrorResponse);

            await expect(apiClient.deleteRestrictedWord(testId))
                .to.eventually.rejectedWith()
                .and.have.property("messages")
                .with.lengthOf(1);
        });

    });

});
