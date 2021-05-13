

# imports - standard imports
import subprocess as sp

# imports - module imports
from fluxviz.util.system import popen
from fluxviz.exception   import (
    FluxvizError,
    PopenError
)

# imports - test imports
import pytest

def test_fluxviz_error():
    with pytest.raises(FluxvizError):
        raise FluxvizError

def test_popen_error():
    with pytest.raises(PopenError):
        popen('python -c "raise TypeError"')

    assert isinstance(
        PopenError(0, "echo foobar"),
        (FluxvizError, sp.CalledProcessError)
    )
    assert isinstance(FluxvizError(), Exception)