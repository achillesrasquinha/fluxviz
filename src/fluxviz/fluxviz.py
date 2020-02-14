# imports - compatibility imports
from fluxviz._compat    import iterkeys

# imports - standard imports
import os, os.path as osp
import json
import shutil

# imports - third-party imports
from IPython.display    import HTML
from cobra.io.json      import model_to_dict
from cobra.exceptions   import OptimizationError

# imports - module imports
from fluxviz.template       import render_template
from fluxviz.util.string    import get_random_str
from fluxviz.util.system    import remove 
from fluxviz.constant       import PATH
from fluxviz._compat        import iterkeys

def patch_model(model):
    for reaction in model.reactions:
        try:
            flux = reaction.flux
            reaction.notes["fluxviz"] = dict({
                "flux": flux
            })
        except OptimizationError:
            pass

    return model

def plot(model):
    model       = patch_model(model)

    dict_       = model_to_dict(model)
    json_       = json.dumps(dict_)

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
    javascript  = render_template("fluxviz.js",
        model = json_, id = id_
    )

    template    = render_template("main.html",
        javascript = javascript, id = id_
    )

    html        = HTML(template)

    return html