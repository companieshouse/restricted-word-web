import { ISignInInfo } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import { RequestHandler } from "express";
import { Session } from "ch-node-session-handler";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import config from "../config";
import { createLogger } from "ch-structured-logging";

const logger = createLogger(config.applicationNamespace);

const createAuthenticationMiddleware = function (): RequestHandler {

    return (request, response, next) => {

        request.session.ifNothing(() => {

            logger.errorRequest(request, "Session doesn't exist");

            return next();
        });

        const signedIn = request.session
            .chain((session: Session) => session.getValue<ISignInInfo>(SessionKey.SignInInfo))
            .map((signInInfo: ISignInInfo) => signInInfo[SignInInfoKeys.SignedIn] === 1)
            .orDefault(false);

        if (signedIn) {
            return next();
        }

        return response.redirect(`/signin?return_to=/${config.urlPrefix}`);
    };
};

export = createAuthenticationMiddleware;
