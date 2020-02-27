import chai, { expect } from "chai";
import sinon, { SinonSandbox, SinonStubbedInstance } from "sinon";

import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import { AxiosInstance } from "axios";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
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

        apiClient = new (requireApiClient())(testUser);
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe("#getAllRestrictedWords", function () {

        it("successfully maps results with words");

        it("successfully maps results with NO words");

        it("passes filter options starts_with");

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
});
