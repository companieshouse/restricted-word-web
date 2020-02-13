import Pager from "../../src/pagination/Pager";
import { expect } from "chai";

describe("Pager", function () {

    const createResults = function (numResults: number): string[] {

        const results = [];

        for (let i = 0; i < numResults; i++) {
            results.push(`Result ${i}`);
        }

        return results;
    };

    describe("#getPaginationOptions", function () {

        it("returns the correct previous page index", function () {

            const pager = new Pager("3", createResults(2000));
            const paginationOptions = pager.getPaginationOptions();

            expect(paginationOptions.previousPage).to.equal(2);
            expect(paginationOptions.nextPage).to.equal(4);
            expect(paginationOptions.currentPage).to.equal(3);
        });

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
