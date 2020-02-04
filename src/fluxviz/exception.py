# imports - standard imports
import subprocess as sp

class FluxVizError(Exception):
    pass

class PopenError(FluxVizError, sp.CalledProcessError):
    pass

class TemplateNotFoundError(FluxVizError):
    pass