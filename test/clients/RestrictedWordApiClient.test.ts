import { Arg, SubstituteOf } from "@fluffy-spoon/substitute";

import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import { AxiosInstance } from "axios";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
import SubstituteFactory from "../SubstituteFactory";
import { expect } from "chai";

const proxyquire = require("proxyquire").noCallThru();

describe("RestrictedWordApiClient", function () {

    let mockAxiosInstance: SubstituteOf<AxiosInstance>;
    let mockApplicationLogger: SubstituteOf<ApplicationLogger>;
    let MockApiClient: RestrictedWordApiClient;
    let mockApiClient: RestrictedWordApiClient;

    const requireApiClient = function () {

        const client = proxyquire("../../src/clients/RestrictedWordApiClient", {
            "./axiosInstance": mockAxiosInstance,
            "../config": {
                applicationNamespace: "testNamespace"
            },
            "ch-structured-logging": function () {
                return mockApplicationLogger;
            }
        });

        return client;
    };

    const testUser = "test@user.com";

    beforeEach(function () {

        mockAxiosInstance = SubstituteFactory.create<AxiosInstance>();
        mockApplicationLogger = SubstituteFactory.create<ApplicationLogger>();

        MockApiClient = requireApiClient();
        mockApiClient = Object.create(MockApiClient);
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

        it("creates a word successfully", function () {

            mockApiClient.createRestrictedWord("naughty");
        });

        it("returns an error when we can NOT create a word");

    });
});
