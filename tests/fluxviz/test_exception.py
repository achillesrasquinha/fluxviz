# imports - standard imports
import subprocess as sp

# imports - module imports
from fluxviz.util.system import popen
from fluxviz.exception   import (
    FluxVizError,
    PopenError
)

# imports - test imports
import pytest

def test_fluxviz_error():
    with pytest.raises(FluxVizError):
        raise FluxVizError

def test_popen_error():
    with pytest.raises(PopenError):
        popen('python -c "raise TypeError"')

    assert isinstance(
        PopenError(0, "echo foobar"),
        (FluxVizError, sp.CalledProcessError)
    )
    assert isinstance(FluxVizError(), Exception)
