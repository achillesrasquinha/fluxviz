import render from "./render";
import Logger from "./logger";
import { getenv } from "./util/environment";

const logger    = Logger.get("fluxviz");

const fluxviz   = {
    render,
    logger,
    Logger
} 

if ( getenv("ENVIRONMENT", "development") == "development" ) {
    window.fluxviz = fluxviz;
}

export default fluxviz;