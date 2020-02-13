import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { Request, Response } from "express";

// import RestrictedWordController from "../../src/controllers/RestrictedWordController";
import { expect } from "chai";

describe("RestrictedWordController", function () {

    // let mockRequest: SubstituteOf<Request>;
    // let mockResponse: SubstituteOf<Response>;

    // beforeEach(function () {
    //     mockRequest = Substitute.for<Request>();
    //     mockResponse = Substitute.for<Response>();
    // });

    describe("#getAllWords", function () {

        it("returns the correct view", async function () {

            // await RestrictedWordController.getAllWords(mockRequest, mockResponse);
            // mockResponse.received().render("")
            // expect(mockResponse.render).to.exist;
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
