require.config({
    baseUrl: "js/vendor",
    paths: {
        ccNetViz:           "ccNetViz",
        Combinatorics:      "https://cdn.jsdelivr.net/npm/js-combinatorics@0.5.5/combinatorics.min",
        randomColor:        "https://cdnjs.cloudflare.com/ajax/libs/randomcolor/0.5.4/randomColor.min",
        deepmerge:          "https://unpkg.com/deepmerge@4.2.2/dist/umd"
    }
});

require([
    "ccNetViz",
    "Combinatorics",
    "randomColor",
    "deepmerge"
], function (
    ccNetViz,
    Combinatorics,
    randomColor,
    deepmerge
) {
    var CANVAS_ID   = "fluxviz-$id-graph";
    var TOOLTIP_ID  = "fluxviz-$id-tooltip";

    const flatten   = arr => [].concat.apply([], arr);

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
            backgroundColor:        "#F7F7F7",
            borderBottom:           "1px solid #EBEBEB",
            borderTopLeftRadius:    "calc(.3rem - 1px)",
            borderTopRightRadius:   "calc(.3rem - 1px)"
        }
    };

    function tooltip (options) {
        options = deepmerge(DEFAULT_TOOLTIP_OPTIONS, options);

        var element = document.getElementById(TOOLTIP_ID);
        if ( !element ) {
            var element     = document.createElement("div");
            element.setAttribute("id", TOOLTIP_ID);
        
            document.body.appendChild(element);

            var header      = document.createElement("div");
            header.setAttribute("id", TOOLTIP_ID + "-header");

            element.appendChild(header);
        };

        element.style.display = options.show ? "block" : "none";
        
        if ( options.style ) {
            for ( const type in options.style ) {
                element.style[type] = options.style[type];
            }
        }

        var header       = document.getElementById(TOOLTIP_ID + "-header");
        header.innerHTML = "<h3>" + options.title + "</h3>"
    
        if ( options.headerStyle ) {
            for ( const type in options.headerStyle ) {
                header.style[type] = options.style[type];
            }
        }
    }

    function _patch_model (model) {
        console.log("Patching Reactions...");
        for ( const reaction of model.reactions ) {
            var compartments = [ ];

            for ( const reaction_metabolite in reaction.metabolites ) {
                var metabolite = model.metabolites.find(function (m) { return m.id == reaction_metabolite });
                compartments.push(metabolite.compartment);
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

            reaction.compartments   = compartments;
        }

        console.log("Patching Compartments...");
        var compartments = Object.keys(model.compartments);
        for ( const compartment in model.compartments ) {
            var name            = model.compartments[compartment];

            var n_metabolites   = model.metabolites.filter(function (m) {
                return m.compartment == compartment;
            }).length;

            var subsystems      = Array.from(
                new Set(
                    flatten(
                        model.reactions
                            .filter(function (r) {
                                return r.compartments.includes(compartment)
                            })
                            .map(function (r) {
                                return r.subsystems;
                            })
                    )
                )
            );

            model.compartments[compartment] = { name: name,
                n_metabolites: n_metabolites, subsystems: subsystems };

            var foobar = compartments
                .map(function (c) {

                })
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

        console.log("Patching SubSystems...");
        var subsystems   = Array.from(
            new Set(
                flatten(
                    model.reactions
                        .map(function (r) {
                            return r.subsystems
                        })
                        .filter(Boolean)
                )
            )
        );
        
        subsystems       = subsystems
            .map(function (subsystem) {
                var reactions   = model.reactions
                    .filter(function (r) {
                        return r.subsystems.includes(subsystem);
                    })
                var metabolites = Array.from(
                    new Set(
                        flatten(
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
                });

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

        console.log("Model Patched.");
    }

    function getSubGraphOnEvent (graph, e) {
        var element = document.getElementById(CANVAS_ID);
        
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

    const main = model => {
        _patch_model(model);

        console.log("Patched Model: ");
        console.log(model);

        const ASPECT_RATIO    = 16 / 9;

        const width           = 1024;
        const height          = width / ASPECT_RATIO;
        
        const element         = document.getElementById(CANVAS_ID);
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
            compartments.reduce(function (prev, next) {
                var compartment = model.compartments[next];

                var style   = {
                    size:   compartment.metabolite_density * 15 + 15,
                    color:  get_color("compartment")
                };

                var key     = "compartment-" + next;

                var result  = Object.assign({ }, prev, { [key]: style }); 

                return result;
            }, { }),
            model.subsystems.reduce(function (prev, next) {
                var style   = {
                    size:   next.reaction_density * 15 + 15,
                    color:  get_color("subsystem")
                };

                var key     = "subsystem-" + next.name;

                var result  = Object.assign({ }, prev, { [key]: style });

                return result;
            }, { })
        );

        var graph           = new ccNetViz.ccNetVizMultiLevel(element, {
            styles: Object.assign({ },
                {
                    node: {
                        texture: "images/circle.png",
                        label: {
                            hideSize: 6
                        },
                        color: get_color("node")
                    },
                    edges: {
                        arrow: {
                            texture: "images/arrow.png"
                        },
                        hideSize: 2
                    },
                },
                styles
            )
        });

        var reactions       = model.reactions;

        var nodes           = compartments.reduce(function (prev, next) {
            var compartment = model.compartments[next];

            var nodes       = null;
            var edges       = null;

            if ( compartment.subsystems ) {
                nodes           = compartment.subsystems
                    .map(function (subsystem) {
                            subsystem   = model.subsystems.find(function (s) {
                                return s.name == subsystem
                            });

                        var metabolites = subsystem.metabolites
                            .reduce(function (prev, next) {
                                var type = { "name": "metabolite",
                                    "label": "Metabolite" };
                                var node = { label: next.name, type: type };
                                return Object.assign({ }, prev, { [next.id]: node });
                            }, { });
                        var edges       = flatten(
                            subsystem.reactions
                                .map(function (r) {
                                    var edges       = [ ];
                                    var edge_map    = { };

                                    for ( const reactant of r.reactants ) {
                                        for ( const product of r.products ) {
                                            var target = metabolites[reactant];
                                            
                                            var edge = {
                                                source: metabolites[product],
                                                target: target,
                                                label:  r.name,
                                            };

                                            if ( !(reactant.id in edge_map) ) {
                                                edge_map[reactant.id] = edge
                                            } else {
                                                edge.target = edge_map[reactant.id];
                                            }

                                            edges.push(edge);
                                        };
                                    };

                                    return edges;
                                })
                        )

                        var type        = { "name": "subsystem",
                            "label": "Sub System" };
                        var node        = { label: subsystem.name,
                            type: type,
                            style: "subsystem-" + subsystem.name,
                            nodes: Object.values(metabolites), edges: edges };

                        return node;
                    });
                edges = [ ];
            } else {
                nodes = model.metabolites
                    .map(function (m) {
                        var type = { "name": "metabolite",
                            "label": "Metabolite" };
                        var node = { label: m.name, type: type };

                        return node;
                    });
                edges = [ ];
            }

            var type = { "name": "compartment",
                "label": "Compartment" };
            var node = { label: compartment.name,
                style: "compartment-" + next, 
                nodes: nodes, edges: edges, type: type };

            return Object.assign({ }, prev, { [next]: node });
        }, { });

        var edges = Combinatorics
            .combination(compartments, 2)
            .toArray()
            .map(function (combination) {
                var a = combination[0];
                var b = combination[1];
                var c = { from: a, to: b, connected: false };

                for ( const reaction of reactions ) {
                    var compartments = reaction.compartments;
                    
                    if ( compartments.includes(a) && compartments.includes(b) ) {
                        c = { from: a, to: b, connected: true };
                    }
                }

                return c;
            })
            .filter(function (c) { return c.connected })
            .map(function (combination) {
                var from = combination.from;
                var to   = combination.to;
                
                var edge = { source: nodes[from], target: nodes[to] };

                return edge;
            });

        graph.set(Object.values(nodes), edges, "force").then(function () {
            graph.draw();
        });
        
        element.addEventListener("mousemove", function (e) {
            var target    = getSubGraphOnEvent(graph, e);
            var targets   = target.nodes.length ? target.nodes : target.edges;
            
            if ( targets.length ) {
                var object = targets.reduce(function (prev, next) {
                    return prev.dist < next.dist ? prev : next;
                });
                object     = object.node ? object.node : object.edge;
    
                console.log("On Mouse Move: ");
                console.log(object);
                
                var title = object.label;

                tooltip({
                    title:  title,
                    // label:  
                    show:   true,
                    style: {
                        left: (e.clientX - 10) + "px",
                        top:  (e.clientY + 25) + "px"
                    }
                })
            } else {
                tooltip({ show: false });
            }
        });

        console.log("Graph: ");
        console.log("Nodes: ");
        console.log(nodes);
        console.log("Edges: ");
        console.log(edges);
    };

    console.log("Rendering Model: ");
    console.log($model);

    main($model);
});