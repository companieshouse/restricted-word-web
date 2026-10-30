"use strict";

const fs = require("node:fs");
const path = require("node:path");
const sass = require("sass");

const outputDirectory = path.resolve("dist");
const stylesheetDirectory = path.join(outputDirectory, "stylesheets");
const assetsDirectory = path.resolve("node_modules/govuk-frontend/govuk/assets");

fs.mkdirSync(stylesheetDirectory, { recursive: true });
const { css } = sass.compile(path.resolve("scss/application.scss"), { sourceMap: false });
fs.writeFileSync(path.join(stylesheetDirectory, "application.css"), css);
fs.cpSync(assetsDirectory, outputDirectory, { recursive: true });
