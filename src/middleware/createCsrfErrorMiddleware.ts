import { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import {
    CsrfError
} from '@companieshouse/web-security-node'

// TODO: Enter the template name here instead of <TEMPLATE NAME>
const csrfErrorTemplateName = "403";

const csrfErrorHandler = (err: CsrfError | Error, _: Request,
  res: Response, next: NextFunction) => {
  
  // handle non-CSRF Errors immediately
  if (!(err instanceof CsrfError)) {
    return next(err);
  }

  return res.status(403).render(
    csrfErrorTemplateName, {
        csrfErrors: true
    }
  )
};

export default csrfErrorHandler;