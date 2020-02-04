# imports - standard imports
import os.path as osp

# imports - module imports
from fluxviz.__attr__    import __name__
from fluxviz.util.system import pardir, makedirs
from fluxviz.util._dict  import autodict

PATH              = autodict()
PATH["BASE"]      = pardir(__file__)
PATH["DATA"]      = osp.join(PATH["BASE"], "data")
PATH["TEMPLATES"] = osp.join(PATH["DATA"], "templates")
PATH["CACHE"]     = osp.join(osp.expanduser("~"), ".%s" % __name__)

makedirs(PATH["CACHE"], exist_ok = True)