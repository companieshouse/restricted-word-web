import { ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import config from "../config";
import { createLogger } from "@companieshouse/structured-logging-node";

const logger = createLogger(config.applicationNamespace);

const createAuthenticationMiddleware = function (): RequestHandler {

    return (request: Request, response: Response, next : NextFunction) => {

        if (request.originalUrl === `/${config.urlPrefix}/healthcheck`) {
            logger.debug("/healthcheck endpoint called, skipping authentication.");
            return next();
        }

        const signInInfo: ISignInInfo | undefined = request.session?.data[SessionKey.SignInInfo];

        if (signInInfo !== undefined) {

            const signedIn = signInInfo[SignInInfoKeys.SignedIn] === 1;
            const userInfo = signInInfo[SignInInfoKeys.UserProfile];

            if (signedIn && userInfo !== undefined) {

                const permissions = userInfo[UserProfileKeys.Permissions];

                // Not optimal, awaiting api with request.session.email or similar
                if (request.body === undefined) {
                    request.body = {};
                }

                request.body.loggedInUserEmail = userInfo[UserProfileKeys.Email];
                // /Not optimal

                if (permissions !== undefined && permissions["/admin/restricted-word"] === 1) {
                    return next();
                } else {
                    logger.infoRequest(request, `Signed in user (${request.body.loggedInUserEmail}) does not have the correct permissions`);

                    response.status(404); // eslint-disable-line @typescript-eslint/no-magic-numbers

                    return response.render("404");
                }
            }
        }

        return response.redirect(`/signin?return_to=/${config.urlPrefix}`);
    };
};

export default createAuthenticationMiddleware;
