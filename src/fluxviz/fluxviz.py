# imports - compatibility imports
from fluxviz._compat    import iterkeys

# imports - standard imports
import os, os.path as osp
import json
import shutil

# imports - third-party imports
from IPython.display    import HTML
from cobra.io.json      import model_to_dict

# imports - module imports
from fluxviz.template   import render_template
from fluxviz.constant   import PATH
from fluxviz._compat    import iterkeys

def dictify(obj):
    string = json.dumps(obj)
    dict_  = json.loads(string)

    return dict_

def dictify_model(model):
    dict_        = dictify(model_to_dict(model))

    compartments = list(iterkeys(dict_["compartments"]))
    
    for compartment in compartments:
        name         = dict_["compartments"][compartment]

        nmetabolites = len(model.metabolites.query(
            lambda m: m.compartment == compartment))

        dict_["compartments"][compartment] = dict({
            "name": name,
            "n_metabolites": nmetabolites
        })
    
    for i, reaction in enumerate(dict_["reactions"]):
        compartments = [ ]

        for reaction_metabolite in iterkeys(reaction["metabolites"]):
            metabolite = model.metabolites.get_by_id(reaction_metabolite)
            compartments.append(metabolite.compartment)

        reaction["compartments"] = list(set(compartments))

    return dict_

def plot(model):
    dict_       = dictify_model(model)
    json_       = json.dumps(dict_)

    source      = osp.join(PATH["DATA"], "images")
    destination = osp.join(os.getcwd(), "images")
    
    # shutil.copytree(source, destination)

    javascript  = render_template("fluxviz.js",
        model = json_
    )

    template    = render_template("main.html",
        javascript = javascript
    )

    html        = HTML(template)

    return html