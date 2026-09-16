#!/bin/zsh
set -a
source "/Users/kanehooper/Library/Application Support/OperationsPortal/operations.env"
set +a
cd "/Users/kanehooper/Documents/nextjs-starter"
exec "/Users/kanehooper/.local/share/mise/installs/node/24/bin/node" "node_modules/next/dist/bin/next" start -H 127.0.0.1 -p 3015
