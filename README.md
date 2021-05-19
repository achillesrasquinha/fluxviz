<div align="center">
  <img src=".github/assets/logo.png" height="128">
  <h1>
      fluxviz
  </h1>
  <h4>A visualizer for metabolic pathways</h4>
</div>

<p align="center">
  <a href="https://coveralls.io/github/achillesrasquinha/fluxviz">
    <img src="https://img.shields.io/coveralls/github/achillesrasquinha/fluxviz.svg?style=flat-square">
  </a>
  <a href="https://pypi.org/project/fluxviz/">
		<img src="https://img.shields.io/pypi/v/fluxviz.svg?style=flat-square">
	</a>
  <a href="https://pypi.org/project/fluxviz/">
		<img src="https://img.shields.io/pypi/l/fluxviz.svg?style=flat-square">
	</a>
  <a href="https://pypi.org/project/fluxviz/">
		<img src="https://img.shields.io/pypi/pyversions/fluxviz.svg?style=flat-square">
	</a>
  <a href="https://hub.docker.com/r/achillesrasquinha/fluxviz">
		<img src="https://img.shields.io/docker/cloud/build/achillesrasquinha/fluxviz.svg?style=flat-square&logo=docker">
	</a>
  <a href="https://git.io/boilpy">
    <img src="https://img.shields.io/badge/made%20with-boilpy-red.svg?style=flat-square">
  </a>
	<a href="https://saythanks.io/to/achillesrasquinha">
		<img src="https://img.shields.io/badge/Say%20Thanks-🦉-1EAEDB.svg?style=flat-square">
	</a>
	<a href="https://paypal.me/achillesrasquinha">
		<img src="https://img.shields.io/badge/donate-💵-f44336.svg?style=flat-square">
	</a>
</p>

<div align="center">
  <img src=".github/assets/demo.gif">
</div>

### Table of Contents
* [Features](#Features)
* [Installation](#installation)
* [Usage](#usage)
  * [Basic Usage](#basic-usage)
  * [Docker](#docker)
  * [Environment Variables](docs/source/envvar.md)
* [FAQ](FAQ.md)
* [License](#license)

### Features

### Installation

```shell
$ pip install fluxviz
```

### Usage

##### Application Interface

```python
>>> import fluxviz
```

##### Command-Line Interface

```console
$ fluxviz
Usage: fluxviz [OPTIONS] COMMAND [ARGS]...

  An SBML Visualizer

Options:
  --version   Show the version and exit.
  -h, --help  Show this message and exit.

Commands:
  help     Show this message and exit.
  version  Show version and exit.
```

### Docker

```
$ docker run \
    --rm \
    -it \
    -v $(pwd):/path/to/project \
      achillesrasquinha/fluxviz \
```

### Similar Packages

* [d3flux](https://github.com/pstjohn/d3flux)

### License

This repository has been released under the [MIT License](LICENSE).

---

<div align="center">
  Made with ❤️ using <a href="https://git.io/boilpy">boilpy</a>.
</div>
