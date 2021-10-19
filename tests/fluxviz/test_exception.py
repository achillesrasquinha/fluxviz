

# imports - module imports
from fluxviz.exception import (
    FluxvizError
)

# imports - test imports
import pytest

def test_fluxviz_error():
    with pytest.raises(FluxvizError):
        raise FluxvizError