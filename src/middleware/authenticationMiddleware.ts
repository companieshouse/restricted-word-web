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
        // request.session.ifNothing(() => {
        //     logger.errorRequest(request, "Session doesn't exist");

        //     return response.redirect(`/signin?return_to=/${config.urlPrefix}`);
        // });

        console.log("headers", request.headers);

        const signInInfo: ISignInInfo | undefined = request.session
            .chain((session: Session) => session.getValue<ISignInInfo>(SessionKey.SignInInfo)).extract();

        if (signInInfo !== undefined) {
            const signedIn = signInInfo[SignInInfoKeys.SignedIn] === 1;
            const userInfo: any = signInInfo[SignInInfoKeys.UserProfile];

            if (userInfo !== undefined) {
                const permissions = userInfo[UserProfileKeys.Permissions] as any;
                const scope = userInfo[UserProfileKeys.Scope];

                console.log("permissions is", permissions);
                console.log("scope is", scope);

                if (signedIn) {
                    return next();
                }
            }
        }

        return response.redirect(`/signin?return_to=/${config.urlPrefix}`);
    };
};

export = createAuthenticationMiddleware;
