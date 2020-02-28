.PHONY: shell test help

BASEDIR					= $(shell pwd)
-include ${BASEDIR}/.env

ENVIRONMENT			   ?= development

PROJECT					= fluxviz

SRCDIR					= ${BASEDIR}/src
PROJDIR					= ${SRCDIR}/fluxviz
DISTDIR					= ${BASEDIR}/dist
TESTDIR					= ${BASEDIR}/tests
DOCSDIR					= ${BASEDIR}/docs
NOTEBOOKSDIR			= ${DOCSDIR}/source/notebooks

PYTHONPATH		 	   ?= python

VIRTUAL_ENV			   ?= ${BASEDIR}/.venv
VENVBIN					= ${VIRTUAL_ENV}/bin

PYTHON				  	= ${VENVBIN}/python
IPYTHON					= ${VENVBIN}/ipython
PIP					  	= ${VENVBIN}/pip
JUPYTER					= ${VENVBIN}/jupyter
PYTEST					= ${VENVBIN}/pytest
TOX						= ${VENVBIN}/tox
COVERALLS				= ${VENVBIN}/coveralls
IPYTHON					= ${VENVBIN}/ipython
SAFETY					= ${VENVBIN}/safety
PRECOMMIT				= ${VENVBIN}/pre-commit
SPHINXBUILD				= ${VENVBIN}/sphinx-build
TWINE					= ${VENVBIN}/twine

NODE_MODULES			= ${BASEDIR}/node_modules

NODEBIN					= $(shell yarn bin)

ROLLUP					= ${NODEBIN}/rollup

JOBS				   ?= $(shell $(PYTHON) -c "import multiprocessing as mp; print(mp.cpu_count())")
PYTHON_ENVIRONMENT      = $(shell $(PYTHON) -c "import sys;v=sys.version_info;print('py%s%s'%(v.major,v.minor))")

NULL					= /dev/null

