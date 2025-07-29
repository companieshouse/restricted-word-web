import { ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys";
import config from "../config";
import { createLogger } from "@companieshouse/structured-logging-node";
import { context, propagation, trace } from '@opentelemetry/api';


const logger = createLogger(config.applicationNamespace);

const createBaggageMiddleware = function (): RequestHandler {

    return (request: Request, response: Response, next: NextFunction) => {

        const baggage = propagation.createBaggage({
            'loggedin_user_email': { value: request.body.loggedInUserEmail }
        });

        const ctxWithBaggage = propagation.setBaggage(context.active(), baggage);

        context.with(ctxWithBaggage, () => next());

    };
};

export default createBaggageMiddleware;
