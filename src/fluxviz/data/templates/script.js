requirejs.config({
    baseUrl: "js/vendor",
    paths: {
        fluxviz: "fluxviz"
    }
});

requirejs(["fluxviz"], fluxviz => {
    (async () => {
        fluxviz.logger.warn("Rendering Model: ", $model);
        fluxviz.logger.warn($model);

        await fluxviz.render("graph-$id", $model);

        fluxviz.logger.info("Model rendered.");
    })();
});