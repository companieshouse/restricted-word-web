import { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { Request, Response } from "express";
import SubstituteFactory from "../SubstituteFactory";
import * as healthcheckController from "../../src/controllers/healthcheckController";

let mockRequest: SubstituteOf<Request>;
let mockResponse: SubstituteOf<Response>;

describe("healthcheckController", function () {

    beforeEach(function () {
        mockRequest = SubstituteFactory.create<Request>();
        mockResponse = SubstituteFactory.create<Response>();
    });

    describe("GET tests", function () {
        it("returns a 200 response", function () {
            healthcheckController.get(mockRequest, mockResponse);

            mockResponse
                .received()
                .status(200);
        });

        it("returns the message \"OK\"", function () {
            mockResponse.status(Arg.any()).returns(mockResponse);
            healthcheckController.get(mockRequest, mockResponse);

            mockResponse
                .received()
                .send("OK");
        });
    });
});
