import { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { Request, Response } from "express";

import Pager from "../../src/pagination/Pager";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
import RestrictedWordViewModel from "../../src/clients/RestrictedWordViewModel";
import SubstituteFactory from "../SubstituteFactory";

const proxyquire = require("proxyquire").noCallThru();

describe.only("RestrictedWordController", function () {

    let mockRequest: SubstituteOf<Request>;
    let mockResponse: SubstituteOf<Response>;
    let mockApiClient: SubstituteOf<RestrictedWordApiClient>;
    let mockPager: SubstituteOf<Pager<RestrictedWordViewModel>>;

    beforeEach(function () {
        mockRequest = SubstituteFactory.create<Request>();
        mockResponse = SubstituteFactory.create<Response>();
        mockApiClient = SubstituteFactory.create<RestrictedWordApiClient>();
        mockPager = SubstituteFactory.create<Pager<RestrictedWordViewModel>>();
    });

    describe("#getAllWords", function () {

        it("returns the correct view", async function () {

            const RestrictedWordController = proxyquire("../../src/controllers/RestrictedWordController", {
                "../clients/RestrictedWordApiClient": mockApiClient,
                "../pagination/Pager": mockPager
            });

            mockApiClient
                .getAllRestrictedWords(Arg.any())
                .returns(Promise.resolve([]));

            mockRequest.query.returns({});

            await RestrictedWordController.getAllWords(mockRequest, mockResponse);

            mockResponse
                .received()
                .render("all", Arg.any());
        });
    });

    describe("#createNewWord", function () {
        //
    });

    describe("#handleCreateNewWord", function () {
        //
    });

    describe("#deleteWord", function () {
        //
    });

    describe("#handleDeleteWord", function () {
        //
    });
});
