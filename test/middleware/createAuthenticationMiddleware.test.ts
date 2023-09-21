import sinon, { SinonStubbedInstance } from "sinon";

import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { RequestHandler } from "express";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import { expect } from "chai";

import proxyquire from "proxyquire";
import { Session } from "@companieshouse/node-session-handler";

describe("createAuthenticationMiddleware", function () {

    const mockApplicationLogger: SinonStubbedInstance<ApplicationLogger> = sinon.createStubInstance(ApplicationLogger);

    const createMockSession = function (signInInfo?: ISignInInfo): Session {
        return new Session({
            [SessionKey.SignInInfo]: signInInfo
        });
    };

    const createMockRequest = function (signInInfo?: ISignInInfo) {
        return {
            session: createMockSession(signInInfo)
        };
    };

    const createMockResponse = function () {
        return {
            redirect: sinon.stub(),
            status: sinon.stub(),
            render: sinon.stub()
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

        return proxyquire("../../src/middleware/createAuthenticationMiddleware", {
            "@companieshouse/structured-logging-node": {
                createLogger: function () {
                    return mockApplicationLogger;
                }
            },
            "../config": {
                default: mockConfig
            }
        }).default();
    };

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

        const mockRequest: any = createMockRequest();

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

        expect(mockResponse.status)
            .to.have.been.calledOnceWithExactly(404);

        expect(mockResponse.render)
            .to.have.been.calledOnceWithExactly("404");
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

        expect(mockResponse.status)
            .to.have.been.calledOnceWithExactly(404);

        expect(mockResponse.render)
            .to.have.been.calledOnceWithExactly("404");
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

        expect(mockResponse.status)
            .to.have.been.calledOnceWithExactly(404);

        expect(mockResponse.render)
            .to.have.been.calledOnceWithExactly("404");
    });

    it("calls next and skips authentication if request is for the healthcheck url", function () {

        const mockRequest: any = {
            originalUrl: "/healthcheck"
        };

        middleware(mockRequest, mockResponse, mockNext);

        expect(mockNext)
            .to.have.been.called.calledOnce;

        expect(mockResponse.redirect)
            .not.to.have.been.called;

        expect(mockResponse.render)
            .not.to.have.been.called;
    });
});
