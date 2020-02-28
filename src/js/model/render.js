import ccnetviz from "ccnetviz";

import Logger from "../logger";
import { ElementNotFoundError } from "../exception";

const logger = Logger.get("fluxviz");

export default async (query, model) => {
    const element = document.querySelector(query);

    if ( !element ) {
        throw new ElementNotFoundError(`Element with selector ${query} not found.`);
    } else {
        logger.warn(`Attempting to render model on element ${query}...`);
        logger.warn(model);

        const styles    = {
            node: {
                texture: "images/circle.png",
                color: "#000",
                label: {

                }
            },
            edge: {
                label: {

                }
            }
        };

        const options   = { styles };
        const graph     = new ccnetviz(element, options);

        const nodes     = model.metabolites
            .map(m => {
                const node  = { };

                node.label  = m.id || m.name; 

                return node;
            });
        const edges     = [ ];

        await graph.set(nodes, edges);
        logger.info("Drawing Graph...");
        graph.draw();
    };
};