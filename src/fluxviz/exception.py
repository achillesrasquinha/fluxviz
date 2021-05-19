# imports - standard imports
import subprocess as sp

class FluxvizError(Exception):
    pass

class PopenError(FluxvizError, sp.CalledProcessError):
    pass

class DependencyNotFoundError(ImportError):
    pass