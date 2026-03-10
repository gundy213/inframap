#!/bin/sh
set -e

# Start nginx in the background
nginx -g 'daemon off;' &

# Run Node in the foreground — container exits if Node crashes
exec node /app/dist/backend/server.js
