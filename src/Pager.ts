"use strict";

class Pager {

    private resultsPerPage: number;
    private totalPages: number;
    private currentPage: number;
    private results: any[];

    constructor(requestedPage: string, results: any[]) {

        this.resultsPerPage = 30;

        this.totalPages = Math.ceil(results.length / this.resultsPerPage);
        this.currentPage = requestedPage ? parseInt(requestedPage) : 1;

        this.results = results;
    }

    getPaginationOptions() {

        const startOfRangeOffset = (this.currentPage * this.resultsPerPage) - this.resultsPerPage;

        const endOfRange = startOfRangeOffset + this.resultsPerPage;
        const endOfPage = endOfRange < this.results.length ?
            endOfRange :
            this.results.length;

        return {
            previousPage: this.currentPage - 1,
            nextPage: this.currentPage + 1,
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            numResults: this.results.length,
            startOfPage: startOfRangeOffset + 1,
            endOfPage: endOfPage
        };
    }

    pageResults() {

        const pagedResults = this.results.slice((this.currentPage - 1) * this.resultsPerPage, this.currentPage * this.resultsPerPage);

        return pagedResults;
    }
}

export = Pager;
