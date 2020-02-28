import chai, { expect } from "chai";
import sinon, { SinonSandbox, SinonStubbedInstance } from "sinon";

import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import { AxiosInstance } from "axios";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
import RestrictedWordFilterDto from "../../src/clients/RestrictedWordFilterDto";
import RestrictedWordQueryOptions from "../../src/clients/RestrictedWordQueryOptions";
import axiosInstance from "../../src/clients/axiosInstance";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";

chai.use(sinonChai);
chai.use(chaiAsPromised);

const proxyquire = require("proxyquire").noCallThru();

describe("RestrictedWordApiClient", function () {

    let sandbox: SinonSandbox;

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
        });

        return client;
    };

    const testUser = "test@user.com";

    beforeEach(function () {

        sandbox = sinon.createSandbox();

        mockAxiosInstance.post = sinon.stub();

        mockAxiosInstance.delete = sinon.stub();

        mockAxiosInstance.get = sinon.stub();

        apiClient = new (requireApiClient())(testUser);
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("#getAllRestrictedWords", function () {

        it("successfully maps results with words");

        it("successfully maps results with NO words");

        it("passes filter options starts_with", async function () {

            const results = [
                {
                    id: "1",
                    word: "FIRST",
                    createdBy: "Fred Jones",
                    createdAt: "2020-01-23T12:05:08.096"
                },
                {
                    id: "2",
                    word: "Second",
                    createdBy: "Jill Jones",
                    createdAt: "2020-01-24T12:05:08.096"
                }
            ];

            mockAxiosInstance.get.returnValues = Promise.resolve(results);

            const outerOptions: RestrictedWordQueryOptions = {
                startsWith: "PA"
            };

            const queryString: RestrictedWordFilterDto = {
                // eslint-disable-next-line camelcase
                starts_with: "PA"
            };

            await apiClient.getAllRestrictedWords(outerOptions);

            expect(mockAxiosInstance.get).to.have.been.calledWithExactly("/word", {
                params: queryString
            });

        });

        it("passes filter options contains");

        it("passes filter options deleted words");

        it("handles errors from the API");

    });

    describe("#createRestrictedWord", function () {

        it("creates a word successfully", async function () {

            const restrictedWord = "naughty";

            await apiClient.createRestrictedWord(restrictedWord);

            expect(mockAxiosInstance.post).to.have.been.calledWithExactly("/word", {
                "created_by": "test@user.com",
                "full_word": "naughty"
            });
        });

        it("returns an error when we can NOT create a word", async function () {

            const word = "test";

            mockAxiosInstance.post.rejects({
                response: {
                    data: {
                        errors: ["Test error"]
                    }
                }
            });

            await expect(apiClient.createRestrictedWord(word))
                .to.eventually.rejectedWith()
                .and.have.property("messages")
                .with.lengthOf(1);
        });

    });

    describe("#deleteRestrictedWord", function () {

        it("deletes a word successfully", async function () {

            const id = "123456";

            await apiClient.deleteRestrictedWord(id);

            expect(mockAxiosInstance.delete).to.have.been.calledWithExactly("/word/".concat(id), {
                data: {
                    "deleted_by": "test@user.com"
                }
            });
        });

        it("returns an error when we can NOT delete a word", async function () {

            const id = "123456";

            mockAxiosInstance.delete.rejects({
                response: {
                    data: {
                        errors: ["Test error"]
                    }
                }
            });

            await expect(apiClient.deleteRestrictedWord(id))
                .to.eventually.rejectedWith()
                .and.have.property("messages")
                .with.lengthOf(1);
        });

    });

});
