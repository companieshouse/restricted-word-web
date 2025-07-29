import { NextFunction, Request, RequestHandler, Response } from "express";
import config from "../config";
import { createLogger } from "@companieshouse/structured-logging-node";
import { context, propagation } from '@opentelemetry/api';


const logger = createLogger(config.applicationNamespace);

const createBaggageMiddleware = function (): RequestHandler {

    return (request: Request, response: Response, next: NextFunction) => {

        if (request.originalUrl === `/${config.urlPrefix}/healthcheck`) {
            logger.debug("/healthcheck endpoint called, skipping setting the baggage.");
            return next();
        }

        const loggedInUserEmail = request.body.loggedInUserEmail;

        if (!loggedInUserEmail) {
            return next();
        }

        const baggage = propagation.createBaggage({
            'loggedin_user_email': { value: loggedInUserEmail }
        });
        const ctxWithBaggage = propagation.setBaggage(context.active(), baggage);

        context.with(ctxWithBaggage, () => next());
    };
};

export default createBaggageMiddleware;
