# imports - compatibility imports
from __future__ import absolute_import

# imports - standard imports
import sys, os
import re
import json
import multiprocessing as mp
from   functools import partial
import traceback

from fluxviz.commands.util 	import cli_format
from fluxviz.util.array    	import flatten, sequencify
from fluxviz.util._dict     import merge_dict
from fluxviz.util.system   	import (read, write, touch, popen, which)
from fluxviz.util.environ  	import getenvvar
from fluxviz.util.datetime 	import get_timestamp_str
from fluxviz.util.imports   import import_handler
from fluxviz 		      	import (request as req, cli,
    log, parallel
)
from fluxviz._compat		import builtins, iteritems
from fluxviz.__attr__      	import __name__
from fluxviz.config			import environment
from fluxviz.exception      import DependencyNotFoundError

logger   = log.get_logger(level = log.DEBUG)

ARGUMENTS = dict(
    jobs						= 1,
    check		 				= False,
    interactive  				= False,
    yes			 				= False,
    no_cache		            = False,
    no_color 	 				= True,
    output						= None,
    ignore_error				= False,
    force						= False,
    verbose		 				= False
)

@cli.command
def command(**ARGUMENTS):
    try:
        return _command(**ARGUMENTS)
    except Exception as e:
        if not isinstance(e, DependencyNotFoundError):
            cli.echo()

            traceback_str = traceback.format_exc()
            cli.echo(traceback_str)

            cli.echo(cli_format("""\
An error occured while performing the above command. This could be an issue with
"fluxviz". Kindly post an issue at https://github.com/achillesrasquinha/fluxviz/issues""", cli.RED))
        else:
            raise e

def to_params(kwargs):
    class O(object):
        pass

    params = O()

    kwargs = merge_dict(ARGUMENTS, kwargs)

    for k, v in iteritems(kwargs):
        setattr(params, k, v)

    return params

def import_or_raise(package, name = None):
    name = name or package

    try:
        import_handler(package)
    except ImportError:
        raise DependencyNotFoundError((
            "Unable to import {package} for resolving dependencies. "
            "fluxviz requires {package} to be installed. "
            "Please install {package} by executing 'pip install {name}'."
        ).format(package = package, name = name))

def _command(*args, **kwargs):
    a = to_params(kwargs)

    if not a.verbose:
        logger.setLevel(log.NOTSET)

    logger.info("Environment: %s" % environment())
    logger.info("Arguments Passed: %s" % locals())

    file_ = a.output

    if file_:
        logger.info("Writing to output file %s..." % file_)
        touch(file_)
    
    logger.info("Using %s jobs..." % a.jobs)