from __future__ import absolute_import

# imports - compatibility imports
from fluxviz._compat    import iterkeys

# imports - standard imports
import os, os.path as osp
import json
import shutil
import collections

# imports - third-party imports
from IPython.display    import HTML
from cobra.io.json      import model_to_dict

# imports - module imports
from fluxviz.template       import render_template
from fluxviz.util.string    import get_random_str
from fluxviz.util.system    import remove
from fluxviz.constant       import PATH
from fluxviz._compat        import iterkeys

def patch_model(model):
    if "species" in model:
        model["metabolites"] = model.pop("species")

    for i, reaction in enumerate(model["reactions"]):
        if "stoichiometry" in reaction:
            model["reactions"][i]["metabolites"] = model["reactions"][i].pop("stoichiometry")

    return model

def plot(model):
    if not isinstance(model, collections.Mapping):
        model = model_to_dict(model)

    model = patch_model(model)
    
    json_ = json.dumps(model)

    directories = [
        osp.join(PATH["DATA"], "images"),
        osp.join(PATH["DATA"], "js")
    ]

    for directory in directories:
        basedir = osp.basename(directory)

        abspath = osp.join(os.getcwd(), basedir)
        remove(abspath, recursive = True, raise_err = False)

        shutil.copytree(directory, abspath)

    id_         = get_random_str()
    javascript  = render_template("main.js",
        model = json_, id = id_
    )

    template    = render_template("main.html",
        javascript = javascript, id = id_
    )

    html        = HTML(template)

    return html
