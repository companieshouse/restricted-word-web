import sinon, { SinonStubbedInstance } from "sinon";

import ApplicationLogger from "ch-structured-logging/lib/ApplicationLogger";
import { ISignInInfo } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import { RequestHandler } from "express";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "ch-node-session-handler/lib/session/keys/UserProfileKeys";
import { expect } from "chai";

const proxyquire = require("proxyquire");

describe("authenticationMiddleware", function () {

    const mockApplicationLogger: SinonStubbedInstance<ApplicationLogger> = sinon.createStubInstance(ApplicationLogger);

    const createMockRequest = function (signInInfo?: ISignInInfo) {
        return {
            session: {
                chain: function () {
                    return {
                        extract: () => signInInfo
                    };
                }
            }
        };
    };

    const createMockResponse = function () {
        return {
            send: sinon.stub(),
            redirect: sinon.stub()
        };
    };

    let mockResponse: any;
    let mockNext: any;

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
            "../config": {
                default: mockConfig
            }
        }).default();
    };

    const permissionError = "You are signed in but do not have permissions!";

    beforeEach(function () {

        mockResponse = createMockResponse();
        mockNext = sinon.stub();

        middleware = requireMiddleware();

    });

    it("redirects to signin if session does not exist", function () {

        const mockRequest: any = createMockRequest();

        middleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.redirect)
            .to.have.been.calledOnceWithExactly(`/signin?return_to=/${mockConfig.urlPrefix}`);
    });

    it("redirects to signin if session exists but you are not signed in", function () {

        const mockRequest: any = createMockRequest({
            [SignInInfoKeys.SignedIn]: 0
        });

        middleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.redirect)
            .to.have.been.calledOnceWithExactly(`/signin?return_to=/${mockConfig.urlPrefix}`);
    });

    it("redirects to signin if you are signed in but user profile is undefined", function () {

        const mockRequest: any = createMockRequest({
            [SignInInfoKeys.SignedIn]: 1,
            [SignInInfoKeys.UserProfile]: undefined
        });

        middleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.redirect)
            .to.have.been.calledOnceWithExactly(`/signin?return_to=/${mockConfig.urlPrefix}`);
    });

    it("calls next if you are signed in and have the correct permissions", function () {

        const mockRequest: any = createMockRequest({
            [SignInInfoKeys.SignedIn]: 1,
            [SignInInfoKeys.UserProfile]: {
                [UserProfileKeys.Permissions]: {
                    "/admin/restricted-word": 1
                }
            }
        });

        middleware(mockRequest, mockResponse, mockNext);

        expect(mockNext)
            .to.have.been.called.calledOnce;
    });

    it("sends an error response if you are logged in and do not have correct permissions", function () {

        const mockRequest: any = createMockRequest({
            [SignInInfoKeys.SignedIn]: 1,
            [SignInInfoKeys.UserProfile]: {
                [UserProfileKeys.Permissions]: {
                    "/dog-show": 1,
                    "/admin/dog-show": 1
                }
            }
        });

        middleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.send)
            .to.have.been.calledOnceWithExactly(permissionError);
    });

    it("sends an error response if you are logged in and do not have the admin permission", function () {

        const mockRequest: any = createMockRequest({
            [SignInInfoKeys.SignedIn]: 1,
            [SignInInfoKeys.UserProfile]: {
                [UserProfileKeys.Permissions]: {
                    "/restricted-word": 1
                }
            }
        });

        middleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.send)
            .to.have.been.calledOnceWithExactly(permissionError);
    });

    it("sends an error response if you are logged in and only have a child permission", function () {

        const mockRequest: any = createMockRequest({
            [SignInInfoKeys.SignedIn]: 1,
            [SignInInfoKeys.UserProfile]: {
                [UserProfileKeys.Permissions]: {
                    "/admin/restricted-word/delete-word": 1
                }
            }
        });

        middleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.send)
            .to.have.been.calledOnceWithExactly(permissionError);
    });
});
