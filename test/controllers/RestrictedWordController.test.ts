import { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { Request, Response } from "express";

import Pager from "../../src/pagination/Pager";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
import RestrictedWordViewModel from "../../src/clients/RestrictedWordViewModel";
import SubstituteFactory from "../SubstituteFactory";

const proxyquire = require("proxyquire").noCallThru();

describe("RestrictedWordController", function () {

    let mockRequest: SubstituteOf<Request>;
    let mockResponse: SubstituteOf<Response>;
    let mockApiClient: SubstituteOf<RestrictedWordApiClient>;
    let mockPager: SubstituteOf<Pager<RestrictedWordViewModel>>;
    let restrictedWordController: any;

    beforeEach(function () {

        mockRequest = SubstituteFactory.create<Request>();
        mockResponse = SubstituteFactory.create<Response>();
        mockApiClient = SubstituteFactory.create<RestrictedWordApiClient>();
        mockPager = SubstituteFactory.create<Pager<RestrictedWordViewModel>>();
        restrictedWordController = proxyquire("../../src/controllers/RestrictedWordController", {
            "../clients/RestrictedWordApiClient": mockApiClient,
            "../pagination/Pager": mockPager
        });
    });

    describe("#getAllWords", function () {

        it("returns the correct view", async function () {

            mockRequest.query.returns({});

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockResponse
                .received()
                .render("all", Arg.any());
        });
    });

    describe("#createNewWord", function () {

        it("returns the correct view", async function () {

            await restrictedWordController.createNewWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render("add-new-word");
        });
    });

    describe("#handleCreateNewWord", function () {
        //
    });

    describe("#deleteWord", function () {

        it("returns the correct view", async function () {

            await restrictedWordController.deleteWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render("delete-word", Arg.any());
        });

        it("logs and returns errors if word ID is not supplied", async function () {

            await restrictedWordController.deleteWord(mockRequest, mockResponse);

            mockRequest.logger;

            mockResponse
                .received()
                .render("delete-word", Arg.any());
        });

        it("logs and returns errors if word is not supplied");
    });

    describe("#handleDeleteWord", function () {
        //
    });
});
