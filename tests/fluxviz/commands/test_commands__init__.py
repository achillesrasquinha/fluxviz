import os.path as osp

# imports - compatibility imports
from fluxviz.commands    import _command as command
from fluxviz.util._dict  import merge_dict
from fluxviz.util.string import strip_ansi

# imports - test imports
import pytest

# imports - test imports
from testutils import mock_input, PATH