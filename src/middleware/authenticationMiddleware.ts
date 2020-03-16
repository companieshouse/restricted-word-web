import { ISignInInfo } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import { RequestHandler } from "express";
import { Session } from "ch-node-session-handler";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "ch-node-session-handler/lib/session/keys/UserProfileKeys";
import config from "../config";
import { createLogger } from "ch-structured-logging";

const logger = createLogger(config.applicationNamespace);

const createAuthenticationMiddleware = function (): RequestHandler {

    return (request, response, next) => {

        const signInInfo = request.session
            .chain((session: Session) => session.getValue<ISignInInfo>(SessionKey.SignInInfo))
            .extract();

        if (signInInfo !== undefined) {

            const signedIn = signInInfo[SignInInfoKeys.SignedIn] === 1;
            const userInfo = signInInfo[SignInInfoKeys.UserProfile];

            if (signedIn && userInfo !== undefined) {

                const permissions = userInfo[UserProfileKeys.Permissions];

                if (permissions !== undefined && permissions["/admin/restricted-word"] === 1) {
                    return next();
                } else {
                    return response.send("You are signed in but do not have permissions!");
                }
            }
        }

        return response.redirect(`/signin?return_to=/${config.urlPrefix}`);
    };
};

export = createAuthenticationMiddleware;
