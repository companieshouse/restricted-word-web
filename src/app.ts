import { Session, SessionMiddleware, SessionStore } from "ch-node-session-handler";
import { createLogger, createLoggerMiddleware } from "ch-structured-logging";
import express, { response } from "express";
import nunjucks, { ConfigureOptions } from "nunjucks";

import { ISignInInfo } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import Redis from "ioredis";
import RestrictedWordRouter from "./routers/RestrictedWordRouter";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import config from "./config";
import helmet from "helmet";
import path from "path";

const logger = createLogger(config.applicationNamespace);
const sessionStore = new SessionStore(new Redis(`redis://${config.session.cacheServer}`));
const sessionMiddleware = SessionMiddleware({ // eslint-disable-line new-cap
    cookieName: config.session.cookieName,
    cookieSecret: config.session.cookieSecret
}, sessionStore);

const app = express();

app.use((request, _response, next) => {

    request.session.ifNothing(() => {

        logger.errorRequest(request, "Session doesn't exist");

        return next();
    });

    const signedIn = request.session
        .chain((session: Session) => session.getValue<ISignInInfo>(SessionKey.SignInInfo))
        .map((signInInfo: ISignInInfo) => signInInfo[SignInInfoKeys.SignedIn] === 1)
        .orDefault(false);

    if (signedIn) {
        return next();
    }

    return response.redirect(`/signin?return_to=${"test"}`);
});

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
app.use(sessionMiddleware);
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

app.use(`/${config.urlPrefix}/`, RestrictedWordRouter.create());

app.listen(config.port, function () {
    logger.info(`Server started on port ${config.port}`);
});
