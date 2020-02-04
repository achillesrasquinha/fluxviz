require.config({
    paths: {
        ccNetViz:       "//cdn.jsdelivr.net/npm/ccnetviz@1.0.19/lib/ccNetViz.min",
        randomColor:    "//cdnjs.cloudflare.com/ajax/libs/randomcolor/0.5.4/randomColor.min",
        Combinatorics:  "//cdn.jsdelivr.net/npm/js-combinatorics@0.5.5/combinatorics.min"
    }
});

require([
    "ccNetViz",
    "Combinatorics",
    "randomColor"
], function (
    ccNetViz,
    Combinatorics,
    randomColor
) {
    function main (model) {
        ccNetViz            = ccNetViz.default;

        var ASPECT_RATIO    = 16 / 9;

        var width           = 500;
        var height          = width / ASPECT_RATIO;
        
        var element         = document.getElementById("graph");
        element.width       = width;
        element.height      = height;

        var graph           = new ccNetViz(element, {
            styles: {
                node: {
                    texture: "images/node.png",
                    label: {
                        hideSize: 16
                    }
                },
                edges: {

                },
                // circle: {
                //     textureColor: randomColor(),
                //     stroke: { size: 5, color: "#000" }
                // }
            }
        });

        var compartments    = Object.keys(model.compartments);
        var reactions       = model.reactions;

        var nodes           = compartments.reduce(function (prev, next) {
            var compartment = model.compartments[next];
            
            var nodes       = model.metabolites
                .map(function (m) {
                    var node = { label: m.name };

                    return node;
                })

            var node        = { label: compartment.name, nodes: nodes };

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
    };

    console.log("Rendering Model: ");
    console.log($model);

    main($model);
});