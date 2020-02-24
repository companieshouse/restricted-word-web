import Pager from "../../src/pagination/Pager";
import { expect } from "chai";

describe("Pager", function () {

    const createResults = function (numResults: number): string[] {

        const results = [];

        for (let i = 0; i < numResults; i++) {
            results.push(`Result ${i + 1}`);
        }

        return results;
    };

    const getPaginationOptions = function (currentPage: string | undefined, numResults: number, resultsPerPage?: number) {

        const pager = new Pager(currentPage, createResults(numResults), resultsPerPage);

        return pager.getPaginationOptions();
    };

    describe("#getPaginationOptions", function () {

        context("with default results per page", function () {

            it("returns the correct previous, next and current page index", function () {

                const paginationOptions = getPaginationOptions("3", 2000);

                expect(paginationOptions.previousPage).to.equal(2);
                expect(paginationOptions.nextPage).to.equal(4);
                expect(paginationOptions.currentPage).to.equal(3);
            });

            it("returns the correct number of pages and results", function () {

                const paginationOptions = getPaginationOptions(undefined, 2000);

                expect(paginationOptions.numResults).to.equal(2000);
                expect(paginationOptions.totalPages).to.equal(67); // Math.ceil(2000 / 30)
            });

            it("returns the correct number of results");

            it("returns the correct starting result index of the current page");

            it("returns the correct ending result index of the current page");

            it("defaults to page 1 if the page is below 1", function () {

                const pager = new Pager("-50", createResults(2000));
                const paginationOptions = pager.getPaginationOptions();

                expect(paginationOptions.currentPage).to.equal(1);
            });

            it("defaults to page 1 if the page is undefined", function () {

                const pager = new Pager(undefined, createResults(2000));
                const paginationOptions = pager.getPaginationOptions();

                expect(paginationOptions.currentPage).to.equal(1);
            });

            it("defaults to the last page if the page is over the last page");

        });

        context("with custom results per page", function () {

            it("returns the correct number of pages and results", function () {

                const paginationOptions = getPaginationOptions(undefined, 2000, 13);

                expect(paginationOptions.numResults).to.equal(2000);
                expect(paginationOptions.totalPages).to.equal(154); // Math.ceil(2000 / 13)
            });

        });

    });

    describe("#pageResults", function () {

        it("returns the correct items for a first full page");

        it("returns the correct items for a first partially full page");

        it("returns the correct items for a middle full page");

        it("returns the correct items for a middle partially full page");

        it("returns the correct items for a final full page");

        it("returns the correct items for a final partially full page");

    });
});
