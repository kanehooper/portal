#!/bin/zsh
set -a
source "/Users/kanehooper/Library/Application Support/OperationsPortal/operations.env"
set +a
cd "/Users/kanehooper/Documents/nextjs-starter"
exec "/Users/kanehooper/Documents/nextjs-starter/node_modules/.bin/tsx" "src/worker/main.ts"
