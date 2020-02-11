"use strict";

const jsEnabler = require("./fancyFramework/jsEnabler");
const parentDismisser = require("./fancyFramework/parentDismisser");
const govUk = require("govuk-frontend");

document.addEventListener("DOMContentLoaded", function () {

    jsEnabler.init();
    parentDismisser.init();
    govUk.initAll();
});
