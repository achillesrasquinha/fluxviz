import path from "path";

import { expect } from "chai";
import { JSDOM } from "jsdom";

import { PATH } from "../../../config";

import render from "../../../src/js/model/render";
import sample from "../../../src/fluxviz/data/models/sample";
import { ElementNotFoundError } from "../../../src/js/exception";

describe("Test Render", () => {
    before(async () => {
        const dom       = await JSDOM.fromFile(path.join(PATH.TEST, "index.html"));

        global.window   = dom.window;
        global.document = window.document;
    });
    
    it("should render", () => {
        render("#app", sample);
    });

    it("should throw ElementNotFoundError", () => {
        expect(() => render("#foobar", sample)).to.throw(ElementNotFoundError, `Element with selector #foobar not found.`)
    });
});