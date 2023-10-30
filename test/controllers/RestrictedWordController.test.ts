import { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { Request, Response } from "express";

import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import Pager from "../../src/pagination/Pager";
import PaginationOptions from "../../src/pagination/PaginationOptions";
import PromiseRejector from "../PromiseRejector";
import PromiseResolver from "../PromiseResolver";
import RestrictedWordApiClient from "../../src/clients/RestrictedWordApiClient";
import RestrictedWordViewModel from "../../src/clients/RestrictedWordViewModel";
import SubstituteFactory from "../SubstituteFactory";
import { expect } from "chai";
import config from "../../src/config";

const proxyquire = require("proxyquire").noCallThru();

describe("RestrictedWordController", function () {

    const testNamespace = "test-namespace";
    const testUrl = "test-url";

    const mockConfig = {
        urlPrefix: "restricted-word",
        namespace: testNamespace,
        baseUrl: testUrl
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
            "@companieshouse/structured-logging-node": {
                createLogger: function () {
                    return mockLogger;
                }
            }
        }).default;
    };

    const createRestrictedWordViewModel = function (): RestrictedWordViewModel {
        return {
            id: "id",
            word: "word",
            categories: ["criminal-fraudulent-purposes"],
            createdBy: "createdBy",
            deletedBy: "deletedBy",
            createdAt: "createdAt",
            deletedAt: "deletedAt",
            deletedReason: "deletedReason",
            deleted: false,
            superRestricted: false,
            superRestrictedAuditLog: []
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
    const exampleCategories = ["prev-subjected-to-direction-to-change", "criminal-fraudulent-purposes"];
    const exampleCreatedReason = "Example created reason";
    const exampleDelReason = "reason";

    beforeEach(function () {
        mockRequest = SubstituteFactory.create<Request>();
        mockResponse = SubstituteFactory.create<Response>();
        mockLogger = SubstituteFactory.create<ApplicationLogger>();
        mockApiClient = SubstituteFactory.create<RestrictedWordApiClient>();
        mockPager = SubstituteFactory.create<Pager<RestrictedWordViewModel>>();
        restrictedWordController = requireController();
    });

    describe("#getWord", function () {

        const getWordViewName = "word";

        it("returns the correct view", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({});
            }

            await restrictedWordController.getWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(getWordViewName, Arg.any());
        });

        it("renders the true super restricted value correctly", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    setSuperRestricted: "true"
                });
            }

            await restrictedWordController.getWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(getWordViewName, Arg.is(options => {

                    expect(options.setSuperRestricted).to.equal("true");

                    return true;
                }));
        });

        it("renders the false super restricted value correctly", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    setSuperRestricted: "false"
                });
            }

            await restrictedWordController.getWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(getWordViewName, Arg.is(options => {

                    expect(options.setSuperRestricted).to.equal("false");

                    return true;
                }));
        });

        it("maps the audit correctly", async function () {

            const databaseWord = {
                superRestrictedAuditLog: [{
                    changedAt: "18 May 2020",
                    changedBy: "todd",
                    newValue: true
                }, {
                    changedAt: "19 June 2020",
                    changedBy: "kenneth",
                    newValue: false
                }]
            };

            const expectedResult1 = [{
                text: "18 May 2020"
            }, {
                text: "todd"
            }, {
                text: "Yes"
            }];

            const expectedResult2 = [{
                text: "19 June 2020"
            }, {
                text: "kenneth"
            }, {
                text: "No"
            }];

            mockApiClient.getSingleRestrictedWord(Arg.any()).returns(PromiseResolver.resolveWith(databaseWord));

            await restrictedWordController.getWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render("word", Arg.is(options => {

                    expect(options.wordHistory.length).to.equal(2);

                    const record1 = options.wordHistory[0];
                    const record2 = options.wordHistory[1];

                    expect(record1).to.deep.equal(expectedResult1);
                    expect(record2).to.deep.equal(expectedResult2);

                    return true;
                }));
        });
    });

    describe("#postSuperRestrictedWord", function () {

        const viewName = "word";
        const testId = "abc123";
        const testUser = "test@test.com";

        it("redirects after successful patch", async function () {

            mockRequest.body.returns({
                id: testId,
                superRestricted: "true",
                loggedInUserEmail: testUser
            });

            await restrictedWordController.postSuperRestrictedWord(mockRequest, mockResponse);
            mockResponse
                .received()
                .redirect(Arg.is(options => {
                    expect(options).to.equal(`${mockConfig.baseUrl}/${mockConfig.urlPrefix}/word/${testId}?setSuperRestricted=true`);
                    return true;
                }));
        });

        it("should redirect successfully with default base url for no CHS_URL env variable", async function () {
            const temp = process.env.CHS_URL;
            process.env.CHS_URL = undefined;
            mockConfig.baseUrl = config.baseUrl;

            mockRequest.body.returns({
                id: testId,
                superRestricted: "true",
                loggedInUserEmail: testUser
            });

            await restrictedWordController.postSuperRestrictedWord(mockRequest, mockResponse);
            mockResponse
                .received()
                .redirect(Arg.is(options => {
                    expect(options).to.equal(`${mockConfig.baseUrl}/${mockConfig.urlPrefix}/word/${testId}?setSuperRestricted=true`);
                    return true;
                }));
            expect(mockConfig.baseUrl).to.equal("http://chs.local");
            process.env.CHS_URL = temp;
        });

        it("should throw an error with invalid id", async function () {
            const invalidId = "$$";
            mockRequest.body.returns({
                id: invalidId,
                superRestricted: "true",
                loggedInUserEmail: testUser
            });

            await restrictedWordController.postSuperRestrictedWord(mockRequest, mockResponse);
            mockResponse
                .received()
                .render(viewName, Arg.is(options => {

                    const expectedErrors = [{
                        text: `Provided id: (${invalidId}) is not valid. Must be alpha numeric.`
                    }];

                    expect(options.errors).to.deep.equal(expectedErrors);

                    return true;
                }));
        });

        it("renders the word page if there is an error", async function () {

            mockApiClient.patchSuperRestrictedStatus(Arg.any()).returns(PromiseRejector.rejectWith({
                messages: [exampleError]
            }));

            mockRequest.body.returns({
                id: testId
            });

            await restrictedWordController.postSuperRestrictedWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(viewName, Arg.is(options => {

                    const expectedErrors = [{
                        text: exampleError
                    }];

                    expect(options.errors).to.deep.equal(expectedErrors);

                    return true;
                }));
        });
    });

    describe("#getAllWords", function () {

        const getAllWordsViewName = "all";

        it("returns the correct view", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({});
            }
            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(getAllWordsViewName, Arg.any());
        });

        it("returns deletedWord and addedWord if supplied", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    deletedWord: exampleWord1,
                    addedWord: exampleWord2
                });
            }

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
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    filterWord: ""
                });
            }

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

        it("returns the supplied filterWord, superRestricted 'Super' if 'Super' supplied, deletedStatus 'Active' if 'Active' supplied, and filterUrl is correct", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    filterWord: exampleWord1,
                    deletedStatus: "Active",
                    filterSuperRestricted: "Super"
                });
            }

            const expectedFilterUrl = `?filterSuperRestricted=Super&deletedStatus=Active&filterWord=${encodeURIComponent(exampleWord1)}`;

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
                    expect(options.filterParams.superRestricted).to.equal("Super");
                    expect(options.filterParams.word).to.equal(exampleWord1);
                    expect(options.filterUrl).to.equal(expectedFilterUrl);

                    return true;
                }));
        });

        it("returns filterStatus 'Deleted' if 'Deleted' supplied, superRestricted 'Normal' if 'Normal' supplied,  and filterUrl is correct", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    filterWord: "",
                    deletedStatus: "Deleted",
                    filterSuperRestricted: "Normal"
                });
            }

            const expectedFilterUrl = "?filterSuperRestricted=Normal&deletedStatus=Deleted";

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
                    expect(options.filterParams.superRestricted).to.equal("Normal");
                    expect(options.filterParams.word).to.be.empty;
                    expect(options.filterUrl).to.equal(expectedFilterUrl);

                    return true;
                }));
        });

        it("handles selecting a single category correctly", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    categorySelection: "restricted"
                });
            }

            const expectedFilterUrl = "?categorySelection=restricted";

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockApiClient
                .received()
                .getAllRestrictedWords(Arg.is(options => {
                    expect(options.startsWith).to.not.exist;
                    expect(options.contains).to.not.exist;
                    expect(options.categories).to.be.eql(["restricted"]);
                    return true;
                }));

            mockResponse
                .received()
                .render(getAllWordsViewName, Arg.is(options => {
                    expect(options.filterParams.categories).to.be.eql(["restricted"]);
                    expect(options.filterParams.status).to.not.exist;
                    expect(options.filterParams.superRestricted).to.not.exist;
                    expect(options.filterParams.word).to.not.exist;
                    expect(options.filterUrl).to.equal(expectedFilterUrl);
                    return true;
                }));
        });

        it("handles selecting multiple cateogories correctly", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    categorySelection: ["restricted", "international-orgs-foreign-gov-depts"]
                });
            }

            const expectedFilterUrl = "?categorySelection=restricted&categorySelection=international-orgs-foreign-gov-depts";

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockApiClient
                .received()
                .getAllRestrictedWords(Arg.is(options => {
                    expect(options.startsWith).to.not.exist;
                    expect(options.contains).to.not.exist;
                    expect(options.categories).to.be.eql(["restricted", "international-orgs-foreign-gov-depts"]);
                    return true;
                }));

            mockResponse
                .received()
                .render(getAllWordsViewName, Arg.is(options => {
                    expect(options.filterParams.categories).to.be.eql(["restricted", "international-orgs-foreign-gov-depts"]);
                    expect(options.filterParams.status).to.not.exist;
                    expect(options.filterParams.superRestricted).to.not.exist;
                    expect(options.filterParams.word).to.not.exist;
                    expect(options.filterUrl).to.equal(expectedFilterUrl);
                    return true;
                }));
        });

        it("passes undefined to the API and passes an empty array to render when no category is selected", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({});
            }

            const expectedFilterUrl = "?";

            await restrictedWordController.getAllWords(mockRequest, mockResponse);

            mockApiClient
                .received()
                .getAllRestrictedWords(Arg.is(options => {
                    expect(options.startsWith).to.not.exist;
                    expect(options.contains).to.not.exist;
                    expect(options.categories).to.not.exist;
                    return true;
                }));

            mockResponse
                .received()
                .render(getAllWordsViewName, Arg.is(options => {
                    expect(options.filterParams.categories).to.be.eql([]);
                    expect(options.filterParams.status).to.not.exist;
                    expect(options.filterParams.superRestricted).to.not.exist;
                    expect(options.filterParams.word).to.not.exist;
                    expect(options.filterUrl).to.equal(expectedFilterUrl);
                    return true;
                }));
        });

        it("puts the results of 'pageResults' in 'words', and results of 'getPaginationOptions' in 'pagination' on the render options", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({});
            }
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
            if (mockRequest.query.returns) {
                mockRequest.query.returns({});
            }

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

    describe("#getCreateNewWord", function () {

        const createNewWordViewName = "add-new-word";

        it("returns the correct view", async function () {

            await restrictedWordController.getCreateNewWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(createNewWordViewName);
        });
    });

    describe("#postCreateNewWord", function () {

        const createNewWordViewName = "add-new-word";

        it("calls the api with the word from the body with no errors, and redirects successfully", async function () {

            mockRequest.body.returns({
                word: exampleWord1,
                createdReason: exampleCreatedReason,
                categories: exampleCategories
            });

            const expectedRedirectUrl = `/${mockConfig.urlPrefix}/?addedWord=${encodeURIComponent(exampleWord1)}`;

            await restrictedWordController.postCreateNewWord(mockRequest, mockResponse);

            mockApiClient
                .received()
                .createRestrictedWord(exampleWord1, exampleCreatedReason, exampleCategories, false, false);

            mockResponse
                .received()
                .redirect(expectedRedirectUrl, Arg.any());
        });

        it("renders the create view with errors and the word, if the api raises errors, and logs error", async function () {

            mockRequest.body.returns({
                word: exampleWord1,
                createdReason: exampleCreatedReason,
                categories: exampleCategories
            });

            const expectedError = [{ text: exampleError }];

            mockApiClient
                .createRestrictedWord(exampleWord1, exampleCreatedReason, exampleCategories, false, false)
                .returns(PromiseRejector.rejectWith({
                    messages: [exampleError]
                }));

            await restrictedWordController.postCreateNewWord(mockRequest, mockResponse);

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
                    expect(options.superRestricted).to.equal(false);

                    return true;
                }));
        });

        it("sends back and logs error if word is not provided", async function () {

            mockRequest.body.returns({
                word: "",
                createdReason: exampleCreatedReason,
                categories: exampleCategories
            });

            const wordRequiredError = "A word is required to create a new word";
            const expectedError = [{ text: wordRequiredError }];

            await restrictedWordController.postCreateNewWord(mockRequest, mockResponse);

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

        it("sends back and logs error if created reason is not provided", async function () {

            mockRequest.body.returns({
                word: exampleWord1,
                createdReason: "",
                categories: exampleCategories
            });

            const createdReasonRequiredError = "A reason for creating the word is required";
            const expectedError = [{ text: createdReasonRequiredError }];

            await restrictedWordController.postCreateNewWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, createdReasonRequiredError);

            mockResponse
                .received()
                .render(createNewWordViewName, Arg.is(options => {

                    expect(options.errors)
                        .to.have.length(1)
                        .to.deep.equal(expectedError);

                    return true;
                }));
        });

        it("sends back and logs error if category is not provided", async function () {

            mockRequest.body.returns({
                word: exampleWord1,
                createdReason: exampleCreatedReason
            });

            const categoriesRequiredError = "A category for the new word is required";
            const expectedError = [{ text: categoriesRequiredError }];

            await restrictedWordController.postCreateNewWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, categoriesRequiredError);

            mockResponse
                .received()
                .render(createNewWordViewName, Arg.is(options => {

                    expect(options.errors)
                        .to.have.length(1)
                        .to.deep.equal(expectedError);

                    return true;
                }));
        });

        it("returns appropriate information if word needs forcing", async function () {

            mockRequest.body.returns({
                word: exampleWord1,
                createdReason: exampleCreatedReason,
                categories: exampleCategories
            });

            mockApiClient
                .createRestrictedWord(exampleWord1, exampleCreatedReason, exampleCategories, false, false)
                .returns(Promise.reject({ // eslint-disable-line prefer-promise-reject-errors
                    conflictingWords: ["DOG", "CAT"]
                }));

            await restrictedWordController.postCreateNewWord(mockRequest, mockResponse);

            mockApiClient
                .received()
                .createRestrictedWord(exampleWord1, exampleCreatedReason, exampleCategories, false, false);

            mockResponse
                .received()
                .render("add-new-word", Arg.is(options => {

                    expect(options)
                        .to.deep.equal({
                            word: exampleWord1.toUpperCase(),
                            createdReason: exampleCreatedReason,
                            categories: exampleCategories,
                            superRestricted: false,
                            hasConflicting: true,
                            conflictingWords: [
                                "DOG",
                                "CAT"
                            ]
                        });

                    return true;
                }));
        });
    });

    describe("#getDeleteWord", function () {

        const deleteWordViewName = "delete-word";

        it("returns the correct view with the provided word and ID", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    id: exampleId,
                    word: exampleWord1
                });
            }

            await restrictedWordController.getDeleteWord(mockRequest, mockResponse);

            mockResponse
                .received()
                .render(deleteWordViewName, Arg.is(options => {

                    expect(options.id).to.equal(exampleId);
                    expect(options.word).to.equal(exampleWord1);

                    return true;
                }));
        });

        it("returns and logs errors if no ID is supplied", async function () {
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    word: exampleWord1
                });
            }

            const missingIdError = "Id required to delete word";

            const expectedError = [{ text: missingIdError }];

            await restrictedWordController.getDeleteWord(mockRequest, mockResponse);

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
            if (mockRequest.query.returns) {
                mockRequest.query.returns({
                    id: exampleId
                });
            }

            const missingIdError = "Word required to delete word";

            const expectedError = [{ text: missingIdError }];

            await restrictedWordController.getDeleteWord(mockRequest, mockResponse);

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

    describe("#postDeleteWord", function () {

        const deleteWordViewName = "delete-word";

        it("logs and returns errors if word ID is not supplied", async function () {

            mockRequest.body.returns({
                word: exampleWord1
            });

            const missingIdError = "Id required to delete word";
            const expectedError = [{ text: missingIdError }];

            await restrictedWordController.postDeleteWord(mockRequest, mockResponse);

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

            await restrictedWordController.postDeleteWord(mockRequest, mockResponse);

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

        it("logs and returns errors if delete reason is not supplied", async function () {

            mockRequest.body.returns({
                id: exampleId,
                word: exampleWord1
            });

            const missingReasonError = "Justification required to delete word";
            const expectedError = [{ text: missingReasonError }];

            await restrictedWordController.postDeleteWord(mockRequest, mockResponse);

            mockLogger
                .received()
                .errorRequest(mockRequest, missingReasonError);

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
                word: exampleWord1,
                deletedReason: exampleDelReason
            });

            await restrictedWordController.postDeleteWord(mockRequest, mockResponse);

            mockApiClient
                .received()
                .deleteRestrictedWord(exampleId, exampleDelReason);

            mockResponse
                .received()
                .redirect(`/${mockConfig.urlPrefix}/?deletedWord=${encodeURIComponent(exampleWord1)}`, Arg.any());
        });

        it("returns and logs an error and the word/ID if the api throws an error", async function () {

            mockRequest.body.returns({
                id: exampleId,
                word: exampleWord1,
                deletedReason: exampleDelReason
            });

            const expectedError = [{ text: exampleError }];

            mockApiClient
                .deleteRestrictedWord(Arg.any(), Arg.any())
                .returns(PromiseRejector.rejectWith({
                    messages: [exampleError]
                }));

            await restrictedWordController.postDeleteWord(mockRequest, mockResponse);

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
