import Logger from "../logger";

const logger = Logger.get("fluxviz");

export default model => {
    logger.warn(`Patching model ${JSON.stringify(model)}...`);

    const  patched = { };

    if ( !("id" in model) ) {
        patched.id = null;
    };

    if ( !("metabolites" in model) ) {
        patched.metabolites = [ ];
    };

    if ( !("reactions" in model) ) {
        patched.reactions   = [ ]
    };

    logger.info(`Model patched.`);

    return patched;
};