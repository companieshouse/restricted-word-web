import { SessionMiddleware, SessionStore } from "ch-node-session-handler";
import nunjucks, { ConfigureOptions } from "nunjucks";

import ChStructuredLogging from "ch-structured-logging";
import RestrictedWordRouter from "./routers/RestrictedWordRouter";
import config from "./config";
import express from "express";
import helmet from "helmet";
import path from "path";
import redis from "redis";

const structuredLogging = new ChStructuredLogging({
    namespace: "restricted-word-web"
});

const logger = structuredLogging.logger;
const sessionStore = new SessionStore(redis.createClient(`redis://${config.session.cacheServer}`));
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

app.use(structuredLogging.middleware);

app.use(sessionMiddleware);
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

app.use(`/${config.urlPrefix}/`, RestrictedWordRouter.create());

app.listen(config.port, function () {
    logger.info(`Server started on port ${config.port}`);
});
