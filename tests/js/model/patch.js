import { expect } from "chai";

import patch from "../../../src/js/model/patch";

describe("Test Model Patch", () => {
    it("should patch an empty model", () => {
        expect(patch({ })).to.deep.equal({
            id:             null,
            metabolites:    [ ],
            reactions:      [ ],
            // genes:          [ ],
            // compartments:   { }
        });
    });
});