define log
	$(eval CLEAR     = \033[0m)
	$(eval BOLD		 = \033[0;1m)
	$(eval INFO	     = \033[0;36m)
	$(eval SUCCESS   = \033[0;32m)

	$(eval BULLET 	 = "→")
	$(eval TIMESTAMP = $(shell date +%H:%M:%S))

	@echo "${BULLET} ${$1}[${TIMESTAMP}]${CLEAR} ${BOLD}$2${CLEAR}"
endef

define browse
	$(PYTHON) -c "import webbrowser as wb; wb.open('${$1}')"
endef

ifndef VERBOSE
.SILENT:
endif

.DEFAULT_GOAL 		   := help 

env: ## Create a Virtual Environment
ifneq (${VERBOSE},true)
	$(eval OUT = > /dev/null)
endif

	$(call log,INFO,Creating a Virtual Environment ${VIRTUAL_ENV} with Python - ${PYTHONPATH})
	@virtualenv $(VIRTUAL_ENV) -p $(PYTHONPATH) $(OUT)

info: ## Display Information
	@echo "Python Environment: ${PYTHON_ENVIRONMENT}"

install: clean info ## Install dependencies and module.
ifneq (${VERBOSE},true)
	$(eval OUT = > /dev/null)
endif

ifneq (${PIPCACHEDIR},)
	$(eval PIPCACHEDIR := --cache-dir $(PIPCACHEDIR))
endif

	$(call log,INFO,Building Requirements)
	@find $(BASEDIR)/requirements -maxdepth 1 -type f | xargs awk '{print}' > $(BASEDIR)/requirements-dev.txt
	@cat $(BASEDIR)/requirements/production.txt  > $(BASEDIR)/requirements.txt
	@cat $(BASEDIR)/requirements/production.txt $(BASEDIR)/requirements/test.txt > $(BASEDIR)/requirements-test.txt

	$(call log,INFO,Installing Requirements)
ifeq (${TRAVIS},true)
	$(PIP) install -r $(BASEDIR)/requirements-test.txt $(OUT)
else
	$(PIP) install -r $(BASEDIR)/requirements-dev.txt  $(OUT)
endif

	$(call log,INFO,Installing ${PROJECT} (${ENVIRONMENT}))
ifeq (${ENVIRONMENT},production)
	$(PYTHON) setup.py install $(OUT)
else
	$(PYTHON) setup.py develop $(OUT)
endif

	$(call log,SUCCESS,Installation Successful)

clean: ## Clean cache, build and other auto-generated files.
ifneq (${ENVIRONMENT},test)
	@clear

	$(call log,INFO,Cleaning Python Cache)
	@find $(BASEDIR) | grep -E "__pycache__|\.pyc" | xargs rm -rf

	@rm -rf \
		$(BASEDIR)/*.egg-info \
		$(BASEDIR)/.pytest_cache \
		$(BASEDIR)/.tox \
		$(BASEDIR)/*.coverage \
		$(BASEDIR)/*.coverage.* \
		$(BASEDIR)/htmlcov \
		$(BASEDIR)/dist \
		$(BASEDIR)/build \

	$(call log,SUCCESS,Cleaning Successful)
else
	$(call log,SUCCESS,Nothing to clean)
endif

test: install ## Run tests.
	$(call log,INFO,Running Python Tests using $(JOBS) jobs.)
	$(TOX) --skip-missing-interpreters $(ARGS)

js-test: ## Run JavaScript tests.
	$(NODEBIN)/nyc $(NODEBIN)/mocha $(TESTDIR)/js \
		--recursive \
		--require @babel/register

js-lint: ## Run JavaScript lint.
	$(NODEBIN)/eslint

coverage: install ## Run tests and display coverage.
ifeq (${ENVIRONMENT},development)
	$(eval IARGS := --cov-report html)
endif

	$(PYTEST) -n $(JOBS) --cov $(PROJDIR) $(IARGS) -vv $(ARGS)

ifeq (${ENVIRONMENT},development)
	$(call browse,file:///${BASEDIR}/htmlcov/index.html)
endif

ifeq (${ENVIRONMENT},test)
	$(COVERALLS)
endif

shell: ## Launch an IPython shell.
	$(call log,INFO,Launching Python Shell)
	$(IPYTHON) \
		--no-banner

build: clean ## Build the Distribution.
	$(PYTHON) setup.py sdist bdist_wheel

	$(ROLLUP) -c $(BASEDIR)/rollup.config.js

	@cp $(DISTDIR)/js/fluxviz.js $(PROJDIR)/data/js/vendor

watch: clean ## Watch for file changes and build.
	$(ROLLUP) -c $(BASEDIR)/rollup.config.js --watch

pre-commit: ## Perform Pre-Commit Tasks.
	$(PRECOMMIT) run

docs: install ## Build Documentation
ifneq (${VERBOSE},true)
	$(eval OUT = > /dev/null)
endif

	$(call log,INFO,Building Notebooks)
	@find $(DOCSDIR)/source/notebooks -type f -name '*.ipynb' -not -path "*/.ipynb_checkpoints/*" | \
		xargs $(JUPYTER) nbconvert \
			--to notebook 		\
			--inplace 			\
			--execute 			\
			--ExecutePreprocessor.timeout=300

	$(call log,INFO,Building Documentation)
	$(SPHINXBUILD) $(DOCSDIR)/source $(DOCSDIR)/build $(OUT)

	$(call log,INFO,Cleaning Up...)
	$(PYTHON) scripts/delete-models.py

	$(call log,SUCCESS,Building Documentation Successful)

docker-build: clean ## Build the Docker Image.
	$(call log,INFO,Building Docker Image)

	@docker build $(BASEDIR) --tag $(DOCKER_HUB_USERNAME)/$(PROJECT) $(DOCKER_BUILD_ARGS)

docker-tox: clean ## Test using Docker Tox Image.
	$(call log,INFO,Running Tests using Docker Tox)
	$(eval TMPDIR := /tmp/$(PROJECT)-$(shell date +"%Y_%m_%d_%H_%M_%S"))

	@mkdir   $(TMPDIR)
	@cp -R . $(TMPDIR)

	@docker run --rm -v $(TMPDIR):/app themattrix/tox

	@rm -rf  $(TMPDIR)

release: ## Create a Release
	$(PYTHON) setup.py sdist bdist_wheel

ifeq (${ENVIRONMENT},development)
	$(call log,WARN,Ensure your environment is in production mode.)
	$(TWINE) upload --repository-url https://test.pypi.org/legacy/   $(BASEDIR)/dist/* 
else
	$(TWINE) upload --repository-url https://upload.pypi.org/legacy/ $(BASEDIR)/dist/* 
endif

notebooks: ## Launch Notebooks
	$(JUPYTER) notebook --notebook-dir $(NOTEBOOKSDIR)

help: ## Show help and exit.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

samples: ## Launch samples
	$(NODEBIN)/http-server $(BASEDIR)