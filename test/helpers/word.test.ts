import { assert } from 'console'
import { getCategoriesListHtml } from '../../src/helpers/word'
import { expect } from "chai";

describe("RestrictedWordHelper", function() {
    
    describe("#getCategoriesListHtml", function () {

        it("returns blank when categories list is empty", async function () {
            expect(getCategoriesListHtml([])).to.equal("")
        });

        it("returns proper html when called with one category", async function () {
            expect(getCategoriesListHtml(['criminal-fraudulent-purposes']))
                .to.equal(`
                <div class="tooltip">
                    <strong class="govuk-tag govuk-tag--blue">
                        Crimes/Fraud
                    </strong>
                    <span class="tooltip-text">Names for criminal / fraudulent purposes</span>
                </div>
                <br>
            `)
        });

        it("returns proper html when called with multiple category", async function () {
            expect(
                getCategoriesListHtml([
                    'restricted',
                    'criminal-fraudulent-purposes',
                    'prev-subjected-to-direction-to-change'
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
            `)
        });
    });
});