import { expect } from "chai";

import { FluxVizError, TypeError } from "../../src/js/exception";

describe("Test Exceptions", () => {
    it("should raise FluxVizError", () => {
        expect(() => {
            throw new FluxVizError("Test");
        }).to.throw(FluxVizError, "Test");
    });

    it("should raise TypeError", () => {
        expect(() => { 
            throw new TypeError("Test");
        }).to.throw(TypeError, "Test");
    });
});