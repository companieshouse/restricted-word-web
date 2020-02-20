import { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { Request, Response } from "express";

import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import Pager from "../../src/pagination/Pager";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
import RestrictedWordViewModel from "../../src/clients/RestrictedWordViewModel";
import SubstituteFactory from "../SubstituteFactory";

const proxyquire = require("proxyquire").noCallThru();

const requireController = function (mockApiClient: SubstituteOf<RestrictedWordApiClient>, mockPager: SubstituteOf<Pager<RestrictedWordViewModel>>) {

    return proxyquire("../../src/controllers/RestrictedWordController", {
        "../clients/RestrictedWordApiClient": function () {
            return mockApiClient;
        },
        "../pagination/Pager": function () {
            return mockPager;
        }
    });
};

describe("RestrictedWordController", function () {

    const exampleWord = "Example word";

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
        restrictedWordController = requireController(mockApiClient, mockPager);
    });

    describe("#getAllWords", function () {

        it("returns the correct view", async function () {

            mockRequest.query.returns({});

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockResponse
                .received()
                .render("all", Arg.any());
        });

        it("returns deletedWord and addedWord if supplied", async function () {

            mockRequest.query.returns({
                deletedWord: exampleWord,
                addedWord: exampleWord
            });

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockResponse
                .received()
                .render("all", Arg.is(options =>
                    options.deletedWord === exampleWord &&
                    options.addedWord === exampleWord
                ));
        });

        it("returns filterWord and filterStatus as undefined if not supplied, and filterUrl is correct", async function () {

            mockRequest.query.returns({
                filterWord: ""
            });

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockApiClient
                .received()
                .getAllRestrictedWords(Arg.is(options =>
                    options.startsWith === undefined &&
                    options.contains === undefined &&
                    options.deleted === undefined
                ));

            mockResponse
                .received()
                .render("all", Arg.is(options =>
                    options.filterParams.status === undefined &&
                    !options.filterParams.word &&
                    options.filterUrl === "?"
                ));
        });

        it("returns supplied filterWord and filterStatus 'Active' if 'Active' supplied, and filterUrl is correct", async function () {

            mockRequest.query.returns({
                filterWord: exampleWord,
                filterStatus: "Active"
            });

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockApiClient
                .received()
                .getAllRestrictedWords(Arg.is(options =>
                    options.startsWith === undefined &&
                    options.contains === exampleWord &&
                    options.deleted === false
                ));

            mockResponse
                .received()
                .render("all", Arg.is(options =>
                    options.filterParams.status === "Active" &&
                    options.filterParams.word === exampleWord &&
                    options.filterUrl === `?filterStatus=Active&filterWord=${encodeURIComponent(exampleWord)}`
                ));
        });

        it("returns filterStatus 'Deleted' if 'Deleted' supplied, and filterUrl is correct", async function () {

            mockRequest.query.returns({
                filterWord: "",
                filterStatus: "Deleted"
            });

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockApiClient
                .received()
                .getAllRestrictedWords(Arg.is(options =>
                    options.startsWith === undefined &&
                    options.contains === undefined &&
                    options.deleted === true
                ));

            mockResponse
                .received()
                .render("all", Arg.is(options =>
                    options.filterParams.status === "Deleted" &&
                    !options.filterParams.word &&
                    options.filterUrl === "?filterStatus=Deleted"
                ));
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

        it("logs and returns errors if word is not supplied");
    });

    describe("#handleDeleteWord", function () {

        it("logs and returns errors if word ID is not supplied", async function () {

            mockRequest.body.returns({});

            const mockLogger: SubstituteOf<ApplicationLogger> = SubstituteFactory.create<ApplicationLogger>();

            if (mockRequest.logger.returns !== undefined) {
                mockRequest.logger.returns(mockLogger);
            }

            await restrictedWordController.handleDeleteWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .error("Id required to delete word");

            mockResponse
                .received()
                .render("delete-word", Arg.any());
        });
    });
});
