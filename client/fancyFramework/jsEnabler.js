"use strict";

const jsEnabler = function () {
    const me = {};

    const hiddenJsElements = Array.from(document.getElementsByClassName("js-is-disabled"));

    me.init = function () {
        hiddenJsElements.forEach(function (element) {
            element.classList.remove("js-is-disabled");
        });
    };

    return me;
};

module.exports = jsEnabler();
