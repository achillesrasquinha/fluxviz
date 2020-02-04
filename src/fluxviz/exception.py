# imports - standard imports
import subprocess as sp

class fluxvizError(Exception):
    pass

class PopenError(fluxvizError, sp.CalledProcessError):
    pass