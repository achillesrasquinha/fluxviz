import React from "react";
import ReactDOM from "react-dom";

import App from "./container/App";
import Logger from "./logger";
import { ElementNotFoundError } from "./exception";

const logger = Logger.get("fluxviz");

export default (query, model) => {
    const element = document.querySelector(query);

    if ( !element ) {
        throw new ElementNotFoundError(`Element with selector ${query} not found.`);
    } else {
        logger.warn(`Attempting to mount on element ${query}...`);
        ReactDOM.render(<App model={model}/>, element);
    };
};