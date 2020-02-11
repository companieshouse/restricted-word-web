"use strict";

const parentDismisser = function () {
    const me = {};

    const dismissibleParents = Array.from(document.getElementsByClassName("js-dismissible"));

    const addListenersToChildren = function (dismissibleParent) {

        const dismissButtons = Array.from(dismissibleParent.getElementsByClassName("js-dismiss-button"));

        dismissButtons.forEach(function (dismissButton) {
            dismissButton.onclick = function () {

                dismissibleParent.parentNode.removeChild(dismissibleParent);

                /**
                 * Alternative:
                 *  dismissibleParent.style.display = "none";
                 */
            };
        });
    };

    me.init = function () {
        dismissibleParents.forEach(addListenersToChildren);
    };

    return me;
};

module.exports = parentDismisser();
