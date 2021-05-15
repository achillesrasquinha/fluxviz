// if ( 'undefined' === typeof window ) {
// 	const jsdom		= require("jsdom");
// 	const dom		= new jsdom.JSDOM();

// 	const window	= dom.window;
// 	const document	= window.document;

// 	global.window	= window;
// 	global.document	= document;
// }

// const ccNetViz 	  = require("ccnetviz").default;
// const randomColor = require("randomcolor");

import ccNetViz from "ccnetviz";
import randomColor from "randomcolor";
import deepmerge from "deepmerge";

const fluxviz = {
	util: {
		array: { }
	},
	ENVIRONMENT: ""
};

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
			{Error.captureStackTrace(this, this.constructor)}
		else
			{this.stack = (new Error(message)).stack}
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
				{
					throw new fluxviz.TypeError("Expected string for name, got " + (typeof name) + " instead.");
				}

				this.name   = name
				this.level  = level

				if ( !this.level ) {
						if ( fluxviz.ENVIRONMENT == "development" )
								{this.level = fluxviz.Logger.ERROR}
						else
								{this.level = fluxviz.Logger.NOTSET}
				}
		}

		/**
		 * @description Get instance of fluxviz.Logger (return registered one if declared).
		 *
		 * @param {string} name - Name of the logger.
		 */
		static get (name, level) {
				if ( !(name in fluxviz.loggers) )
						{fluxviz.loggers[name] = new fluxviz.Logger(name, level)}
				return fluxviz.loggers[name]
		}

		debug (message) { this.log(message, fluxviz.Logger.DEBUG) }
		info  (message) { this.log(message, fluxviz.Logger.INFO)  }
		warn  (message) { this.log(message, fluxviz.Logger.WARN)  }
		error (message) { this.log(message, fluxviz.Logger.ERROR) }

		log (message, level) {
			if ( level.value <= this.level.value ) {
				const timestamp = new Date();
				const timestr 	= timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + (timestamp.getSeconds() + "." + timestamp.getMilliseconds());
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
fluxviz.logger.level  = fluxviz.Logger.DEBUG;

const get_element_id = name => {
		const prefix = "fluxviz-$id-";
		const id     = prefix + name;

		return id;
};

const TOOLTIP_ID  = "fluxviz-$id-tooltip";

// ccnetviz plugins
// ccNetViz            = ccNetViz.default;

const getSubGraphOnEvent = (element, graph, e) => {
		const boundingBox = element.getBoundingClientRect();

		const x           = e.clientX - boundingBox.left;
		const y           = e.clientY - boundingBox.top;
		const radius      = 5;

		const layerCoordinates = graph.getLayerCoords({ x: x, y: y,
				radius: radius });

		const result           = graph.find(
				layerCoordinates.x,
				layerCoordinates.y,
				layerCoordinates.radius,
				true,
				true
		);

		return result;
}

const DEFAULT_TOOLTIP_OPTIONS = {
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

		let element = document.getElementById(TOOLTIP_ID);
		if ( !element ) {
				element     = document.createElement("div");
				element.setAttribute("id", TOOLTIP_ID);
		
				document.body.appendChild(element);

				const header      = document.createElement("div");
				header.setAttribute("id", TOOLTIP_ID + "-header");

				element.appendChild(header);

				const body        = document.createElement("div");
				body.setAttribute("id", TOOLTIP_ID + "-body");

				element.appendChild(body);
		}

		element.style.display = options.show ? "block" : "none";
		
		if ( options.style ) {
				for ( const type in options.style ) {
						element.style[type] = options.style[type];
				}
		}

		const header       = document.getElementById(TOOLTIP_ID + "-header");
		header.innerHTML = "<h3>" + options.title + " " + options.label + "</h3>";
		
		if ( options.headerStyle ) {
				for ( const type in options.headerStyle ) {
						header.style[type] = options.style[type];
				}
		}
		
		const body        = document.getElementById(TOOLTIP_ID + "-body");
}

const footnote = options => {
	const id        = get_element_id("footnote");
	const element   = get_or_create_element(id);
}

const _objectify	= (arr, fn) => {
	const objekt = { };

	for ( let i = 0, n = arr.length ; i < n ; ++i ) {
		const o 			= arr[i]; 
		const result 	= fn(o);

		for ( const key in result ) {
			objekt[key] = result[key];
		}
	}

	return objekt
}

const patch_model = model => {
		model.styles	= { };

		fluxviz.logger.warn("Patching Reactions...");

		model.compartments 	 	= model.compartments || { };
		const compartment_ids	= Object.keys(model.compartments)

		const metabolite_map 	= _objectify(model.metabolites, next => ({ [next.id]: next }));

		const fluxes					= [ ]

		const compartment_subsystems	= _objectify(compartment_ids, c => ({ [c]: [ ] }));
		const compartment_reactions		= _objectify(compartment_ids, c => ({
			[c]: _objectify(compartment_ids, c => ({ [c]: [ ] })) 
		}));
		const compartment_reactions_reversible = _objectify(compartment_ids, c => ({
			[c]: _objectify(compartment_ids, c => ({ [c]: [ ] })) 
		}));

		let subsystems 							= [ ];
		const subsystem_metabolites = { };
		const subsystem_reactions 	= { };

		fluxviz.logger.warn("Patching Metabolites...");
		const compartment_metabolite_count = _objectify(compartment_ids, c => ({ [c]: 0 }))

		for ( let i = 0, n = model.metabolites.length ; i < n ; ++i ) {
				const metabolite = model.metabolites[i];
				
				if ( metabolite.notes && metabolite.notes.fluxviz ) {
					metabolite.hide = metabolite.notes.fluxviz.hide;
				} else {
					metabolite.hide = false;
				}

				compartment_metabolite_count[metabolite.compartment] += 1
		}

		for ( let i = 0, a = model.reactions.length ; i < a ; ++i ) {
				const reaction		 	= model.reactions[i];
				const compartments 	= [ ];

				const metabolites		= Object.keys(reaction.metabolites);

				const reactants			= [ ];
				const products			= [ ];

				if ( !(reaction.subsystem in subsystem_reactions) ) {
					subsystem_reactions[reaction.subsystem] = new Array();
				}
				
				if ( !(reaction.subsystem in subsystem_metabolites) ) {
					subsystem_metabolites[reaction.subsystem] = { };
				}

				for ( let j = 0, b = metabolites.length ; j < b ; ++j ) {
					const metabolite = metabolites[j];
					const m = metabolite_map[ metabolite ];
					
					if ( m.compartment ) {
						compartments.push(m.compartment);
						// compartment subsystems.
						compartment_subsystems[m.compartment].push(reaction.subsystem);
					}

					if ( reaction.metabolites[ metabolite ] < 0 ) {
						reactants.push(metabolite);
					} else {
						products.push(metabolite)
					}

					if ( !m.hide ) {
						subsystem_metabolites[reaction.subsystem][m.id] = m;
					}
				}
				
				reaction.stoichiometry			= reaction.metabolites;

				reaction.metabolites        = metabolites;
				
				reaction.reversible         = reaction.lower_bound < 0 && reaction.upper_bound > 0;
				
				reaction.subsystems         = [reaction.subsystem];

				reaction.reactants					= reactants;
				reaction.products						= products;
				
				reaction.compartments       = Array.from(new Set(compartments));

				if ( reaction.notes
						&& reaction.notes.fluxviz 
						&& reaction.notes.fluxviz.flux ) {
						reaction.flux = reaction.notes.fluxviz.flux;
						
						fluxes.push(Math.abs(reaction.flux))
				}

				subsystems.push(reaction.subsystem);

				subsystem_reactions[reaction.subsystem].push(reaction);

				const reaction_compartments = reaction.compartments;
				const reaction_compartments_map = _objectify(reaction_compartments, c => ({ [c]: true }))

				for ( let k = 0, c = compartment_ids.length ; k < c ; ++k ) {
					const compartment_id 	= compartment_ids[k];
					const contains				= reaction_compartments_map[compartment_id];

					for ( let l = 0, d = reaction_compartments.length ; l < d ; ++l ) {
						const compartment 	= reaction_compartments[l];

						if ( contains ) {
							compartment_reactions[compartment][compartment_id].push(reaction);
							compartment_reactions[compartment_id][compartment].push(reaction);
							
							compartment_reactions_reversible[compartment][compartment_id].push(reaction);
							compartment_reactions_reversible[compartment_id][compartment].push(reaction);

							if ( reaction.reversible ) {
								compartment_reactions_reversible[compartment][compartment_id].push(reaction);
								compartment_reactions_reversible[compartment_id][compartment].push(reaction);
							}
						}
					}
				}

				model.styles[`reaction-${reaction.id}`] = {
					width: 1,
					arrow: { texture: "" },
					label: { }
				}
		}
		
		if ( fluxes.length ) {
			const min_flux 		= Math.min.apply(Math, fluxes);
			const max_flux 		= Math.max.apply(Math, fluxes);
			const denominator = max_flux - min_flux;
			
			for ( let i = 0, n = model.reactions.length ; i < n ; ++i ) {
				const reaction			= model.reactions[i];
				reaction.flux_width = Math.round(((
					Math.abs(reaction.flux) / denominator
				) * 100) / 10);

				model.styles[`reaction-${reaction.id}`].width = Math.min(reaction.flux_width * 10, 10);
			}
		}

		// Find Densities...
		const compartment_max_metabolites = Math.max.apply(null, Object.values(compartment_metabolite_count));
		
		fluxviz.logger.warn("Patching Compartments...");
		for ( let i = 0, a = compartment_ids.length ; i < a ; ++i ) {
				const compartment			= compartment_ids[i];
				const name            = model.compartments[compartment] || compartment;

				const n_metabolites   = compartment_metabolite_count[compartment];
				
				const subsystems      = Array.from(new Set(compartment_subsystems[compartment]));

				const connections			= [ ];

				for ( let j = 0, b = compartment_ids.length ; j < b ; ++j ) {
					const compartment_id = compartment_ids[j];

					if ( compartment_id !== compartment ) {
						const connection  = { compartment: compartment_id };
						const reactions		= compartment_reactions[compartment_id][compartment];

						if ( reactions.length ) {
							connection.reactions = reactions;
							connection.reactions_reversible = compartment_reactions_reversible[compartment_id][compartment]
							connections.push(connection)
						}
					}
				}

				const max_reactions = Math.max.apply(null, connections.map(c => c.reactions.length));

				for ( let j = 0, b = connections.length ; j < b ; ++j ) {
					const connection	= connections[j]
					const reactions 	= connection.reactions_reversible;

					const reaction_density      = reactions.length / max_reactions;
					connection.reaction_density = reaction_density;

					model.styles[`compartment-edge-${name}-${connection.compartment}`] = {
						width: Math.max(1, Math.min(connection.reaction_density * 3, 3))
					}
				}

				const metabolite_density			= n_metabolites / compartment_max_metabolites;

				model.compartments[compartment] = { name: name,
						n_metabolites: n_metabolites, subsystems: subsystems,
						connections: connections, metabolite_density: metabolite_density };

				const style_name = `compartment-${compartment}`;
				model.styles[style_name] = { size: metabolite_density * 15 + 15, color: fluxviz.color(style_name) }
				model.styles[`metabolite-compartment-${compartment}`] = { color: fluxviz.color(`compartment-${compartment}`) };
		}

		fluxviz.logger.warn("Patching SubSystems...");
		subsystems = Array.from(new Set(subsystems));
		
		subsystems = subsystems
				.map(subsystem => ({
					name: subsystem, metabolites: Object.values(subsystem_metabolites[subsystem]),
					reactions: subsystem_reactions[subsystem]
				}))

		// Find Densities
		const max_reactions = Math.max.apply(null, subsystems.map(s => s.reactions.length))

		for ( let i = 0, n = subsystems.length ; i < n ; ++i ) {
				const subsystem							= subsystems[i];
				const reaction_density     	= subsystem.reactions.length / max_reactions;
				subsystem.reaction_density  = reaction_density;

				const style_name = `subsystem-${subsystem.name}`
				model.styles[style_name] = { size: reaction_density * 15 + 15, color: fluxviz.color("subsystem") };
		}

		model.subsystems = subsystems;

		fluxviz.logger.info("Model Patched.");
}

const get_metabolite_nodes_and_reaction_edges = (metabolites, reactions) => {
		fluxviz.logger.info("Building Metabolite Nodes...");
		let nodes         = { metabolites: { }, reactions: { } }
		
		for ( let i = 0, n = metabolites.length ; i < n ; ++i ) {
				const m 		= metabolites[i]; 
				const type 	= { "name": "metabolite", "label": "Metabolite" };
				const node 	= { label: m.id, type: type,
						style: "metabolite-compartment-" + m.compartment,
						object: m };

				nodes.metabolites[m.id] = node;
		}

		for ( let i = 0, n = reactions.length ; i < n ; ++i ) {
				const r			= reactions[i]; 
				const type 	= { "name": "reaction", "label": "Reaction" };
				const node 	= { label: r.id, type: type,
						style: "reaction-node", object: r };

				nodes.reactions[r.id] = node;
		}
		
		fluxviz.logger.info("Building Reaction Edges...");
		const edges = 
				reactions.map(r => {
						const edges     = [ ]
						const type      = "reaction-edge";

						const reactants = r.reactants.filter(r => r in nodes.metabolites);
						const products  = r.products .filter(p => p in nodes.metabolites);

						if ( reactants.length && products.length ) {
								if ( reactants.length == 1 && products.length == 1 ) {
										const reactant = reactants[0];
										const product  = products[0];

										if ( reactant in nodes.metabolites && product in nodes.metabolites ) {
											edges.push({
												type:   type,
												source: nodes.metabolites[reactant],
												target: nodes.metabolites[product],
												object: r
											});

											if ( r.reversible ) {
												edges.push({
													type:   type,
													source: nodes.metabolites[product],
													target: nodes.metabolites[reactant],
													object: r
												});
											}
										}
								} else {
										for ( let i = 0, n = reactants.length ; i < n ; ++i ) {
												const reactant = reactants[i];
												if ( reactant in nodes.metabolites ) {
														edges.push({
															type:   type,
															source: nodes.metabolites[reactant],
															target: nodes.reactions[r.id],
															object: r,
															style:  `reaction-${r.id}`
														});

														if ( r.reversible ) {
																edges.push({
																	type:   type,
																	source: nodes.reactions[r.id],
																	target: nodes.metabolites[reactant],
																	object: r
																});
														}
												}
										}
		
										for ( let i = 0, n = products.length ; i < n ; ++i ) {
												const product = products[i]
												if ( product in nodes.metabolites ) {
														edges.push({
															type:   type,
															source: nodes.reactions[r.id],
															target: nodes.metabolites[product],
															object: r
														});

														if ( r.reversible ) {
																edges.push({
																	type:   type,
																	source: nodes.metabolites[product],
																	target: nodes.reactions[r.id],
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
				.flat()
		
		nodes = [].concat(
			Object.values(nodes.metabolites),
			Object.values(nodes.reactions)
		)

		fluxviz.logger.info("Sub Graph built.");

		return { nodes, edges };
}

fluxviz._colors	= { };
fluxviz.color	= (type) => {
		const colors = fluxviz._colors

		if ( !(type in colors) ) {
			colors[type] = randomColor({ format: "rgb" });
		}

		return colors[type];
}

export const render = async (element, model, { styles = { } } = { }) => {
		fluxviz.logger.warn("Patching Model...", model);
		patch_model(model);

		fluxviz.logger.info("Patched Model: ");
		fluxviz.logger.info(model);

		const ASPECT_RATIO    = 16 / 9;

		const width           = 1024;
		const height          = width / ASPECT_RATIO;
		
		element.width         = width;
		element.height        = height;

		const compartments    = Object.keys(model.compartments);

		styles              = Object.assign({ },
				{
					"reaction-edge": {
						arrow: {
							texture: ""
						},
						label: {

						}
					}
				},
				{
					"reaction-edge-highlight": {
						color: "rgb(0,0,0)"
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
					"opague": {
						color: "rgb(255, 255, 240)"
					}
				},
				model.styles,
				styles
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
								color: fluxviz.color("node")
							},
							edge: {
								arrow: {
									texture: "images/arrow.png",
									animation: {
										type: "size"
									},
									type: "delta",
									size: 12
								},
								label: {
										
								}
							}
						},
						styles
				)
		});

		let nodes = [ ];
		let edges = [ ];

		if ( compartments.length ) {
			nodes = _objectify(compartments, next => {
					const compartment = model.compartments[next];
	
					let nodes = null;
					let edges = null;
	
					if ( compartment.subsystems.length ) {
							// parallelize this.
							const get_subsystem_node = subsystem => {
								subsystem = model.subsystems.find(s => s.name == subsystem);
								fluxviz.logger.info("Building node for subsystem: " + subsystem.name);
	
								const result = get_metabolite_nodes_and_reaction_edges(
									subsystem.metabolites, subsystem.reactions
								);
	
								const type = { "name": "subsystem", "label": "Sub System" };
								const node = {
										label: subsystem.name,
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
	
					const type    = { "name": "compartment",
							"label": "Compartment" };
					const notes = {
							body: "                     \
									<div>                   \
											Reaction Density:   \
									</div>                  \
							"
					};
					const node    = {
							_id: `compartment:${next}`,
							label: compartment.name,
							style: "compartment-" + next, 
							nodes: nodes, edges: edges, type: type, notes: notes };
	
					return { [next]: node };
			}),
			
			edges = 
					compartments
							.map(c => {
									const compartment   = model.compartments[c];
									const edges         = [ ];
	
									for ( let i = 0, n = compartment.connections.length ; i < n ; ++i ) {
											const connection 	= compartment.connections[i]
											const to        	= connection.compartment;
											
											const edge      	= { source: nodes[c], target: nodes[to],
													style: "compartment-edge-" + c + "-" + to,
													type: "compartment-edge" }
	
											edges.push(edge);
									}
	
									return edges;
							})
							.flat()

			nodes = Object.values(nodes)
		} else {
			const result = get_metabolite_nodes_and_reaction_edges(
				model.metabolites, model.reactions
			);

			nodes = result.nodes;
			edges = result.edges;
		}

		
		const history = { };
		let   level   = 1;

		const multiLevel    = (element, graph) => {
			fluxviz.logger.warn("Setting up multi-level plugin...");
			
			element.addEventListener("click", async e => {
					fluxviz.logger.info("Current Level (On Mouse Click): " + level);
					fluxviz.logger.info("History (On Mouse Click): ");
					fluxviz.logger.info(history);

					const targets = getSubGraphOnEvent(element, graph, e);
					
					if ( targets.nodes && targets.nodes.length == 1 ) {
							const node = targets.nodes[0].node;

							if ( node.nodes ) {
									const nodes     = node.nodes;
									const edges     = node.edges || [ ];
									
									const current   = graph.findArea(0, 0, 1, 1, true, true);

									history[level]  = {
										nodes: current.nodes.map(n => n.node),
										edges: current.edges.map(e => e.edge)
									};

									fluxviz.logger.info("History Level " + level);
									fluxviz.logger.info(history[level]);
											
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

		const plugins       = { multiLevel };

		const setGraph      = async (graph, nodes, edges, layout, options) => {
				fluxviz.logger.warn("Setting graph nodes and edges...");
				fluxviz.logger.warn("Graph: ");
				fluxviz.logger.warn("Nodes: ");
				fluxviz.logger.warn(nodes);
				fluxviz.logger.warn("Edges: ");
				fluxviz.logger.warn(edges);

				const set   = async () => {
						if ( !("plugin" in ccNetViz) ) {
								ccNetViz.plugin = { };
						}

						fluxviz.logger.warn("Setting up plugins...");
						for ( const plugin in plugins ) {
								if ( !(plugin in ccNetViz.plugin) ) {
										fluxviz.logger.warn("Setting up plugin: " + plugin);
										ccNetViz.plugin[plugin] = plugins[plugin];
								}

								fluxviz.logger.warn("Initializing plugin: " + plugin);
								ccNetViz.plugin[plugin](element, graph);
						}

						fluxviz.logger.warn("Setting up graph...");
						await graph.set(nodes, edges, layout, options);
				}

				await set();
		}

		const drawGraph = async (graph, nodes, edges, layout, options) => {
				await setGraph(graph, nodes, edges, layout, options);
				fluxviz.logger.warn("Rendering graph...");
				graph.draw();
		}

		const pathway = [ ];
		
		element.addEventListener("mousemove", e => {
				const target  = getSubGraphOnEvent(element, fluxviz._graph, e);
				// prioritize nodes...
				const targets = target.nodes.length ? target.nodes : target.edges;
				
				if ( targets.length ) {
					const component = targets.reduce((prev, next) => (prev.dist < next.dist ? prev : next));
					let object    	= null;

					if ( component.node ) {
							object      = component.node;
							object.node = true;
							object.edge = false;
					} else {
							object      = component.edge;
							object.node = false;
							object.edge = true;
					}

					fluxviz.logger.info("On Mouse Move: ");
					fluxviz.logger.info(object);
					
					if ( object.node ) {
							fluxviz.logger.info("");

							pathway.push(object);
					} else {
							fluxviz.logger.warn("Highlighting an edge...");

							if ( object.type == "reaction-edge" ) {
									fluxviz.logger.warn("Highlighting a reaction...");
							}
					}
					
					if ( object ) {
						const { label, type } = object;

						fluxviz.tooltip({
							title: label, 
							label: type && type.label,
							show: true,
							style: {
								left: e.clientX - 10 + "px",
								top:  e.clientY + 25 + "px"
							}
						})
					}
				} else {
					fluxviz.tooltip({ show: false });
				}
		});

		await drawGraph(fluxviz._graph, nodes, edges, "force");

		fluxviz.goTo = id => {
			const nodes = nodes;

			for ( const node of nodes ) {
				if ( node._id == id ) {
					
				}
			}
		}

		return { graph: fluxviz._graph, styles };
};