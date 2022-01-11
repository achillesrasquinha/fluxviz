# imports - compatibility imports
<<<<<<< HEAD
from fluxviz._compat import iteritems, iterkeys
=======
from bpyutils._compat import iteritems, iterkeys
>>>>>>> template/master

# imports - module imports
from fluxviz import cli
from fluxviz.cli import get_args
<<<<<<< HEAD
<<<<<<< HEAD
from fluxviz.util._dict import merge_dict
=======
from bpyutils.util._dict import merge_dict
>>>>>>> template/master
=======
from bpyutils.util._dict import merge_dict
>>>>>>> template/master

def test_command():
    def _assert_command(values, override = dict(), initial = dict()):
        @cli.command
        def foobar(*args, **kwargs):
            args    = get_args()
            params  = merge_dict(args, override)
            
            for k, v in iteritems(values):
                assert params[k] == v

            if initial:
                for k in iterkeys(initial):
                    assert initial[k] == args[k]
        
        foobar()
    
    _assert_command(dict(yes = False))
<<<<<<< HEAD
<<<<<<< HEAD
    _assert_command(dict(force = True), dict(force = True), dict(force = False))
=======
    _assert_command(dict(force = True), dict(force = True), dict(force = False))
>>>>>>> template/master
=======
    _assert_command(dict(force = True), dict(force = True), dict(force = False))
>>>>>>> template/master
