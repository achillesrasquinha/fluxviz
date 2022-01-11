.. _install:

### Installation

#### Installation via pip

The recommended way to install **fluxviz** is via `pip`.

```shell
$ pip install fluxviz
```

For instructions on installing python and pip see “The Hitchhiker’s Guide to Python” 
[Installation Guides](https://docs.python-guide.org/starting/installation/).

#### Building from source

`fluxviz` is actively developed on [https://github.com](https://github.com/achillesrasquinha/fluxviz)
and is always avaliable.

You can clone the base repository with git as follows:

```shell
$ git clone https://github.com/achillesrasquinha/fluxviz
```

Optionally, you could download the tarball or zipball as follows:

##### For Linux Users

```shell
$ curl -OL https://github.com/achillesrasquinha/tarball/fluxviz
```

##### For Windows Users

```shell
$ curl -OL https://github.com/achillesrasquinha/zipball/fluxviz
```

Install necessary dependencies

```shell
$ cd fluxviz
$ pip install -r requirements.txt
```

Then, go ahead and install fluxviz in your site-packages as follows:

```shell
$ python setup.py install
```

Check to see if you’ve installed fluxviz correctly.

```shell
$ fluxviz --help
```