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

            it("returns the correct starting and ending result index of the current page", function () {

                const paginationOptions = getPaginationOptions("2", 100);

                expect(paginationOptions.startOfPage).to.equal(31);
                expect(paginationOptions.endOfPage).to.equal(60);
            });

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

            it("defaults to the last page if the page is over the last page", function () {

                const pager = new Pager("11", createResults(300));
                const paginationOptions = pager.getPaginationOptions();

                expect(paginationOptions.currentPage).to.equal(10);
            });

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

        it("returns the correct items for a first full page", function () {

            const results = createResults(300);
            const pager = new Pager("1", results);
            const pageResults = pager.pageResults();

            expect(pageResults).to.deep.equal(results.slice(0, 30));
        });

        it("returns the correct items for a first partially full page", function () {

            const numResults = 15;
            const results = createResults(numResults);
            const pager = new Pager("1", results);
            const pageResults = pager.pageResults();

            expect(pageResults).to.deep.equal(results.slice(0, numResults));
        });

        it("returns the correct items for a middle full page", function () {

            const results = createResults(300);
            const pager = new Pager("3", results);
            const pageResults = pager.pageResults();

            expect(pageResults).to.deep.equal(results.slice(60, 90));
        });

        it("returns the correct items for a middle partially full page", function () {

            const numResults = 75;
            const results = createResults(numResults);
            const pager = new Pager("3", results);
            const pageResults = pager.pageResults();

            expect(pageResults).to.deep.equal(results.slice(60, numResults));
        });

        it("returns the correct items for a final full page", function () {

            const results = createResults(300);
            const pager = new Pager("10", results);
            const pageResults = pager.pageResults();

            expect(pageResults).to.deep.equal(results.slice(270, 300));
        });

        it("returns the correct items for a final partially full page", function () {

            const numResults = 275;
            const results = createResults(numResults);
            const pager = new Pager("310", results);
            const pageResults = pager.pageResults();

            expect(pageResults).to.deep.equal(results.slice(270, numResults));
        });

    });
});
