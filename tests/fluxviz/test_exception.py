<<<<<<< HEAD
=======


>>>>>>> template/master
# imports - standard imports
import subprocess as sp

# imports - module imports
<<<<<<< HEAD
from fluxviz.util.system import popen
from fluxviz.exception   import (
    FluxVizError,
=======
from bpyutils.util.system import popen
from fluxviz.exception   import (
    FluxvizError,
>>>>>>> template/master
    PopenError
)

# imports - test imports
import pytest

def test_fluxviz_error():
<<<<<<< HEAD
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
=======
    with pytest.raises(FluxvizError):
        raise FluxvizError

def test_popen_error():
    with pytest.raises(PopenError):
        popen('python -c "from fluxviz.exceptions import PopenError; raise PopenError"')

    assert isinstance(
        PopenError(0, "echo foobar"),
        (FluxvizError, sp.CalledProcessError)
    )
    assert isinstance(FluxvizError(), Exception)
>>>>>>> template/master
