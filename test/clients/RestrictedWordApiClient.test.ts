import { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import chai, { expect } from "chai";
import sinon, { SinonStubbedInstance } from "sinon";

import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import { AxiosInstance } from "axios";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
import SubstituteFactory from "../SubstituteFactory";
import axiosInstance from "../../src/clients/axiosInstance";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

const proxyquire = require("proxyquire").noCallThru();

describe("RestrictedWordApiClient", function () {

    let mockAxiosInstance: SinonStubbedInstance<AxiosInstance>;
    let mockApplicationLogger: SubstituteOf<ApplicationLogger>;

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

        mockAxiosInstance = sinon.stub(axiosInstance);
        mockApplicationLogger = SubstituteFactory.create<ApplicationLogger>();

        apiClient = new (requireApiClient())(testUser);
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

        it("returns an error when we can NOT create a word");

    });
});
