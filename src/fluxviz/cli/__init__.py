# imports - module imports
from fluxviz.cli.util   import *
from fluxviz.cli.parser import get_args
from fluxviz.util._dict import merge_dict
from fluxviz.util.types import get_function_arguments

def command(fn):
    args    = get_args()
    
    params  = get_function_arguments(fn)

    params  = merge_dict(params, args)
    
    def wrapper(*args, **kwargs):
        return fn(**params)

    return wrapper