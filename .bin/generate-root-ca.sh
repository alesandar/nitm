#!/usr/bin/env bash

set -e

DIR=$(pwd $(dirname $(dirname ${BASH_SOURCE[0]})))
DIR_CERT=$DIR/.cert

[[ -f $DIR/.env ]] && echo "sourcing $DIR/.env" && source $DIR/.env

HOST=${HTTP_HOST:-localhost}

echo "> configuration:"
echo "  \$DIR_CERT: $DIR_CERT"
echo "  \$HOST:     $HOST"
echo

echo "> Generating Root CA key"
openssl genrsa -des3 -out $DIR_CERT/rootCA.key 2048
echo

echo "> Generating Root CA certificate"
openssl req -x509 -new -nodes -key $DIR_CERT/rootCA.key -sha256 -days 1024 -out $DIR_CERT/rootCA.pem
echo

echo "> Generating certificate key"
openssl genrsa -des3 -out $DIR_CERT/$HOST.key 1024
echo

echo "> Generating Certificate signing request"
openssl req -nodes -sha256 -newkey rsa:2048 -keyout $DIR_CERT/$HOST.key -out $DIR_CERT/$HOST.csr -config <( cat<<EOF
[req]
prompt = no
distinguished_name = dn
req_extensions = req_ext
x509_extensions = usr_cert
[dn]
C=BG
ST=Sofia
L=Sofia
O=publicvoidltd
OU=IT
emailAddress=publicvoid@tuta.io
CN=$HOST

[ req_ext ]
subjectAltName=DNS:$HOST
[ usr_cert ]
subjectAltName=DNS:$HOST
EOF
)
echo

echo "> Signing CSR with root key"
openssl x509 -req -in $DIR_CERT/$HOST.csr -CA $DIR_CERT/rootCA.pem -CAkey $DIR_CERT/rootCA.key -CAcreateserial -out $DIR_CERT/$HOST.crt -days 500 -sha256 -extfile <(printf "subjectAltName=DNS:$HOST")
echo
