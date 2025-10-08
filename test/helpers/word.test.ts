import { getCategoriesList, getCategoriesListHtml } from "../../src/helpers/word";
import { expect } from "chai";

describe("RestrictedWordHelper", function () {

    describe("#getCategoriesListHtml", function () {

        it("returns blank when categories list is empty", async function () {
            expect(getCategoriesListHtml([])).to.equal("");
        });

        it("returns proper html when called with one category", async function () {
            expect(getCategoriesListHtml(["criminal-fraudulent-purposes"]))
                .to.equal(`
                <div class="tooltip">
                    <strong class="govuk-tag govuk-tag--blue">
                        Crimes/Fraud
                    </strong>
                    <span class="tooltip-text">Names for criminal / fraudulent purposes</span>
                </div>
                <br>
            `);
        });

        it("returns proper html when called with multiple category", async function () {
            expect(
                getCategoriesListHtml([
                    "restricted",
                    "criminal-fraudulent-purposes",
                    "prev-subjected-to-direction-to-change"
                ]))
                .to.equal(`
                <div class="tooltip">
                    <strong class="govuk-tag govuk-tag--red">
                        Restricted
                    </strong>
                    <span class="tooltip-text">Restricted</span>
                </div>
                <br>
            
                <div class="tooltip">
                    <strong class="govuk-tag govuk-tag--blue">
                        Crimes/Fraud
                    </strong>
                    <span class="tooltip-text">Names for criminal / fraudulent purposes</span>
                </div>
                <br>
            
                <div class="tooltip">
                    <strong class="govuk-tag govuk-tag--yellow">
                        Dir. to change
                    </strong>
                    <span class="tooltip-text">Names previously subjected to a direction to change them</span>
                </div>
                <br>
            `);
        });
        it('should escape special characters in category details', () => {
            const customMap = {
                'test': ['<script>', '"quoted"', "govuk-tag govuk-tag--red"]
            };
            const result = getCategoriesListHtml(['test'], customMap);
            expect(result).to.include('&lt;script&gt;');
            expect(result).to.include('&quot;quoted&quot;');
        });
    });

    describe("#getCategoriesList", function () {

        it("returns list when a single category string is passed", async function () {
            expect(getCategoriesList("criminal-fraudulent-purposes")).to.deep.equal(["criminal-fraudulent-purposes"]);
        });

        it("returns list when a category list is passed", async function () {
            expect(getCategoriesList([
                "criminal-fraudulent-purposes",
                "restricted",
                "prev-subjected-to-direction-to-change"
            ]))
                .to.deep.equal([
                    "criminal-fraudulent-purposes",
                    "restricted",
                    "prev-subjected-to-direction-to-change"
                ]);
        });

        it("returns empty array when a category is emppty", async function () {
            expect(getCategoriesList(undefined))
                .to.deep.equal([]);
        });
    });
});

