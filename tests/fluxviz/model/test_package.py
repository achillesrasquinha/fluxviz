from fluxviz.model.package import (
    _get_pypi_info,
    _get_package_version,
    _get_pip_info
)
from fluxviz.__attr__ import (
    __name__    as NAME,
    __author__
)
from fluxviz import semver

def test___get_pypi_info():
    info = _get_pypi_info("fluxviz")
    assert info["author"] == "Achilles Rasquinha"

def test__get_package_version():
    version = _get_package_version("fluxviz")
    semver.parse(version)

def test__get_pip_info():
    packages = _get_pip_info("fluxviz", "pytest")

    assert packages["fluxviz"]["name"]      == NAME
    assert packages["fluxviz"]["author"]    == __author__

    assert packages["pytest"]["name"]          == "pytest"
    assert packages["pytest"]["license"]       == "MIT license"