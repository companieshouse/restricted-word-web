import { SessionMiddleware, SessionStore, CookieConfig } from "@companieshouse/node-session-handler";
import { createLogger, createLoggerMiddleware } from "@companieshouse/structured-logging-node";
import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import nunjucks, { ConfigureOptions } from "nunjucks";

import Redis from "ioredis";
import RestrictedWordRouter from "./routers/RestrictedWordRouter";
import config from "./config";
import cookieParser from "cookie-parser";
import createAuthenticationMiddleware from "./middleware/createAuthenticationMiddleware";
import createNotFoundMiddleware from "./middleware/createNotFoundMiddleware";
import express from "express";
import helmet from "helmet";
import path from "path";
import csrfErrorHandler from "middleware/csrfErrorMiddleware";

const logger = createLogger(config.applicationNamespace);
const sessionStore = new SessionStore(new Redis(`redis://${config.session.cacheServer}`));
const cookieConfig: CookieConfig = { cookieName: config.session.cookieName, cookieSecret: config.session.cookieSecret, cookieDomain: config.session.cookieDomain };
const sessionMiddleware = SessionMiddleware(cookieConfig, sessionStore);
const csrfProtectionMiddleware = CsrfProtectionMiddleware({
    sessionStore,
    enabled: true,
    sessionCookieName: config.session.cookieName
});

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
        "dist/views",
        "node_modules/govuk-frontend/",
        "node_modules/govuk-frontend/components/",
        "node_modules/@companieshouse/"
    ], nunjucksConfig)
    .addGlobal("urlPrefix", config.urlPrefix);

app.set("view engine", "html");
app.use(`/${config.urlPrefix}/public`, express.static(path.join(__dirname, "../dist")));

app.use(createLoggerMiddleware(config.applicationNamespace));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(csrfProtectionMiddleware);

app.use(createAuthenticationMiddleware());

app.use(`/${config.urlPrefix}/`, RestrictedWordRouter.create());

app.use(csrfErrorHandler);

app.use(createNotFoundMiddleware());

app.listen(config.port, function () {
    logger.info(`Server started on port ${config.port}`);
});
