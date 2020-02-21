import { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { Request, Response } from "express";

import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import Pager from "../../src/pagination/Pager";
import PaginationOptions from "../../src/pagination/PaginationOptions";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
import RestrictedWordViewModel from "../../src/clients/RestrictedWordViewModel";
import SubstituteFactory from "../SubstituteFactory";
import { expect } from "chai";

const proxyquire = require("proxyquire").noCallThru();

describe("RestrictedWordController", function () {

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

    const createRestrictedWordViewModel = function (): RestrictedWordViewModel {
        return {
            id: "id",
            word: "word",
            createdBy: "createdBy",
            deletedBy: "deletedBy",
            createdAt: "createdAt",
            deletedAt: "deletedAt"
        };
    };

    const createPaginationOptions = function (): PaginationOptions {
        return {
            previousPage: 1,
            nextPage: 2,
            currentPage: 3,
            totalPages: 4,
            numResults: 5,
            startOfPage: 6,
            endOfPage: 7
        };
    };

    const exampleWord1 = "Example word 1";
    const exampleWord2 = "Example word 2";
    const exampleError = "Test message";

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
                deletedWord: exampleWord1,
                addedWord: exampleWord2
            });

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockResponse
                .received()
                .render("all", Arg.is(options => {

                    expect(options.deletedWord).to.equal(exampleWord1);
                    expect(options.addedWord).to.equal(exampleWord2);

                    return true;
                }));
        });

        it("returns the filterWord, filterStatus as undefined if not supplied, and filterUrl is correct", async function () {

            mockRequest.query.returns({
                filterWord: ""
            });

            const expectedFilterUrl = "?";

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockApiClient
                .received()
                .getAllRestrictedWords(Arg.is(options => {

                    expect(options.startsWith).to.not.exist;
                    expect(options.contains).to.not.exist;
                    expect(options.deleted).to.not.exist;

                    return true;
                }));

            mockResponse
                .received()
                .render("all", Arg.is(options => {

                    expect(options.filterParams.status).to.not.exist;
                    expect(options.filterParams.word).to.be.empty;
                    expect(options.filterUrl).to.equal(expectedFilterUrl);

                    return true;
                }));
        });

        it("returns the supplied filterWord, filterStatus 'Active' if 'Active' supplied, and filterUrl is correct", async function () {

            mockRequest.query.returns({
                filterWord: exampleWord1,
                filterStatus: "Active"
            });

            const expectedFilterUrl = `?filterStatus=Active&filterWord=${encodeURIComponent(exampleWord1)}`;

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockApiClient
                .received()
                .getAllRestrictedWords(Arg.is(options => {

                    expect(options.startsWith).to.not.exist;
                    expect(options.contains).to.equal(exampleWord1);
                    expect(options.deleted).to.be.false;

                    return true;
                }));

            mockResponse
                .received()
                .render("all", Arg.is(options => {

                    expect(options.filterParams.status).to.equal("Active");
                    expect(options.filterParams.word).to.equal(exampleWord1);
                    expect(options.filterUrl).to.equal(expectedFilterUrl);

                    return true;
                }));
        });

        it("returns filterStatus 'Deleted' if 'Deleted' supplied, and filterUrl is correct", async function () {

            mockRequest.query.returns({
                filterWord: "",
                filterStatus: "Deleted"
            });

            const expectedFilterUrl = "?filterStatus=Deleted";

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockApiClient
                .received()
                .getAllRestrictedWords(Arg.is(options => {

                    expect(options.startsWith).to.not.exist;
                    expect(options.contains).to.not.exist;
                    expect(options.deleted).to.be.true;

                    return true;
                }));

            mockResponse
                .received()
                .render("all", Arg.is(options => {

                    expect(options.filterParams.status).to.equal("Deleted");
                    expect(options.filterParams.word).to.be.empty;
                    expect(options.filterUrl).to.equal(expectedFilterUrl);

                    return true;
                }));
        });

        it("puts the results of 'pageResults' in 'words', and results of 'getPaginationOptions' in 'pagination' on the render options", async function () {

            mockRequest.query.returns({});

            const expectedResults = [createRestrictedWordViewModel()];
            const expectedPaginationOptions = createPaginationOptions();

            const originalResultValues = [Object.assign({}, expectedResults[0])];
            const originalPaginationOptionsValues = Object.assign({}, expectedPaginationOptions);

            mockPager
                .pageResults()
                .returns(expectedResults);

            mockPager
                .getPaginationOptions()
                .returns(expectedPaginationOptions);

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockResponse
                .received()
                .render("all", Arg.is(options => {

                    expect(options.words).to.equal(expectedResults);
                    expect(options.words).to.deep.equal(originalResultValues);

                    expect(options.pagination).to.equal(expectedPaginationOptions);
                    expect(options.pagination).to.deep.equal(originalPaginationOptionsValues);

                    return true;
                }));
        });

        it("calls render with 'errors' defined in the options", async function () {

            mockRequest.query.returns({});

            const expectedError = [{ text: exampleError }];

            mockApiClient
                .getAllRestrictedWords(Arg.any())
                .returns(new Promise((_resolve, reject) => reject({
                    messages: [exampleError]
                })));

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockResponse
                .received()
                .render("all", Arg.is(options => {

                    expect(options.errors)
                        .to.exist
                        .to.have.length(1)
                        .to.deep.equal(expectedError);

                    return true;
                }));
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
