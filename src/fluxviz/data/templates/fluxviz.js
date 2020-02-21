window.fluxviz = {
    util: {
        array: { }
    },
    ENVIRONMENT: "development"
};

require.config({
    baseUrl: "js/vendor",
    paths: {
        ccNetViz:           "ccNetViz",
        randomColor:        "https://cdnjs.cloudflare.com/ajax/libs/randomcolor/0.5.4/randomColor.min",
        deepmerge:          "https://unpkg.com/deepmerge@4.2.2/dist/umd"
    }
});

require([
    "ccNetViz",
    "randomColor",
    "deepmerge"
], (
    ccNetViz,
    randomColor,
    deepmerge
) => {
    /**
     * @description The base class for all FluxViz Errors.
     *
     * @example
     * try
     *      throw new fluxviz.Error("foobar")
     * catch (e)
     *      fluxviz.logger.info(e.name)
     * // returns "FluxVizError"
     *
     * @see  https://stackoverflow.com/a/32749533
     * @todo Requires "transform-builtin-extend" for Babel 6
     */
    fluxviz.Error = class extends Error {
    	constructor (message) {
    		super (message)

    		this.name = 'FluxVizError'

    		if ( typeof Error.captureStackTrace === 'function' )
    			Error.captureStackTrace(this, this.constructor)
    		else
    			this.stack = (new Error(message)).stack
    	}
    }

    /**
     * @description TypeError
     */
    fluxviz.TypeError  = class extends fluxviz.Error {
        constructor (message) {
            super (message)

            this.name = this.constructor.name
        }
    }

    // fluxviz.loggers - A registry for fluxviz loggers.
    fluxviz.loggers    = [ ];

    /**
     * @description fluxviz's Logger Class
     *
     * @example
     * fluxviz.logger       = fluxviz.Logger.get('foobar')
     * fluxviz.logger.level = fluxviz.Logger.DEBUG
     *
     * fluxviz.logger.info('foobar')
     * // prints '[timestamp] foobar: foobar'
     */
    fluxviz.Logger = class {
        /**
         * @description fluxviz's Logger Class's constructor.
         *
         * @param {string} name - Name of the logger.
         */
        constructor (name, level) {
            if ( typeof name !== 'string' )
                throw new fluxviz.TypeError("Expected string for name, got " + (typeof name) + " instead.");

            this.name   = name
            this.level  = level

            if ( !this.level ) {
                if ( fluxviz.ENVIRONMENT == "development" )
                    this.level = fluxviz.Logger.ERROR
                else
                    this.level = fluxviz.Logger.NOTSET
            }
        }

        /**
         * @description Get instance of fluxviz.Logger (return registered one if declared).
         *
         * @param {string} name - Name of the logger.
         */
        static get (name, level) {
            if ( !(name in fluxviz.loggers) )
                fluxviz.loggers[name] = new fluxviz.Logger(name, level)
            return fluxviz.loggers[name]
        }

        debug (message) { this.log(message, fluxviz.Logger.DEBUG) }
        info  (message) { this.log(message, fluxviz.Logger.INFO)  }
        warn  (message) { this.log(message, fluxviz.Logger.WARN)  }
        error (message) { this.log(message, fluxviz.Logger.ERROR) }

        log (message, level) {
            const timestamp   = new Date();

            if ( level.value <= this.level.value ) {
                const timestr = timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + (timestamp.getSeconds() + "." + timestamp.getMilliseconds());
                console.log("%c " + timestr, "color: " + level.color, message)
            }
        }
    }

    fluxviz.Logger.DEBUG  = { value: 10, color: '#616161', name: 'DEBUG'  }
    fluxviz.Logger.INFO   = { value: 20, color: '#2196F3', name: 'INFO'   }
    fluxviz.Logger.WARN   = { value: 30, color: '#FFC107', name: 'WARN'   }
    fluxviz.Logger.ERROR  = { value: 40, color: '#F44336', name: 'ERROR'  }
    fluxviz.Logger.NOTSET = { value:  0,                   name: 'NOTSET' }

    fluxviz.logger        = fluxviz.Logger.get('fluxviz');

    fluxviz.util.array.flatten  = arr => [].concat.apply([], arr);

    const get_element_id = name => {
        const prefix = "fluxviz-$id-";
        const id     = prefix + name;

        return id;
    };

    var TOOLTIP_ID  = "fluxviz-$id-tooltip";

    // ccnetviz plugins
    ccNetViz            = ccNetViz.default;

    const getSubGraphOnEvent = (graph, e) => {
        var element     = document.getElementById(get_element_id("graph"));
        
        var boundingBox = element.getBoundingClientRect();

        var x           = e.clientX - boundingBox.left;
        var y           = e.clientY - boundingBox.top;
        var radius      = 5;

        var layerCoordinates = graph.getLayerCoords({ x: x, y: y, radius: radius });

        var result           = graph.find(
            layerCoordinates.x,
            layerCoordinates.y,
            layerCoordinates.radius,
            true,
            true
        );

        return result;
    }

    var DEFAULT_TOOLTIP_OPTIONS = {
        style: {
            position:               "absolute",
            maxWidth:               "256px",
            backgroundColor:        "#FFF",
            borderRadius:           ".3rem",
            border:                 "1px solid rgba(0,0,0,0.2)",
            zIndex:                 99
        },
        headerStyle: {
            padding:                ".5rem .75rem",
            fontSize:               "1rem",
            backgroundColor:        "#F7F7F7 !important",
            borderBottom:           "1px solid #EBEBEB",
            borderTopLeftRadius:    "calc(.3rem - 1px)",
            borderTopRightRadius:   "calc(.3rem - 1px)"
        }
    };

    const get_or_create_element = id => {
        const element = document.getElementById(id);
        
        if ( !element ) {
            const element = document.createElement("div");
            element.setAttribute("id", id);

            document.appendChild(element);
        }

        return element;
    };

    fluxviz.tooltip = options => {
        options = deepmerge(DEFAULT_TOOLTIP_OPTIONS, options);

        var element = document.getElementById(TOOLTIP_ID);
        if ( !element ) {
            var element     = document.createElement("div");
            element.setAttribute("id", TOOLTIP_ID);
        
            document.body.appendChild(element);

            var header      = document.createElement("div");
            header.setAttribute("id", TOOLTIP_ID + "-header");

            element.appendChild(header);

            var body        = document.createElement("div");
            body.setAttribute("id", TOOLTIP_ID + "-body");

            element.appendChild(body);
        };

        element.style.display = options.show ? "block" : "none";
        
        if ( options.style ) {
            for ( const type in options.style ) {
                element.style[type] = options.style[type];
            }
        }

        var header       = document.getElementById(TOOLTIP_ID + "-header");
        header.innerHTML = "<h3>" + options.title + " " + options.label + "</h3>";
        
        if ( options.headerStyle ) {
            for ( const type in options.headerStyle ) {
                header.style[type] = options.style[type];
            }
        }
        
        var body        = document.getElementById(TOOLTIP_ID + "-body");
    }

    const footnote = options => {
        const id        = get_element_id("footnote");
        const element   = get_or_create_element(id);
    }

    const patch_model = model => {
        fluxviz.logger.warn("Patching Reactions...");
        for ( const reaction of model.reactions ) {
            var compartments = new Set();

            for ( const reaction_metabolite in reaction.metabolites ) {
                var metabolite = model.metabolites.find(function (m) { return m.id == reaction_metabolite });
                compartments.add(metabolite.compartment);
            }

            reaction.stoichiometry      = reaction.metabolites;
            
            reaction.metabolites        = Object.keys(reaction.stoichiometry);
            
            reaction.reactants          = Object.keys(reaction.stoichiometry)
                .filter(m => reaction.stoichiometry[m] < 0)
            reaction.products           = Object.keys(reaction.stoichiometry)
                .filter(m => reaction.stoichiometry[m] > 0);
            
            reaction.reversible         = reaction.lower_bound < 0 && reaction.upper_bound > 0; 
            reaction.subsystems         = [reaction.subsystem];
            // reaction.subsystems      = reaction.subsystem.split(", ");

            reaction.compartments       = Array.from(compartments);

            if ( reaction.notes
                && reaction.notes.fluxviz 
                && reaction.notes.fluxviz.flux ) {
                reaction.flux = reaction.notes.fluxviz.flux;
            }
        }

        fluxviz.logger.warn("Patching Metabolites...");
        for ( const metabolite of model.metabolites ) {
            if ( metabolite.notes && metabolite.notes.fluxviz ) {
                metabolite.hide = metabolite.notes.fluxviz.hide;
            } else {
                metabolite.hide = false;
            }
        }
        
        fluxviz.logger.warn("Patching Compartments...");
        var compartments = Object.keys(model.compartments);
        for ( const compartment in model.compartments ) {
            var name            = model.compartments[compartment] || compartment;

            var n_metabolites   = model.metabolites.filter(function (m) {
                return m.compartment == compartment;
            }).length;

            var subsystems      = Array.from(
                new Set(
                    fluxviz.util.array.flatten(
                        model.reactions
                            .filter(function (r) {
                                return r.compartments.includes(compartment)
                            })
                            .map(function (r) {
                                return r.subsystems;
                            })
                    )
                )
            ).filter(Boolean);

            const connections = compartments
                .filter(c => c != compartment)
                .map(c => {
                    const connection = { compartment: c };
                    const reactions  = [ ];

                    for ( const reaction of model.reactions ) {
                        const compartments = reaction.compartments;

                        if ( compartments.includes(c) && compartments.includes(compartment) ) {
                            reactions.push(reaction);
                        }
                    }

                    connection.reactions = reactions;

                    return connection;
                })
                .filter(c => c.reactions.length)

            const max_reactions = Math.max.apply(null,
                connections
                    .map(connection => {
                        return connection.reactions.length
                    })
            );

            for ( const connection of connections ) {
                const reactions             = fluxviz.util.array.flatten(
                    connection.reactions
                        .map(r => {
                            if ( r.reversible ) {
                                return [r, r];
                            }

                            return r;
                        })
                )

                const reaction_density      = reactions.length
                    / max_reactions;
                connection.reaction_density = reaction_density;
            }

            model.compartments[compartment] = { name: name,
                n_metabolites: n_metabolites, subsystems: subsystems,
                connections: connections };
        }
        
        // Find Densities...
        var max_metabolites = Math.max.apply(null,
            compartments
                .map(function (id) {
                    return model.compartments[id].n_metabolites
                })
        );

        for ( const compartment in model.compartments ) {
            var metabolite_density = model.compartments[compartment].n_metabolites
                / max_metabolites;

            model.compartments[compartment].metabolite_density = metabolite_density;
        }

        fluxviz.logger.warn("Patching SubSystems...");
        var subsystems = Array.from(
            new Set(
                fluxviz.util.array.flatten(
                    model.reactions
                        .map(function (r) {
                            return r.subsystems
                        })
                        .filter(Boolean)
                )
            )
        ).filter(Boolean);
        
        subsystems       = subsystems
            .map(function (subsystem) {
                var reactions   = model.reactions
                    .filter(function (r) {
                        return r.subsystems.includes(subsystem);
                    })
                var metabolites = Array.from(
                    new Set(
                        fluxviz.util.array.flatten(
                            reactions
                                .map(function (r) {
                                    return r.metabolites
                                })
                        )
                    )
                ).map(function (m) {
                    const metabolite = model.metabolites.find(function (e) {
                        return e.id == m;
                    })

                    return metabolite;
                })
                .filter(m => !m.hide);

                return { name: subsystem, 
                    metabolites: metabolites, reactions: reactions };
            });

        // Find Densities
        var max_reactions = Math.max.apply(null,
            subsystems
                .map(function (subsystem) {
                    return subsystem.reactions.length
                })
        );

        for ( const subsystem of subsystems ) {
            var reaction_density        = subsystem.reactions.length / max_reactions;
            subsystem.reaction_density  = reaction_density;
        }

        model.subsystems = subsystems;

        fluxviz.logger.info("Model Patched.");
    }
    
    const get_metabolite_nodes_and_reaction_edges = (metabolites, reactions) => {
        fluxviz.logger.info("Building Metabolite Nodes...");
        let nodes         = { metabolites: { }, reactions: { } }
        
        for ( const m of metabolites ) {
            const type = { "name": "metabolite", "label": "Metabolite" };
            const node = { label: m.id, type: type,
                style: "metabolite-compartment-" + m.compartment,
                object: m };

            nodes.metabolites[m.id] = node;
        }

        for ( const r of reactions ) {
            const type = { "name": "reaction", "label": "Reaction" };
            const node = { label: r.id, type: type,
                style: "reaction-node", object: r };

            nodes.reactions[r.id] = node;
        }
        
        fluxviz.logger.info("Building Reaction Edges...");
        const edges = fluxviz.util.array.flatten(
            reactions.map(r => {
                const edges     = [ ]
                const type      = { "name": "reaction", "label": "Reaction" };

                const reactants = r.reactants.filter(r => r in nodes.metabolites);
                const products  = r.products.filter(p => p in nodes.metabolites);

                if ( reactants.length && products.length ) {
                    if ( reactants.length == 1 && products.length == 1 ) {
                        const reactant = reactants[0];
                        const product  = products[0];
    
                        if ( reactant in nodes.metabolites && product in nodes.metabolites ) {
                            edges.push({
                                type:   type,
                                source: nodes.metabolites[reactant],
                                target: nodes.metabolites[product],
                                label:  r.name || r.id,
                                object: r
                            });

                            if ( r.reversible ) {
                                edges.push({
                                    type:   type,
                                    source: nodes.metabolites[product],
                                    target: nodes.metabolites[reactant],
                                    label:  r.name || r.id,
                                    object: r
                                });
                            }
                        }
                    } else {
                        for ( const reactant of reactants ) {
                            if ( reactant in nodes.metabolites ) {
                                edges.push({
                                    type:   type,
                                    source: nodes.metabolites[reactant],
                                    target: nodes.reactions[r.id],
                                    label:  r.name || r.id,
                                    object: r,
                                    style:  "reaction-edge"
                                });

                                if ( r.reversible ) {
                                    edges.push({
                                        type:   type,
                                        source: nodes.reactions[r.id],
                                        target: nodes.metabolites[reactant],
                                        label:  r.name || r.id,
                                        object: r
                                    });
                                }
                            }
                        }
        
                        for ( const product of products ) {
                            if ( product in nodes.metabolites ) {
                                edges.push({
                                    type:   type,
                                    source: nodes.reactions[r.id],
                                    target: nodes.metabolites[product],
                                    label:  r.name || r.id,
                                    object: r
                                });

                                if ( r.reversible ) {
                                    edges.push({
                                        type:   type,
                                        source: nodes.metabolites[product],
                                        target: nodes.reactions[r.id],
                                        label:  r.name || r.id,
                                        object: r,
                                        style:  "reaction-edge"
                                    });
                                }
                            }
                        }
                    }
                } else {
                    delete nodes.reactions[r.id];
                }

                
                return edges;
            })
        )
        
        nodes = [].concat(
            Object.values(nodes.metabolites),
            Object.values(nodes.reactions)
        )

        fluxviz.logger.info("Sub Graph built.");

        return { nodes, edges };
    }

    fluxviz.render = async model => {
        fluxviz.logger.warn("Patching Model...");
        patch_model(model);

        fluxviz.logger.info("Patched Model: ");
        fluxviz.logger.info(model);

        const ASPECT_RATIO    = 16 / 9;

        const width           = 1024;
        const height          = width / ASPECT_RATIO;
        
        const element         = document.getElementById(get_element_id("graph"));
        element.width         = width;
        element.height        = height;

        const compartments    = Object.keys(model.compartments);

        const colors          = { };
        function get_color (type) {
            if ( !(type in colors) ) {
                colors[type] = randomColor({ format: "rgb" });
            }

            return colors[type];
        }

        var styles          = { };
        styles              = Object.assign({ }, styles, 
            compartments.reduce((prev, next) => {
                var compartment = model.compartments[next];
                
                var key     = "compartment-" + next;
                var style   = {
                    size:   compartment.metabolite_density * 15 + 15,
                    color:  get_color(key)
                };
                
                var result  = Object.assign({ }, prev, { [key]: style }); 

                return result;
            }, { }),
            model.subsystems.reduce((prev, next) => {
                var style   = {
                    size:   next.reaction_density * 15 + 15,
                    color:  get_color("subsystem")
                };

                var key     = "subsystem-" + next.name;

                var result  = Object.assign({ }, prev, { [key]: style });

                return result;
            }, { }),
            compartments.reduce((prev, next) => {
                var key     = "metabolite-compartment-" + next;
                var style   = { color: get_color("compartment-" + next) }
                var result  = { ...prev, [key]: style }

                return result
            }, { }),
            compartments.reduce((prev, next) => {
                const compartment   = model.compartments[next]
                var   result        = { ...prev };

                for ( const connection of compartment.connections ) {
                    const key       = "compartment-edge-" + next + "-" + connection.compartment;
                    const style     = { width: Math.max(1, Math.min(connection.reaction_density * 3, 3)) };

                    result          = { ...result, [key]: style };
                }

                return result;
            }, { }),
            {
                "reaction-edge": {
                    arrow: {
                        texture: ""
                    }
                }
            },
            {
                "reaction-node": {
                    size: 1,
                    texture: "",
                    label: {
                        hideSize: 2
                    }
                }
            },
            {
                "black": {
                    color: randomColor({ format: "rgb" })
                }
            }
        );

        fluxviz.logger.info("Styles: ");
        fluxviz.logger.info(styles);

        fluxviz._graph = new ccNetViz(element, {
            bidirectional: "overlap",
            styles: Object.assign({ },
                {
                    node: {
                        texture: "images/circle.png",
                        label: {
                            hideSize: 6
                        },
                        color: get_color("node")
                    },
                    edge: {
                        arrow: {
                            texture: "images/arrow-2.png",
                            animation: {
                                type: "size"
                            },
                            type: "delta",
                            size: 12
                        }
                    }
                },
                styles
            )
        });

        var nodes = compartments.reduce((prev, next) => {
            var compartment = model.compartments[next];

            var nodes = null;
            var edges = null;

            if ( compartment.subsystems.length ) {
                // parallelize this.
                const get_subsystem_node = subsystem => {
                    subsystem = model.subsystems.find(s => s.name == subsystem);
                    fluxviz.logger.info("Building node for subsystem: " + subsystem.name);

                    const result    = get_metabolite_nodes_and_reaction_edges(
                        subsystem.metabolites, subsystem.reactions
                    );

                    var type        = { "name": "subsystem",
                            "label": "Sub System" };
                    var node        = { label: subsystem.name,
                        type: type,
                        style: "subsystem-" + subsystem.name,
                        nodes: Object.values(result.nodes), edges: result.edges };

                    return node;
                }

                nodes = compartment.subsystems.map(get_subsystem_node);
                edges = [ ];
            } else {
                const result = get_metabolite_nodes_and_reaction_edges(
                    model.metabolites, model.reactions
                );
                
                nodes = result.nodes
                edges = result.edges
            }

            var type    = { "name": "compartment",
                "label": "Compartment" };
            const notes = {
                body: "                     \
                    <div>                   \
                        Reaction Density:   \
                    </div>                  \
                "
            };
            var node    = { label: compartment.name,
                style: "compartment-" + next, 
                nodes: nodes, edges: edges, type: type, notes: notes };

            return { ...prev, [next]: node };
        }, { });
        
        const edges = fluxviz.util.array.flatten(
            compartments
                .map(c => {
                    const compartment   = model.compartments[c];
                    const edges         = [ ];

                    for ( const connection of compartment.connections ) {
                        const to    = connection.compartment;
                        const edge  = { source: nodes[c], target: nodes[to],
                            style: "compartment-edge-" + c + "-" + to }

                        edges.push(edge);
                    }

                    return edges;
                })
        )
        
        const history = { };
        let   level   = 1;

        const multilevel    = (element, graph) => {
            element.addEventListener("click", async e => {
                fluxviz.logger.info("Current Level (On Mouse Click): " + level);
                fluxviz.logger.info("History (On Mouse Click): ");
                fluxviz.logger.info(history);

                const targets = getSubGraphOnEvent(graph, e);
                
                if ( targets.nodes.length == 1 ) {
                    const node = targets.nodes[0].node;

                    if ( node.nodes ) {
                        const nodes     = node.nodes;
                        const edges     = node.edges || [ ];
                        
                        const current   = graph.findArea(0, 0, 1, 1, true, true);

                        history[level]  = {
                            nodes: current.nodes.map(n => n.node),
                            edges: current.edges.map(e => e.edge)
                        };
                            
                        graph.setViewport({ size: 1, x: 0, y: 0 });
                        await drawGraph(graph, nodes, edges, "force");

                        level           = level + 1;
                    }
                }
            });

            element.addEventListener("contextmenu", async e => {
                fluxviz.logger.info("Current Level (On Mouse Right-Click): " + level);
                fluxviz.logger.info("History (On Mouse Right-Click): ");
                fluxviz.logger.info(history);

                e.preventDefault();

                fluxviz.logger.info("Rendering previous level...");

                if ( level > 0 ) {
                    level = level - 1;

                    const { nodes, edges } = history[level];

                    graph.setViewport({ size: 1, x: 0, y: 0 });
                    await drawGraph(graph, nodes, edges, "force");
                }
            });
        }

        const plugins       = { multilevel };

        const setGraph      = async (graph, nodes, edges, layout, options) => {
            fluxviz.logger.warn("Setting graph nodes and edges...");
            fluxviz.logger.info("Graph: ");
            fluxviz.logger.info("Nodes: ");
            fluxviz.logger.info(nodes);
            fluxviz.logger.info("Edges: ");
            fluxviz.logger.info(edges);

            const set   = async () => {
                for ( const plugin in plugins ) {
                    fluxviz.logger.info("Setting up plugin: " + plugin)
                    plugins[plugin](element, graph);
                }

                await graph.set(Object.values(nodes), edges, layout, options);
            }

            await set();
        }

        const drawGraph = async (graph, nodes, edges, layout, options) => {
            await setGraph(graph, nodes, edges, layout, options);
            fluxviz.logger.warn("Rendering graph...");
            graph.draw();
        }

        let pathway = [ ];
        
        element.addEventListener("mousemove", e => {
            var target  = getSubGraphOnEvent(fluxviz._graph, e);
            var targets = target.nodes.length ? target.nodes : target.edges;
            
            if ( targets.length ) {
                var object  = targets.reduce(function (prev, next) {
                    return prev.dist < next.dist ? prev : next;
                });

                object      = object.node ? object.node : object.edge;
                
                fluxviz.logger.info("On Mouse Move: ");
                fluxviz.logger.info(object);
                
                pathway.push(object);

                const title = object.label;
                const label = object.type.label;
                const notes = object.notes || { };

                fluxviz.tooltip({
                    title:  title,
                    label:  label,
                    body:   notes.body,
                    show:   true,
                    style: {
                        left: (e.clientX - 10) + "px",
                        top:  (e.clientY + 30) + "px"
                    }
                });
            } else {
                fluxviz.tooltip({ show: false });
            }
        });

        element.addEventListener("mouseleave", e => {
            fluxviz.logger.info("Resetting Pathways...");
            pathway = [ ];
            fluxviz.logger.info("Pathway resetted.");
        });

        await drawGraph(fluxviz._graph, nodes, edges, "force");
    };
    
    (async () => {
        fluxviz.logger.warn("Rendering Model: ", $model);
        fluxviz.logger.warn($model);
        await fluxviz.render($model);

        fluxviz.logger.info("Model rendered.");
    })();
});