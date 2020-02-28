/**
 * @description The base class for all FluxViz Errors.
 *
 * @example
 * try {
 *      throw new FluxVizError("foobar");
 * } catch (e) {
 *      logger.info(e.name);
 *      // returns "FluxVizError"
 * }
 *
 * @see  https://stackoverflow.com/a/32749533
 */
class FluxVizError extends Error {
    constructor (message) {
        super (message);

        this.name = "FluxVizError";

        if ( typeof Error.captureStackTrace === 'function' ) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    };
};

class TypeError extends FluxVizError {
    constructor (message) {
        super (message);

        this.name = this.constructor.name;
    }
};

class ElementNotFoundError extends FluxVizError {
    constructor (message) {
        super (message);

        this.name = this.constructor.name;
    };
};

export {
    FluxVizError,
    TypeError,
    ElementNotFoundError
};