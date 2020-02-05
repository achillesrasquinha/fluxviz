require.config({
    baseUrl: "js/vendor",
    paths: {
        ccNetViz:           "ccNetViz",
        Combinatorics:      "https://cdn.jsdelivr.net/npm/js-combinatorics@0.5.5/combinatorics.min",
        randomColor:        "https://cdnjs.cloudflare.com/ajax/libs/randomcolor/0.5.4/randomColor.min",
    }
});

require([
    "ccNetViz",
    "Combinatorics",
    "randomColor"
], function (
    ccNetViz,
    Combinatorics,
    randomColor,
) {
    function flatten (arr) {
        return [].concat.apply([], arr);
    }

    function _patch_model (model) {
        console.log("Patching Reactions...");
        for ( const reaction of model.reactions ) {
            var compartments = [ ];

            for ( const reaction_metabolite in reaction.metabolites ) {
                var metabolite = model.metabolites.find(function (m) { return m.id == reaction_metabolite });
                compartments.push(metabolite.compartment);
            }
            
            reaction.subsystems        = [reaction.subsystem];
            // reaction.subsystems     = reaction.subsystem.split(", ");

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
                var n_reactions = reactions.length;
                var metabolites = Array.from(
                    new Set(
                        flatten(
                            reactions
                                .map(function (r) {
                                    return Object.keys(r.metabolites)
                                })
                        )
                    )
                ).map(function (m) {
                    const metabolite = model.metabolites.find(function (e) {
                        return e.id == m;
                    })

                    return metabolite;
                });

                return { name: subsystem, n_reactions: n_reactions,
                    metabolites: metabolites };
            })

        model.subsystems = subsystems;

        console.log("Model Patched.");
    }

    function main (model) {
        _patch_model(model);

        console.log("Patched Model: ");
        console.log(model);

        var ASPECT_RATIO    = 16 / 9;

        var width           = 1024;
        var height          = width / ASPECT_RATIO;
        
        var element         = document.getElementById("graph");
        element.width       = width;
        element.height      = height;

        var compartments    = Object.keys(model.compartments);

        var styles          = { };
        styles              = Object.assign({ }, styles, 
            compartments.reduce(function (prev, next) {
                var compartment = model.compartments[next];

                var style   = {
                    size:   compartment.metabolite_density * 15 + 10,
                    color:  randomColor({ format: "rgb" })
                };

                var key     = "compartment-" + next;

                var result  = Object.assign({ }, prev, { [key]: style }); 

                return result;
            }, { }),
            model.subsystems.reduce(function (prev, next) {
                var style   = {
                    color:  randomColor({ format: "rgb" })
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
                            hideSize: 16
                        },
                        color: randomColor({
                            format: "rgb"
                        })
                    },
                    edges: {
                        arrow: {
                            texture: "images/arrow.png"
                        }
                    },
                },
                styles
            )
        });

        var reactions       = model.reactions;

        var nodes           = compartments.reduce(function (prev, next) {
            var compartment = model.compartments[next];

            var nodes       = model.metabolites
                .map(function (m) {
                    var node = { label: m.name };

                    return node;
                });
            var edges       = [ ];

            if ( compartment.subsystems ) {
                nodes           = compartment.subsystems
                    .map(function (subsystem) {
                            subsystem   = model.subsystems.find(function (s) {
                                return s.name == subsystem
                            });

                        var metabolites = subsystem.metabolites
                            .map(function (m) {
                                var node = { label: m.name };
                                return node;
                            })

                        var node        = { label: subsystem.name,
                            style: "subsystem-" + subsystem.name,
                            nodes: metabolites, edges: [ ] };

                        return node;
                    });
            }

            var node        = { label: compartment.name,
                style: "compartment-" + next, 
                nodes: nodes, edges: edges };

            return Object.assign({ }, prev, { [next]: node });
        }, { });

        var edges           = Combinatorics
            .combination(compartments, 2)
            .toArray()
            .map(function (combination) {
                var a = combination[0];
                var b = combination[1];
                var c = { from: a, to: b, connected: false };

                for ( const reaction of reactions ) {
                    var compartments = reaction.compartments;
                    
                    if ( compartments.includes(a) ) {
                        if ( compartments.includes(b) ) {
                            c = { from: a, to: b, connected: true };
                        }
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
        });
    };

    console.log("Rendering Model: ");
    console.log($model);

    main($model);
});