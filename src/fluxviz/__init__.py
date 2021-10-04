from __future__ import absolute_import

try:
    import os

    if os.environ.get("FLUXVIZ_GEVENT_PATCH"):
        from gevent import monkey
        monkey.patch_all(threaded = False, select = False)
except ImportError:
    pass

# imports - module imports
from fluxviz.__attr__ import (
    __name__,
    __version__,
    __description__,
    __author__
)
from fluxviz.__main__    import main
from fluxviz.config      import Settings
from bpyutils.util.jobs   import run_all as run_all_jobs, run_job

settings = Settings()

def get_version_str():
    version = "%s%s" % (__version__, " (%s)" % __build__ if __build__ else "")
    return version