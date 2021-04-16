import { SessionMiddleware, SessionStore } from "ch-node-session-handler";
import { createLogger, createLoggerMiddleware } from "ch-structured-logging";
import nunjucks, { ConfigureOptions } from "nunjucks";

import Redis from "ioredis";
import RestrictedWordRouter from "./routers/RestrictedWordRouter";
import authenticationMiddleware from "./middleware/authenticationMiddleware";
import config from "./config";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import notFoundMiddleware from "./middleware/notFoundMiddleware";
import path from "path";

const logger = createLogger(config.applicationNamespace);
const sessionStore = new SessionStore(new Redis(`redis://${config.session.cacheServer}`));
const sessionMiddleware = SessionMiddleware({ // eslint-disable-line new-cap
    cookieName: config.session.cookieName,
    cookieSecret: config.session.cookieSecret
}, sessionStore);

const app = express();

const nunjucksConfig: ConfigureOptions = {
    autoescape: true,
    noCache: false,
    express: app
};

if (config.env === "development") {
    logger.info("Configuring nunjucks for development mode");
    nunjucksConfig.watch = true;
    nunjucksConfig.noCache = true;
}

nunjucks
    .configure([
        "views",
        "node_modules/govuk-frontend/",
        "node_modules/govuk-frontend/components/"
    ], nunjucksConfig)
    .addGlobal("urlPrefix", config.urlPrefix);

app.set("view engine", "html");
app.use(`/${config.urlPrefix}/public`, express.static(path.join(__dirname, "../dist")));

app.use(createLoggerMiddleware(config.applicationNamespace));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

app.use(authenticationMiddleware());

app.use(`/${config.urlPrefix}/`, RestrictedWordRouter.create());

app.use(notFoundMiddleware());

app.listen(config.port, function () {
    logger.info(`Server started on port ${config.port}`);
});
