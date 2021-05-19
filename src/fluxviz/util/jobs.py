# imports - standard imports
import os, os.path as osp
from   functools import partial
import sys

# imports - module imports
from fluxviz.config          import PATH, Settings
from fluxviz.util.imports    import import_handler
from fluxviz.util.system     import popen
from fluxviz.util._dict      import merge_dict
from fluxviz.util.environ    import getenvvar, getenv
from fluxviz import parallel, log

settings = Settings()
logger   = log.get_logger()

JOBS = [
    {
        "name": "bigg_connector"
    },
    {
        "name": "build_pathway_info",
    }
]

def run_job(name, variables = None):
    job = [job for job in JOBS if job["name"] == name]
    if not job:
        raise ValueError("No job %s found." % name)
    else:
        job = job[0]

    variables = merge_dict(job.get("variables", {}), variables or {})

    popen("%s -c 'from fluxviz.util.imports import import_handler; import_handler(\"%s\")()'" %
        (sys.executable, "fluxviz.jobs.%s.run" % name), env = variables)

def run_all():
    logger.info("Running all jobs...")
    for job in JOBS:
        if not job.get("beta") or getenv("JOBS_BETA"):
            run_job(job["name"], variables = job.get("variables"))