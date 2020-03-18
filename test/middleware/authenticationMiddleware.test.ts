import { Request, Response } from "express";
import sinon, { SinonSandbox, SinonStubbedInstance } from "sinon";

import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import { RequestHandler } from "express";
import { expect } from "chai";

const proxyquire = require("proxyquire");

describe("authenticationMiddleware", function () {

    let sandbox: SinonSandbox;

    const mockApplicationLogger: SinonStubbedInstance<ApplicationLogger> = sinon.createStubInstance(ApplicationLogger);
    let mockRequest = sinon.createStubInstance<Request>();
    let mockResponse = sinon.createStubInstance<Response>();

    const testNamespace = "test-namespace";
    const mockConfig = {
        urlPrefix: "restricted-word",
        namespace: testNamespace
    };

    let middleware: RequestHandler;

    const requireMiddleware = function () {

        return proxyquire("../../src/middleware/authenticationMiddleware", {
            "ch-structured-logging": {
                createLogger: function () {
                    return mockApplicationLogger;
                }
            },
            "../config": mockConfig
        }).default;
    };

    beforeEach(function () {

        sandbox = sinon.createSandbox();

        middleware = requireMiddleware();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("redirects to signin if session");

    it("redirects to signin if session exists but you are not signed in");

    it("redirects to signin if you are signed in but user info is undefined");

    it("calls next if you are signed in and have the correct permissions");

    it("sends an error response if you are logged in and do not have correct permissions");
});
