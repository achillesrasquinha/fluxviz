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
from fluxviz.util.array     import sequencify
from fluxviz.constant       import PATH
from fluxviz._compat        import iterkeys, string_types
from fluxviz.config         import Settings
from fluxviz.log            import get_logger

logger = get_logger()

def patch_model(model):
    settings         = Settings()
    hide_metabolites = settings.get("hide_metabolites")

    if hide_metabolites:
        hide_metabolites = hide_metabolites.split(",")
    
        for metabolite in model.metabolites:
            for hide_metabolite in hide_metabolites:
                if isinstance(metabolite.id, string_types) and metabolite.id:
                    if metabolite.annotation:
                        if "bigg.metabolite" in metabolite.annotation:
                            annotation = sequencify(metabolite.annotation["bigg.metabolite"])
                            if hide_metabolite in annotation:
                                metabolite.notes["fluxviz"] = dict({
                                    "hide": True
                                })

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
    logger.info("Patching Model...")
    model       = patch_model(model)
    logger.info("Model patched.")

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
    javascript  = render_template("script.js",
        model = json_, id = id_
    )

    template    = render_template("main.html",
        javascript = javascript, id = id_
    )

    html        = HTML(template)

    return html