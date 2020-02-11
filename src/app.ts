"use strict";

import express from "express";
import nunjucks, { ConfigureOptions } from "nunjucks";
import helmet from "helmet";
import path from "path";
import config from "./config";
import ChLogger from "ch-logger";

const chLogger = new ChLogger({
    namespace: "restricted-word-web"
});

const logger = chLogger.logger;

const app = express();

const nunjucksConfig: ConfigureOptions = {
    autoescape: true,
    noCache: true,
    express: app
};

if (config.env === "development") {
    nunjucksConfig.watch = true;
}

nunjucks.configure(
    [
        "views",
        "node_modules/govuk-frontend/",
        "node_modules/govuk-frontend/components/"
    ],
    nunjucksConfig
);

app.set("view engine", "html");
app.use("/public", express.static(path.join(__dirname, "../dist")));

app.use(chLogger.middleware);
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

import RestrictedWordRouter from "./routers/RestrictedWordRouter";

app.use("/", RestrictedWordRouter.create());

app.listen(config.port, function () {
    logger.info(`Server started on port ${config.port}`);
});
