#!/bin/bash

set -e

if [ "${1:0:1}" = "-" ]; then
<<<<<<< HEAD
    set -- fluxviz "$@"
=======
    set -- {{ slug }} "$@"
>>>>>>> template/master
fi

exec "$@"