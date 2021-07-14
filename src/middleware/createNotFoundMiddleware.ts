import { RequestHandler } from "express";

const createNotFoundMiddleware = function (): RequestHandler {

    return (_request, response) => {

        response.status(404); // eslint-disable-line @typescript-eslint/no-magic-numbers

        return response.render("404");
    };
};

export default createNotFoundMiddleware;
