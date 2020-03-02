import { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { Request, Response } from "express";

import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import Pager from "../../src/pagination/Pager";
import PaginationOptions from "../../src/pagination/PaginationOptions";
import PromiseRejector from "../PromiseRejector";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
import RestrictedWordViewModel from "../../src/clients/RestrictedWordViewModel";
import SubstituteFactory from "../SubstituteFactory";
import { expect } from "chai";

const proxyquire = require("proxyquire").noCallThru();

describe("RestrictedWordController", function () {

    const testNamespace = "test-namespace";

    const mockConfig = {
        urlPrefix: "restricted-word",
        namespace: testNamespace
    };

    let mockRequest: SubstituteOf<Request>;
    let mockResponse: SubstituteOf<Response>;
    let mockLogger: SubstituteOf<ApplicationLogger>;
    let mockApiClient: SubstituteOf<RestrictedWordApiClient>;
    let mockPager: SubstituteOf<Pager<RestrictedWordViewModel>>;
    let restrictedWordController: any;

    const requireController = function () {

        return proxyquire("../../src/controllers/RestrictedWordController", {
            "../clients/RestrictedWordApiClient": function () {
                return mockApiClient;
            },
            "../pagination/Pager": function () {
                return mockPager;
            },
            "../config": mockConfig,
            "ch-structured-logging": {
                createLogger: function () {
                    return mockLogger;
                }
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
            deletedAt: "deletedAt",
            deleted: false
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
    const exampleId = "abc123";

    beforeEach(function () {

        mockRequest = SubstituteFactory.create<Request>();
        mockResponse = SubstituteFactory.create<Response>();
        mockLogger = SubstituteFactory.create<ApplicationLogger>();
        mockApiClient = SubstituteFactory.create<RestrictedWordApiClient>();
        mockPager = SubstituteFactory.create<Pager<RestrictedWordViewModel>>();
        restrictedWordController = requireController();
    });

    describe("#getAllWords", function () {

        const getAllWordsViewName = "all";

        it("returns the correct view", async function () {

            mockRequest.query.returns({});

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(getAllWordsViewName, Arg.any());
        });

        it("returns deletedWord and addedWord if supplied", async function () {

            mockRequest.query.returns({
                deletedWord: exampleWord1,
                addedWord: exampleWord2
            });

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(getAllWordsViewName, Arg.is(options => {

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
                .render(getAllWordsViewName, Arg.is(options => {

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
                .render(getAllWordsViewName, Arg.is(options => {

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
                .render(getAllWordsViewName, Arg.is(options => {

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
                .render(getAllWordsViewName, Arg.is(options => {

                    expect(options.words)
                        .to.equal(expectedResults)
                        .to.deep.equal(originalResultValues);

                    expect(options.pagination)
                        .to.equal(expectedPaginationOptions)
                        .to.deep.equal(originalPaginationOptionsValues);

                    return true;
                }));
        });

        it("calls render with 'errors' defined in the options if the api rejects the promise, and logs error", async function () {

            mockRequest.query.returns({});

            const expectedError = [{ text: exampleError }];

            mockApiClient
                .getAllRestrictedWords(Arg.any())
                .returns(PromiseRejector.rejectWith({
                    messages: [exampleError]
                }));

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, Arg.is(message => {

                    expect(message).to.include(exampleError);

                    return true;
                }));

            mockResponse
                .received()
                .render(getAllWordsViewName, Arg.is(options => {

                    expect(options.errors)
                        .to.have.length(1)
                        .to.deep.equal(expectedError);

                    return true;
                }));
        });
    });

    describe("#createNewWord", function () {

        const createNewWordViewName = "add-new-word";

        it("returns the correct view", async function () {

            await restrictedWordController.createNewWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(createNewWordViewName);
        });
    });

    describe("#handleCreateNewWord", function () {

        const createNewWordViewName = "add-new-word";

        it("calls the api with the word from the body with no errors, and redirects successfully", async function () {

            mockRequest.body.returns({
                word: exampleWord1
            });

            const expectedRedirectUrl = `/${mockConfig.urlPrefix}/?addedWord=${encodeURIComponent(exampleWord1)}`;

            await restrictedWordController.handleCreateNewWord(mockRequest, mockResponse);

            mockApiClient
                .received()
                .createRestrictedWord(exampleWord1);

            mockResponse
                .received()
                .redirect(expectedRedirectUrl, Arg.any());
        });

        it("renders the create view with errors and the word, if the api raises errors, and logs error", async function () {

            mockRequest.body.returns({
                word: exampleWord1
            });

            const expectedError = [{ text: exampleError }];

            mockApiClient
                .createRestrictedWord(Arg.any())
                .returns(PromiseRejector.rejectWith({
                    messages: [exampleError]
                }));

            await restrictedWordController.handleCreateNewWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, Arg.is(message => {

                    expect(message)
                        .to.include(exampleError)
                        .to.include(exampleWord1);

                    return true;
                }));

            mockResponse
                .received()
                .render(createNewWordViewName, Arg.is(options => {

                    expect(options.errors)
                        .to.have.length(1)
                        .to.deep.equal(expectedError);

                    expect(options.word).to.equal(exampleWord1);

                    return true;
                }));
        });

        it("sends back and logs error if word is not provided", async function () {

            mockRequest.body.returns({
                word: ""
            });

            const wordRequiredError = "A word is required to create a new word";
            const expectedError = [{ text: wordRequiredError }];

            await restrictedWordController.handleCreateNewWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, wordRequiredError);

            mockResponse
                .received()
                .render(createNewWordViewName, Arg.is(options => {

                    expect(options.errors)
                        .to.have.length(1)
                        .to.deep.equal(expectedError);

                    return true;
                }));
        });
    });

    describe("#deleteWord", function () {

        const deleteWordViewName = "delete-word";

        it("returns the correct view with the provided word and ID", async function () {

            mockRequest.query.returns({
                id: exampleId,
                word: exampleWord1
            });

            await restrictedWordController.deleteWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(deleteWordViewName, Arg.is(options => {

                    expect(options.id).to.equal(exampleId);
                    expect(options.word).to.equal(exampleWord1);

                    return true;
                }));
        });

        it("returns and logs errors if no ID is supplied", async function () {

            mockRequest.query.returns({
                word: exampleWord1
            });

            const missingIdError = "Id required to delete word";

            const expectedError = [{ text: missingIdError }];

            await restrictedWordController.deleteWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, missingIdError);

            mockResponse
                .received()
                .render(deleteWordViewName, Arg.is(options => {

                    expect(options.errors).to.deep.equal(expectedError);

                    return true;
                }));
        });

        it("returns and logs errors if no word is supplied", async function () {

            mockRequest.query.returns({
                id: exampleId
            });

            const missingIdError = "Word required to delete word";

            const expectedError = [{ text: missingIdError }];

            await restrictedWordController.deleteWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, missingIdError);

            mockResponse
                .received()
                .render(deleteWordViewName, Arg.is(options => {

                    expect(options.errors).to.deep.equal(expectedError);

                    return true;
                }));
        });
    });

    describe("#handleDeleteWord", function () {

        const deleteWordViewName = "delete-word";

        it("logs and returns errors if word ID is not supplied", async function () {

            mockRequest.body.returns({
                word: exampleWord1
            });

            const missingIdError = "Id required to delete word";
            const expectedError = [{ text: missingIdError }];

            await restrictedWordController.handleDeleteWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, missingIdError);

            mockResponse
                .received()
                .render(deleteWordViewName, Arg.is(options => {

                    expect(options.errors).to.deep.equal(expectedError);

                    return true;
                }));
        });

        it("logs and returns errors if word is not supplied", async function () {

            mockRequest.body.returns({
                id: exampleId
            });

            const missingIdError = "Word required to delete word";
            const expectedError = [{ text: missingIdError }];

            await restrictedWordController.handleDeleteWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, missingIdError);

            mockResponse
                .received()
                .render(deleteWordViewName, Arg.is(options => {

                    expect(options.errors).to.deep.equal(expectedError);

                    return true;
                }));
        });

        it("calls the api with the word ID provided and succesfully redirects if no errors", async function () {

            mockRequest.body.returns({
                id: exampleId,
                word: exampleWord1
            });

            await restrictedWordController.handleDeleteWord(mockRequest, mockResponse);

            mockApiClient
                .received()
                .deleteRestrictedWord(exampleId);

            mockResponse
                .received()
                .redirect(`/${mockConfig.urlPrefix}/?deletedWord=${encodeURIComponent(exampleWord1)}`, Arg.any());
        });

        it("returns and logs an error and the word/ID if the api throws an error", async function () {

            mockRequest.body.returns({
                id: exampleId,
                word: exampleWord1
            });

            const expectedError = [{ text: exampleError }];

            mockApiClient
                .deleteRestrictedWord(Arg.any())
                .returns(PromiseRejector.rejectWith({
                    messages: [exampleError]
                }));

            await restrictedWordController.handleDeleteWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, Arg.is(message => {

                    expect(message)
                        .to.include(exampleError)
                        .to.include(exampleId)
                        .to.include(exampleWord1);

                    return true;
                }));

            mockResponse
                .received()
                .render(deleteWordViewName, Arg.is(options => {

                    expect(options.errors)
                        .to.have.length(1)
                        .to.deep.equal(expectedError);

                    expect(options.word).to.equal(exampleWord1);

                    expect(options.id).to.equal(exampleId);

                    return true;
                }));
        });
    });
});
