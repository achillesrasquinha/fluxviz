# imports - compatibility imports
from fluxviz._compat import iteritems

# imports - standard imports
import os, os.path as osp
import errno
import platform
import shutil
import subprocess  as sp
from   distutils.spawn import find_executable

# imports - module imports
from fluxviz.exception   import PopenError
from fluxviz.util.string import strip, safe_decode
from fluxviz._compat     import iteritems
from fluxviz.log         import get_logger
from fluxviz._compat     import string_types

logger = get_logger()

def read(fname):
    with open(fname) as f:
        data = f.read()
    return data

def write(fname, data = None, force = False, append = False):
    if not osp.exists(fname) or append or force:
        with open(fname, mode = "a" if append else "w") as f:
            if data:
                f.write(data)

def which(executable, raise_err = False):
    exec_ = find_executable(executable)
    
    if not exec_ and raise_err:
        raise ValueError("Executable %s not found." % exec_)
    
    return exec_

def pardir(fname, level = 1):
    for _ in range(level):
        fname = osp.dirname(fname)
    return fname

def popen(*args, **kwargs):
    output      = kwargs.get("output", False)
    quiet       = kwargs.get("quiet" , False)
    directory   = kwargs.get("cwd")
    environment = kwargs.get("env")
    shell       = kwargs.get("shell", True)
    raise_err   = kwargs.get("raise_err", True)

    environ     = os.environ.copy()
    if environment:
        environ.update(environment)

    for k, v in iteritems(environ):
        environ[k] = string_types(v)

    command     = " ".join([string_types(arg) for arg in args])

    logger.info("Executing command: %s" % command)

    if quiet:
        output  = True
    
    proc        = sp.Popen(command,
        bufsize = -1,
        stdin   = sp.PIPE if output else None,
        stdout  = sp.PIPE if output else None,
        stderr  = sp.PIPE if output else None,
        env     = environ,
        cwd     = directory,
        shell   = shell
    )

    code       = proc.wait()

    if code and raise_err:
        raise PopenError(code, command)

    if output:
        output, error = proc.communicate()

        if output:
            output = safe_decode(output)
            output = strip(output)

        if error:
            error  = safe_decode(error)
            error  = strip(error)

        if quiet:
            return code
        else:
            return code, output, error
    else:
        return code

def makedirs(dirs, exist_ok = False):
    try:
        os.makedirs(dirs)
    except OSError as e:
        if not exist_ok or e.errno != errno.EEXIST:
            raise

def environment():
    environ = dict()
    
    environ["python_version"]   = platform.python_version()
    environ["os"]               = platform.platform()

    return environ

def touch(filename):
    if not osp.exists(filename):
        with open(filename, "w") as f:
            pass

def remove(path, recursive = False, raise_err = True):
    path = osp.realpath(path)

    if osp.isdir(path):
        if recursive:
            shutil.rmtree(path)
        else:
            if raise_err:
                raise OSError("{path} is a directory.".format(
                    path = path
                ))
    else:
        try:
            os.remove(path)
        except OSError:
            if raise_err:
                raise