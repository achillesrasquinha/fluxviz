import sys
import os, os.path as osp
import datetime as dt

def pardir(path, level = 1):
    for _ in range(level):
        path = osp.dirname(path)
    return path

BASEDIR = osp.abspath(pardir(__file__, 3))
DOCSDIR = osp.join(BASEDIR, "docs")
SRCDIR  = osp.join(BASEDIR, "src")
NOW     = dt.datetime.now()

sys.path.insert(0, BASEDIR)

import fluxviz

project   = fluxviz.__name__
author    = fluxviz.__author__
copyright = "%s %s" % (NOW.year, fluxviz.__author__)

version   = fluxviz.__version__
release   = fluxviz.__version__

source_suffix       = [".rst"]

master_doc          = "index"

exclude_patterns    = [
    osp.join(DOCSDIR, "source", "notebooks", ".ipynb_checkpoints")
]

extensions          = [
    "sphinx.ext.autodoc",
    "nbsphinx"
]

templates_path      = [
    osp.join(DOCSDIR, "source", "_templates")
]

html_theme          = "alabaster"

html_static_path    = [
    osp.join(DOCSDIR, "source", "_static")
]

html_sidebars       = {
    "index": ["sidebar.html"],
    "**": [
        "sidebar.html"
    ]
}