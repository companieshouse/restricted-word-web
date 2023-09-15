import { Request, Response } from "express";
import config from "../config";
import { createLogger } from "@companieshouse/structured-logging-node";

const logger = createLogger(config.applicationNamespace);

export const get = (req: Request, res: Response) => {
    logger.debug("GET healthcheck");
    const status = 200;
    res.status(status).send("OK");
};
