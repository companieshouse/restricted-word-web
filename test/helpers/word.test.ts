import { assert } from 'console'
import { getCategoriesListHtml } from '../../src/helpers/word'
import { expect } from "chai";

describe("RestrictedWordHelper", function() {
    
    describe("#getCategoriesListHtml", function () {

        it("returns blank when categories list is empty", async function () {
            expect(getCategoriesListHtml([])).to.equal("")
        });

        it("returns proper html when called with one category", async function () {
            expect(getCategoriesListHtml(['criminal-fraudulent-purposes'])).to.equal("Names for criminal / fraudulent purposes" + "<br>")
        });

        it("returns proper html when called with multiple category", async function () {
            expect(
                getCategoriesListHtml([
                    'restricted',
                    'criminal-fraudulent-purposes',
                    'prev-subjected-to-direction-to-change'
                ]))
                .to.equal(
                    "Restricted" + "<br>" +
                    "Names for criminal / fraudulent purposes" + "<br>" +
                    "Names previously subjected to a direction to change them" + "<br>"
                )
        });
    });
});