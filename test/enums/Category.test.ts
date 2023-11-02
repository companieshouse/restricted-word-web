import { assert } from 'console'
import { expect } from "chai";
import { getCategoryName } from '../../src/enums';

describe("Category enum", function() {
    it("returns restricted category name ", async function () {
        expect(getCategoryName('restricted')).to.equal("Restricted")
    });

    it("returns international-orgs-foreign-gov-depts category name ", async function () {
        expect(getCategoryName('international-orgs-foreign-gov-depts')).to.equal("International organisations and foreign government departments")
    });

    it("returns criminal-fraudulent-purposes ", async function () {
        expect(getCategoryName('criminal-fraudulent-purposes')).to.equal("Names for criminal / fraudulent purposes")
    });

    it("returns Restricted ", async function () {
        expect(getCategoryName('prev-subjected-to-direction-to-change')).to.equal("Names previously subjected to a direction to change them")
    });  
});