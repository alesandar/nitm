#!/usr/bin/env bash

set -e

DIR=$(pwd $(dirname $(dirname ${BASH_SOURCE[0]})))

[[ -f $DIR/.env ]] && echo "sourcing $DIR/.env" && source $DIR/.env

HOST=${HTTP_HOST:-localhost}
PORT=${HTTP_PORT:-8080}

ROOT_CA="$DIR/.cert/rootCA.pem"

echo "The proxy won't function, unless you import the public certificate authority into your browser."
echo "The file is located in $ROOT_CA"
echo

echo "HOST: $HOST"
echo "PORT: $PORT"
echo

[[ ! -f "$ROOT_CA" ]] && echo "Error! Certificate does not exist! \$ROOT_CA = $ROOT_CA" && exit

export http_proxy=http://$HOST:$PORT
export https_proxy=http://$HOST:$PORT

curl --cacert "$ROOT_CA" "$@"
