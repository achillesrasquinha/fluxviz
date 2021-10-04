import os.path as osp

# imports - compatibility imports
from fluxviz.commands    import _command as command
<<<<<<< HEAD
from fluxviz.util._dict  import merge_dict
from fluxviz.util.string import strip_ansi
=======
from bpyutils.util._dict  import merge_dict
from bpyutils.util.string import strip_ansi
>>>>>>> template/master

# imports - test imports
import pytest

# imports - test imports
from testutils import mock_input, PATH