import PaginationOptions from "./PaginationOptions";

class Pager<T> {

    private _resultsPerPage: number;

    private _totalPages: number;

    private _currentPage: number;

    private _results: T[];

    public constructor(requestedPage: string, results: T[]) {

        this._resultsPerPage = 30;

        this._totalPages = Math.ceil(results.length / this._resultsPerPage);
        this._currentPage = requestedPage ? parseInt(requestedPage) : 1;

        this._results = results;
    }

    public getPaginationOptions(): PaginationOptions {

        const startOfRangeOffset = (this._currentPage * this._resultsPerPage) - this._resultsPerPage;

        const endOfRange = startOfRangeOffset + this._resultsPerPage;
        const endOfPage = endOfRange < this._results.length ?
            endOfRange :
            this._results.length;

        return {
            previousPage: this._currentPage - 1,
            nextPage: this._currentPage + 1,
            currentPage: this._currentPage,
            totalPages: this._totalPages,
            numResults: this._results.length,
            startOfPage: startOfRangeOffset + 1,
            endOfPage: endOfPage
        };
    }

    public pageResults(): T[] {

        const pagedResults = this._results
            .slice((this._currentPage - 1) * this._resultsPerPage, this._currentPage * this._resultsPerPage);

        return pagedResults;
    }
}

export = Pager;
