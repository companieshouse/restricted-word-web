import { NextFunction, Request, Response } from "express";
import { CsrfError } from "@companieshouse/web-security-node";
import { StatusCodes } from "http-status-codes";

const csrfErrorTemplateName = "403";

const csrfErrorHandler = (
    err: CsrfError | Error,
    _: Request,
    res: Response,
    next: NextFunction
) => {
    if (!(err instanceof CsrfError)) {
        return next(err);
    }

    return res.status(StatusCodes.FORBIDDEN).render(csrfErrorTemplateName, {
        csrfErrors: true
    });
};

export default csrfErrorHandler;
