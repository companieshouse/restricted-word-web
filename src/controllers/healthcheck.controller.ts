import { Request, Response } from "express";
import config from "../config";
import { createLogger } from "@companieshouse/structured-logging-node";

const logger = createLogger(config.applicationNamespace);

export const get = (req: Request, res: Response) => {
    logger.debug(`GET healthcheck`);
  
    res.status(200).send("OK");
};