require("mocha");

describe("pagerFactory", function () {

    describe("#getPaginationOptions", function () {

        it("returns the correct previous page index");
        it("returns the correct next page index");
        it("returns the correct current page index");
        it("returns the correct number of pages");
        it("returns the correct number of results");
        it("returns the correct starting index of the current page");
        it("returns the correct ending index of the current page");
    });

    describe("#pageResults", function () {

        it("returns the correct items for a first full page");
        it("returns the correct items for a first partially full page");
        it("returns the correct items for a middle full page");
        it("returns the correct items for a middle partially full page");
        it("returns the correct items for a final full page");
        it("returns the correct items for a final partially full page");
        it("defaults to page 1 if the page is below 1");
        it("defaults to the last page if the page is below over the last page");
    });
});
